using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http.HttpResults;
namespace GatherApp.Models;


public class PostLike
{
    [JsonIgnore]
    public int Id { get; set; }

    [JsonIgnore]
    public int PostId { get; set; }
    public Post Post { get; set; }

    [JsonIgnore]
    public string UserId { get; set; }  // ใช้ UserId จาก JWT
    [JsonIgnore]
    public User User { get; set; }
}

public class unlikedPost
{
    public int PostId { get; set; }

}