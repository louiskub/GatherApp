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

        await Clients.OthersInGroup("GlobalChat").SendAsync(
        "ReceiveGlobalMessage",
        false, 
        username,
        message,
        globalMessage.SentAt.ToString("o"),
        profileImageUrl
         );

        await Clients.Caller.SendAsync(
        "ReceiveGlobalMessage",
        true, // เป็นข้อความของเรา
        username,
        message,
        globalMessage.SentAt.ToString("o"),
        profileImageUrl
    );

    }

   public override async Task OnConnectedAsync()
    {
        try
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                _userConnections[Context.ConnectionId] = userId;
                Console.WriteLine($"[DEBUG] User {userId} connected with ConnectionId: {Context.ConnectionId}");
            }
            else
            {
                Console.WriteLine("[WARNING] OnConnectedAsync: User ID not found!");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, "GlobalChat");
            Console.WriteLine($"[DEBUG] ConnectionId {Context.ConnectionId} added to GlobalChat group.");
            await LoadGlobalMessages(); 
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] OnConnectedAsync failed: {ex.Message}\n{ex.StackTrace}");
        }
        
        await base.OnConnectedAsync();
    }


    public async Task LoadGlobalMessages()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUserId = userId; 

        var messages = await _db.ChatGlobals
            .OrderBy(m => m.SentAt)
            .Select(m => new
            {
                IsMine = (m.UserId == currentUserId),
                Username = _db.Users
                    .Where(u => u.Id == m.UserId)
                    .Select(u => u.Username)
                    .FirstOrDefault() ?? "Unknown",
                Message = m.Message,
                SentAt = m.SentAt.ToUniversalTime().ToString("o"),
                ProfileImg = m.ProfileImg
            })
            .ToListAsync();

        Console.WriteLine($"[DEBUG] Loaded {messages.Count} messages");
        
        var postInvitations = await _db.PostInvitations
        .OrderBy(p => p.SentAt)
        .Select(p => new
        {
            PostId = p.PostId,
            PostName = p.Post.PostName,
            PostDetail = p.Post.Detail,
            Username = _db.Users
                .Where(u => u.Id == p.InviterUserId)
                .Select(u => u.Username)
                .FirstOrDefault() ?? "Unknown",
            SentAt = p.SentAt.ToUniversalTime().ToString("o")
        })
        
        .ToListAsync();

         Console.WriteLine($"[DEBUG] Loaded {postInvitations.Count} post invitations");

            foreach (var msg in messages)
            {
                Console.WriteLine($"[Debug] IsMine: {msg.IsMine}, Username: {msg.Username}, Message: {msg.Message}, SentAt: {msg.SentAt}, ProfileImg: {msg.ProfileImg}");
            }

            foreach (var invite in postInvitations)
            {
                Console.WriteLine($"[Debug] PostId: {invite.PostId}, PostName: {invite.PostName}, PostDetail: {invite.PostDetail}, Username: {invite.Username}, SentAt: {invite.SentAt}");
            }

        await Clients.All.SendAsync("LoadPreviousGlobalMessages", messages, postInvitations); 
        Console.WriteLine("[DEBUG] Sent LoadPreviousGlobalMessages to Client");
    }

public async Task SendPostInvitation(int postId)
{
    try
    {
        Console.WriteLine($"[DEBUG] SendPostInvitation called with postId: {postId}, Type: {postId.GetType()}");

        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            await Clients.Caller.SendAsync("Error", "Unauthorized: User ID not found.");
            return;
        }

        Console.WriteLine($"[DEBUG] postId Type: {postId.GetType()}");

        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == postId);
        if (post == null)
        {
            Console.WriteLine($"[ERROR] Post with ID {postId} not found.");
            await Clients.Caller.SendAsync("Error", "Post not found.");
            return;
        }

        var user = await _db.Users.FindAsync(userId);
        string username = user?.Username ?? "Unknown";

        var invitation  = new PostInvitation
        {
            PostId = post.Id,
            PostName = post.PostName,
            PostDetail = post.Detail,
            InviterUserId = userId,
            SentAt = DateTime.Now
        };

        _db.PostInvitations.Add(invitation);
        await _db.SaveChangesAsync();

        Console.WriteLine($"[DEBUG] User '{username}' invited to post '{post.PostName}' ({postId})");
        Console.WriteLine($"[DEBUG] Sending to GlobalChat: PostId={invitation.PostId}, PostName={invitation.PostName}, PostDetail={invitation.PostDetail}, Username={username}");

       await Clients.Group("GlobalChat").SendAsync("ReceivePostInvitation", 
            invitation.PostId, invitation.PostName, invitation.PostDetail, username);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR] SendPostInvitation failed: {ex.Message}\n{ex.StackTrace}");
        await Clients.Caller.SendAsync("Error", $"An unexpected error occurred: {ex.Message}");
    }
}




}