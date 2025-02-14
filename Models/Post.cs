using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
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
    public string? UserId { get; set; } //

    [JsonIgnore]
    public Activity Activity { get; set; }  //

    
    [JsonIgnore]
    public List<Application> Applications { get; set; } = new List<Application>(); //
    
    public List<PostLike> PostLikes { get; set; } = new List<PostLike>();  // ความสัมพันธ์กับ PostLike


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

        if (DateTime.Now < Activity.OpenDateTime)
            return "Post is not available yet";

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
        Activity.OpenDateTime = dtopost.OpenDateTime;
        Activity.CloseDateTime = dtopost.CloseDateTime;
        Activity.ActDatetime = dtopost.ActDatetime;
        Activity.Province = dtopost.Province;
        Activity.District = dtopost.District;
        Activity.Online = dtopost.Online;
        Activity.GoogleMapLink = dtopost.GoogleMapLink;
    }
}



public class PostLike
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public Post Post { get; set; }

    public string UserId { get; set; }  // ใช้ UserId จาก JWT
    public User User { get; set; }
}


public class DtoCreatePost
{
    public string PostName { get; set; }
    public string Detail { get; set; }
    public bool IsAttached { get; set; }
    public string? CoverPageImg { get; set; }

    [Range(1,1000)]
    public int MaxParticipant { get; set; }

    public DateTime OpenDateTime { get; set; }
    public DateTime CloseDateTime { get; set; }
    public DateTime ActDatetime { get; set; }

    [MaxLength(200)]
    public string? Province { get; set; }

    public string? District { get; set; } 

    public bool? Online { get; set; }

    public string? GoogleMapLink { get; set; }

    public List<string> ActTypes { get; set; } = new List<string>();

}

