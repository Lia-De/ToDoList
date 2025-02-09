using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ToDoList.Models;

public class Task
{
    [Key] public int TaskId { get; set; }
    [MaxLength(50)] public required string Name { get; set; }
    public List<Tag> Tags { get; set; } = new List<Tag>();
    [ForeignKey("ProjectId")] public int ProjectId { get; set; }
    public required Project Project { get; set; }
    public DateTime? Deadline { get; set; }
    public ToDoStatus? Status { get; set; }
    public string? Description { get; set; }
    public TimeSpan TimeSpent { get; set; } = TimeSpan.Zero;
    public bool IsDeleted { get; set; } = false;
    
}
