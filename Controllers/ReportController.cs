using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using GatherApp.Models;
using GatherApp.Data;
using System.Net.NetworkInformation;

namespace GatherApp.Controllers;

[Authorize]
public class ReportController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportController(AppDbContext db)
    {
        _db = db;
    }



[HttpPost]
[Route("api/reports/create")]
public async Task<IActionResult> CreateReport([FromBody] CreateReportRequest report)
{
    var reporterId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var reporter = await _db.Users.FirstOrDefaultAsync(u => u.Id == reporterId);
    var reported = await _db.Users.FirstOrDefaultAsync(u => u.Username == report.ReportedUsername);
    if (reporter == null || reported == null)
        return NotFound("User not found.");

    var postOwner = await _db.Posts
        .Where(p => p.Id == report.PostId && p.UserId == reporterId)
        .FirstOrDefaultAsync();

    if (postOwner == null)
    {
        return BadRequest("You must be the owner of the post to report users in it.");
    }

    if (reported.Id == reporter.Id)
    {
        return BadRequest("You cannot report yourself.");
    }

    var post = await _db.Posts.Include(p=> p.Activity).FirstOrDefaultAsync(p => p.Id == report.PostId);
    if (post == null)
    {
        return NotFound("Post not found.");
    }

    if(DateTime.Now < post.Activity.ActDatetime)
    {
        return BadRequest("Reports can only be made after the event date.");
    }

    bool alreadyReported = await _db.Reports
        .AnyAsync(r => r.ReporterId == reporterId && r.ReportedUserId == reported.Id && r.PostId == report.PostId);

    if (alreadyReported)
    {
        return BadRequest("You have already reported this user in this post.");
    }

    var newReport = new Report
    {
        ReporterId = reporterId,
        ReportedUserId = reported.Id,
        PostId = report.PostId,
        Reason = report.Reason,
        ReportType = reported.Id == post.UserId ? ReportType.Owner : ReportType.User,
    };

    _db.Reports.Add(newReport);

    var participantCount = await _db.Posts.CountAsync(p => p.Id == report.PostId);
    var reportCount = await _db.Reports.CountAsync(r => r.PostId == report.PostId && r.ReportType == ReportType.Owner);
    
    if (reportCount >= participantCount /2)
    {

        var reportedPostOwner = await _db.BehaviorScores.FirstOrDefaultAsync(s => s.UserId == post.UserId);
        if (reportedPostOwner != null )
        {
            reportedPostOwner.Score -= 20;

            _db.Notifications.Add(new Notification
            {
                Type = "report",
                Title = "Behavior Score",
                UserId = reported.Id,
                Content = "Your behavior score has been reduced by 20 due to a report.",
                CreatedAt = DateTime.Now
            });

            if (reportedPostOwner.Score < 50 && !reportedPostOwner.IsBanned)
            {
                reportedPostOwner.IsBanned = true;
                reportedPostOwner.BannedUntil = DateTime.Now.AddDays(7);

                _db.Notifications.Add(new Notification
                {
                    Type = "report",
                    Title = "Behavior Score",
                    UserId = reported.Id,
                    Content = "Your behavior score is below 50, and you have been temporarily banned for 7 days.",
                    CreatedAt = DateTime.Now
                });
            }

            if (reportedPostOwner.Score <= 0)
            {
                reportedPostOwner.IsBanned = true;
                reportedPostOwner.BannedUntil = null;

                _db.Notifications.Add(new Notification
                {
                    Type = "report",
                    Title = "Behavior Score",
                    UserId = reported.Id,
                    Content = "Your behavior score has reached 0, and you have been permanently banned.",
                    CreatedAt = DateTime.Now
                });
            }
        }
    }





    var reportedUserScore = await _db.BehaviorScores.FirstOrDefaultAsync(s => s.UserId == reported.Id);

    if (reportedUserScore != null)
    {
        reportedUserScore.Score -= 20;

        _db.Notifications.Add(new Notification
        {
            Type = "report",
            Title = "Behavior Score",
            UserId = reported.Id,
            Content = "Your behavior score has been reduced by 20 due to a report.",
            CreatedAt = DateTime.Now
        });

        if (reportedUserScore.Score <= 0)
        {
            reportedUserScore.IsBanned = true;
            reportedUserScore.BannedUntil = null;

            _db.Notifications.Add(new Notification
            {
                Type = "report",
                Title = "Behavior Score",
                UserId = reported.Id,
                Content = "Your behavior score has reached 0, and you have been permanently banned.",
                CreatedAt = DateTime.Now
            });
        }
        else if (reportedUserScore.Score < 50 && !reportedUserScore.IsBanned)
        {
            reportedUserScore.IsBanned = true;
            reportedUserScore.BannedUntil = DateTime.Now.AddDays(7);

            _db.Notifications.Add(new Notification
            {
                Type = "report",
                Title = "Behavior Score",
                UserId = reported.Id,
                Content = "Your behavior score is below 50, and you have been temporarily banned for 7 days.",
                CreatedAt = DateTime.Now
            });
        }
    }
    else
    {
        return NotFound("Behavior score not found for reported user.");
    }

    await _db.SaveChangesAsync();
    return Ok(new { message = "Report submitted successfully." });

    }   

    [HttpPut]
    [Route("api/reports/update/{postId}/{reportedUserId}")]
    public async Task<IActionResult> UpdateReportByPostId(int postId, string reportedUserId, [FromBody] Report updatedReport)
    {
        var reporterId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(reporterId))
        {
            return Unauthorized("Invalid token");
        }

        var post = await _db.Posts.Include(p => p.Activity).FirstOrDefaultAsync(p => p.Id == postId);
        if (post == null)
        {
            return NotFound("Post not found.");
        }

        if (post.UserId != reporterId)
        {
            return BadRequest("You are not authorized to update reports for this post.");
        }

        var report = await _db.Reports
            .FirstOrDefaultAsync(r => r.PostId == postId && r.ReportedUserId == reportedUserId);

        if (report == null)
        {
            return NotFound("Report not found. ");
        }

        if (DateTime.Now < post.Activity.ActDatetime)
        {
            return BadRequest("Reports can only be updated after the event date.");
        }

        report.Reason = updatedReport.Reason;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Report updated successfully." });
    }


}

