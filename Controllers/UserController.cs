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
}
