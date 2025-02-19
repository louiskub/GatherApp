using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;


namespace GatherApp.Models;

public class User{

    [Key]
    [Required]
    [MaxLength(36)]
    public string Id { get; set; }     // uuid
    
    [Required]
    [MaxLength(20)]
    public string Username { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(50)]
    public string Email { get; set; }

    public string? Sex { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password must have at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    public string Password { get; set; }


    public string? ProfileImg { get; set; }

    [MaxLength(1000)]
    public string? Bio { get; set; }

    [Required]
    [RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "First name can only contain letters.")]
    public string FirstName { get; set; }

    [Required]
    [RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "Last name can only contain letters.")]
    public string LastName { get; set; }

    [Required]
    public DateTime DateOfBirth { get; set; }

    public List<ActivityType> ActTypeProfile { get; set; } = new List<ActivityType>();

    // Relationship
    [JsonIgnore]
    public List<Post> CreatedPosts { get; set; } = new List<Post>(); //

    [JsonIgnore]
    public List<Post> LikedPosts { get; set; } = new List<Post>(); //

    [JsonIgnore]
    public List<Application> ApplyHistories { get; set; } = new List<Application>(); //

    [JsonIgnore]
    public List<Notification> Notifications { get; set; } = new List<Notification>(); //

    public ICollection<BehaviorScore> BehaviorScores { get; set; }

    public ICollection<RatingScore> GivenRatings { get; set; } = new List<RatingScore>();

    public ICollection<RatingScore> ReceivedRatings { get; set; } = new List<RatingScore>();

}

public class ChangePasswordRequest
{
    [Required]
    [StringLength(100, MinimumLength = 8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password must have at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    public string OldPassword { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password must have at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    public string NewPassword { get; set; }
}

public class Notification
{
    [Required]
    [JsonIgnore]
    public string UserId { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(200)]
    public string Content { get; set; }
}