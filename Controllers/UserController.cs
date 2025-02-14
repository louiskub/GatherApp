using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GatherApp.Models;
using GatherApp.Data;

namespace GatherApp.Controllers;

public class UserController : Controller
{
    private readonly AppDbContext _db;

    public UserController(AppDbContext db)
    {
        _db = db;
    }

    [Route("/api/getuser")]
    public IActionResult GetUser()
    {
        var user = _db.Users.Where(u => u.Id == "1").FirstOrDefault();
        if (user == null)
        {
            return NotFound();
        }
        return Json(new { userid = user.Id, username = user.Username, password = user.Password });
    }

    [HttpPost]
    [Route("/api/createuser")]
    public IActionResult CreateUser([FromBody] User user)
    {
        try
        {
            _db.Users.Add(user);
            _db.SaveChanges();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
        return Json(new { user });
    }

}

