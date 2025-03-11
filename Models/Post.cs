using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http.HttpResults;
namespace GatherApp.Models;


public class Post{
    [Key]
    public int Id { get; set; }

    [Required]
    public DateTime CreateAt { get; set; } = DateTime.Now;

    [Required]
    [DefaultValue(true)]
    public bool IsOpened { get; set; } = true;

    [Required]
    [MaxLength(50)]
    public string PostName { get; set; }

    [Required]
    [MaxLength(10000)]
    public string Detail { get; set; }

    [DefaultValue(false)]
    public bool IsAttached { get; set; }
    
    [MaxLength(4000000)]
    public string? CoverPageImg { get; set; }

    [DefaultValue(0)]
    public int Like { get; set; }

    [Required]
    [Range(1, 1000, ErrorMessage = "MaxParticipant must be between 1 and 1000.")]
    public int MaxParticipant { get; set; }

    [DefaultValue(0)]
    public int CurParticipant { get; set; }


    // Relationship
    [JsonIgnore]
    public User User { get; set; }  //

    [Required]
    [JsonIgnore]
    public string? UserId { get; set; } //

    [JsonIgnore]
    public Activity Activity { get; set; }  //

    
    [JsonIgnore]
    public List<Application> Applications { get; set; } = new List<Application>(); //
    
    [JsonIgnore]
    public List<PostLike> PostLikes { get; set; } = new List<PostLike>();  // ความสัมพันธ์กับ PostLike

    public ICollection<RatingScore> RatingScores { get; set; } = new List<RatingScore>();


    // Method

    public void AcceptParticipant(User user) { /* Logic here */ }
    public void RejectPerson(User user) { /* Logic here */ }
    public void AddApplication(Application application) => Applications.Add(application);

    public string? IsPostAvailable()
    {
        if (IsOpened == false)
            return "Post is closed";

        if (Activity == null) 
            return "Activity information is missing";

        // if (DateTime.Now < Activity.OpenDateTime)
        //     return "Post is not available yet";

        if (DateTime.Now > Activity.CloseDateTime)
            return "Post is already closed";

        if (CurParticipant >= MaxParticipant)
            return "Post is already full";

        if (DateTime.Now > Activity.ActDatetime)
            return "Post is already past";

        return null;
    }

    public void ChangeEverything(DtoCreatePost dtopost) 
    { 
        PostName = dtopost.PostName;    
        Detail = dtopost.Detail;
        IsAttached = dtopost.IsAttached;
        MaxParticipant = dtopost.MaxParticipant;
        CoverPageImg = dtopost.CoverPageImg;
        Activity.CloseDateTime = dtopost.CloseDateTime;
        Activity.ActDatetime = dtopost.ActDatetime;
        Activity.Province = dtopost.Province;
        Activity.District = dtopost.District;
        Activity.Online = dtopost.Online;
        Activity.GoogleMapLink = dtopost.GoogleMapLink;
    }

    public Dictionary<string, object> ToJson(string? reqUserId=null)
    {
        CurParticipant = Applications.Count(a => a.AppliedStatus == true);
        var isAppliedApp = Applications.Where(x => x.UserId == reqUserId).FirstOrDefault();
        var isApplied = isAppliedApp != null;
        var isParticipant = false;
        if (isApplied)
            isParticipant = isAppliedApp.AppliedStatus == true;

        return new Dictionary<string, object> {
            { "owner", new Dictionary<string, object> {
                { "username", User.Username },
                { "profileImg", User.ProfileImg }
            }},
            { "post", new Dictionary<string, object> {
                { "id", Id },
                { "createAt", CreateAt },
                { "isOpened", IsOpened },
                { "postName", PostName },
                { "detail", Detail },
                { "isAttached", IsAttached },
                { "coverPageImg", CoverPageImg },
                { "like", Like },
                { "maxParticipant", MaxParticipant },
                { "curParticipant", CurParticipant },
                { "totalApplicant", Applications.Count },
                { "isLiked", PostLikes.Any(x => x.UserId == reqUserId) },
                { "isApplied", isApplied},
                { "isParticipant",  isParticipant}
            }},
            { "activity", Activity },
            { "actTypes", Activity.ActTypes.Select(x => x.ActType).ToList() }
        };
    }

    public object ToJsonSmall()
    {
        CurParticipant = Applications.Count(a => a.AppliedStatus == true);
        return new{
            Post = new {
                Id,
                CreateAt,
                IsOpened,
                PostName,
                IsAttached,
                MaxParticipant,
                CurParticipant,
                TotalApplicant = Applications.Count
            },
            Activity,
            ActTypes = Activity.ActTypes.Select(x => x.ActType).ToList()
        };
    } 
}
