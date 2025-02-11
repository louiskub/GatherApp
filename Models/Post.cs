using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace GatherApp.Models;

public class Post{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(10)]
    public string Status { get; set; }  // open closeApp full close     เปิด ปิดรับสมัคร เต็ม ปิด(ทำกิจกจรรมแล้ว)

    [Required]
    [MaxLength(50)]
    public string PostName { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Detail { get; set; }

    [DefaultValue(false)]
    public bool IsAttached { get; set; }
    
    [MaxLength(4000000)]
    public string? CoverPageImg { get; set; }

    [DefaultValue(0)]
    public int Like { get; set; }

    [Required]
    public int MaxParticipant { get; set; }

    [DefaultValue(0)]
    public int CurParticipant { get; set; }


    [Required]
    public User User { get; set; }  //

    [Required]
    public string UserId { get; set; } //

    [Required]
    public Activity Activity { get; set; }  //

    public List<Application> Applications { get; set; } = new List<Application>(); //

}
