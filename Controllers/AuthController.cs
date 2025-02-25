using Microsoft.AspNetCore.Mvc;
using GatherApp.Models;
using GatherApp.Data;
using System.Security.Cryptography;
using System.Text;
using GatherApp.Services;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace GatherApp.Controllers;

public class AuthController : Controller
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwtService;

    public AuthController(AppDbContext db, JwtService jwtService)
    {
        _db = db;
        _jwtService = jwtService;
    }

    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Login()
    {
        return View();
    }


    [HttpPost]
    [Route("api/auth/login")]
    public async Task<IActionResult> Login([FromBody] UserDTO obj)
    {
        if (obj.Password == null || obj.Username == null)
        {   
            return BadRequest("Invalid request body");
        }
        
        var userDTO = await _db.Users.FirstOrDefaultAsync(s=> s.Username == obj.Username);

        if (userDTO == null)
        {
            return Json(new { status = "Invalid username or password" });
        }

        var userScore = await _db.BehaviorScores.FirstOrDefaultAsync(s => s.UserId == userDTO.Id);
        if (userScore != null && userScore.IsBanned)
        {
            if (userScore.BannedUntil.HasValue && userScore.BannedUntil > DateTime.Now)
            {
            return Unauthorized($"You are banned until {userScore.BannedUntil.Value}");
            }

        if (!userScore.BannedUntil.HasValue) // แบนถาวร
            {
            return Unauthorized("You have been permanently banned.");
            }

        // ถ้าครบ 7 วันแล้ว ให้ยกเลิกการแบน
        userScore.IsBanned = false;
        userScore.BannedUntil = null;
        await _db.SaveChangesAsync();
        }

        if (!BCrypt.Net.BCrypt.Verify(obj.Password, userDTO.Password))
        {
            return Json(new { status = "Invalid username or password" });
        }

        string stId = userDTO.Id.ToString();
        var token = _jwtService.GenerateToken(stId, userDTO.Username);

        Response.Cookies.Append("token", token, new CookieOptions
        {
            HttpOnly = false,
            Secure = false,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(1)
        });
        
        return Json(new { status = "Login success", token = token });
    }
    
    [HttpPost]
    [Route("api/auth/logout")]
    public async Task<IActionResult> Logout()
    {
        // ทำการ sign-out และลบ cookie ของผู้ใช้
        Response.Cookies.Delete("token");
        // await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Index", "Home");
    }

    public IActionResult Register()
    {

        return View();
    }

    [HttpPost]
    [Route("api/auth/register")]
    public async Task<IActionResult> Register([FromBody] UserDTO obj)
    {

             if (obj == null)
            {
                return BadRequest(new { status = "Invalid request body", errors = new[] { "Request body is missing or malformed." } });
            }
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors)
                                            .Select(e => e.ErrorMessage)
                                            .ToList();

                return BadRequest(new { status = "Invalid request body" + errors, errors});
            }


            if (_db.Users.Any(s => s.Username == obj.Username))
            {
                return BadRequest(new { status = "Username already exists" });
            }
            

            if (_db.Users.Any(s => s.Email == obj.Email))
            {
                return BadRequest(new { status = "Email already exists" });
            }
            else
            {
                var user = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = obj.Username,
                    Email = obj.Email,
                    Password = BCrypt.Net.BCrypt.HashPassword(obj.Password),
                    FirstName = obj.FirstName  ?? "Unknown",
                    LastName = obj.LastName ?? "Unknown",
                    DateOfBirth = (DateTime)obj.DateOfBirth
                };

                _db.Users.Add(user);
                await _db.SaveChangesAsync();


                if (string.IsNullOrEmpty(user.Id))
                {
                    return BadRequest("User ID is null or empty.");
                }


                var behaviorScore = new BehaviorScore
                {
                    UserId = user.Id,  
                    Score = 100,     
                    IsBanned = false,
                    BannedUntil = null
                };


                _db.BehaviorScores.Add(behaviorScore);
                await _db.SaveChangesAsync();

                string stId = user.Id.ToString();
                var token = _jwtService.GenerateToken(stId, user.Username); 

                Response.Cookies.Append("token", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(1)
                });

                return Ok(new { status = "Registration successful", token = token });
            }
    }
}