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
    
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // เกี่ยวกับการดึงโพส

    [Route("api/acttype")]
    public async Task<ActionResult> GetAllActTypes()
    {
        var actTypes = await _db.ActivityTypes.ToListAsync();
        if (actTypes == null || actTypes.Count == 0)
            return NotFound("Activity type not found");
        return Json(actTypes.Select(a => a.ActType));
    }

    // อนาคต ต้องลบ
    [HttpPost]
    [Route("api/acttype/{actType}")]
    public IActionResult AddActType(string actType)
    {
        if (string.IsNullOrEmpty(actType))
            return BadRequest("Invalid act type");
        var newActType = new ActivityType
        {
            ActType = actType
        };
        try {
            _db.ActivityTypes.Add(newActType);
            _db.SaveChanges();
            return Json(newActType);
        }
        catch (Exception) {
            return BadRequest("Act type already exists");
        }
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
                            .Include(p => p.PostLikes)
                            .Where(p => p.Id == postId).FirstOrDefault();   // ดึงข้อมูล post+user
        if (post == null)
            return NotFound("Post not found");

        var applications = post.Applications.Where(a => a.AppliedStatus == true)
                            .Select(a => new
                            {
                                a.User.Username,
                                a.User.ProfileImg
                            }).ToList();
        var result = post.ToJson(reqUserId);
        result["participants"] = applications;
        return Json(result);
    }
    
    [Route("api/post/user")]
    public IActionResult GetPostsFromUsername(string username)
    {
        var reqUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _db.Users.Where(u => u.Username == username).FirstOrDefault();

        if (user == null) 
            return NotFound("User not found");

        var posts = _db.Posts.Include(p => p.Activity)
                            .ThenInclude(a => a.ActTypes)
                            .Include(p => p.Applications)
                            .Include(p => p.PostLikes)
                            .Where(p => p.UserId == user.Id)
                            .OrderByDescending(p => p.Id)
                            .ToList();

        if (posts == null || posts.Count == 0) 
            return NotFound("Post not found" );
        var result = posts.Select(p => p.ToJson(reqUserId)).ToList();
        return Json(result);
    }


    [HttpGet]
    [Route("api/post/allposts")]
    public async Task<ActionResult> GetAllPosts()
    {
        // รวมข้อมูล User ที่เกี่ยวข้องกับ Post
        var reqUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var posts = await _db.Posts
                            .Include(p => p.User)
                            .Include(p => p.Activity)
                            .ThenInclude(a => a.ActTypes)
                            .Include(p => p.Applications)
                            .Include(p => p.PostLikes)
                            .Where(p => p.IsOpened == true)
                            .Where(p => p.CurParticipant < p.MaxParticipant)
                            .Where(p => p.Activity.CloseDateTime > DateTime.Now)
                            .Where(p => p.Activity.ActDatetime > DateTime.Now)
                            .OrderByDescending(p => p.Like)
                            .ThenByDescending(p => p.Applications.Count)
                            .ToListAsync();
                            
        if(posts == null || !posts.Any()) 
        {
            return NotFound("No posts found");
        }
        var groupedPosts = posts.GroupBy(p => p.Activity.ActDatetime.Date)
                                .OrderBy(g => g.Key)
                                .Select(g => new {
                                       date = g.Key,  
                                    posts = g.Select(p => p.ToJson(reqUserId))})
                                .ToList();
        return Json(groupedPosts);
    }
    
    // Filter วันที่ทำกิจกรรม
    [Route("api/post/filter")]
    public async Task<ActionResult> FilterPosts
    (string? date, string? category, string? actType, string? province, string? district)
    {   
        // รวมข้อมูล User ที่เกี่ยวข้องกับ Post
        var reqUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Console.WriteLine("\n\n{0} {1} {2} {3} {4}\n\n", date, category, actType, province, district);
        var posts = await _db.Posts.Include(p => p.User)
                            .Include(p => p.Activity)
                            .ThenInclude(a => a.ActTypes)
                            .Include(p => p.Applications)
                            .Include(p => p.PostLikes)
                            .Where(p => p.IsOpened == true)
                            .Where(p => p.CurParticipant < p.MaxParticipant)
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
            posts = posts.Where(p => p.Activity.ActDatetime.Date <= DateTime.Now.Date.AddDays(7 - (int)DateTime.Now.DayOfWeek)).ToList();
        else if (date == "Next week")
            posts = posts.Where(p =>  DateTime.Now.Date.AddDays(8 - (int)DateTime.Now.DayOfWeek) <= p.Activity.ActDatetime.Date 
                            && p.Activity.ActDatetime.Date <= DateTime.Now.Date.AddDays(14 - (int)DateTime.Now.DayOfWeek)).ToList();
        else if(date == "This month")
            posts = posts.Where(p => p.Activity.ActDatetime.Month == DateTime.Now.Month).ToList();

        if (!string.IsNullOrEmpty(category) && category != "Any category")
            posts = posts.Where(p => p.Activity.ActTypes.Any(a => a.ActType == category)).ToList();

        bool? actTypeFilter = null;
        if (actType == "Online") 
            actTypeFilter = true;
        else if (actType == "Onsite") 
            actTypeFilter = false;

        if (actTypeFilter.HasValue)
            posts = posts.Where(p => p.Activity.Online == actTypeFilter).ToList();
        if (actTypeFilter == false)
        {   
            if (!string.IsNullOrEmpty(province) && province != "Any province")
                posts = posts.Where(p => p.Activity.Province == province).ToList();
            if (!string.IsNullOrEmpty(district) && district != "Any district")
                posts = posts.Where(p => p.Activity.District == district).ToList();
        }

        if (posts.Count == 0)
            return NotFound("No post found");

        var groupedPosts = posts.GroupBy(p => p.Activity.ActDatetime.Date)
                                .OrderBy(g => g.Key)
                                .Select(g => new {
                                    date = g.Key,  
                                    posts = g.Select(p => p.ToJson(reqUserId))})
                                .ToList();
        return Json(groupedPosts);
    }

    // ค้นหาโพสต์ และผู้ใช้
    [Route("api/search")]
    public async Task<ActionResult> SearchKeyword(string keyword)
    {   
        var reqUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var users = await _db.Users.Where(u => EF.Functions.Like(u.Username, $"{keyword}%"))
                                .OrderByDescending(u => u.Username == keyword)
                                .ThenBy(u => u.Username)
                                .ToListAsync();

        // รวมข้อมูล User ที่เกี่ยวข้องกับ Post
        var posts = await _db.Posts.Include(p => p.User)
                            .Include(p => p.Activity)
                            .ThenInclude(a => a.ActTypes)
                            .Include(p => p.Applications)
                            .Include(p => p.PostLikes)
                            .Where(p => p.IsOpened == true)
                            .Where(p => p.CurParticipant < p.MaxParticipant)
                            .Where(p => p.Activity.CloseDateTime > DateTime.Now)
                            .Where(p => EF.Functions.Like(p.PostName, $"%{keyword}%"))
                            .Where(p => p.Activity.ActDatetime > DateTime.Now)
                            .OrderByDescending(p => p.Like)
                            .ThenByDescending(p => p.Applications.Count)
                            .ToListAsync();   // ดึงข้อมูล post+user
                            
        if((posts == null || !posts.Any()) && (users == null || !users.Any()))   
            return NotFound("User and Post not found");

        var groupedPosts = posts.GroupBy(p => p.Activity.ActDatetime.Date)
                                .OrderBy(g => g.Key)
                                .Select(g => new {
                                    date = g.Key,  
                                    posts = g.Select(p => p.ToJson(reqUserId))})
                                .ToList();
        var groupedUsers = users.Select(u => new {
            u.Username,
            u.ProfileImg
        }).ToList();
        Console.WriteLine("\n\n{0}", reqUserId);
        Console.WriteLine("{0}", groupedPosts);
        return Json(new {posts = groupedPosts, users = groupedUsers});
    }

    // ค้นหาโพสต์ และผู้ใช้ พร้อมกับ Filter
    [Route("api/searchAndFilter")]
    public async Task<ActionResult> SearchAndFilter
    (string? date, string? category, string? actType, string? province, string? district, string? keyword)
    {
        // รวมข้อมูล User ที่เกี่ยวข้องกับ Post
        var reqUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var posts = await _db.Posts.Include(p => p.User)
                            .Include(p => p.Activity)
                            .ThenInclude(a => a.ActTypes)
                            .Include(p => p.Applications)
                            .Include(p => p.PostLikes)
                            .Where(p => p.IsOpened == true)
                            .Where(p => p.CurParticipant < p.MaxParticipant)
                            .Where(p => p.Activity.CloseDateTime > DateTime.Now)
                            .Where(p => EF.Functions.Like(p.PostName, $"%{keyword}%"))
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
            posts = posts.Where(p => p.Activity.ActDatetime.Date <= DateTime.Now.Date.AddDays(7 - (int)DateTime.Now.DayOfWeek)).ToList();
        else if (date == "Next week")
            posts = posts.Where(p =>  DateTime.Now.Date.AddDays(8 - (int)DateTime.Now.DayOfWeek) <= p.Activity.ActDatetime.Date 
                            && p.Activity.ActDatetime.Date <= DateTime.Now.Date.AddDays(14 - (int)DateTime.Now.DayOfWeek)).ToList();
        else if(date == "This month")
            posts = posts.Where(p => p.Activity.ActDatetime.Month == DateTime.Now.Month).ToList();

        if (!string.IsNullOrEmpty(category) && category != "Any category")
            posts = posts.Where(p => p.Activity.ActTypes.Any(a => a.ActType == category)).ToList();

        bool? actTypeFilter = null;
        if (actType == "Online") 
            actTypeFilter = true;
        else if (actType == "Onsite") 
            actTypeFilter = false;

        if (actTypeFilter.HasValue)
            posts = posts.Where(p => p.Activity.Online == actTypeFilter).ToList();
        if (actTypeFilter == false)
        {   
            if (!string.IsNullOrEmpty(province) && province != "Any province")
                posts = posts.Where(p => p.Activity.Province == province).ToList();
            if (!string.IsNullOrEmpty(district) && district != "Any district")
                posts = posts.Where(p => p.Activity.District == district).ToList();
        }

        if (posts.Count == 0)
            return NotFound("No post found");

        var groupedPosts = posts.GroupBy(p => p.Activity.ActDatetime.Date)
                                .OrderBy(g => g.Key)
                                .Select(g => new {
                                    date = g.Key,  
                                    posts = g.Select(p => p.ToJson(reqUserId))})
                                .ToList();
        return Json(groupedPosts);
    }


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    [Authorize]
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
        var isLiked = existingLike == null;
        if (existingLike != null)
        {
            _db.PostLikes.Remove(existingLike);
            post.Like--;
        }
        else
        {
            var postLike = new PostLike
            {
                PostId = postId,
                UserId = userId
            };
            _db.PostLikes.Add(postLike);
            post.Like++;
        }

        await _db.SaveChangesAsync();
        return Json(new{like = post.Like, isLiked});
    }


    [Route("api/chat/getactiveinvites")]
    [HttpGet]
    public async Task<IActionResult> GetActiveInvites()
    {
        var activeInvites = await _db.PostInvitations
            .OrderByDescending(i => i.SentAt)
            .Select(i => new
            {
                i.PostId,
                i.PostName,
                i.PostDetail,
                Username = _db.Users
                    .Where(u => u.Id == i.InviterUserId)
                    .Select(u => u.Username)
                    .FirstOrDefault() ?? "Unknown"
            })
            .ToListAsync();

        return Ok(activeInvites);
    }
}

