using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace GatherApp.Models;


public class Application{

    [Required]
    public DateTime AppliedDateTime { get; set; } = DateTime.Now;

    public bool? AppliedStatus { get; set; } = null; // pending accepted rejected

    [MaxLength(4000000)]
    public string? FileAttached { get; set; }


    // Relationship
    [JsonIgnore]
    public User User { get; set; }  //
    [JsonIgnore]
    public string UserId { get; set; }  // FK
    
    public Post Post { get; set; } //
    
    [JsonIgnore]
    public int PostId { get; set; }  // FK

    public (byte[], string) GetFile ()
    {
        var content = Convert.FromBase64String(FileAttached);
        var fileType = GetFileType(content);
        return (content, fileType);
    }

    public object ToJson()
    {
        return new {
            User.Username,
            User.ProfileImg,
            AppliedDateTime,
            AppliedStatus
        };
    }

    public string GetFileType(byte[] fileBytes)
    {
        if (fileBytes.Length < 4) return "Unknown";

        // Convert first few bytes to hex
        string hexHeader = BitConverter.ToString(fileBytes, 0, 4).Replace("-", "");

        // Check against known magic numbers
        return hexHeader switch
        {
            "89504E47" => "PNG",
            "FFD8FFE0" or "FFD8FFE1" or "FFD8FFE2" or "FFD8FFE3" => "JPEG",
            "47494638" => "GIF",
            "25504446" => "PDF",
            "504B0304" => "ZIP",
            "424D"     => "BMP",
            "49492A00" or "4D4D002A" => "TIFF",
            "52494646" => "WAV or AVI",
            _ => "Unknown"
        };
    }
}

public class DtoApplyPost
{
    public string? FileAttached { get; set; }
}