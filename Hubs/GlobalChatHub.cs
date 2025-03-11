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
            string profileImageUrl = user?.ProfileImg ?? "https://tr.rbxcdn.com/30DAY-Avatar-310966282D3529E36976BF6B07B1DC90-Png/352/352/Avatar/Png/noFilter";

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
            true, 
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
                }

                await Groups.AddToGroupAsync(Context.ConnectionId, "GlobalChat");

                await LoadGlobalMessages(); 
            }
            catch (Exception ex)
            {

            }
            
            await base.OnConnectedAsync();
        }

        private static Dictionary<string, (string Username, string ProfileImg)> _userCache = new();

        public async Task LoadGlobalMessages()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserId = userId;

            var messagesList = await _db.ChatGlobals
                .OrderByDescending(m => m.SentAt)
                .Take(30)
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            var userIds = messagesList.Select(m => m.UserId).Distinct().ToList();

            var missingUserIds = userIds.Where(id => !_userCache.ContainsKey(id)).ToList();

            if (missingUserIds.Any())
            {
                var userData = await _db.Users
                    .Where(u => missingUserIds.Contains(u.Id))
                    .Select(u => new { u.Id, u.Username, u.ProfileImg })
                    .ToListAsync();

                foreach (var user in userData)
                {
                    _userCache[user.Id] = (user.Username ?? "Unknown", user.ProfileImg ?? GetDefaultProfileImage());
                }
            }

            var messages = messagesList
                .Select(m => new
                {
                    IsMine = (m.UserId == currentUserId),
                    Username = _userCache.ContainsKey(m.UserId) ? _userCache[m.UserId].Username : "Unknown",
                    Message = m.Message,
                    SentAt = m.SentAt.ToUniversalTime().ToString("o"),
                    ProfileImg = _userCache.ContainsKey(m.UserId) ? _userCache[m.UserId].ProfileImg : GetDefaultProfileImage()
                })
                .ToList();

            var postInvitations = await _db.PostInvitations
                .OrderByDescending(p => p.SentAt)
                .Take(30)
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

            await Clients.All.SendAsync("LoadPreviousGlobalMessages", messages, postInvitations);
        }


        private string GetDefaultProfileImage()
        {
            return "https://tr.rbxcdn.com/30DAY-Avatar-310966282D3529E36976BF6B07B1DC90-Png/352/352/Avatar/Png/noFilter";
        }


    public async Task SendPostInvitation(int postId)
    {
        try
        {

            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                await Clients.Caller.SendAsync("Error", "Unauthorized: User ID not found.");
                return;
            }


            var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null)
            {
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


        await Clients.Group("GlobalChat").SendAsync("ReceivePostInvitation", 
                invitation.PostId, invitation.PostName, invitation.PostDetail, username);
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("Error", $"An unexpected error occurred: {ex.Message}");
        }
    }




    }