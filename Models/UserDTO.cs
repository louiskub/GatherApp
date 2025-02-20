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

    [Required]
    [RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "First name can only contain letters.")]
    public string FirstName { get; set; }
    
    [Required]
    [RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "Last name can only contain letters.")]
    public string LastName { get; set; }

    [Required]
    [CustomValidation(typeof(UserDTO), nameof(ValidateDateOfBirth))]
    public string DateOfBirth { get; set; }

    public static ValidationResult? ValidateDateOfBirth(string dateOfBirth, ValidationContext context)
    {
        if (DateTime.TryParse(dateOfBirth, out DateTime dob))
        {
            var age = DateTime.Now.Year - dob.Year;
            if (dob > DateTime.Now.AddYears(-age)) age--;
            if (age >= 0 && age <= 120)
            {
                return ValidationResult.Success;
            }
        }
        return new ValidationResult("Date of Birth must be a valid date and the age must be between 0 and 120 years.");
    }
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