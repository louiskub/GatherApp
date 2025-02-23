using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;

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
    [StringLength(100, MinimumLength = 8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password must have at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    public string Password { get; set; }

    [RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "First name can only contain letters.")]
    public string? FirstName { get; set; }
    
    [RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "Last name can only contain letters.")]
    public string? LastName { get; set; }

    [DataType(DataType.Date)]
    public DateTime? DateOfBirth { get; set; }

}


public class UpdateProfileRequest
{
    
    [MaxLength(20)]
    public string? Username { get; set; }

    [EmailAddress]
    [MaxLength(50)]
    public string? Email { get; set; }
    public string? Sex { get; set; }
    public string? ProfileImg { get; set; }

    [MaxLength(1000)]
    public string? Bio { get; set; }

    [RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "First name can only contain letters.")]
    public string? FirstName { get; set; }
    
    [RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "Last name can only contain letters.")]
    public string? LastName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public List<string> ActTypeProfile { get; set; } = [];
}

public class UserProfileResponse
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string ProfileImg { get; set; }
    public string Bio { get; set; }
    public string Message { get; set; }
}