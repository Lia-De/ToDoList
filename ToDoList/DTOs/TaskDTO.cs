using ToDoList.Models;

namespace ToDoList.DTOs;

public class TaskDTO
{
    public int TaskId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int ProjectId { get; set; }
    public DateTime? Deadline { get; set; }
    public ToDoStatus? Status { get; set; }
    public string? Description { get; set; }
}
