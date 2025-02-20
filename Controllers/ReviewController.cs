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
        public async Task<IActionResult> CreateRating([FromBody] RatingScore rating)
        {
            var raterId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(raterId))
            {
                return Unauthorized("Invalid token");
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

            var commonPost = await _db.Applications
                .Where(a => a.UserId == raterId)
                .Select(a => a.PostId)
                .Intersect(_db.Applications
                    .Where(a => a.UserId == rating.RatedUserId)
                    .Select(a => a.PostId)
                    )
                .AnyAsync();

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

            var newRating = new RatingScore
            {
                RaterId = raterId,
                RatedUserId = rating.RatedUserId,
                Score = rating.Score,
                Comment = rating.Comment,   
                CreatedAt = DateTime.UtcNow
            };

            _db.RatingScores.Add(newRating);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Rating submitted successfully." });
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetRatingsForUser(string userId)
        {
            var ratings = await _db.RatingScores
                .Where(r => r.RatedUserId == userId)
                .Include(r => r.Rater)
                .ToListAsync();

            if (ratings == null || ratings.Count == 0)
            {
                return NotFound("No ratings found for this user.");
            }

            return Ok(ratings);
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
