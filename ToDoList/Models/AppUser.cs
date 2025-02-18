using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace ToDoList.Models;

public class AppUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public List<Project> Projects { get; set; }

    //public AppUser()
    //{
    //    UserProfile userProfile = new UserProfile() { UserId = Id, User = this };
    //}

}
