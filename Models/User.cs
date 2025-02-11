using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

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
    public List<Post> CreatedPosts { get; set; } = new List<Post>(); //
    public List<Post> LikedPosts { get; set; } = new List<Post>(); //
    public List<Application> ApplyHistories { get; set; } = new List<Application>(); //
    public List<string> Notifications { get; set; } = new List<string>();
}