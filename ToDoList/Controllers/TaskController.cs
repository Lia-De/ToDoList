using Microsoft.AspNetCore.Mvc;
using ToDoList.Models;
namespace ToDoList.Controllers;
[ApiController]
[Route("[controller]")]

public class TaskController : Controller
{
    private TodoContext _context;

    public TaskController(TodoContext context)
    {
        _context = context;
    }

    // Read
    [HttpGet]
    public List<Models.Task> Index()
    {
        return _context.Tasks.ToList();
    }
    // Create
    [HttpPost("addTask")]
    public IActionResult AddTask([FromForm] string description)
    {
        var task = new Models.Task { Description = description };
        _context.Tasks.Add(task);
        _context.SaveChanges();
        return Ok($"Task {description} added");
    }
    // Update
    [HttpPost("updateTask")]
    public IActionResult UpdateTask([FromBody] ToDoList.Models.Task frontendTask)
    {
        var task = _context.Tasks.Find(frontendTask.Id);
        if (task == null)
        {
            return NotFound();
        }
        string oldDesc = task.Description;
        task.Description = frontendTask.Description;
        _context.SaveChanges();
        return Ok($"Task {frontendTask.Description} updated from {oldDesc}");
    }
    // Delete
    [HttpDelete("deleteTask/{id}")]
    public IActionResult DeleteTask(int id)
    {
        var task = _context.Tasks.Find(id);
        if (task == null)
        {
            return NotFound();
        }
        _context.Tasks.Remove(task);
        _context.SaveChanges();
        return Ok($"Task {id} deleted");
    }
}
