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
    
    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; }

    // ข้อมูลเพิ่มเติมของคนนั้น
    [MaxLength(4000000)]
    public string? ProfileImg { get; set; }

    [MaxLength(1000)]
    public string? Bio { get; set; }


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

}

public class ChangePasswordRequest
{
    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string OldPassword { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string NewPassword { get; set; }
}
public class Notification
{
    [Required]
    [JsonIgnore]
    public string UserId { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [Required]
    [MaxLength(200)]
    public string Content { get; set; }
}