using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

    [Route("/api/getpost")]
    public IActionResult GetPost()
    {
        var post = _db.Posts.Include(p => p.User).Where(p => p.Id == 9).FirstOrDefault();   // ดึงข้อมูล post+user
        if (post == null)
        {
            return NotFound();
        }
        return Json(new { post, post.User});
    }

    [HttpPost]
    [Route("/api/createpost/{userId}")]
    public IActionResult CreatePost([FromBody] DtoCreatePost dtopost, string userId)
    {   
        // return Ok(dtopost);
        var user = _db.Users.Where(u => u.Id == userId).FirstOrDefault();
        if (user == null)
        {
            return NotFound("User not found");
        }

        var actTypes = new List<ActivityType>();
        foreach (var id in dtopost.ActTypes)
        {   
            var actType = _db.ActivityTypes.Where(a => a.Id == id).FirstOrDefault();
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
}
