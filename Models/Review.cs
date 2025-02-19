using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GatherApp.Models
{
    public class RatingScore
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("RatedUser")]
        public string RatedUserId { get; set; }

        [Required]
        [ForeignKey("Rater")]
        public string RaterId { get; set; } 

        [Required]
        [Range(1, 5, ErrorMessage = "คะแนนต้องอยู่ระหว่าง 1 ถึง 5")]
        public int Score { get; set; } 

        [MaxLength(300)]
        public string Comment { get; set; } 

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual User RatedUser { get; set; }

        public virtual User Rater { get; set; }
    }
}
