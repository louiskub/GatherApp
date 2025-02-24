using GatherApp.Data;
using GatherApp.Models;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;
using System.Threading.Tasks;

public class ChatHub : Hub
{
    private readonly AppDbContext _db;

    public ChatHub(AppDbContext db)
    {
        _db = db;
    }

    public async Task JoinChat(string postId)
    {
        var userId = Context.UserIdentifier; 

        var postUser = _db.Applications
                          .FirstOrDefault(pu => pu.PostId == int.Parse(postId) && pu.UserId == userId && pu.AppliedStatus == true);

        if (postUser != null)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, postId);
            await Clients.Group(postId).SendAsync("ReceiveMessage", "System", $"{userId} has joined the chat.");
        }
        else
        {
            await Clients.Caller.SendAsync("Error", "You are not accepted into this chat.");
        }
    }

    public async Task SendMessage(string postId, string userId, string message)
    {
        try
        {
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
            Console.WriteLine($"Error: {e.Message}");
            await Clients.Caller.SendAsync("Error", "An error occurred while sending the message.");
        }
    }

    public async Task LeaveChat(string postId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, postId);
        await Clients.Group(postId).SendAsync("ReceiveMessage", "System", $"User {Context.ConnectionId} left the chat.");
    }
}
