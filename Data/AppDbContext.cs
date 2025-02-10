using Microsoft.EntityFrameworkCore;
// using KongRukSiam.Models;

namespace GatherApp.Data;
public class AppDbContext : DbContext
{
    // public DbSet<Student> Students { get; set; }  
    protected override void OnConfiguring(DbContextOptionsBuilder options) 
    {
        options.UseMySql(
            "server=localhost;port=3306;database=testdb;user=root;password=root;",
            new MySqlServerVersion(new Version(9, 1, 0))  // Change based on your MySQL version
        );
    }
    public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // modelBuilder.Entity<Student>(entity =>
        // {
        //     entity.HasKey(u => u.id); // Primary key

        //     entity.Property(u => u.username)
        //         .IsRequired()  // NOT NULL constraint
        //         .HasMaxLength(10);

        //     entity.Property(u => u.password)
        //         .IsRequired()       // NOT NULL constraint
        //         .HasMaxLength(50); // Maximum length constraint
        // });
    }
}