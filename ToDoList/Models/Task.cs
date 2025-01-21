namespace ToDoList.Models;

public class Task
{
    public int TaskId { get; set; }
    public required string Description { get; set; }
    public List<Tag> Tags { get; set; } = new List<Tag>();
    public DateTime? Deadline { get; set; }
    public ToDoStatus? Status { get; set; }
}
