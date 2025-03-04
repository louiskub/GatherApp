namespace GatherApp.Models;

public class PostInvitation
{
    public int Id { get; set; }  
    public int PostId { get; set; }  
    public string PostName { get; set; }  
    public string PostDetail { get; set; }  
    public string InviterUserId { get; set; }  
    public DateTime SentAt { get; set; }  
    public Post Post { get; set; }
}