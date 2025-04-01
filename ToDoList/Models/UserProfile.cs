namespace ToDoList.Models;

public class UserProfile
{
    public int UserProfileId { get; set; }
    public string AppUserId { get; set; }
    public AppUser AppUser { get; set; }
    public List<Project> Projects { get; set; } = new List<Project>();

}
