using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using GatherApp.Models;
using GatherApp.Data;

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
            foreach (var id in dtopost.ActTypes)
            {   
                var actType = await _db.ActivityTypes.Where(a => a.Id == id).FirstOrDefaultAsync();
                if (actType != null)
                    actTypes.Add(actType);
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
            return Json(post);
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

}
