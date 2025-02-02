namespace ToDoList.Models;

public class ProjectDto
{
    public int ProjectId { get; set; }
    public string? Name { get; set; }
    public ToDoStatus? Status { get; set; }
    public string? Description { get; set; } = string.Empty;
    public TimeSpan? TotalWorkingTime { get; set; } = TimeSpan.Zero;
}
