using System.ComponentModel.DataAnnotations;

namespace ToDoList.Models;

public class User
{
    [Key] public int UserId { get; set; }
    [MaxLength(50)] public required string Email { get; set; } 
    public required string Password { get; set; }
    public List<Project> Projects { get; set; } = new List<Project>();
}
