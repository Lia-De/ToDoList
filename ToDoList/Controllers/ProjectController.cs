using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDoList.Models;

namespace ToDoList.Controllers;
[ApiController]
[Route("[controller]")]
public class ProjectController : ControllerBase
{
    private TodoContext _context;

    public ProjectController(TodoContext context)
    {
        _context = context;
    }
    
    // Adding CRUD methods
    // Read
    [HttpGet]
    public List<Project> Index()
    {
        return _context
            .Projects
            .Include(p => p.Tasks)
            .Include(p => p.Tags)
            .ToList();
    }

    // Create
    [HttpPost("addProject")]
    public IActionResult AddProject([FromForm] string name)
    {
        var project = new Project { Name = name };
        project.Status = ToDoStatus.Active;
        _context.Projects.Add(project);
        _context.SaveChanges();
        return Ok($"Project {name} added");
    }

    [HttpPost("addProjectWithTasks")]
    public IActionResult AddProjectWithTasks(Project projectToEdit)
    {
        var project = _context.Projects.Find(projectToEdit.ProjectId);
        if (project == null)
        {
            return NotFound();
        }
        project.Tags = projectToEdit.Tags;
        project.Tasks = projectToEdit.Tasks;
        _context.SaveChanges();
        return Ok();
    }

    // Update
    [HttpPost("updateProject")]
    public IActionResult UpdateProject(Project frontendProject)
    {
        var project = _context.Projects.Find(frontendProject.ProjectId);
        if (project == null)
        {
            return NotFound();
        }
        string oldName = project.Name;
        project.Name = frontendProject.Name;
        _context.SaveChanges();
        return Ok($"Project ({oldName}) updated to {project.Name}");
    }


    // Delete
    [HttpDelete("deleteProject")]
    public IActionResult DeleteProject(Project frontendProject)
    {
        var project = _context.Projects.Find(frontendProject.ProjectId);
        if (project == null)
        {
            return NotFound();
        }
        _context.Projects.Remove(project);
        _context.SaveChanges();
        return Ok($"Project {project.Name} deleted");
    }

}
