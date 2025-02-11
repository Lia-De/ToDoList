using Microsoft.AspNetCore.Mvc;

namespace ToDoList.Controllers;

[ApiController]
[Route("/")]
public class AppController : ControllerBase
{
    [HttpGet]
    public IActionResult Index()
    {
        string sessionValue = Request.Cookies["CraftInTime"];
        bool successful = int.TryParse(sessionValue, out int userId);
        
        if (sessionValue == null || !successful) return Unauthorized();
        return Ok(userId);
    }
}