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
    [Route("/api/user/profile")]
    [HttpGet]
    public IActionResult GetUserProfile([FromQuery] string username)
    {
        var reqUser = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();

        if (user == null) 
            return NotFound("User not found");

        bool authorize = user.Username == reqUser;
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
    [Route("/api/user/myprofile")]
    [Authorize]
    public IActionResult GetMyProfile()
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();

        if (user == null) 
            return NotFound("User not found");

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
            return NotFound("User not found");

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
            status = "Update success"
        });
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

        if (user.Password != changePasswordRequest.OldPassword)
            return BadRequest("Old password is incorrect");

        user.Password = changePasswordRequest.NewPassword;
        try 
        {
            _db.SaveChanges();
            return Json(new { status = "ok" });
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // เกี่ยวกับ post หรือ app ของเรา

    [Route("/api/user/mylikedpost")]
    [Authorize]
    public IActionResult GetMyLikedPost()
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();
        if (user == null) 
            return NotFound("User not found");
            
        var likedPosts = _db.PostLikes.OrderBy(lp => lp.Id)
                                    .Where(lp => lp.UserId == user.Id).ToList();
        return Json(likedPosts);

    }

    [Route("/api/user/applyposts")]
    [Authorize]
    public IActionResult GetMyApplyHistory()
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();

        if (user == null) 
            return NotFound("User not found" );
        
        var applications = _db.Applications.Include(a => a.Post)
                                        .Where(a => a.UserId == user.Id)
                                        .OrderByDescending(a => a.AppliedDateTime).ToList();
        return Json(applications);
    }


}
