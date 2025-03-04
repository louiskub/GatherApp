using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http.HttpResults;
namespace GatherApp.Models;


public class DtoCreatePost
{
    public string PostName { get; set; }
    public string Detail { get; set; }
    public bool IsAttached { get; set; }
    public string? CoverPageImg { get; set; }

    [Range(1,1000)]
    public int MaxParticipant { get; set; }

    // public DateTime OpenDateTime { get; set; }
    public DateTime CloseDateTime { get; set; }
    public DateTime ActDatetime { get; set; }

    [MaxLength(200)]
    public string? Province { get; set; }

    public string? District { get; set; } 

    public bool Online { get; set; } = false;

    public string? GoogleMapLink { get; set; }

    public List<string> ActTypes { get; set; } = new List<string>();

}