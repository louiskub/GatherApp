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
                user.ActTypeProfile = [];

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
    [HttpGet]
    [Authorize]
    public IActionResult GetMyLikedPost()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();
        if (user == null) 
            return NotFound("User not found");
            
        var likedPosts = _db.PostLikes
                                .Include(lp => lp.Post)
                                .ThenInclude(p => p.User)
                                .Include(lp => lp.Post.Activity)
                                .ThenInclude(a => a.ActTypes)
                                .Where(lp => lp.UserId == user.Id)
                                .Select(lp => new
                                {
                                    id = lp.Post.Id,
                                    postname = lp.Post.PostName,
                                    image = lp.Post.CoverPageImg ?? "https://storage-wp.thaipost.net/2024/12/Moo-Deng3.jpg",
                                    Province = lp.Post.Activity.Province,
                                    District = lp.Post.Activity.District,
                                    total = lp.Post.Applications.Count,
                                    Accepted = lp.Post.Applications.Count(a => a.AppliedStatus == true),
                                    registered = lp.Post.Applications.Count(a => a.AppliedStatus == null || a.AppliedStatus == true),
                                    actDatetime = lp.Post.Activity.ActDatetime.ToString("dd/MM/yyyy HH:mm"),
                                    tags = lp.Post.Activity.ActTypes.Select(at => at.ActType).ToList(),
                                })
                                .ToList();
                        
        if (likedPosts == null || likedPosts.Count == 0)
            return NotFound("Liked post not found");    

        return Ok(likedPosts);

    }

    [Route("api/user/unlikepost")]
    [HttpPost]
    [Authorize]
    public IActionResult UnlikePost([FromBody] unlikedPost unlikePostRequest)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId)) 
             return Unauthorized("User not found");

        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();
        if (user == null) 
            return NotFound("User not found");

        var post = _db.Posts.Where(p => p.Id == unlikePostRequest.PostId).FirstOrDefault();
        if (post == null)
            return NotFound("Post not found");

        var postLike = _db.PostLikes.Where(pl => pl.UserId == user.Id && pl.PostId == post.Id).FirstOrDefault();
        if (postLike == null)
            return NotFound("Post like not found");

        _db.PostLikes.Remove(postLike);
        _db.SaveChanges();
        return Ok(new { status = "unliked" });
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


    [Route("api/user/myposts")]
    [Authorize]
    public IActionResult GetMyPostHistory()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();
        if (user == null) 
            return NotFound("User not found");

        var myposts = _db.Posts.Include(p => p.Activity)
                                .Include(p => p.Activity.ActTypes)
                                .Include(p => p.Applications)
                                .Where(p => p.UserId == userId)
                                .OrderByDescending(p => p.CreateAt).ToList()
                                .Select(p => p.ToJsonSmall());
        if (myposts == null || !myposts.Any())
            return NotFound("Post not found");

        List<object> inComming = [], future = [], success = [];

        foreach (var post in myposts)
        {   
            var res = (dynamic)post;
            var activity = res.Activity;
            //incomming
            if (activity.ActDatetime <= DateTime.Now.AddDays(7))
                inComming.Add(post);
            // future
            else if (activity.ActDatetime > DateTime.Now)
                future.Add(post);
            // success
            else
                success.Add(post);
        }

        return Json(new{
            inComming, future, success
        });
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
                                        .Include(a => a.Post.Activity)
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
                Post = a.Post.ToJsonSmall(),
            }
        );

        List<object> inComming = [], pending = [], success = [], fail = [];
        foreach (var res in result)
        {
            // participant laew
            var app = (dynamic)res;
            var post = app.Post.Post;
            var activity = app.Post.Activity;

            if (app.AppliedStatus == true){
                // ยังไม่จบ
                if (activity.ActDatetime > DateTime.Now)
                    inComming.Add(app);
                // จบแล้ว
                else 
                    success.Add(app);
            }
            // pending และ ยังไม่จัด
            else if (app.AppliedStatus == null && activity.ActDatetime > DateTime.Now)
                pending.Add(app);
            // จบแล้ว
            else
                fail.Add(app);
        }

        return Json(new{inComming, success, pending, fail});
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
