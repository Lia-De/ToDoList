﻿using Microsoft.EntityFrameworkCore;

namespace ToDoList;

public class TodoContext : DbContext
{
    public TodoContext(DbContextOptions<TodoContext> options) : base(options)
    {
    }
    public DbSet<Models.Task> Tasks { get; set; }
    public DbSet<Models.Project> Projects { get; set; }
    public DbSet<Models.Tag> Tags { get; set; }
    public DbSet<Models.ProjectTimer> ProjectTimers { get; set; }
    public DbSet<Models.User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Models.Task>().HasQueryFilter(t => !t.IsDeleted);
    }
}

