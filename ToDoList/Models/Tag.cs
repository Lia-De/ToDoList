using System.ComponentModel.DataAnnotations;

namespace ToDoList.Models;

public class Tag
{
    [Key] public int TagId { get; set; }
    [MaxLength(50)] public required string Name { get; set; }
    public List<Project> Projects { get; set; } = new List<Project>();
    public List<Task> Tasks { get; set; } = new List<Task>();
}
