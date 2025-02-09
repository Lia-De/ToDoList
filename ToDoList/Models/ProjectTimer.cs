using System.ComponentModel.DataAnnotations;

namespace ToDoList.Models;

public class ProjectTimer
{
    [Key] public int PTId { get; set; }
    public required int ProjectId { get; set; }
    public int? TaskId { get; set; }
    public required DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
