using GatherApp.Data;
using GatherApp.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
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

        var userId = Context.UserIdentifier; 
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

        var userId = Context.UserIdentifier;

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
                        .Select(m => new { m.UserId, m.Message, m.SentAt })
                        .ToList();

        await Clients.Caller.SendAsync("LoadMessages", messages);
    }


    public async Task SendMessage(string postId, string userId, string message)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(message)) return;

            var safeMessage = HttpUtility.HtmlEncode(message);  

            var post = _db.Posts.FirstOrDefault(p => p.Id == int.Parse(postId));

            var postIdInt = int.Parse(postId);

            if (post == null)
            {
                await Clients.Caller.SendAsync("Error", "Post not found.");
                return;
            }

            var isPostOwner = post.UserId == userId;
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

            await Clients.Group(postId).SendAsync("ReceiveMessage", userId, message, chatMessage.SentAt);
        }
        catch (Exception e)
        {
            await Clients.Caller.SendAsync("Error", "An error occurred while sending the message.");
        }
    }

    public async Task LeaveChat(string postId)
    {
        var userId = Context.UserIdentifier;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, postId);
        await Clients.Group(postId).SendAsync("ReceiveMessage", "System", $"User {userId} left the chat.");
    }
}
