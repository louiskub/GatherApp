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
