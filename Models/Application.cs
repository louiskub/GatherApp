using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GatherApp.Models;


public class Application{

    [Required]
    public DateTime AppliedDateTime { get; set; } = DateTime.Now;

    public bool AppliedStatus { get; set; } // pending accepted rejected

    [MaxLength(4000000)]
    public string? FileAttached { get; set; }


    // Relationship
    public User User { get; set; }  //
    public string UserId { get; set; }  // FK
    public Post Post { get; set; } //
    public int PostId { get; set; }  // FK
}

public class DtoApplyPost
{
    public string? FileAttached { get; set; }
}