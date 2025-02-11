namespace ToDoList.DTOs;

public class TagDTO
{
    public int TagId { get; set; }
    public required string Name { get; set; }
    public int ProjectCount { get; set; }
    public int TaskCount { get; set; }
}
