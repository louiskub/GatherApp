using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GatherApp.Models;
using GatherApp.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
#pragma warning disable CS0472 

namespace GatherApp.Controllers;

public class UserController : Controller
{
    private readonly AppDbContext _db;

    public UserController(AppDbContext db)
    {
        _db = db;
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // เกี่ยวกับ user profile
    // ดู user คนไหนก็ได้
    [Route("api/user/profile")]
    [HttpGet]
    public IActionResult GetUserProfile([FromQuery] string username)
    {
        var reqUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();

        if (user == null) 
            return NotFound("User not found");

        bool authorize = user.Id == reqUserId;
        return Json(new
        {
            username = user.Username,
            email = user.Email,
            profileImg = user.ProfileImg,
            bio = user.Bio,
            authorize
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
            if (myuser.Username != null) user.Username = myuser.Username;
            if (myuser.Email != null) user.Email = myuser.Email;
            if (myuser.ProfileImg != null) user.ProfileImg = myuser.ProfileImg;
            if (myuser.Bio != null) user.Bio = myuser.Bio;
            
            _db.SaveChanges();
            return Json(new 
            {
                username = user.Username,
                email = user.Email,
                profileImg = user.ProfileImg,
                bio = user.Bio,
                status = "updated"
            });
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
        
    }
    

    [Route("api/user/myprofile/changepassword")]
    [HttpPatch]
    [Authorize]
    public IActionResult ChangePassword([FromBody] ChangePasswordRequest changePasswordRequest)
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
    // เกี่ยวกับ post หรือ app ของเรา

    [Route("api/user/mypost")]
    [Authorize]
    public IActionResult GetMyPost()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();

        if (user == null) 
            return NotFound("User not found");
        
        var posts = _db.Posts.Include(p => p.Activity)
                            .Include(p => p.Applications)
                            .Where(p => p.UserId == user.Id)
                            .OrderByDescending(p => p.CreateAt)
                            .ToList();

        if (posts == null || posts.Count == 0) 
            return NotFound("Post not found" );
        var result = posts.Select(p => p.ToJson());
        return Json(result);
    }


    // get All Applicant my created post
    [Route("api/user/mypost/{postId}")]
    [Authorize]
    public IActionResult GetAllApplicantMyPost(int postId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();
        if (user == null) 
            return NotFound("User not found");
        
        var post = _db.Posts.Where(p => p.Id == postId && p.UserId == user.Id).FirstOrDefault();
        if (post == null) 
            return NotFound("Post not found");

        var applications = _db.Applications.Include(a => a.User)
                                        .Where(a => a.PostId == postId).ToList();
        if (applications == null || applications.Count == 0) 
            return NotFound("Applicant not found");
        
        var result = applications.OrderBy(a => a.AppliedStatus == null)
                                .ThenByDescending(a => a.AppliedStatus)
                                .ThenByDescending(a => a.AppliedDateTime)
                                .Select(a => a.ToJson()
                                ).ToList();
        return Json(result);
    }



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

    [Route("api/user/myapplypost")]
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

    // ดู ไฟล์ที่เราส่งไป
    [Route("api/user/myapplypost/file")]
    [Authorize]
    public IActionResult GetFile(int postId)
    {
        var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var application = _db.Applications.Where(a => a.PostId == postId && a.User.Id == ownerId)
                                        .FirstOrDefault();
        if (application == null)
            return NotFound("Application not found");
        if (application.FileAttached == null)
            return NotFound("File not found");
        var fileResult = application.GetFile();
        return File(fileResult.Item1, "application/octet-stream", $"archieve.{fileResult.Item2}");
    }



}
