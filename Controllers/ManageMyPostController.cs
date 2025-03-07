using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GatherApp.Models;
using GatherApp.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.AspNetCore.SignalR;


namespace GatherApp.Controllers;

public class ManageMyPostController : Controller
{
    private readonly AppDbContext _db;
    private readonly IHubContext<ChatHub> _chathubContext;

    public ManageMyPostController(AppDbContext db, IHubContext<ChatHub> chathubContext)
    {
        _db = db;
        _chathubContext = chathubContext;
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ดูโพสต์ที่สร้าง
    // create post
    [HttpPost]
    [Route("api/post")]
    [Authorize]
    public async Task<IActionResult> CreatePost([FromBody] DtoCreatePost dtopost, [FromServices] IHubContext<ChatHub> chathubContext)
    {
        // ดึง UserId จาก JWT
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("Invalid token");
        
        var user = await _db.Users.Where(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null)
            return NotFound("User not found");

        if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(errors);
            }

        if (dtopost.ActTypes == null || dtopost.ActTypes.Count == 0)
        {
            return BadRequest("Invalid ActTypes.");
        }

        
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
        
        dtopost.Online = dtopost.Online || false;
        if (dtopost.Online == true)
        {
            dtopost.Province = null;
            dtopost.District = null;
        }

        var activity = new Activity
        {
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
            CoverPageImg = dtopost.CoverPageImg ?? "https://images.squarespace-cdn.com/content/v1/57263bf8f8baf385ff61bb09/1535668320137-NZQPOXCGLFT34I9E4Z1E/Screen+Shot+2018-08-30+at+6.17.10+PM.png",
            Activity = activity,
            UserId = user.Id,
            User = user
        };

        try 
        {
            _db.Posts.Add(post);
            await _db.SaveChangesAsync();
            

            await chathubContext.Clients.All.SendAsync("ReceiveMessage", "Post", "New post has been created");

            var connectionId = HttpContext.Connection.Id;
            await chathubContext.Groups.AddToGroupAsync(connectionId, post.Id.ToString());


            return Json(new {status = "created"});
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
    [Route("api/post")]
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
            return Json(new{IsOpened = post.IsOpened});
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // จัดการคนสมัครเข้าร่วมโพสต์
    
    // ดูรายชื่อคนสมัคร post ของเราโพสนั้นๆ
    [Route("api/post/application")]
    [Authorize]
    public IActionResult GetAllApplicantsMyPost(int postId)
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
        
        var result = applications.OrderByDescending(a => a.AppliedStatus == null)
                                .ThenByDescending(a => a.AppliedStatus)
                                .ThenBy(a => a.AppliedDateTime)
                                .Select(a => a.ToJson()
                                ).ToList();
        return Json(result);
    }

    [Route("api/post/participant")]
    [Authorize]
    public IActionResult GetAllParticipantsMyPost(int postId)
    {
        // return Json("kuy");
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Id == userId)
                            .FirstOrDefault();
        if (user == null) 
            return NotFound("User not found");
        
        var post = _db.Posts.Where(p => p.Id == postId).FirstOrDefault();
        if (post == null) 
            return NotFound("Post not found");

        var applications = _db.Applications.Include(a => a.User)
                                        .OrderBy(a => a.AppliedDateTime)
                                        .Where(a => a.PostId == postId && a.AppliedStatus == true).ToList();

        if (applications == null || applications.Count == 0) 
            return NotFound("Applicant not found");
        if (applications.Any(a => a.UserId == user.Id) == false && post.UserId != user.Id)
            return Unauthorized("User Unauthorized");
        
        // ดูว่าเราเคยให้คะแนนคนนี้ไปแล้วหรือยัง
        var reviews = _db.RatingScores.Include(r => r.Rater)
                                    .Where(r => r.PostId == postId && r.RaterId == user.Id)
                                    .Select(r => r.RatedUserId)
                                    .ToList();

        var reports = _db.Reports.Include(r => r.Reporter)
                                .Where(r => r.PostId == postId && r.ReporterId == user.Id)
                                .Select(r => r.ReportedUserId)
                                .ToList();

        var result = applications.Select(a => new {
            a.User.Username,
            a.User.ProfileImg,
            isReviewed = reviews.Any(r => r == a.UserId),
            isReported = reports.Any(r => r == a.UserId)
        }).ToList();

        // add owner
        result.Add(new {
            Username = post.User.Username+"(Owner)",
            ProfileImg = post.User.ProfileImg,
            isReviewed = reviews.Any(r => r == post.UserId),
            isReported = reports.Any(r => r == post.UserId)
        });

        // เอาเราออกจาก list
        result = result.Where(r => r.Username != user.Username).ToList();
        return Json(result);
    }

    
    [HttpPatch]
    [Route("api/post/accept")]
    [Authorize]

    public IActionResult AcceptParticipant(int postId, string username)
    {
        var postOwnerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (postOwnerId == null)
        {
            return Unauthorized("Invalid token. User ID not found.");
        }

        var application = _db.Applications.Include(a => a.User)
                            .Include(a => a.Post)
                            .ThenInclude(p => p.User)
                            .Include(a => a.Post)
                            .ThenInclude(p => p.Activity)
                            .Include(a => a.Post.Applications)
                            .Include(a => a.Post.Activity)
                            .Where(a => a.PostId == postId && a.User.Username == username)
                            .FirstOrDefault();
        if (application == null)
            return NotFound("Application not found");
        // check if the user is the owner of the post


        if (application.Post.User == null)
        {
            return NotFound("Post owner not found.");
        }
        if (application.Post.User.Id != postOwnerId)
            return Unauthorized("User Unauthorized");
        
        var post = application.Post;
        application.AppliedStatus = true;

        if (post.Activity == null)
        {
            return NotFound("Activity data is missing for this post.");
        }

        _db.Notifications.Add(new Notification
        {
            UserId = application.User.Id,
            Content = $"Your application({application.Post.PostName}) has been accepted"
        });
        if (post.Activity.ActDatetime < DateTime.Now)
        {
            
            var userScore = _db.BehaviorScores.Where(bs => bs.UserId == application.User.Id).FirstOrDefault();
            if (userScore == null)
            {
                userScore = new BehaviorScore
                {
                    UserId = application.User.Id,
                    Score = 10,
                };
                _db.BehaviorScores.Add(userScore);
            }
            else
            {
                userScore.Score += 10;
                if(userScore.Score > 100)
                {
                    userScore.Score = 100;
                }
            } 
        }  

        _db.SaveChanges();
        _chathubContext.Clients.Group(postId.ToString()).SendAsync("ReceiveMessage", "Post", $"User {username} has been accepted to join the chat.",DateTime.UtcNow);
        post.CurParticipant = post.Applications.Count(a => a.AppliedStatus == true);
        _db.SaveChanges();
        return Json(new {status = "accepted", curParticipant = post.CurParticipant});
    }


    [HttpPatch]
    [Route("api/post/reject")]
    [Authorize]
    public IActionResult RejectParticipant(int postId, string username)
    {
        var postOwnerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var application = _db.Applications.Include(a => a.User)
                            .Include(a => a.Post)
                            .ThenInclude(p => p.User)
                            .Include(a => a.Post.Applications)
                            .Where(a => a.PostId == postId && a.User.Username == username)
                            .FirstOrDefault();
        if (application == null)
            return NotFound("Application not found");
        // check if the user is the owner of the post
        if (application.Post.User.Id != postOwnerId)
            return Unauthorized("User Unauthorized");
        
        var post = application.Post;
        application.AppliedStatus = false;
        _db.Notifications.Add(new Notification
        {
            UserId = application.User.Id,
            Content = $"Your application({application.Post.PostName}) has been rejected"
        });
        post.CurParticipant = post.Applications.Count(a => a.AppliedStatus == true);
        _db.SaveChanges();
        post.CurParticipant = post.Applications.Count(a => a.AppliedStatus == true);
        _db.SaveChanges();
        return Json(new {status = "rejected", curParticipant = post.CurParticipant});
    }


    // ดู ไฟล์ที่ผู้เข้าร่วมส่งมา
    [Route("api/post/getfile")]
    [Authorize]
    public IActionResult GetFile(int postId, string participantName)
    {
        Console.WriteLine("\n\nGetFile {0} {1}\n\n", postId, participantName);
        var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var application = _db.Applications.Include(a => a.User)
                            .Include(a => a.Post)
                            .ThenInclude(p => p.User)
                            .Where(a => a.PostId == postId && a.User.Username == participantName)
                            .FirstOrDefault();
        if (application == null)
            return NotFound("Application not found");
        // ต้องเป็นเจ้าของโพส  หรือ คนส่งไฟล์
        if (!(application.Post.User.Id == ownerId || application.User.Id == ownerId))
            return Unauthorized("User Unauthorized");
        // if (application.Post.IsAttached == false)
        //     return BadRequest("File not attached");
        if (application.FileAttached == null)
            return NotFound("File not found");
        var fileResult = application.GetFile();
        return File(fileResult.Item1, "application/octet-stream", $"archieve.{fileResult.Item2}");
    }

        [HttpGet]
        [Route("api/chat/{postId}")]
        public async Task<IActionResult> GetChatHistory(string postId)
        {
            var messages = await _db.ChatMessages
                .Where(m => m.PostId == int.Parse(postId))
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return Ok(messages);
        }


}