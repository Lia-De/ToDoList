namespace ToDoList.Models;

public class TagDto
{
    public int TagId { get; set; }
    public required string Name { get; set; }
    public int ProjectCount { get; set; }
    public int TaskCount { get; set; }
}
