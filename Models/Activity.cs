using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace GatherApp.Models;

public class Activity
{

    [Required]
    public DateTime OpenDateTime { get; set; }

    [Required]
    public DateTime CloseDateTime { get; set; }

    [Required]
    public DateTime ActDatetime { get; set; }

    public string? Latitude { get; set; }
    public string? Longitude { get; set; }


    // Relationship
    public Post Post { get; set; }  //

    [Required]
    [Key]
    public int PostId { get; set; } // Fk
    public List<ActivityType> ActTypes { get; set; } = new List<ActivityType>(); //

}


public class ActivityType
{
    public string Id { get; set; }
    public string ActType { get; set; }
}