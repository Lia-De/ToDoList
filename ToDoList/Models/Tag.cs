namespace ToDoList.Models;

public class Tag
{
    public int TagId { get; set; }
    public required string Name { get; set; }
    public List<Project> Projects { get; set; } = new List<Project>();
    public List<Task> Tasks { get; set; } = new List<Task>();
}
