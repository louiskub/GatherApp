using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GatherApp.Models;

public class RatingScore
{
    [Key]
    public int Id { get; set; }

    [Required]
    [ForeignKey("User")]
    public string UserId { get; set; }

    [JsonIgnore]
    public User User { get; set; }

    [Required]
    public int PostId { get; set; }

    public Post Post { get; set; }

    [Required]
    [ForeignKey("RatedUser")]
    public string RatedUserId { get; set; }

    [Required]
    [ForeignKey("Rater")]
    public string RaterId { get; set; }

    [Required]
    [Range(0, 5, ErrorMessage = "Score should be 0 to 5")]
    public int Score { get; set; }

    [MaxLength(300)]
    public string Comment { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User RatedUser { get; set; }

    public User Rater { get; set; }
}
