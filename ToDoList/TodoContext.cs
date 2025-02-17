using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ToDoList;

public class TodoContext : IdentityDbContext<IdentityUser>
{
    public TodoContext(DbContextOptions<TodoContext> options) : base(options)
    {
    }
    public DbSet<Models.Task> Tasks { get; set; }
    public DbSet<Models.Project> Projects { get; set; }
    public DbSet<Models.Tag> Tags { get; set; }
    public DbSet<Models.ProjectTimer> ProjectTimers { get; set; }
    //public DbSet<Models.User> Users { get; set; }

    //protected override void OnModelCreating(ModelBuilder modelBuilder)
    //{
    //    base.OnModelCreating(modelBuilder); // Supposedly should work - does not.
    //    modelBuilder.Entity<Models.Task>().HasQueryFilter(t => !t.IsDeleted);
    //}
}

