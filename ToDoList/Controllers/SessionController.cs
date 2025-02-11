using Microsoft.AspNetCore.Mvc;
using ToDoList.DTOs;
using ToDoList.Services;
namespace ToDoList.Controllers;

[ApiController]
[Route("/session")]
public class SessionController : ControllerBase
{
    private TodoContext _context;

    public SessionController(TodoContext context)
    {
        _context = context;
    }
    
    [HttpPost]
    [Route("login")]
    public IActionResult Login(LoginDTO login)
    {
        CookieOptions options = new CookieOptions();
        options.Expires = DateTime.Now.AddMinutes(1);
        Response.Cookies.Append("CraftInTime", "66", options);
        return Ok("Logged in");
    }

    [HttpGet]
    [Route("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("CraftInTime");
        return Ok("Logged out");
    }
    [HttpPost]
    [Route("createUser")]
    public IActionResult CreateUser(LoginDTO login)
    {
        var newUSer = new Models.User() { Email= login.Email, Password = login.Password };
        
        return Ok();
    }
}