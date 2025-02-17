using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using GatherApp.Models;
using GatherApp.Data;

namespace GatherApp.Controllers;

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

    [Route("post/allpost")]
    public async Task<IActionResult> GetAllPost()
    {
        // ดึงข้อมูลทั้งหมดจากฐานข้อมูล
        var posts = await _db.Posts.Include(p => p.User).ToListAsync();
        // ส่งข้อมูลไปยัง View
        return View(posts);
    }
    
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // เกี่ยวกับการดึงโพส

    [Route("api/actype")]
    public async Task<ActionResult> GetAllActTypes()
    {
        var actTypes = await _db.ActivityTypes.ToListAsync();
        if (actTypes == null || actTypes.Count == 0)
            return NotFound("Activity type not found");
        return Json(actTypes);
    }

    // ถ้าเป็นเจ้าของ return isOwner = true
    [Route("api/post")]
    public IActionResult GetPostFromId(int postId)
    {
        var reqUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var post = _db.Posts.Include(p => p.User)
                            .Include(p => p.Activity)
                            .ThenInclude(a => a.ActTypes)
                            .Include(p => p.Applications)
                            .ThenInclude(a => a.User)
                            .Where(p => p.Id == postId).FirstOrDefault();   // ดึงข้อมูล post+user
        if (post == null)
            return NotFound();

        bool isOwner = post.User.Id == reqUserId;

        var applications = post.Applications.Where(a => a.AppliedStatus == true)
                            .Select(a => new
                            {
                                a.User.Username,
                                a.User.ProfileImg
                            }).ToList();

        return Json(new {
            owner = new {
                post.User.Username,
                post.User.ProfileImg
            },
            post,
            activity = post.Activity,
            actTypes = post.Activity.ActTypes.Select(a => a.ActType),
            participant = applications,
            isOwner
        });
    }

    // ถ้าเป็นเจ้าของ return isOwner = true
    [Route("api/post/user")]
    public IActionResult GetPostsFromUsername(string username)
    {
        var reqUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();

        if (user == null) 
            return NotFound("User not found");

        bool isOwner = user.Id == reqUserId;
        
        var posts = _db.Posts.Include(p => p.Activity)
                            .Include(p => p.Applications)
                            .Where(p => p.UserId == user.Id)
                            .OrderByDescending(p => p.CreateAt)
                            .ToList();

        if (posts == null || posts.Count == 0) 
            return NotFound("Post not found" );
        var result = posts.Select(p => p.ToJson());
        return Json(new{posts = result, isOwner});
    }


    [Route("api/post/allposts")]
    public async Task<ActionResult> GetAllPosts()
    {
        // รวมข้อมูล User ที่เกี่ยวข้องกับ Post
        var posts = await _db.Posts.Include(p => p.User)
                            .Include(p => p.Activity)
                            .ThenInclude(a => a.ActTypes)
                            .Include(p => p.Applications)
                            .Where(p => p.IsOpened == true)
                            .Where(p => p.CurParticipant < p.MaxParticipant)
                            .Where(p => p.Activity.OpenDateTime < DateTime.Now)
                            .Where(p => p.Activity.CloseDateTime > DateTime.Now)
                            .Where(p => p.Activity.ActDatetime > DateTime.Now)
                            .OrderByDescending(p => p.Like)
                            .ThenByDescending(p => p.Applications.Count)
                            .ToListAsync();   // ดึงข้อมูล post+user
                            
        if(posts == null || !posts.Any())   
            return NotFound();

        var groupedPosts = posts.GroupBy(p => p.Activity.ActDatetime.Date)
                                .Select(g => new {
                                    date = g.Key,  
                                    posts = g.Select(p => p.ToJson())})
                                .ToList();
        return Json(groupedPosts);
    }
    
    // Filter วันที่ทำกิจกรรม
    [Route("api/post/filter")]
    public async Task<ActionResult> FilterPosts
    (string? date, string? category, string? actType, string? province, string? district)
    {   
        // รวมข้อมูล User ที่เกี่ยวข้องกับ Post
        var posts = await _db.Posts.Include(p => p.User)
                            .Include(p => p.Activity)
                            .ThenInclude(a => a.ActTypes)
                            .Include(p => p.Applications)
                            .Where(p => p.IsOpened == true)
                            .Where(p => p.CurParticipant < p.MaxParticipant)
                            .Where(p => p.Activity.OpenDateTime < DateTime.Now)
                            .Where(p => p.Activity.CloseDateTime > DateTime.Now)
                            .Where(p => p.Activity.ActDatetime > DateTime.Now)
                            .OrderByDescending(p => p.Like)
                            .ThenByDescending(p => p.Applications.Count)
                            .ToListAsync();   // ดึงข้อมูล post+user
                            
        if(posts == null || !posts.Any())   
            return NotFound("No post found");

        if (date == "Today")
            posts = posts.Where(p => p.Activity.ActDatetime.Date == DateTime.Now.Date).ToList();
        else if (date == "Tomorrow")
            posts = posts.Where(p =>  p.Activity.ActDatetime.Date == DateTime.Now.Date.AddDays(1)).ToList();
        else if (date == "This week")
            posts = posts.Where(p => p.Activity.ActDatetime.Date <= DateTime.Now.Date.AddDays(7)).ToList();
        else if (date == "Next week")
            posts = posts.Where(p =>  DateTime.Now.Date.AddDays(7) <= p.Activity.ActDatetime.Date 
                            && p.Activity.ActDatetime.Date <= DateTime.Now.Date.AddDays(14)).ToList();

        if (!string.IsNullOrEmpty(category))
            posts = posts.Where(p => p.Activity.ActTypes.Any(a => a.ActType == category)).ToList();

        bool? actTypeFilter = null;
        if (actType == "Online") 
            actTypeFilter = true;
        else if (actType == "In Person") 
            actTypeFilter = false;
        
        if (actTypeFilter.HasValue)
            posts = posts.Where(p => p.Activity.Online == actTypeFilter).ToList();
        if (actTypeFilter == false)
        {
            if (!string.IsNullOrEmpty(province))
                posts = posts.Where(p => p.Activity.Province == province).ToList();
            if (!string.IsNullOrEmpty(district))
                posts = posts.Where(p => p.Activity.District == district).ToList();
        }

        if (posts.Count == 0)
            return NotFound("No post found");

        var groupedPosts = posts.GroupBy(p => p.Activity.ActDatetime.Date)
                                .Select(g => new {
                                    date = g.Key,  
                                    posts = g.Select(p => p.ToJson())})
                                .ToList();
        return Json(groupedPosts);
    }

    // ค้นหาโพสต์ และผู้ใช้
    [Route("api/search")]
    public async Task<ActionResult> SearchKeyword(string keyword)
    {   
        var users = await _db.Users.Where(u => EF.Functions.Like(u.Username, $"{keyword}%")).ToListAsync();

        // รวมข้อมูล User ที่เกี่ยวข้องกับ Post
        var posts = await _db.Posts.Include(p => p.User)
                            .Include(p => p.Activity)
                            .ThenInclude(a => a.ActTypes)
                            .Include(p => p.Applications)
                            .Where(p => p.IsOpened == true)
                            .Where(p => p.CurParticipant < p.MaxParticipant)
                            .Where(p => p.Activity.OpenDateTime < DateTime.Now)
                            .Where(p => p.Activity.CloseDateTime > DateTime.Now)
                            .Where(p => EF.Functions.Like(p.PostName, $"%{keyword}%"))
                            .Where(p => p.Activity.ActDatetime > DateTime.Now)
                            .OrderByDescending(p => p.Like)
                            .ThenByDescending(p => p.Applications.Count)
                            .ToListAsync();   // ดึงข้อมูล post+user
                            
        if((posts == null || !posts.Any()) && (users == null || !users.Any()))   
            return NotFound("User and Post not found");

        var groupedPosts = posts.GroupBy(p => p.Activity.ActDatetime.Date)
                                .Select(g => new {
                                    date = g.Key,  
                                    posts = g.Select(p => p.ToJson())})
                                .ToList();
        return Json(new {posts = groupedPosts, users});
    }


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    // กดไลค์โพสต์
    [HttpPost]
    [Route("api/post/togglelike/{postId}")]
    public async Task<IActionResult> ToggleLike(int postId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("Invalid token");
        
        var post = await _db.Posts.Include(p => p.PostLikes)
                                .FirstOrDefaultAsync(p => p.Id == postId);
        if (post == null)
            return NotFound("Post not found");
        

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
        return Json(new{like = post.Like}); // ส่งจำนวนไลก์กลับไป
    }
}

