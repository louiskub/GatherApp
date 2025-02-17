using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace GatherApp.Models;


public class UserDTO
{
    public string? Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string Username { get; set; }

    [EmailAddress]
    [MaxLength(50)]
    public string? Email { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; }
}

public class UpdateProfileRequest
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string ProfileImg { get; set; }
    public string Bio { get; set; }
    public string Password { get; set; }
}

public class UserProfileResponse
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string ProfileImg { get; set; }
    public string Bio { get; set; }
    public string Message { get; set; }
}