using Microsoft.EntityFrameworkCore;
using GatherApp.Models;

namespace GatherApp.Data;
public class AppDbContext : DbContext
{
    // public DbSet<Student> Students { get; set; }  
    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Application> Applications { get; set; }
    public DbSet<Activity> Activities { get; set; }
    public DbSet<ActivityType> ActivityTypes { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options) 
    {
        options.UseMySql(
            "server=localhost;port=3306;database=testdb3;user=root;password=root;",
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

            // One to Many Relationship     AppliedPost
            entity.HasMany(e => e.AppliedPosts)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId);

            // Many to Many
            entity.HasMany(e => e.LikedPosts)
                .WithMany();

            // Notification
            // entity.HasMany(e => e.Notification)
            //     .WithOne()
            //     .HasForeignKey("UserId");            
        });


        modelBuilder.Entity<Post>(entity =>
        {
            // 1-1 Relationship  Post-Activity
            entity.HasOne(e => e.Activity)
                .WithOne(e => e.Post)
                .HasForeignKey<Activity>(e => e.PostId);
            
            entity.HasMany(e => e.Applications)
                .WithOne(e => e.Post)
                .HasForeignKey(e => e.PostId);
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
    }
}