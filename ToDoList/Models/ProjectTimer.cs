using System.ComponentModel.DataAnnotations;

namespace ToDoList.Models;

public class ProjectTimer
{
    [Key]
    public int PTId { get; set; }
    public required int ProjectId { get; set; }
    public required DateTime StartDate { get; set; }
}
