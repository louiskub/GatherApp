using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GatherApp.Models;
using GatherApp.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace GatherApp.Controllers;

public class UserController : Controller
{
    private readonly AppDbContext _db;

    public UserController(AppDbContext db)
    {
        _db = db;
    }

    [Route("/api/getuser")]
    public IActionResult GetUser()
    {
        var user = _db.Users.Where(u => u.Id == "1").FirstOrDefault();
        if (user == null)
        {
            return NotFound();
        }
        return Json(new { userid = user.Id, username = user.Username, password = user.Password });
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // เกี่ยวกับการสมัครเข้าร่วมกิจกรรม
    
    [HttpPost]
    [Route("api/user/applypost")]
    [Authorize]
    public IActionResult ApplyPost(int postId, [FromBody] DtoApplyPost dtoApplyPost)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();
        if (user == null)
            return NotFound("User not found");
        
        var oldApplication = _db.Applications.Where(a => a.UserId == userId && a.PostId == postId)
                                            .FirstOrDefault();
        if (oldApplication != null)
            return BadRequest("You have already applied this post");
        var post = _db.Posts.Where(p => p.Id == postId)
                            .Include(p => p.Activity)
                            .FirstOrDefault();
        if (post == null)
            return NotFound("Post not found");

        string? isAvilable = post.IsPostAvailable();
        if (isAvilable != null)
            return BadRequest(isAvilable);

        var application = new Application
        {
            User = user,
            Post = post
        };
        
        if (post.IsAttached)
            application.FileAttached = dtoApplyPost.FileAttached;
        try 
        {
            _db.Applications.Add(application);
            _db.SaveChanges();
            return Json(new { status = "ok" });
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    // ยกเลิกการสมัครโพส
    [HttpDelete]
    [Route("api/user/applypost")]
    [Authorize]
    public IActionResult CancelApplyPost(int postId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();
        if (user == null)
            return NotFound("User not found");

        var application = _db.Applications.Where(a => a.PostId == postId && a.UserId == userId)
                                        .FirstOrDefault();
        if (application == null)
            return NotFound("Application not found");
        
        try 
        {
            _db.Applications.Remove(application);
            _db.SaveChanges();
            return Json(new { status = "ok" });
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Route("/api/user/profile")]
    [HttpGet]
    public IActionResult GetUserProfile([FromQuery] string username)
    {
        var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();

        if (user == null) 
        {
            return NotFound(new { message = "User not found" });
        }

        bool Authorization = User.Identity.Name == username;
        int authorize = Authorization ? 1 : 0;
        return Json(new
        {
            username = user.Username,
            email = user.Email,
            profileImg = user.ProfileImg,
            bio = user.Bio,
            authorize = authorize
        });
    }

    // get my profile
    [Route("/api/user/myprofile")]
    [Authorize]
    public IActionResult GetMyProfile()
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();

        if (user == null) 
        {
            return NotFound(new { message = "User not found" });
        }

        bool Authorization = User.Identity.Name == username;
        int authorize = Authorization ? 1 : 0;
        return Json(new
        {
            username = user.Username,
            profileImg = user.ProfileImg,
            notification = user.Notifications
        });
    }

    // edit my profile
    [HttpPut]
    [Route("/api/user/myprofile")]
    [Authorize]
    public IActionResult UpdateMyProfile([FromBody] UpdateProfileRequest myuser)
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();

        if (user == null) 
        {
            return NotFound(new { message = "User not found" });
        }
        // user.ChangeUsernameEmail(user.Username, user.Email);
        // user.ChangeProfile(user.ProfileImg, user.Bio);
        // user.ChangePassword(user.Password);
        // user.Username = myuser.Username;
        // user.Email = myuser.Email;
        // user.ProfileImg = myuser.ProfileImg;
        // user.Bio = myuser.Bio;
        // user.Password = myuser.Password; 

        if (myuser.Username != null) user.Username = myuser.Username;
        if (myuser.Email != null) user.Email = myuser.Email;
        if (myuser.ProfileImg != null) user.ProfileImg = myuser.ProfileImg;
        if (myuser.Bio != null) user.Bio = myuser.Bio;
        if (myuser.Password != null) user.Password = myuser.Password;

        _db.SaveChanges();
        return Json(new UserProfileResponse
        {
            Username = user.Username,
            Email = user.Email,
            ProfileImg = user.ProfileImg,
            Bio = user.Bio,
            Message = "Update success"
        });
    }
    
    // get my created post
    [Route("/api/user/myprofile/mycreatedpost")]
    [Authorize]
    public IActionResult GetMyCreatedPost()
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();

        if (user == null) 
        {
            return NotFound(new { message = "User not found" });
        }

        var posts = _db.Posts.Where(p => p.UserId == user.Id).ToList();
        if (posts == null || posts.Count == 0) 
        {
            return NotFound(new { message = "Post not found" });
        }
        return Json(posts);
    }

    // [Route("/api/user/myprofile/likedpost")]
    // public IActionResult GetMyLikedPost([FromQuery] string username)
    // {
    //     var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();

    //     if (user == null) 
    //     {
    //         return NotFound(new { message = "User not found" });
    //     }

    //     bool Authorization = User.Identity.Name == username;
    //     int authorize = Authorization ? 1 : 0;
    //     if (authorize == 1) 
    //     {
    //         var likedPosts = _db.LikedPosts.Where(lp => lp.UserId == user.Id).ToList();
    //         return Json(likedPosts);
    //     }
    //     else {
    //         return Unauthorized(new { message = "Unauthorized" });
    //     }
    // }

    [Route("/api/user/myprofile/applyhistory")]
    public IActionResult GetMyApplyHistory([FromQuery] string username)
    {
        var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();

        if (user == null) 
        {
            return NotFound(new { message = "User not found" });
        }

        bool Authorization = User.Identity.Name == username;
        int authorize = Authorization ? 1 : 0;
        if (authorize == 1) 
        {
            var applications = _db.Applications.Where(a => a.UserId == user.Id).ToList();
            return Json(applications);
        }
        else {
            return Unauthorized(new { message = "Unauthorized" });
        }
    }


}
