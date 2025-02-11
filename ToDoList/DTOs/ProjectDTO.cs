using ToDoList.Models;

namespace ToDoList.DTOs;

public class ProjectDTO
{
    public int ProjectId { get; set; }
    public string? Name { get; set; }
    public ToDoStatus? Status { get; set; }
    public string? Description { get; set; } = string.Empty;
    public TimeSpan? TotalWorkingTime { get; set; } = TimeSpan.Zero;
}
