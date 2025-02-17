using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GatherApp.Models;
using GatherApp.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GatherApp.Services;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
#pragma warning disable CS0472 

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
        var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();

        if (user == null) 
            return NotFound("User not found");

        bool isOwner = user.Id == reqUserId;
        return Json(new
        {
            username = user.Username,
            email = user.Email,
            profileImg = user.ProfileImg,
            bio = user.Bio,
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
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();

        if (user == null) 
            return NotFound("User not found");
        var notifications = _db.Notifications.OrderByDescending(n => n.CreatedAt)
                                            .Where(n => n.UserId == user.Id).ToList();
        
        return Json(new
        {
            username = user.Username,
            profileImg = user.ProfileImg,
            notification = user.Notifications
        });
    }

    // edit my profile
    [HttpPut]
    [Route("api/user/myprofile")]
    [Authorize]
    public IActionResult UpdateMyProfile([FromBody] UpdateProfileRequest myuser)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();

        if (user == null) 
            return NotFound("User not found");

        try
        {                
            string? token = null; 
            if (myuser.Email != null) user.Email = myuser.Email;
            if (myuser.ProfileImg != null) user.ProfileImg = myuser.ProfileImg;
            if (myuser.Bio != null) user.Bio = myuser.Bio;
            if (myuser.Username != null) 
            {
                user.Username = myuser.Username;
                Console.WriteLine("Login success");
                string stId = user.Id.ToString();
                token = _jwtService.GenerateToken(stId, user.Username);
            }
            _db.SaveChanges();
            return Json(new 
            {
                username = user.Username,
                email = user.Email,
                profileImg = user.ProfileImg,
                bio = user.Bio,
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
