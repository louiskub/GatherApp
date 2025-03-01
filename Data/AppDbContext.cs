using Microsoft.EntityFrameworkCore;
using GatherApp.Models;


namespace GatherApp.Data;
public class AppDbContext : DbContext
{
    // public DbSet<Student> Students { get; set; }  

    public DbSet<User> Users { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Application> Applications { get; set; }
    public DbSet<Activity> Activities { get; set; }
    public DbSet<ActivityType> ActivityTypes { get; set; }

    public DbSet<PostLike> PostLikes { get; set; }

    public DbSet<BehaviorScore> BehaviorScores { get; set; }

    public DbSet<Report> Reports { get; set; }

    public DbSet<RatingScore> RatingScores { get; set; }

    public DbSet<ChatMessage> ChatMessages { get; set; }

    public DbSet<UserLogin> UserLogins { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options) 
    {
        options.UseMySql(
            "server=localhost;port=3306;database=gatherapp;user=root;password=root;",

            new MySqlServerVersion(new Version(9, 1, 0))  // Change based on your MySQL version
        );
    }
    public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            // Define Column
            entity.HasIndex(u => u.Username)
                .IsUnique(); // Unique constraint
            
            entity.HasIndex(u => u.Email)
                .IsUnique(); // Unique constraint

            // Define Relationship          CreatedPost
            entity.HasMany(e => e.CreatedPosts)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId);

            // One to Many Relationship     AppliedHistory
            entity.HasMany(e => e.ApplyHistories)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId);

            // One to Many Relationship     Notification
            entity.HasMany(e => e.Notifications)
                .WithOne()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);;     

            // Many to Many
            entity.HasMany(e => e.LikedPosts)
                .WithMany();

            modelBuilder.Entity<PostLike>()
            .HasKey(pl => pl.Id);
        });


         modelBuilder.Entity<RatingScore>()
            .HasOne(rs => rs.Rater) 
            .WithMany(u => u.GivenRatings) 
            .HasForeignKey(rs => rs.RaterId) 

            .OnDelete(DeleteBehavior.Restrict);  


        modelBuilder.Entity<RatingScore>()
            .HasOne(rs => rs.RatedUser) 
            .WithMany(u => u.ReceivedRatings)  
            .HasForeignKey(rs => rs.RatedUserId)  

            .OnDelete(DeleteBehavior.Restrict);  

        modelBuilder.Entity<Post>(entity =>
        {

            // 1-1 Relationship  Post-Activity
            entity.HasOne(e => e.Activity)
                .WithOne(e => e.Post)
                .HasForeignKey<Activity>(e => e.PostId);
            
                        // 1-N User-Post
            entity.HasOne(e => e.User)
                .WithMany(e => e.CreatedPosts)
                .HasForeignKey(e => e.UserId);
            
            entity.HasMany(e => e.Applications)
                .WithOne(e => e.Post)
                .HasForeignKey(e => e.PostId);
        });


         modelBuilder.Entity<User>(entity =>
        {
            // Many to Many
            entity.HasMany(e => e.ActTypeProfile)
                .WithMany();
        });

        modelBuilder.Entity<Activity>(entity =>
        {
            // Many to Many
            entity.HasMany(e => e.ActTypes)
                .WithMany();
        });


        modelBuilder.Entity<Application>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.PostId });
        });


        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.CreatedAt });
        });

    }
}