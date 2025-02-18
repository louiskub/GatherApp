using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GatherApp.Models;

public class Report
{
    [Key]
    public int Id { get; set; }

    [Required]
    [ForeignKey("Reporter")]
    public string ReporterId { get; set; }  // คนที่ส่งรีพอร์ต

    [Required]
    [ForeignKey("ReportedUser")]
    public string ReportedUserId { get; set; }  // คนที่ถูกรีพอร์ต

    [Required]
    public int PostId { get; set; } // โพสต์ที่เกี่ยวข้อง

    [Required]
    [MaxLength(500)]
    public string Reason { get; set; }  // เหตุผลที่รีพอร์ต

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [ForeignKey("BehaviorScore")]
    public int? BehaviorScoreId { get; set; }

    // เชื่อมกับ User
    public User Reporter { get; set; }
    public User ReportedUser { get; set; }

    public BehaviorScore BehaviorScore { get; set; }
}
