using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using GatherApp.Models;
using GatherApp.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace GatherApp.Controllers;

[Authorize]
public class PostController : Controller
{
    private readonly AppDbContext _db;

    public PostController(AppDbContext db)
    {
        _db = db;
    }


    [Route("post/aboutpost")]
        public IActionResult AboutPost()
     {
        return View();
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

    [Route("api/post/createpost")]
    public async Task<IActionResult> CreatePost([FromBody] DtoCreatePost dtopost)
    {   
        // ดึง UserId จาก JWT
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("Invalid token");
        }

        var user = await _db.Users.Where(u => u.Id == userId).FirstOrDefaultAsync();
        
        if (user == null)
        {
            return NotFound("User not found");
        }

        // ตรวจสอบว่า dtopost.ActTypes ไม่เป็น null หรือว่าง
        var actTypes = new List<ActivityType>();

        if (dtopost.ActTypes != null && dtopost.ActTypes.Any())
        {
            foreach (var actType in dtopost.ActTypes)
            {   
                var temp = await _db.ActivityTypes.Where(a => a.ActType == actType).FirstOrDefaultAsync();
                if (temp != null)
                    actTypes.Add(temp);
            }
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

    [Route("post/allpost")]
    public async Task<IActionResult> GetAllPost()
    {
        // ดึงข้อมูลทั้งหมดจากฐานข้อมูล
        var posts = await _db.Posts.Include(p => p.User).ToListAsync();
        // ส่งข้อมูลไปยัง View
        return View(posts);
    }

    [Route("api/post/allposts")]
    public async Task<ActionResult<IEnumerable<Post>>> GetAllPosts()
    {
        // รวมข้อมูล User ที่เกี่ยวข้องกับ Post
        var posts = await _db.Posts.Include(p => p.User).ToListAsync();
        if(posts == null || !posts.Any())   
        {
            return NotFound();
        }
        return Ok(posts);
    }

    [HttpPost]
    [Route("api/post/togglelike/{postId}")]

    public async Task<IActionResult> ToggleLike(int postId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("Invalid token");
        }

        var post = await _db.Posts.Include(p => p.PostLikes)
                                .FirstOrDefaultAsync(p => p.Id == postId);
        if (post == null)
        {
            return NotFound("Post not found");
        }

        var existingLike = post.PostLikes.FirstOrDefault(pl => pl.UserId == userId);
        
        if (existingLike != null)
        {
            // ถ้าเคยไลก์แล้ว → ให้ Unlike
            _db.PostLikes.Remove(existingLike);
            post.Like--;
        }
        else
        {
            // ถ้ายังไม่เคยไลก์ → ให้ Like
            var postLike = new PostLike
            {
                PostId = postId,
                UserId = userId
            };
            _db.PostLikes.Add(postLike);
            post.Like++;
        }

        await _db.SaveChangesAsync();
        return Ok(post.Like); // ส่งจำนวนไลก์กลับไป
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
            var temp = _db.ActivityTypes.Where(a => a.ActType == actType)
                                        .FirstOrDefault();
            if (temp != null)
                actTypes.Add(temp);

        }

        try
        {
        
            post.ChangeEverything(dtopost);
            
            _db.SaveChanges();
            return Json(new{status =  "updated"});
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpPatch]
    [Route("api/post/close")]
    [Authorize]
    public IActionResult Close(int postId)
    {
        var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
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
            post.IsOpened = false;
            _db.SaveChanges();
            return Json(new{status =  "closed"});
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

