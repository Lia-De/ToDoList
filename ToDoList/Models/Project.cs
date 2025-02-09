using System.ComponentModel.DataAnnotations;

namespace ToDoList.Models;

public class Project
{
    [Key] public int ProjectId { get; set; }
    [MaxLength(50)] public required string Name { get; set; }
    public List<Task> Tasks { get; set; } = new List<Task>();
    public List<Tag> Tags { get; set; } = new List<Tag>();
    public ToDoStatus Status { get; set; }
    public TimeSpan TotalWorkingTime { get; set; } = TimeSpan.Zero;
    public bool HasTimerRunning { get; set; } = false;
    public string Description { get; set; } = string.Empty;
    public List<ProjectTimer> Timers { get; set; } = new List<ProjectTimer> { };
}
