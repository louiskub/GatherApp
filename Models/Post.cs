using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
namespace GatherApp.Models;


public class Post{
    [Key]
    public int Id { get; set; }

    [Required]
    public DateTime CreateAt { get; set; } = DateTime.Now;

    [Required]
    [MaxLength(10)]
    public string Status { get; set; }  // open closeApp full close     เปิด ปิดรับสมัคร เต็ม ปิด(ทำกิจกจรรมแล้ว)

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



    // Method
    public void ChangeEverything(string name, string detail) 
    { 
        // Name = name; 
        // Detail = detail; 
    }

    public void AcceptParticipant(User user) { /* Logic here */ }
    public void RejectPerson(User user) { /* Logic here */ }
    public void AddApplication(Application application) => Applications.Add(application);
}



public class DtoCreatePost
{
    public string PostName { get; set; }
    public string Detail { get; set; }
    public bool IsAttached { get; set; }
    public string? CoverPageImg { get; set; }
    public int MaxParticipant { get; set; }

    public DateTime OpenDateTime { get; set; }
    public DateTime CloseDateTime { get; set; }
    public DateTime ActDatetime { get; set; }
    public string? Latitude { get; set; }
    public string? Longitude { get; set; }

    public List<int> ActTypes { get; set; } = new List<int>();

}
