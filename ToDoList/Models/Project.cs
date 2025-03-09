using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ToDoList.Models;

public class Project
{
    [Key] public int ProjectId { get; set; }
    [MaxLength(50)] public required string Name { get; set; }
    //[ForeignKey("UserProfileId")] public int UserProfileId { get; set; }
    //public UserProfile UserProfile{ get; set; }
    public List<Task> Tasks { get; set; } = new List<Task>();
    public List<Tag> Tags { get; set; } = new List<Tag>();
    public ToDoStatus Status { get; set; }
    public DateTime ProjectCreated { get; private set; } = DateTime.Now;
    //public TimeSpan TotalWorkingTime { get; set; } = TimeSpan.Zero;
    public bool HasTimerRunning { get; set; } = false;
    public string Description { get; set; } = string.Empty;
    public List<ProjectTimer> Timers { get; set; } = new List<ProjectTimer> { };

    [Column("TotalWorkingTime")]
    public long TotalWorkingTimeSeconds
    {
        get => (long)TotalWorkingTime.TotalSeconds;  // Convert TimeSpan to seconds
        set => TotalWorkingTime = TimeSpan.FromSeconds(value); // Convert back to TimeSpan
    }

    [NotMapped]
    public TimeSpan TotalWorkingTime { get; set; } = TimeSpan.Zero;


}
