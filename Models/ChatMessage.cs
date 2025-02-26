
namespace GatherApp.Models;



public class ChatMessage
{
    public int Id { get; set; }
    public string PostId { get; set; } 
    public string UserId { get; set; }
    public string Message { get; set; } 
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}


