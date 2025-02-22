using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GatherApp.Models;

public class BehaviorScore
{
    [Key]
    public int Id { get; set; }

    [Required]
    [ForeignKey("User")]
    public string UserId { get; set; }

    [JsonIgnore]
    public User User { get; set; }

    [Required]
    public int Score { get; set; } = 100;

    [Required]
    public bool IsBanned { get; set; } = false;

    public DateTime? BannedUntil { get; set; }
}


