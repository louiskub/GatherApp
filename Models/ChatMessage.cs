
namespace GatherApp.Models;



public class ChatMessage
{
    public int Id { get; set; }
    public string PostId { get; set; }  // ผูกกับโพสต์
    public string UserId { get; set; }  // ผูกกับผู้ใช้
    public string Message { get; set; } // ข้อความ
    public DateTime SentAt { get; set; } = DateTime.UtcNow; // เวลาส่งข้อความ
}


