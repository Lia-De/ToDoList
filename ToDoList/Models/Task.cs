using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ToDoList.Models;

public class Task
{
    [Key]
    public int TaskId { get; set; }
    public required string Name { get; set; }
    public List<Tag> Tags { get; set; } = new List<Tag>();
    public int ProjectId { get; set; }

    [ForeignKey("ProjectId")] 
    public required Project Project { get; set; }
    public DateTime? Deadline { get; set; }
    public ToDoStatus? Status { get; set; }
    public string? Description { get; set; }
    public TimeSpan TimeSpent { get; set; } = TimeSpan.Zero;
    public DateTime? TimerStart { get; set; }
    
}
