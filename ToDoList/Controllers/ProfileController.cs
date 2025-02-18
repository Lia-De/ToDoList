using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SQLitePCL;
using System.Security.Claims;
using ToDoList.Models;

namespace ToDoList.Controllers;

[ApiController]
[Route("myProfile")]
public class ProfileController : ControllerBase
{
    private UserManager<AppUser> _userManager;
    private TodoContext _context;

    public ProfileController(UserManager<AppUser> userManager, TodoContext context)
    {
        _userManager = userManager;
        _context = context;
        
    }
    [HttpGet]
    public IActionResult Index()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier); // From HTTP context
        var userProfile = _userManager.Users.First(x => x.Id == currentUserId);
        //var contextUser = _context.Users.FirstOrDefault(x => x.Id == currentUserId);
        return Ok(userProfile);
    }
}
