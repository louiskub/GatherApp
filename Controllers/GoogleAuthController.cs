using Microsoft.AspNetCore.Mvc;
using GatherApp.Models;
using GatherApp.Data;
using GatherApp.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using System.Security.Claims;

namespace GatherApp.Controllers
{
    public class GoogleAuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly JwtService _jwtService;
        private readonly GoogleAuthService _googleAuthService;

        public GoogleAuthController(AppDbContext db, JwtService jwtService, GoogleAuthService googleAuthService)
        {
            _db = db;
            _jwtService = jwtService;
            _googleAuthService = googleAuthService;
        }

[HttpGet]
[Route("api/auth/google-login")]
public IActionResult GoogleLogin()
{
    var properties = new AuthenticationProperties { RedirectUri = Url.Action("GoogleResponse") };
    return Challenge(properties, GoogleDefaults.AuthenticationScheme);
}

[HttpGet]
[Route("api/auth/google-response")]
public async Task<IActionResult> GoogleResponse()
{
    var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    
    if (!result.Succeeded)
    {
        return Unauthorized("Google authentication failed");
    }

    var claims = result.Principal.Identities.FirstOrDefault()?.Claims;
    var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
    var fullName = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? "Unknown";
    var nameParts = fullName.Split(' ', 2);
    var firstName = nameParts.Length > 0 ? nameParts[0] : "Unknown";
    var lastName = nameParts.Length > 1 ? nameParts[1] : "Unknown";
    var googleId = claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrEmpty(email))
    {
        return Unauthorized("Email not received from Google");
    }

    var existingUser = await _db.Users
                                .Include(u => u.UserLogins)
                                .FirstOrDefaultAsync(u => u.Email == email);

    bool isFirstTimeLogin = false;

    if (existingUser == null)
    {
        var newUser = new User
        {
            Id = Guid.NewGuid().ToString(),
            Username = email.Split('@')[0],
            Email = email,
            Password = "",
            FirstName = firstName,
            LastName = lastName,
            DateOfBirth = new DateTime(2000, 1, 1),
            Sex = "Unknown",
            UserLogins = new List<UserLogin>
            {
                new UserLogin { Provider = "Google", ProviderKey = googleId }
            }
        };

        _db.Users.Add(newUser);
        await _db.SaveChangesAsync();
        existingUser = newUser;
        isFirstTimeLogin = true;
    }
    else
    {
        if(!existingUser.UserLogins.Any(ul => ul.Provider == "Google"))
        {
            existingUser.UserLogins.Add(new UserLogin 
            { 
                Provider = "Google", 
                ProviderKey = googleId 
            });
            await _db.SaveChangesAsync();
        }

        if (existingUser.Sex == "Unknown" || existingUser.DateOfBirth == new DateTime(2000, 1, 1))
        {
            isFirstTimeLogin = true;
        }
    }

    // สร้าง JWT Token
    var token = _jwtService.GenerateToken(existingUser.Id, existingUser.Username);

    //  if (isFirstTimeLogin)
    // {
    //     return Redirect($"/user/myprofile?token={token}");
    // }

    Response.Cookies.Append("token", token, new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Expires = DateTime.UtcNow.AddDays(1)
    });

    return Ok(new { status = "Login", token = token });
    }
  }
}
