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

    // Method
    public void CreatePost(Post post) => CreatedPosts.Add(post);
    public void RemoveCreatedPost(Post post) => CreatedPosts.Remove(post);
    public void LikePost(Post post) => LikedPosts.Add(post);
    public void RemoveLikePost(Post post) => LikedPosts.Remove(post);
    public void AddAplyHistory(Application application) => ApplyHistories.Add(application);
    public void RemoveAplyHistory(Application application) => ApplyHistories.Remove(application);
    public void AddNotification(Notification notification) => Notifications.Add(notification);
    public void ChangeUsernameEmail(string username, string email)
    {
        Username = username;
        Email = email;
    }
    public void ChangePassword(string newPassword)
    {
        Password = newPassword;
    }
    
    public void ChangeProfile(string img, string bio)
    {
        ProfileImg = img;
        Bio = bio;
    }
}


public class Notification
{
    [Required]
    public string UserId { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [Required]
    [MaxLength(200)]
    public string Content { get; set; }
}