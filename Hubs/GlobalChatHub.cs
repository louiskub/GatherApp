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
public class GlobalChatHub : Hub
{
    private static readonly Dictionary<string, string> _userConnections = new Dictionary<string, string>();
    private readonly AppDbContext _db;

    public GlobalChatHub(AppDbContext db)
    {
        _db = db;
    }

    public async Task JoinGlobalChat()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "GlobalChat");
        await Clients.Caller.SendAsync("JoinedGlobalChat", "You have joined the global chat.");
    }

    public async Task SendGlobalMessage(string message)
    {
        if (string.IsNullOrWhiteSpace(message)) return;

        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            await Clients.Caller.SendAsync("Error", "Unauthorized: User ID not found.");
            return;
        }

        var user = await _db.Users.FindAsync(userId);
        string username = user?.Username ?? "Unknown";
        string profileImageUrl = user?.ProfileImg ?? "https://www.mcot.net/uploads/article/202409/fc9caee77c607de279ff9116c67c6ddf.jpeg";

        var globalMessage = new ChatGlobal
        {
            UserId = userId,
            Message = message,
            SentAt = DateTime.Now,
            ProfileImg = profileImageUrl
        };

        _db.ChatGlobals.Add(globalMessage);
        await _db.SaveChangesAsync();

        await Clients.Group("GlobalChat").SendAsync(
            "ReceiveGlobalMessage",
            username,
            message,
            globalMessage.SentAt.ToString("o"),
            profileImageUrl
        );
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            _userConnections[Context.ConnectionId] = userId;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, "GlobalChat");

        await base.OnConnectedAsync();
    }

    public async Task LoadGlobalMessages()
    {
        var messages = _db.ChatGlobals
            .OrderBy(m => m.SentAt)
            .Select(m => new
            {
                Username = _db.Users
                    .Where(u => u.Id == m.UserId)
                    .Select(u => u.Username)
                    .FirstOrDefault() ?? "Unknown",
                Message = m.Message,
                SentAt = m.SentAt.ToUniversalTime().ToString("o"),
                ProfileImg = m.ProfileImg
            }).ToList();

        await Clients.Caller.SendAsync("LoadGlobalMessages", messages);
    }
}