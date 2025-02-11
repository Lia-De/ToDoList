namespace ToDoList.DTOs;

public class TimerRequestDTO
{
    public int ProjectID { get; set; }
    public long Timestamp { get; set; }
    public int TaskId { get; set; }
}
