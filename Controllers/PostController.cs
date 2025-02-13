using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GatherApp.Models;
using GatherApp.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace GatherApp.Controllers;

public class PostController : Controller
{
    private readonly AppDbContext _db;

    public PostController(AppDbContext db)
    {
        _db = db;
    }

    [Route("/api/getpost")]
    public IActionResult GetPost()
    {
        var post = _db.Posts.Include(p => p.User).Where(p => p.Id == 1).FirstOrDefault();   // ดึงข้อมูล post+user
        if (post == null)
        {
            return NotFound();
        }
        return Json(new { post, post.User});
    }


    [HttpPost]
    [Route("/api/post/create/{userId}")]
    // [Authorize]
    public IActionResult CreatePost([FromBody] DtoCreatePost dtopost, string userId)
    {   
        // var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();
        if (user == null)
        {
            return NotFound("User not found");
        }

        var actTypes = new List<ActivityType>();
        foreach (var id in dtopost.ActTypes)
        {   
            var actType = _db.ActivityTypes.Where(a => a.Id == id)
                                        .FirstOrDefault();
            if (actType != null)
                actTypes.Add(actType);
        }

        var activity = new Activity
        {
            OpenDateTime = dtopost.OpenDateTime,
            CloseDateTime = dtopost.CloseDateTime,
            ActDatetime = dtopost.ActDatetime,
            Latitude = dtopost.Latitude,
            Longitude = dtopost.Longitude,
            ActTypes = actTypes
        };

        var post = new Post
        {
            Status = "open",
            PostName = dtopost.PostName,
            Detail = dtopost.Detail,
            IsAttached = dtopost.IsAttached,
            MaxParticipant = dtopost.MaxParticipant,
            CoverPageImg = dtopost.CoverPageImg,
            Activity = activity,
            UserId = user.Id,
            User = user
        };
        try 
        {
            _db.Posts.Add(post);
            user.CreatePost(post);
            _db.SaveChanges();
            return Json(post);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpPut]
    [Route("/api/post/{postId}/edit/{ownerId}")]
    // [Authorize]
    public IActionResult EditPost(int postId, [FromBody] DtoCreatePost dtopost, string ownerId)
    {
        // var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var post = _db.Posts.Include(p => p.User)
                            .Include(p => p.Activity)
                            .ThenInclude(a => a.ActTypes)
                            .Where(p => p.Id == postId)
                            .FirstOrDefault();
        if (post == null)
        {
            return NotFound("Post not found");
        }
        // check if the user is the owner of the post\
        if (post.User.Id != ownerId)
        {
            return Unauthorized("User Unauthorized");
        }
        var actTypes = new List<ActivityType>();
        foreach (var id in dtopost.ActTypes)
        {   
            var actType = _db.ActivityTypes.Where(a => a.Id == id)
                                        .FirstOrDefault();
            if (actType != null)
                actTypes.Add(actType);
        }

        try
        {
            post.PostName = dtopost.PostName;
            post.Detail = dtopost.Detail;
            post.IsAttached = dtopost.IsAttached;
            post.MaxParticipant = dtopost.MaxParticipant;
            post.CoverPageImg = dtopost.CoverPageImg;
            post.Activity.OpenDateTime = dtopost.OpenDateTime;
            post.Activity.CloseDateTime = dtopost.CloseDateTime;
            post.Activity.ActDatetime = dtopost.ActDatetime;
            post.Activity.Latitude = dtopost.Latitude;
            post.Activity.Longitude = dtopost.Longitude;
            post.Activity.ActTypes = actTypes;
            
            _db.SaveChanges();
            return Json(new{status =  "updated"});
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpPatch]
    [Route("/api/post/{postId}/close/{ownerId}")]
    // [Authorize]
    public IActionResult Close(int postId, string ownerId)
    {
        // var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var post = _db.Posts.Include(p => p.User)
                            .Where(p => p.Id == postId)
                            .FirstOrDefault();
        if (post == null)
        {
            return NotFound("Post not found");
        }
        // check if the user is the owner of the post
        if (post.User.Id != ownerId)
        {
            return Unauthorized("User Unauthorized");
        }

        try
        {
            post.Status = "close";
            _db.SaveChanges();
            return Json(new{status =  "closed"});
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpDelete]
    [Route("/api/post/{postId}/{ownerId}")]
    // [Authorize]
    public IActionResult DeletePost(int postId, string ownerId)
    {
        // var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var post = _db.Posts.Where(p => p.Id == postId)
                            .Include(p => p.User)
                            .FirstOrDefault();
        if (post == null)
        {
            return NotFound("Post not found");
        }
        // check if the user is the owner of the post
        if (post.User.Id != ownerId)
        {
            return Unauthorized("User Unauthorized");
        }

        try
        {
            _db.Posts.Remove(post);
            _db.SaveChanges();
            return Json(new{status =  "deleted"});
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpPost]
    [Route("/api/post/{postId}/accept/{user_name}/{ownerId}")]
    // [Authorize]
    public IActionResult AcceptParticipant(int postId, string user_name)
    {
        var postOwner = User.FindFirst(ClaimTypes.Name)?.Value;
        var application = _db.Applications.Include(a => a.User)
                            .Include(a => a.Post)
                            .Where(a => a.PostId == postId && a.User.Username == user_name)
                            .FirstOrDefault();
        if (application == null)
        {
            return NotFound("Application not found");
        }
        // check if the user is the owner of the post
        if (application.User.Username != postOwner)
        {
            return Unauthorized("User Unauthorized");
        }
        application.AppliedStatus = true;
        _db.SaveChanges();
        return Json(new {status = "accepted"});
    }


    [HttpPost]
    [Route("/api/post/{postId}/reject/{user_name}/{ownerId}")]
    // [Authorize]
    public IActionResult RejectParticipant(int postId, string user_name)
    {
        var postOwner = User.FindFirst(ClaimTypes.Name)?.Value;
        var application = _db.Applications.Include(a => a.User)
                            .Include(a => a.Post)
                            .Where(a => a.PostId == postId && a.User.Username == user_name)
                            .FirstOrDefault();
        if (application == null)
        {
            return NotFound("Application not found");
        }
        // check if the user is the owner of the post
        if (application.User.Username != postOwner)
        {
            return Unauthorized("User Unauthorized");
        }
        
        application.AppliedStatus = false;
        _db.SaveChanges();
        return Json(new {status = "rejected"});
    }
    



}

