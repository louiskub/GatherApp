using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GatherApp.Models;

public class Report
{
    [Key]
    public int Id { get; set; }

    [Required]
    [ForeignKey("Reporter")]
    public string ReporterId { get; set; }  

    [Required]
    [ForeignKey("ReportedUser")]
    public string ReportedUserId { get; set; } 

    [Required]
    public int PostId { get; set; } 

    [Required]
    [MaxLength(500)]
    public string Reason { get; set; }  

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [ForeignKey("BehaviorScore")]
    public int? BehaviorScoreId { get; set; }

    public User Reporter { get; set; }
    public User ReportedUser { get; set; }

    public BehaviorScore BehaviorScore { get; set; }
}
