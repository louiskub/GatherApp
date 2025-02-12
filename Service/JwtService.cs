using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;


namespace GatherApp.Services;
public class JwtService
{
    private readonly string _secretKey;
    private readonly int _tokenExpiryTime = 60*24; //Minutes

    public JwtService()
    {
        _secretKey = "bee3d44a29a875c6352443f6a53db29d";
    }
    public string GenerateToken(string userId, string username)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_secretKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Name, username)
            }),
            Expires = DateTime.UtcNow.AddMinutes(_tokenExpiryTime),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        
        var token = tokenHandler.CreateToken(tokenDescriptor);
        Console.WriteLine("token : ", token);
        return tokenHandler.WriteToken(token);
    }
}
