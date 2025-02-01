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
            .OrderByDescending(d => d.Deadline)
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
    [HttpGet("setStatus/{taskId}/{status}")]
    public IActionResult SetStatus(int taskId, int status)
    {
        Models.Task? task = _context.Tasks.FirstOrDefault(p => p.TaskId == taskId);
        if (task == null)
        {
            return NotFound();
        }
        else
        {
            ToDoStatus? taskStatus = task.Status;
            if (taskStatus == null || taskStatus != (ToDoStatus)status)
            {
                task.Status = (ToDoStatus)status;
                _context.SaveChanges();
            }
                return Ok();
        }
    }
    // Create
    [HttpPost("addTask")]
    public IActionResult AddTask(TaskDto newTask)
    {
        
        Project? project = _context.Projects.Find(newTask.ProjectId);
       
        if (project == null)
        {
            return BadRequest("Project not found");
        }
        // Explicitly set this as linked
        var task = new Models.Task { Name = newTask.Name, ProjectId = project.ProjectId, Project = project };
        if (newTask.Deadline != null)
        {
            task.Deadline = newTask.Deadline;
        }
        if (newTask.Description != null)
        {
            task.Description = newTask.Description;
        }
            _context.Tasks.Add(task);
        _context.SaveChanges();
        return Ok($"Task {newTask.Name} added");
    }
    // Update
    [HttpPost("updateTask")]
    public IActionResult UpdateTask(ToDoList.Models.TaskDto frontendTask)
    {
        string updatedInfo = "";
        var task = _context.Tasks.FirstOrDefault(t => t.TaskId == frontendTask.TaskId);
        if (task == null)
        {
            return NotFound();
        }
        string oldName = task.Name;
        if (oldName != frontendTask.Name)
        {
            task.Name = frontendTask.Name;
            updatedInfo += " Name";
        }

        if (frontendTask.Status != task.Status)
        {
            task.Status = frontendTask.Status;
            updatedInfo += " Status";
        }

        if (!frontendTask.Deadline.Equals(task.Deadline))
        {
            task.Deadline = frontendTask.Deadline;
            updatedInfo += " Deadline";
        }
        if (frontendTask.Description != null)
        {
            task.Description = frontendTask.Description;
            updatedInfo += " Description";
        }

        _context.SaveChanges();
        return Ok($"Task {frontendTask.Name} updated with {updatedInfo}");
    }
    // Delete
    [HttpDelete("deleteTask/{taskId}")]
    public IActionResult DeleteTask(int taskId)
    {
        var task = _context.Tasks.Find(taskId);
        if (task == null)
        {
            return NotFound();
        }
        _context.Tasks.Remove(task);
        _context.SaveChanges();
        return Ok($"Task {taskId} deleted");
    }

    [HttpPost("addTagsToTask/{taskId}")]
    public IActionResult AddTagsToTask(int taskId, List<string> tagCloud)
    {
        Models.Task? task = GetTask(taskId);
        if (task == null)
        {
            return BadRequest($"Task object with ID: {taskId} not found.");
        }
        else
        {
            List<Tag> taskTags = task.Tags;
            List<Tag> allTags = _context.Tags.ToList();
            foreach (string tag in tagCloud)
            {
                // Make sure the tag is not already set on this project
                if (!taskTags.Any(pt => pt.Name == tag))
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
