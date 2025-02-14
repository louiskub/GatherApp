using Microsoft.AspNetCore.Mvc;
using GatherApp.Models;
using GatherApp.Data;
using System.Security.Cryptography;
using System.Text;
using GatherApp.Services;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;


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
    public IActionResult Login([FromBody] UserDTO obj)
    {
        if (!ModelState.IsValid)
        {   
            Console.WriteLine("Invalid request body");
            return BadRequest("Invalid request body");
        }
        
        Console.WriteLine(obj.Username, obj.Password);
        
        // ค้นหาผู้ใช้จากฐานข้อมูล
        var userDTO = _db.Users.Where(
            s => s.Username == obj.Username
        ).FirstOrDefault();

        // ตรวจสอบหากไม่พบผู้ใช้
        if (userDTO == null)
        {
            Console.WriteLine("Error login");
            return Json(new { status = "Invalid username or password" });
        }

        // ตรวจสอบรหัสผ่านโดยใช้ BCrypt.Verify
        if (!BCrypt.Net.BCrypt.Verify(obj.Password, userDTO.Password))
        {
            Console.WriteLine("Error login - Incorrect password");
            return Json(new { status = "Invalid username or password" });
        }

        // หากล็อกอินสำเร็จ
        Console.WriteLine("Login success");
        string stId = userDTO.Id.ToString();
        var token = _jwtService.GenerateToken(stId, userDTO.Username);
        Console.WriteLine($"token : {token}");
        
        return Json(new { status = "Login success", Token = token });
    }


    public IActionResult Register()
    {

        return View();
    }

    [HttpPost]
    [Route("api/auth/register")]
    public IActionResult Register([FromBody] UserDTO obj)
    {
        if (ModelState.IsValid)
        {
            if (_db.Users.Any(s => s.Username == obj.Username))
            {
                return BadRequest(new { message = "Username already exists" });
            }
            

            if (_db.Users.Any(s => s.Email == obj.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }
            else
            {
                var user = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = obj.Username,
                    Email = obj.Email,
                    Password = BCrypt.Net.BCrypt.HashPassword(obj.Password), 
                };

                _db.Users.Add(user);
                _db.SaveChanges();

                // สร้าง JWT Token หลังจากสมัครสำเร็จ
                string stId = user.Id.ToString();
                var token = _jwtService.GenerateToken(stId, user.Username); 

                return Ok(new { message = "Registration successful", token = token });
            }
        }
        var errors = ModelState.Values.SelectMany(v => v.Errors)
                                    .Select(e => e.ErrorMessage);
        return BadRequest(new {obj});
    }

}