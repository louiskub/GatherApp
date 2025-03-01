using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GatherApp.Models;

public class UserLogin
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Provider { get; set; } // "Google"

    [Required]
    public string ProviderKey { get; set; } // Google ID

    [Required]
    public string UserId { get; set; }

    [JsonIgnore]
    public User User { get; set; }
}