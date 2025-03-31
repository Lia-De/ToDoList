using Microsoft.EntityFrameworkCore;
using ToDoList.Models;
using System;
namespace ToDoList;

public class TodoContext : DbContext
{
    public TodoContext(DbContextOptions<TodoContext> options) : base(options)
    {
    }
    // ✅ Parameterless constructor required for EF CLI tools
    public TodoContext()
    {
    }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            var connectionString = Environment.GetEnvironmentVariable("AZURE_SQL_CONNECTIONSTRING");
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Database connection string is missing from environment variables.");
            }
            optionsBuilder.UseSqlServer(connectionString);
        }
    }
    public DbSet<Models.Task> Tasks { get; set; }
    public DbSet<Models.Project> Projects { get; set; }
    public DbSet<Models.Tag> Tags { get; set; }
    public DbSet<Models.ProjectTimer> ProjectTimers { get; set; }
   
}

