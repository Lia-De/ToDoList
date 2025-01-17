using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
        return _context.Projects.ToList();
    }

    // Create
    [HttpPost("addProject")]
    public IActionResult AddProject([FromForm] string name)
    {
        var project = new Project { Name = name };
        _context.Projects.Add(project);
        _context.SaveChanges();
        return Ok($"Project {name} added");
    }

    // Update
    [HttpPost("updateProject")]
    public IActionResult UpdateProject(Project frontendProject)
    {
        var project = _context.Projects.Find(frontendProject.Id);
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
    [HttpDelete("deleteProject/{id}")]
    public IActionResult DeleteProject(int id)
    {
        var project = _context.Projects.Find(id);
        if (project == null)
        {
            return NotFound();
        }
        _context.Projects.Remove(project);
        _context.SaveChanges();
        return Ok($"Project {project.Name} deleted");
    }

}
