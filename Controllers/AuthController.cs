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
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication;


namespace GatherApp.Controllers;

public class AuthController : Controller
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwtService;
    // private readonly GoogleAuthService _googleAuthService;

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
        if (string.IsNullOrWhiteSpace(obj.Username) || string.IsNullOrWhiteSpace(obj.Password))
        {   
            return BadRequest("Invalid request body");
        }

        var userExists = await _db.Users.AnyAsync(s => s.Username == obj.Username);
        if (!userExists)
        {
            return Unauthorized("Invalid username or password");
        }

        var userDTO = await _db.Users.FirstOrDefaultAsync(s => s.Username == obj.Username);
        if (!BCrypt.Net.BCrypt.Verify(obj.Password, userDTO.Password))
        {
            return Unauthorized("Invalid username or password");
        }

        var userScore = await _db.BehaviorScores.FirstOrDefaultAsync(s => s.UserId == userDTO.Id);
        if (userScore?.IsBanned == true)
        {
            if (userScore.BannedUntil.HasValue && userScore.BannedUntil > DateTime.Now)
            {
                return Unauthorized($"You are banned until {userScore.BannedUntil.Value}");
            }
            if (!userScore.BannedUntil.HasValue)
            {
                return Unauthorized("You have been permanently banned.");
            }
            
            userScore.IsBanned = false;
            userScore.BannedUntil = null;
            await _db.SaveChangesAsync();
        }

        string stId = userDTO.Id.ToString();
        var token = _jwtService.GenerateToken(stId, userDTO.Username);

        Response.Cookies.Append("token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(1)
        });

        return Ok(new { status = "Login success", token = token });
    }


    [HttpPost]
    [Route("api/auth/logout")]
    public IActionResult Logout()
    {
        // ทำการ sign-out และลบ cookie ของผู้ใช้
        Response.Cookies.Delete("token");
        // await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Json(new { status = "Logout success" });
    }

    public IActionResult Register()
    {

        return View();
    }

    [HttpPost]
    [Route("api/auth/register")]
    public async Task<IActionResult> Register([FromBody] UserDTO obj)
    {
            if (_db == null)
            {
                return StatusCode(500, new { status = "Database context is not initialized." });
            }

            if (string.IsNullOrWhiteSpace(obj.Username) || string.IsNullOrWhiteSpace(obj.Email))
            {
                return BadRequest(new { status = "Invalid input", errors = new[] { "Username, Email , and Password are required." } });
            }

            if (string.IsNullOrWhiteSpace(obj.FirstName) || string.IsNullOrWhiteSpace(obj.LastName))
            {
                return BadRequest(new { status = "Invalid input", errors = new[] { "First name and Last name are required." }} );
            }

            if (obj.DateOfBirth == null)
            {
                return BadRequest(new { status = "Invalid input", errors = new[] { "Date of birth is required." } });
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors)    
                                            .Select(e => e.ErrorMessage)
                                            .ToList();

                return BadRequest(new { status = "Invalid request body" , errors});
            }


            var existingUser = await _db.Users.FirstOrDefaultAsync(s => s.Username == obj.Username || s.Email == obj.Email);
            if (existingUser != null)
            {
                return BadRequest(new { status = "User already exists", errors = new[] { "Username or Email is already taken." } });
            }

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                var user = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = obj.Username,
                    Email = obj.Email,
                    Password = BCrypt.Net.BCrypt.HashPassword(obj.Password),
                    FirstName = obj.FirstName  ?? "Unknown",
                    LastName = obj.LastName ?? "Unknown",
                    DateOfBirth = obj.DateOfBirth ?? DateTime.UtcNow.AddDays(-2),
                    Sex = obj.Sex ?? "Unknown",
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

                await transaction.CommitAsync();

                string stId = user.Id.ToString();
                var token = _jwtService.GenerateToken(user.Id, user.Username);
                if (string.IsNullOrEmpty(token))
                {
                    return StatusCode(500, new { status = "Token generation failed" });
                }

                Response.Cookies.Append("token", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(1)
                });

                return Ok(new { status = "Registration successful", token = token });
            }
        catch 
        
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { status = "Registration failed", errors = new[] { "Transaction failed."} });
        }
    }

    [HttpPost]
    [Route("api/auth/checkpassword")]
    public async Task<IActionResult> CheckPassword([FromBody] UserDTO obj)
    {
        if (obj == null || string.IsNullOrWhiteSpace(obj.Password))
        {
            return BadRequest(new { status = "error", message = "Password is required" });
        }

        // ดึง Username ของผู้ใช้ปัจจุบันจาก Authentication (JWT, Cookie)
        var username = User.Identity?.Name; 
        if (string.IsNullOrEmpty(username))
        {
            return Unauthorized(new { status = "error", message = "User not logged in" });
        }

        // ค้นหาผู้ใช้ใน Database
        var user = await _db.Users.FirstOrDefaultAsync(s => s.Username == username);
        if (user == null)
        {
            return Unauthorized(new { status = "error", message = "User not found" });
        }

        // ตรวจสอบรหัสผ่าน
        if (!BCrypt.Net.BCrypt.Verify(obj.Password, user.Password))
        {
            return Unauthorized(new { status = "error", message = "Incorrect password" });
        }

        return Ok(new { status = "success", message = "password correct" });
    }

}
