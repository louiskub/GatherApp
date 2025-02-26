using GatherApp.Data;
using GatherApp.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

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
        var postIdInt = int.Parse(postId);
        
        var isPostOwner = _db.Posts.Any(p => p.Id == postIdInt && p.UserId == userId);
        var isAcceptedUser = _db.Applications.Any(pu => pu.PostId == postIdInt && pu.UserId == userId && pu.AppliedStatus == true);


        if (isPostOwner || isAcceptedUser)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, postId);
            await Clients.Group(postId).SendAsync("ReceiveMessage", "System", $"{userId} has joined the chat.");
        }
        else
        {
            await Clients.Caller.SendAsync("Error", "You are not accepted into this chat.");
        }
    }

    public async Task LoadPreviousMessages(string postId)
    {
        if (!int.TryParse(postId, out int postIdInt))
        {
            await Clients.Caller.SendAsync("Error", "Invalid Post ID.");
            return;
        }

        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var post = _db.Posts.FirstOrDefault(p => p.Id == postIdInt);

        if (post == null)
        {
            await Clients.Caller.SendAsync("Error", "Post not found.");
            return;
        }

        var isPostOwner = _db.Posts.Any(p => p.Id == postIdInt && p.UserId == userId);
        var isAcceptedUser = _db.Applications.Any(pu => pu.PostId == postIdInt && pu.UserId == userId && pu.AppliedStatus == true);


        if (!isPostOwner && !isAcceptedUser)
        {
            await Clients.Caller.SendAsync("Error", "You are not allowed to view this chat.");
            return;
        }


        var messages = _db.ChatMessages
                        .Where(m => m.PostId == postIdInt.ToString())
                        .OrderBy(m => m.SentAt)
                        .Select(m => new
                        {
                            Username = _db.Users
                                        .Where(u => u.Id == m.UserId)
                                        .Select(u => u.Username)
                                        .FirstOrDefault() ?? "Unknow user",
                            Message = m.Message,
                            SentAt = m.SentAt.ToUniversalTime().ToString("o")
                        }).ToList();


        await Clients.Caller.SendAsync("LoadPreviousMessages", messages);
    }


    public async Task SendMessage(string postId, string message)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(message)) return;

            var safeMessage = HttpUtility.HtmlEncode(message);  

            var post = _db.Posts.FirstOrDefault(p => p.Id == int.Parse(postId));

            var postIdInt = int.Parse(postId);

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

            var isPostOwner = _db.Posts.Any(p => p.Id == postIdInt && p.UserId == userId);
            var isAcceptedUser = _db.Applications.Any(pu => pu.PostId == postIdInt && pu.UserId == userId && pu.AppliedStatus == true);

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
                SentAt = DateTime.UtcNow
            };  

            _db.ChatMessages.Add(chatMessage);
            await _db.SaveChangesAsync();

            var user = await _db.Users.FindAsync(userId);
            string username = user?.Username ?? "Unknown";

            string SentAt = chatMessage.SentAt.ToString("o");

            await Clients.Group(postId).SendAsync("ReceiveMessage", username, message, SentAt);
        }
        catch (Exception e)
        {
            await Clients.Caller.SendAsync("ReceiveError", "An error occurred while sending the message.");
        }
    }

    public async Task LeaveChat(string postId)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, postId);
        await Clients.Group(postId).SendAsync("ReceiveMessage", "System", $"User {userId} left the chat.");
    }
}