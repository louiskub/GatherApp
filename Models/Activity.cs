using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GatherApp.Models;

public class Activity
{

    [Required]
    public DateTime OpenDateTime { get; set; }

    [Required]
    public DateTime CloseDateTime { get; set; }

    [Required]
    public DateTime ActDatetime { get; set; }


    [MaxLength(200)]
    public string? Province { get; set; }

    public string? District { get; set; } 

    public bool? Online { get; set; } 

    public string? GoogleMapLink { get; set; }

    // Relationship
    [JsonIgnore]
    public Post Post { get; set; }  //

    [Required]
    [Key]
    [JsonIgnore]
    public int? PostId { get; set; } // Fk

    [JsonIgnore]
    public List<ActivityType> ActTypes { get; set; } = new List<ActivityType>(); //

    // Method
    public void AddActType(ActivityType actType) => ActTypes.Add(actType);
    public void RemoveActType(ActivityType actType) => ActTypes.Remove(actType);

}


public class ActivityType
{
    public int Id { get; set; }
    public string ActType { get; set; }
}