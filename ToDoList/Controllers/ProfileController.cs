using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SQLitePCL;
using System.Security.Claims;
using ToDoList.DTOs;
using ToDoList.Models;

namespace ToDoList.Controllers;

[ApiController]
[Route("profile")]
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
        try
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier); // From HTTP context
            var userProfile = _userManager.Users.First(x => x.Id == currentUserId);

            if (userProfile == null)
            {
                return NotFound();
            }

            return Ok(userProfile);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    [HttpPost]
    [Route("register")]
    public async Task<IActionResult> Register(LoginDTO newUser)
    {
        var user = new AppUser
        {
            Email = newUser.Email,
            UserName = newUser.Email
        };
        var result = await _userManager.CreateAsync(user, newUser.Password);
        if (!result.Succeeded)
        {
            return BadRequest();
        }
        UserProfile newProfile = new UserProfile{ AppUserId = user.Id };
        
        _context.UserProfiles.Add(newProfile);
        await _context.SaveChangesAsync();

        return Ok(user);

    }
}
