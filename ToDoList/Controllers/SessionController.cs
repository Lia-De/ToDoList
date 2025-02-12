using Microsoft.AspNetCore.Mvc;
using ToDoList.DTOs;
using ToDoList.Models;
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
        options.Expires = DateTime.Now.AddHours(1);
        User? user = _context.Users.FirstOrDefault(user => user.Email == login.Email && user.Password == login.Password);
        if (user!=null)
        {
            Response.Cookies.Append("CraftInTime", user.UserId.ToString(), options);
            return Ok("Logged in " + user.UserId);
        }
        return BadRequest();
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