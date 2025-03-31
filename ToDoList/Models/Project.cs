using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ToDoList.Models;

public class Project
{
    [Key] public int ProjectId { get; set; }
    [MaxLength(50)] public required string Name { get; set; }
    public List<Task> Tasks { get; set; } = [];
    public List<Tag> Tags { get; set; } = [];
    public ToDoStatus Status { get; set; }
    public DateTime ProjectCreated { get; private set; } = DateTime.Now;
    //public TimeSpan TotalWorkingTime { get; set; } = TimeSpan.Zero;
    public bool HasTimerRunning { get; set; } = false;
    public string Description { get; set; } = string.Empty;
    public List<ProjectTimer> Timers { get; set; } = [];

    [Column("TotalWorkingTime")]
    public long TotalWorkingTimeSeconds
    {
        get => (long)TotalWorkingTime.TotalSeconds;  // Convert TimeSpan to seconds
        set => TotalWorkingTime = TimeSpan.FromSeconds(value); // Convert back to TimeSpan
    }

    [NotMapped]
    public TimeSpan TotalWorkingTime { get; set; } = TimeSpan.Zero;


}
