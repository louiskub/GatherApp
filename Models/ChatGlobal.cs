
namespace GatherApp.Models;

public class ChatGlobal
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string Message { get; set; }
    public DateTime SentAt { get; set; }
    public string ProfileImg { get; set; }
}