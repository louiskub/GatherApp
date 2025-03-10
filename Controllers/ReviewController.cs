using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GatherApp.Models;
using GatherApp.Data;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GatherApp.Controllers
{
    [Authorize]
    public class RatingController : ControllerBase
    {
        private readonly AppDbContext _db;

        public RatingController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost]
        [Route("api/reviews/rate")]
        public async Task<IActionResult> CreateRatingScore([FromBody] CreateRatingRequest rating)
        {   
            var raterId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rater = await _db.Users.FindAsync(raterId);
            
            var ratedUser = await _db.Users.FirstOrDefaultAsync(u => u.Username == rating.RatedUsername);
            if (rater == null || ratedUser == null)
                return BadRequest("User does not exist.");
            if (rating.RatedUsername == rater.Username)
                return BadRequest("You cannot rate yourself.");
            if (rating.RatedUsername == null)
                return BadRequest("RatedUsername cannot be null.");
            if (rating.Score < 0 || rating.Score > 5)
                return BadRequest("Score must be between 0 and 5.");
            if (rating.Comment != null && rating.Comment.Length > 300)
                return BadRequest("Comment must be less than 300 characters.");

            // post validate
            var post = await _db.Posts.Include(p => p.Activity).Include(p => p.Applications)
                                    .Where(p => p.Id == rating.PostId).FirstOrDefaultAsync();
            if (post == null)
                return BadRequest("Invalid post.");
            if (post.Activity.ActDatetime > DateTime.Now)
                return BadRequest("You can only rate after the event has ended." + post.Activity.ActDatetime);
            if (DateTime.Now > post.Activity.ActDatetime.AddDays(7))
                return BadRequest("You can only rate within 7 days after the event has ended.");

            bool commonPost = (post.Applications.Any(a1 => a1.UserId == raterId && a1.PostId == rating.PostId) || (post.UserId == raterId)) &&
                            (post.Applications.Any(a2 => a2.UserId == ratedUser.Id && a2.PostId == rating.PostId) || (post.UserId == ratedUser.Id));

            if (!commonPost)
                return BadRequest("You can only rate users who applied to the same post.");

            var existingRating = await _db.RatingScores
                .AnyAsync(r => r.RaterId == raterId && r.RatedUserId == ratedUser.Id  && r.PostId == rating.PostId);

            if (existingRating)
                return BadRequest("You have already rated this user.");

            var newRating = new RatingScore
            {
                PostId = rating.PostId,
                RaterId = rater.Id,
                RatedUserId = ratedUser.Id,
                UserId = rater.Id,
                Score = rating.Score,
                Comment = rating.Comment,
                CreatedAt = DateTime.UtcNow,
            };
            
            _ = _db.Notifications.Add(new Notification
            {
                Type = "review",
                Title = "New Rating",
                UserId = ratedUser.Id,
                Content = $"You have received a new rating for the post"
            });

            try
            {
                // เพิ่ม Rating ใหม่ไปยังฐานข้อมูล
                _db.RatingScores.Add(newRating);
                await _db.SaveChangesAsync();
                return Ok(new { message = "Rating submitted successfully." });
            }
            catch (DbUpdateException ex)
            {
                var innerExceptionMessage = ex.InnerException?.Message ?? "No inner exception message available.";
                return StatusCode(500, $"An error while saving the rating: {ex.Message}. Inner Exception: {innerExceptionMessage}");
            }
        }

        [HttpPost]
        [Route("api/reviews/old/rate")]
        public async Task<IActionResult> CreateRating([FromBody] RatingScore rating)
        {
            var raterId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(raterId))
            {
                return Unauthorized("Invalid token");
            }

            if (rating.RaterId == null || rating.RatedUserId == null)
            {
                return BadRequest("RaterId or RatedUserId cannot be null");
            }

            if (rating.RatedUserId == raterId)
            {
                return BadRequest("You cannot rate yourself.");
            }

            if (rating.Score < 0 || rating.Score > 5)
            {
                return BadRequest("Score must be between 0 and 5.");
            }

            var post = await _db.Activities.FindAsync(rating.PostId);
            if (post == null)
            {
                return BadRequest("Invalid post.");
            }

            if (post.ActDatetime > DateTime.UtcNow)
            {
                return BadRequest("You can only rate after the event has ended.");
            }

            if (DateTime.UtcNow > post.ActDatetime.AddDays(7))
            {
                return BadRequest("You can only rate within 7 days after the event has ended.");
            }

            bool commonPost = await _db.Applications
                .AnyAsync(a1 => a1.UserId == raterId &&
                                _db.Applications.Any(a2 => a2.UserId == rating.RatedUserId && a1.PostId == a2.PostId));

            if (!commonPost)
            {
                return BadRequest("You can only rate users who applied to the same post.");
            }

            var existingRating = await _db.RatingScores
                .AnyAsync(r => r.RaterId == raterId && r.RatedUserId == rating.RatedUserId && r.PostId == rating.PostId);

            if (existingRating)
            {
                return BadRequest("You have already rated this user.");
            }

            var rater = await _db.Users.FindAsync(rating.RaterId);
            if (rater == null)
            {
                return BadRequest("Rater user does not exist.");
            }

            var ratedUser = await _db.Users.FindAsync(rating.RatedUserId);
            if (ratedUser == null)
            {
                return BadRequest("Rated user does not exist.");
            }

            var newRating = new RatingScore
            {
                PostId = rating.PostId,
                RaterId = raterId,
                RatedUserId = rating.RatedUserId,
                UserId = raterId,
                Score = rating.Score,
                Comment = rating.Comment,
                CreatedAt = DateTime.UtcNow,
            };
            
            _ = _db.Notifications.Add(new Notification
            {
                Type = "review",
                Title = "New Rating",
                UserId = ratedUser.Id,
                Content = $"You have received a new rating for the post"
            });

            try
            {
                _db.RatingScores.Add(newRating);
                await _db.SaveChangesAsync();
                return Ok(new { message = "Rating submitted successfully." });
            }
            catch (DbUpdateException ex)
            {
                var innerExceptionMessage = ex.InnerException?.Message ?? "No inner exception message available.";
                return StatusCode(500, $"An error while saving the rating: {ex.Message}. Inner Exception: {innerExceptionMessage}");
            }
        }


        [HttpPut]
        [Route("api/reviews/update/{id}")]
        public async Task<IActionResult> UpdateRating(int id, [FromBody] RatingScore updatedRating)
        {
            var rating = await _db.RatingScores.FindAsync(id);
            if (rating == null)
            {
                return NotFound("Rating not found.");
            }

            var raterId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (rating.RaterId != raterId)
            {
                return Unauthorized("You can only update your own ratings.");
            }

            if (updatedRating.Score < 0 || updatedRating.Score > 5) 
            {
                return BadRequest("Score must be between 0 and 5.");
            }

            rating.Score = updatedRating.Score;
            rating.Comment = !string.IsNullOrWhiteSpace(updatedRating.Comment) ? updatedRating.Comment : rating.Comment;
            rating.CreatedAt = DateTime.UtcNow;
            
            _db.RatingScores.Update(rating);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Rating updated successfully." });
        }

        [HttpDelete]
        [Route("api/reviews/delete/{id}")]
        public async Task<IActionResult> DeleteRating(int id)
        {
            var rating = await _db.RatingScores.FindAsync(id);
            if (rating == null)
            {
                return NotFound("Rating not found.");
            }

            var raterId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (rating.RaterId != raterId)
            {
                return Unauthorized("You can only delete your own ratings.");
            }

            _db.RatingScores.Remove(rating);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Rating deleted successfully." , DeleteRating = rating });
        }
    }
}
