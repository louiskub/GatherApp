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

    // สมัครโพส
    [HttpPost]
    [Route("api/user/applypost")]
    [Authorize]
    public IActionResult ApplyPost(int postId, [FromBody] DtoApplyPost? dtoApplyPost)
    {

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not authenticated.");

        var user = _db.Users.Include(u => u.BehaviorScores)
                            .Where(u => u.Id == userId).FirstOrDefault();


        if (user == null)
            return NotFound("User not found");

        var post = _db.Posts.Include(p => p.Activity)
                            .FirstOrDefault(p => p.Id == postId);
        if (post == null)
            return NotFound("Post not found");

        var oldApplication = _db.Applications.FirstOrDefault(a => a.UserId == userId && a.PostId == postId);
        if (oldApplication != null)
            return BadRequest("You have already applied for this post");

        string? isAvailable = post.IsPostAvailable();
        if (!string.IsNullOrEmpty(isAvailable))
            return BadRequest(isAvailable);

        if (post.IsAttached && (dtoApplyPost == null || string.IsNullOrEmpty(dtoApplyPost.FileAttached)))
            return BadRequest("This post requires a file attachment");

        if (DateTime.Now >= post.Activity.ActDatetime)
            return BadRequest("You cannot apply after the event has started.");

        var application = new Application
        {
            User = user,
            Post = post,
            FileAttached = post.IsAttached ? dtoApplyPost.FileAttached : null
        };


        try
        {
            _db.Applications.Add(application);

            var newBehaviorScore = new BehaviorScore
            {
                User = user,
                Score = 10,
                IsBanned = false,
                BannedUntil = null
            };

            _ = _db.Notifications.Add(new Notification
            {
                UserId = user.Id,
                Content = $"You Have Add Behavoir Score 10",
                CreatedAt = DateTime.Now,
            });

            _db.BehaviorScores.Add(newBehaviorScore);

            _db.SaveChanges();

            return Json(new { status = "applied" });
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
        // return Json(new { status = "deleted" });
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();
        // Console.WriteLine("\n\n{0} {1}\n\n", userId, "ets");
        if (user == null)
            return NotFound("User not found");

        var application = _db.Applications.Where(a => a.PostId == postId && a.UserId == userId)
                                        .FirstOrDefault();
        if (application == null)
            return NotFound("Application not found");
        Console.WriteLine("\n\nApp Found\n\n");
        try 
        {
            _db.Applications.Remove(application);
             var newBehaviorScore = new BehaviorScore
            {
                User = user,
                Score = -10,
                IsBanned = false,
                BannedUntil = null
            };
            _db.BehaviorScores.Add(newBehaviorScore);

            _db.SaveChanges();
            return Json(new { status = "deleted" });
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
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Include(u => u.ApplyHistories)
                            .ThenInclude(a => a.Post)
                            .Where(u => u.Id == userId).FirstOrDefault();

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
            return Json(new { status = "updated" });
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
        
    }


}