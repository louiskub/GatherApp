using GatherApp.Data;
using GatherApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

[Authorize]
public class ChatHub : Hub
{
    private readonly AppDbContext _db;

    public ChatHub(AppDbContext db)
    {
        _db = db;
    }

    public async Task JoinChat(string postId)
    {
        if (!int.TryParse(postId, out int postidInt))
        {
            await Clients.Caller.SendAsync("Error", "Invalid post ID.");
            return;
        }

        var post = _db.Posts.FirstOrDefault(p => p.Id == postidInt);

        if (post == null)
        {
            await Clients.Caller.SendAsync("Error", "Post not found.");
            return;
        }

        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value; 
        
        var isPostOwner = _db.Posts.Any(p => p.Id == postidInt && p.UserId == userId);
        var isAcceptedUser = _db.Applications.Any(pu => pu.PostId == postidInt && pu.UserId == userId && pu.AppliedStatus == true);


        if (isPostOwner || isAcceptedUser)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, postidInt.ToString());
        }
        else
        {
            await Clients.Caller.SendAsync("Error", "You are not accepted into this chat.");
        }
    }

    public async Task LoadPreviousMessages(int postId)
    {
        try
        {
            Console.WriteLine($"[DEBUG] LoadPreviousMessages called with postId: {postId}");


            int postIdInt = postId;

            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"[DEBUG] Extracted userId: {userId}");

            if (userId == null)
            {
                Console.WriteLine("[ERROR] User ID not found in context");
                await Clients.Caller.SendAsync("Error", "User not authenticated.");
                return;
            }

            var post = _db.Posts.FirstOrDefault(p => p.Id == postIdInt);
            if (post == null)
            {
                Console.WriteLine("[ERROR] Post not found");
                await Clients.Caller.SendAsync("Error", "Post not found.");
                return;
            }

            Console.WriteLine($"[DEBUG] Post found: {post.Id}");

            var isPostOwner = _db.Posts.Any(p => p.Id == postIdInt && p.UserId == userId);
            var isAcceptedUser = _db.Applications.Any(pu => pu.PostId == postIdInt && pu.UserId == userId && pu.AppliedStatus == true);
            Console.WriteLine($"[DEBUG] isPostOwner: {isPostOwner}, isAcceptedUser: {isAcceptedUser}");

            if (!isPostOwner && !isAcceptedUser)
            {
                Console.WriteLine("[ERROR] User not allowed to view this chat");
                await Clients.Caller.SendAsync("Error", "You are not allowed to view this chat.");
                return;
            }

            // 🔍 Log ว่าเริ่มดึงข้อความจาก Database
            Console.WriteLine("[DEBUG] Fetching messages from database...");
            List<object> messages;
            try
            {
                messages = _db.ChatMessages
                    .Where(m => m.PostId == postIdInt)
                    .OrderBy(m => m.SentAt)
                    .Select(m => new
                    {
                        Username = _db.Users
                            .Where(u => u.Id == m.UserId)
                            .Select(u => u.Username)
                            .FirstOrDefault() ?? "Unknown user",
                        Message = m.Message,
                        SentAt = m.SentAt.ToUniversalTime().ToString("o")
                    }).ToList<object>();

                Console.WriteLine($"[DEBUG] Loaded {messages.Count} messages");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Error fetching messages: {ex}");
                await Clients.Caller.SendAsync("Error", "Error loading messages.");
                return;
            }

            await Clients.Caller.SendAsync("LoadPreviousMessages", messages);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CRITICAL ERROR] {ex}");
            await Clients.Caller.SendAsync("Error", "Unexpected error occurred.");
        }
    }





    public async Task SendMessage(int postId, string message)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(message)) return;

            var safeMessage = HttpUtility.HtmlEncode(message);  

            var post = _db.Posts.FirstOrDefault(p => p.Id == postId);

            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                await Clients.Caller.SendAsync("Error", "Unauthorized: User ID not found.");
                return;
            }

            if (post == null)
            {
                await Clients.Caller.SendAsync("Error", "Post not found.");
                return;
            }

            var isPostOwner = _db.Posts.Any(p => p.Id == postId && p.UserId == userId);
            var isAcceptedUser = _db.Applications.Any(pu => pu.PostId == postId && pu.UserId == userId && pu.AppliedStatus == true);

            if (!isPostOwner && !isAcceptedUser)
            {
                await Clients.Caller.SendAsync("Error", "You are not allowed to send messages in this chat.");
                return;
            }
            
            var chatMessage = new ChatMessage
            {
                PostId = postId,
                UserId = userId,
                Message = message,
                SentAt = DateTime.Now
            };  

            _db.ChatMessages.Add(chatMessage);
            await _db.SaveChangesAsync();

            var user = await _db.Users.FindAsync(userId);
            string username = user?.Username ?? "Unknown";
            string profileImageUrl = user?.ProfileImg ?? "https://www.mcot.net/uploads/article/202409/fc9caee77c607de279ff9116c67c6ddf.jpeg";

            string SentAt = chatMessage.SentAt.ToString("o");

            await Clients.Group(postId.ToString()).SendAsync("ReceiveMessage", userId,username, message, SentAt, profileImageUrl);
        }
        catch (Exception e)
        {
            await Clients.Caller.SendAsync("ReceiveError", "An error occurred while sending the message.");
        }
    }

    public async Task LeaveChat(int postId)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, postId.ToString());
        await Clients.Group(postId.ToString()).SendAsync("ReceiveMessage", "System", $"User {userId} left the chat.");
    }

     public async Task DeleteMessage(string postId, string messageId)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var message = _db.ChatMessages.FirstOrDefault(m => m.Id == int.Parse(messageId));

        if (message == null)
        {
            await Clients.Caller.SendAsync("Error", "Message not found.");
            return;
        }

        var post = _db.Posts.FirstOrDefault(p => p.Id == int.Parse(postId));

        if (post == null)
        {
            await Clients.Caller.SendAsync("Error", "Post not found.");
            return;
        }

        var isPostOwner = _db.Posts.Any(p => p.Id == int.Parse(postId) && p.UserId == userId);
        var isMessageOwner = message.UserId == userId;

        if (!isPostOwner && !isMessageOwner)
        {
            await Clients.Caller.SendAsync("Error", "You are not allowed to delete this message.");
            return;
        }

        _db.ChatMessages.Remove(message);
        await _db.SaveChangesAsync();

        await Clients.Group(postId).SendAsync("DeleteMessage", messageId);
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        await Clients.Caller.SendAsync("SetCurrentUserId", userId);

        await base.OnConnectedAsync();
    }
    public async Task EditMessage(int postId, string messageId, string newMessage)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var message = _db.ChatMessages.FirstOrDefault(m => m.Id == int.Parse(messageId));

        if (message == null)
        {
            await Clients.Caller.SendAsync("Error", "Message not found.");
            return;
        }

        var post = _db.Posts.FirstOrDefault(p => p.Id == postId);;

        if (post == null)
        {
            await Clients.Caller.SendAsync("Error", "Post not found.");
            return;
        }

        var isPostOwner = _db.Posts.Any(p => p.Id == postId && p.UserId == userId);
        var isMessageOwner = message.UserId == userId;

        if (!isPostOwner && !isMessageOwner)
        {
            await Clients.Caller.SendAsync("Error", "You are not allowed to edit this message.");
            return;
        }

        message.Message = newMessage;
        await _db.SaveChangesAsync();

        await Clients.Group(postId.ToString()).SendAsync("EditMessage", messageId, newMessage);
    }

    public async Task GetUserChats()    
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Console.WriteLine($"[DEBUG] Retrieved userId: {userId}");

        if (string.IsNullOrEmpty(userId))
        {
            Console.WriteLine("🚨 Error: Unauthorized access - userId is null");
            await Clients.Caller.SendAsync("Error", "Unauthorized: User ID not found.");
            return;
        }

        var postIds = _db.Posts
            .Where(p => p.UserId == userId)
            .Select(p => p.Id)
            .Union(
                _db.Applications
                    .Where(a => a.UserId == userId && a.AppliedStatus == true)
                    .Select(a => a.PostId)
            )
            .ToList();

        Console.WriteLine($"[DEBUG] Retrieved {postIds.Count} post(s) for user {userId}");
        foreach (var postId in postIds)
        {
            Console.WriteLine($"[DEBUG] Post ID: {postId}");
        }

        await Clients.Caller.SendAsync("LoadUserChats", postIds.Select(p => (int)p).ToList());
    }    
}
