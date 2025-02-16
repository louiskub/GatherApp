using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GatherApp.Models;
using GatherApp.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;


namespace GatherApp.Controllers;

public class ManageMyPostController : Controller
{
    private readonly AppDbContext _db;

    public ManageMyPostController(AppDbContext db)
    {
        _db = db;
    }

        // get my created post
    [Route("/api/user/mycreatedpost")]
    [Authorize]
    public IActionResult GetMyCreatedPost()
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();

        if (user == null) 
            return NotFound("User not found");
        
        var posts = _db.Posts.Include(p => p.Activity)
                            .Where(p => p.UserId == user.Id)
                            .OrderByDescending(p => p.CreateAt)
                            .ToList();

        if (posts == null || posts.Count == 0) 
            return NotFound("Post not found" );
        var result = posts.Select(p => 
            new {
                post = new {
                    p.Id, p.CreateAt, p.PostName,  
                    p.Like, p.IsOpened, 
                    p.MaxParticipant,
                    CurParticipant = p.Applications.Count(a => a.AppliedStatus == true), 
                    totalApplicant = p.Applications.Count,
                },
                activity = p.Activity
            }
        );
        return Json(posts);
    }


    // get All Applicant my created post
    [Route("/api/user/mycreatedpost/{postId}")]
    [Authorize]
    public IActionResult GetAllApplicantMyCreatedPost(int postId)
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = _db.Users.Include(u => u.CreatedPosts)
                            .ThenInclude(p => p.Applications)
                            .Where(u => u.Username == username)
                            .FirstOrDefault();

        if (user == null) 
            return NotFound("User not found");
        
        var post = user.CreatedPosts.Where(p => p.Id == postId).FirstOrDefault();

        if (post == null) 
            return NotFound("Post not found");
        
        var applications = post.Applications;
        if (applications == null || applications.Count == 0) 
            return NotFound("Applicant not found");

        var result = applications.OrderBy(a => a.AppliedStatus == null)
                                .ThenByDescending(a => a.AppliedStatus)
                                .ThenByDescending(a => a.AppliedDateTime)
                                .Select(a => 
                                new {
                                    a.User.Username,
                                    a.User.ProfileImg,
                                    a.AppliedDateTime,
                                    a.AppliedStatus,
                                    a.FileAttached
                                }
        ).ToList();
        return Json(result);
    }



    [HttpPost]
    [Route("api/post/createpost")]
    [Authorize]
    public async Task<IActionResult> CreatePost([FromBody] DtoCreatePost dtopost)
    {   
        // ดึง UserId จาก JWT
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("Invalid token");
        
        var user = await _db.Users.Where(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null)
            return NotFound("User not found");
        
        // ตรวจสอบว่า dtopost.ActTypes ไม่เป็น null หรือว่าง
        var actTypes = new List<ActivityType>();

        foreach (var actType in dtopost.ActTypes)
        {   
            var temp = await _db.ActivityTypes.Where(a => a.ActType == actType).FirstOrDefaultAsync();
            if (temp != null)
                actTypes.Add(temp);
        }

        if (actTypes.Count == 0)
            return BadRequest("Invalid ActTypes");

        if (dtopost.Online == true)
        {
            dtopost.Province = null;
            dtopost.District = null;
        }
        var activity = new Activity
        {
            OpenDateTime = dtopost.OpenDateTime,
            CloseDateTime = dtopost.CloseDateTime,
            ActDatetime = dtopost.ActDatetime,
            Province = dtopost.Province,
            District = dtopost.District,
            Online = dtopost.Online,
            GoogleMapLink = dtopost.GoogleMapLink,
            ActTypes = actTypes
        };

        var post = new Post
        {
            PostName = dtopost.PostName,
            Detail = dtopost.Detail,
            IsAttached = dtopost.IsAttached,
            MaxParticipant = dtopost.MaxParticipant,
            CoverPageImg = dtopost.CoverPageImg,
            Activity = activity,
            UserId = user.Id,  // ระบุ User ที่โพสต์
            User = user
        };

        try 
        {
            _db.Posts.Add(post);
            await _db.SaveChangesAsync();  // ใช้ SaveChangesAsync เพื่อทำงานไม่บล็อก
            return Json(post.Activity);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpDelete]
    [Route("api/post")]
    [Authorize]
    public IActionResult DeletePost(int postId)
    {
        var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var post = _db.Posts.Where(p => p.Id == postId)
                            .Include(p => p.User)
                            .FirstOrDefault();
        if (post == null)
            return NotFound("Post not found");
        // check if the user is the owner of the post
        if (post.User.Id != ownerId)
            return Unauthorized("User Unauthorized");

        try
        {
            _db.Posts.Remove(post);
            _db.SaveChanges();
            return Json(new{status = "deleted"});
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    // แก้ไขโพสต์ที่ตัวเองสร้าง
    [HttpPut]
    [Route("api/post/edit")]
    [Authorize]
    public IActionResult EditPost(int postId, [FromBody] DtoCreatePost dtopost)
    {
        var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var post = _db.Posts.Include(p => p.User)
                            .Include(p => p.Activity)
                            .ThenInclude(a => a.ActTypes)
                            .Where(p => p.Id == postId)
                            .FirstOrDefault();
        if (post == null)
            return NotFound("Post not found");
        // check if the user is the owner of the post
        if (post.User.Id != ownerId)
            return Unauthorized("User Unauthorized");

        var actTypes = new List<ActivityType>();
        foreach (var actType in dtopost.ActTypes)
        {   
            var temp = _db.ActivityTypes.Where(a => a.ActType == actType).FirstOrDefault();
            if (temp != null)
                actTypes.Add(temp);
        }
        if (actTypes.Count == 0)
            return BadRequest("Invalid ActTypes");
        
        if (dtopost.Online == true)
        {
            dtopost.Province = null;
            dtopost.District = null;
        }

        try
        {
            post.ChangeEverything(dtopost);
            post.Activity.ActTypes = actTypes;
            _db.SaveChanges();
            return Json(new{status = "updated"});
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpPatch]
    [Route("api/post/toggle")]
    [Authorize]
    public IActionResult ToggleIsOpened(int postId)
    {
        var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var post = _db.Posts.Include(p => p.User)
                            .Where(p => p.Id == postId)
                            .FirstOrDefault();
        if (post == null)
            return NotFound("Post not found");
        // check if the user is the owner of the post
        if (post.User.Id != ownerId)
            return Unauthorized("User Unauthorized");
        
        try
        {
            post.IsOpened = !post.IsOpened;
            _db.SaveChanges();
            return Json(new{status =  "toggle"});
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpPost]
    [Route("api/post/accept")]
    [Authorize]

    public IActionResult AcceptParticipant(int postId, string user_name)
    {
        var postOwner = User.FindFirst(ClaimTypes.Name)?.Value;
        var application = _db.Applications.Include(a => a.User)
                            .Include(a => a.Post)
                            .Where(a => a.PostId == postId && a.User.Username == user_name)
                            .FirstOrDefault();
        if (application == null)
            return NotFound("Application not found");
        // check if the user is the owner of the post
        if (application.User.Username != postOwner)
            return Unauthorized("User Unauthorized");
        application.AppliedStatus = true;
        _db.SaveChanges();
        return Json(new {status = "accepted"});
    }


    [HttpPost]
    [Route("api/post/reject")]
    [Authorize]
    public IActionResult RejectParticipant(int postId, string user_name)
    {
        var postOwner = User.FindFirst(ClaimTypes.Name)?.Value;
        var application = _db.Applications.Include(a => a.User)
                            .Include(a => a.Post)
                            .Where(a => a.PostId == postId && a.User.Username == user_name)
                            .FirstOrDefault();
        if (application == null)
            return NotFound("Application not found");
        // check if the user is the owner of the post
        if (application.User.Username != postOwner)
            return Unauthorized("User Unauthorized");
        
        application.AppliedStatus = false;
        _db.SaveChanges();
        return Json(new {status = "rejected"});
    }


    // ดู ไฟล์ที่ผู้เข้าร่วมส่งมา
    [Route("api/post/getfile")]
    [Authorize]
    public IActionResult GetFile(int postId, string participantName)
    {
        var ownerName = User.FindFirst(ClaimTypes.Name)?.Value;
        var application = _db.Applications.Include(a => a.Post)
                            .ThenInclude(p => p.User)
                            .Where(a => a.PostId == postId && a.User.Username == participantName)
                            .FirstOrDefault();
        if (application == null)
            return NotFound("Application not found");
        // ต้องเป็นเจ้าของโพส
        if (application.Post.User.Username != ownerName)
            return Unauthorized("User Unauthorized");
        if (application.Post.IsAttached == false)
            return BadRequest("File not attached");
        if (application.FileAttached == null)
            return NotFound("File not found");
        var fileResult = application.GetFile();
        return File(fileResult.Item1, "application/octet-stream", $"archieve.{fileResult.Item2}");
    }



}