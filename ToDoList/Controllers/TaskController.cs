using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        return _context
            .Tasks
            .ToList();
    }
    
    [HttpGet("getSingleTask/{taskId}")]
    public Models.Task? GetTask(int taskId)
    {
        return _context
            .Tasks
            .Include(p => p.Tags)
            .FirstOrDefault(t => t.TaskId == taskId);
    }
    // Create
    [HttpPost("addTask")]
    public IActionResult AddTask([FromForm] string name, [FromForm] int projectID)
    {
        var task = new Models.Task { Name = name };
        Project? project = _context.Projects.Find(projectID);
        Console.WriteLine($"project is: {project}");
        if (project == null)
        {
            return BadRequest("Project not found");
        }
        project.Tasks.Add(task);
        //_context.Tasks.Add(task);
        _context.SaveChanges();
        return Ok($"Task {name} added");
    }
    // Update
    [HttpPost("updateTask")]
    public IActionResult UpdateTask(ToDoList.Models.Task frontendTask)
    {
        var task = _context.Tasks.Find(frontendTask.TaskId);
        if (task == null)
        {
            return NotFound();
        }
        string oldDesc = task.Name;
        task.Name = frontendTask.Name;
        _context.SaveChanges();
        return Ok($"Task {frontendTask.Name} updated from {oldDesc}");
    }
    // Delete
    [HttpDelete("deleteTask")]
    public IActionResult DeleteTask(ToDoList.Models.Task frontendTask)
    {
        var task = _context.Tasks.Find(frontendTask.TaskId);
        if (task == null)
        {
            return NotFound();
        }
        _context.Tasks.Remove(task);
        _context.SaveChanges();
        return Ok($"Task {frontendTask.TaskId} deleted");
    }

    [HttpPost("addTagsToTask/{taskId}")]
    public IActionResult AddTagsToProject(int taskId, List<string> tagCloud)
    {
        Models.Task? task = GetTask(taskId);
        if (task == null)
        {
            return BadRequest($"Project object with ID: {taskId} not found.");
        }
        else
        {
            List<Tag> projectTags = task.Tags;
            List<Tag> allTags = _context.Tags.ToList();
            foreach (string tag in tagCloud)
            {
                // Make sure the tag is not already set on this project
                if (!projectTags.Any(pt => pt.Name == tag))
                {
                    // See if it is an already existing tag, if so add it.
                    Tag? existingTag = allTags.FirstOrDefault(pt => pt.Name == tag);
                    if (existingTag != null)
                    {
                        task.Tags.Add(existingTag);
                    }
                    else
                    {
                        // Otherwise make new tag and add it to the project.
                        task.Tags.Add(new Tag { Name = tag });
                    }
                }
            }
            _context.SaveChanges();
            return Ok();
        }
    }


}
