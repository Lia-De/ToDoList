namespace ToDoList.Models;

public class UserProfile
{
    public int UserProfileId { get; set; }
    public int AppUserId { get; set; }
    public AppUser User { get; set; }
    public List<Project> Projects { get; set; } = new List<Project>();
}
