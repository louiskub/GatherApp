using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GatherApp.Models;
using GatherApp.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GatherApp.Services;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace GatherApp.Controllers;

public class UserController : Controller
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwtService;
    public UserController(AppDbContext db, JwtService jwtService)
    {
        _db = db;
        _jwtService = jwtService;
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // เกี่ยวกับ user profile
    // ดู user คนไหนก็ได้
    [HttpGet]
    [Route("api/user/profile")]
    public IActionResult GetUserProfile([FromQuery] string username)
    {
        var reqUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Include(u => u.BehaviorScores)
                            .Include(u => u.ActTypeProfile)
                            .Include(u => u.ReceivedRatings)
                            .Include(u => u.GivenRatings)
                            .Where(u => u.Username == username).FirstOrDefault();
        if (user == null) 
            return NotFound("User not found");

        bool isOwner = user.Id == reqUserId;
        return Json(new
        {
            user = user.ToJson(isOwner),
            isOwner
        });
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // เกี่ยวกับ profile ของเรา
    // get my profile
    [Route("api/user/myprofile")]
    [Authorize]
    public IActionResult GetMyProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users
              .Include(u => u.BehaviorScores)
              .Include(u => u.ReceivedRatings)
              .FirstOrDefault(u => u.Id == userId); 
              
        var totalScore = _db.BehaviorScores.Where(b => b.UserId == user.Id)
                                   .Sum(b => b.Score);
        
        var rating = _db.RatingScores.Where(r => r.RatedUserId == user.Id)
                                .Select(r => r.Score)
                                .ToList();

        if (user == null) 
            return NotFound("User not found");
        var notifications = user.Notifications.OrderByDescending(n => n.CreatedAt).ToList();
        return Json(new
        {
            username = user.Username,
            name = user.FirstName,
            surname = user.LastName,
            email = user.Email,
            bio = user.Bio,
            birthdate = user.DateOfBirth,
            // tag = user.ActTypeProfile.Select(at => at.ActType),
            profileImg = user.ProfileImg,
            notification = user.Notifications,
            totalBehaviorScore = user.BehaviorScores.Sum(b => b.Score),
            RatingScore = user.ReceivedRatings.Count == 0 ? 0 : user.ReceivedRatings.Average(r => r.Score)
        });
    }

    // edit my profile
    [HttpPut]
    [Route("api/user/myprofile")]
    [Authorize]
    public IActionResult UpdateMyProfile([FromBody] UpdateProfileRequest myuser)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Include(u => u.BehaviorScores)
                            .Include(u => u.ActTypeProfile)
                            .Include(u => u.ReceivedRatings)
                            .Include(u => u.GivenRatings)
                            .Where(u => u.Id == userId)
                            .FirstOrDefault();

        if (user == null) 
            return NotFound("User not found");
        try
        {                
            string? token = null; 
            user.UpdateMyProfile(myuser);

            var actTypes = new List<ActivityType>();
            foreach (var actType in myuser.ActTypeProfile)
            {
                var actTypeProfile = _db.ActivityTypes.Where(at => at.ActType == actType).FirstOrDefault();
                if (actTypeProfile != null)
                    actTypes.Add(actTypeProfile);
            }
            if (actTypes.Count != 0)
                user.ActTypeProfile = actTypes;
            else 
                user.ActTypeProfile = new List<ActivityType>();

            if (myuser.Username != null) 
            {
                user.Username = myuser.Username;
                Console.WriteLine("Change username success");
                string stId = user.Id.ToString();
                token = _jwtService.GenerateToken(stId, user.Username);
            }
            _db.SaveChanges();

            return Json(new 
            {
                user = user.ToJson(true),
                status = "updated",
                token
            });
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
        
    }
    

    [HttpPatch]
    [Route("api/user/myprofile/changepassword")]
    [Authorize]
    public IActionResult ChangeMyPassword([FromBody] ChangePasswordRequest changePasswordRequest)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();
        if (user == null)
            return NotFound("User not found");

        if (!BCrypt.Net.BCrypt.Verify(changePasswordRequest.OldPassword, user.Password))
            return BadRequest("Old password is incorrect");

        user.Password = BCrypt.Net.BCrypt.HashPassword(changePasswordRequest.NewPassword);
        try 
        {
            _db.SaveChanges();
            return Json(new { status = "updated" });
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // เกี่ยวกับ post ที่เรา like ซึ่งเราดูได้คนเดียว

    [Route("api/user/mylikedpost")]
    [Authorize]
    public IActionResult GetMyLikedPost()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();
        if (user == null) 
            return NotFound("User not found");
            
        var likedPosts = _db.PostLikes.OrderBy(lp => lp.Id)
                                    .Include(lp => lp.Post)
                                    .Include(lp => lp.Post.User)
                                    .Include(lp => lp.Post.Activity)
                                    .Include(lp => lp.Post.Activity.ActTypes)
                                    .Where(lp => lp.UserId == user.Id).ToList();
        if (likedPosts == null || likedPosts.Count == 0) 
            return NotFound("Liked post not found");
        var result = likedPosts.Select(lp => lp.Post.ToJson());
        return Json(result);

    }


    [Route("api/user/getmyposts")]
    [HttpGet]
    public async Task<IActionResult> GetMyPosts()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var posts = await _db.Posts
            .Where(p => p.UserId == userId)
            .Select(p => new { p.Id, p.PostName })
            .ToListAsync();

        return Ok(posts);
    }   


    // แสดงประวัติการสมัครโพสของ user คนนั้น
    [Route("api/user/myapplication")]
    [Authorize]
    public IActionResult GetMyApplyHistory()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();

        if (user == null) 
            return NotFound("User not found" );

        var applications = _db.Applications.Include(a => a.Post)
                                        .ThenInclude(p => p.Activity)
                                        .Include(a => a.Post.Activity.ActTypes)
                                        .Include(a => a.Post.User)
                                        .Include(a => a.Post.Applications)
                                        .Where(a => a.UserId == user.Id)
                                        .OrderByDescending(a => a.AppliedDateTime).ToList();
        if (applications == null || applications.Count == 0)
            return NotFound("Application not found");
        var result = applications.Select(a => 
            new {
                a.AppliedDateTime,
                a.AppliedStatus,
                post = a.Post.ToJson(),
            }
        );
        return Json(result);
    }


    // ไม่น่าได้ใช้
    [Route("api/user/incomingevent")]
    [Authorize]
    public IActionResult GetInComingEvent()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Include(u => u.CreatedPosts)
                            .ThenInclude(p => p.Activity)
                            .Include(u => u.ApplyHistories)
                            .ThenInclude(ap => ap.Post)
                            .ThenInclude(p => p.Activity)
                            .Where(u => u.Id == userId).FirstOrDefault();
        if (user == null) 
            return NotFound("User not found");
        
        var createdPost = user.CreatedPosts.OrderBy(p => p.Activity.ActDatetime)
                                    .Where(p => p.Activity.ActDatetime > DateTime.Now)
                                    .GroupBy(p => p.Activity.ActDatetime.Date)
                                    .ToList();

        var applyPosts = user.ApplyHistories.OrderBy(ap => ap.Post.Activity.ActDatetime)
                                            .Where(ap => ap.Post.Activity.ActDatetime > DateTime.Now)
                                            .GroupBy(ap => ap.Post.Activity.ActDatetime.Date)
                                            .ToList();
        
        return Json(new {
            createdPost, applyPosts
        });
    
    }

    
}
