namespace ToDoList.Models;

public class Project
{
    public int ProjectId { get; set; }
    public required string Name { get; set; }
    public List<Task> Tasks { get; set; } = new List<Task>();
    public List<Tag> Tags { get; set; } = new List<Tag>();
    public ToDoStatus Status { get; set; }
    public TimeSpan TotalWorkingTime { get; set; } = TimeSpan.Zero;
}
