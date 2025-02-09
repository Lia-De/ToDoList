namespace ToDoList.Models;

public class TimerRequest
{
    public int ProjectID { get; set; }
    public long Timestamp { get; set; }
    public int TaskId { get; set; }
}
