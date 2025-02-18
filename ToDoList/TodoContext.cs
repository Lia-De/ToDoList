using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ToDoList.Models;

namespace ToDoList;

public class TodoContext : IdentityDbContext<AppUser>
{
    public TodoContext(DbContextOptions<TodoContext> options) : base(options)
    {
    }
    public DbSet<Models.Task> Tasks { get; set; }
    public DbSet<Models.Project> Projects { get; set; }
    public DbSet<Models.Tag> Tags { get; set; }
    public DbSet<Models.ProjectTimer> ProjectTimers { get; set; }
    public DbSet<Models.AppUser> AppUsers { get; set; }
    public DbSet<Models.UserProfile> UserProfiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // Supposedly should work - does not.
        modelBuilder.Entity<Models.Task>().HasQueryFilter(t => !t.IsDeleted);
    }
}

