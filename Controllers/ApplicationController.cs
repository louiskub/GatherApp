using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GatherApp.Models;
using GatherApp.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;

namespace GatherApp.Controllers;

public class ApplicationController : Controller
{
    private readonly AppDbContext _db;
    public ApplicationController(AppDbContext db)
    {
        _db = db;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // เกี่ยวกับการสมัครเข้าร่วมกิจกรรม
    
    // ดู ไฟล์ที่เราส่งไป
    [Route("api/user/applypost/file")]
    [Authorize]
    public IActionResult GetFile(int postId)
    {
        var ownerName = User.FindFirst(ClaimTypes.Name)?.Value;
        var application = _db.Applications.Include(a => a.Post)
                            .Where(a => a.PostId == postId && a.User.Username == ownerName)
                            .FirstOrDefault();
        if (application == null)
            return NotFound("Application not found");
        if (application.Post.IsAttached == false)
            return BadRequest("File not attached");
        if (application.FileAttached == null)
            return NotFound("File not found");
        var fileResult = application.GetFile();
        return File(fileResult.Item1, "application/octet-stream", $"archieve.{fileResult.Item2}");
    }


    // สมัครโพส
    [HttpPost]
    [Route("api/user/applypost")]
    [Authorize]
    public IActionResult ApplyPost(int postId, [FromBody] DtoApplyPost? dtoApplyPost)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();
        if (user == null)
            return NotFound("User not found");

        var post = _db.Posts.Include(p => p.Activity)
                            .Where(p => p.Id == postId)
                            .FirstOrDefault();
        if (post == null)
            return NotFound("Post not found");
        
        var oldApplication = _db.Applications.Where(a => a.UserId == userId && a.PostId == postId)
                                            .FirstOrDefault();
        if (oldApplication != null)
            return BadRequest("You have already applied this post");
        
        string? isAvilable = post.IsPostAvailable();
        if (isAvilable != null)
            return BadRequest(isAvilable);
        
        var application = new Application
        {
            User = user,
            Post = post
        };
        
        if (post.IsAttached && dtoApplyPost != null)
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
    
    // แก้ไขไฟล์ที่แนบมากับการสมัครโพส
    [HttpPut]
    [Route("api/user/applypost")]
    [Authorize]
    public IActionResult EditMyApplyHistory(int postId, [FromBody] DtoApplyPost dtoApplyPost)
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = _db.Users.Include(u => u.ApplyHistories)
                            .ThenInclude(a => a.Post)
                            .Where(u => u.Username == username).FirstOrDefault();

        if (user == null) 
            return NotFound("User not found" );
        
        var application = user.ApplyHistories.Where(a => a.PostId == postId).FirstOrDefault();
        if (application == null) 
            return NotFound("Application not found" );

        try 
        {
            if (application.Post.IsAttached)
            {
                application.FileAttached = dtoApplyPost.FileAttached;
                _db.SaveChanges();
            }
            return Json(new { status = "ok" });
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
        
    }
}