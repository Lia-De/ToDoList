using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Runtime.InteropServices.Marshalling;
using System.Runtime.Intrinsics.X86;
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
            .ToList();
    }

    [HttpGet("getSingleProject/{projectId}")]
    public Project? GetProject(int projectId)
    {
        return _context
            .Projects
            .Include(p => p.Tags)
            .Include(t => t.Tasks)
            .FirstOrDefault(p => p.ProjectId == projectId);
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

    
    //[HttpPost("addProjectWithTasks")]
    //public IActionResult AddProjectWithTasks([FromForm] int projectId, [FromForm] string tagCloud, [FromForm] string taskCloud)
    //{
    //    List<string> tags = tagCloud.Split(',').ToList();
    //    List<string> tasks = taskCloud.Split(',').ToList();
    //    var project = _context.Projects.Find(projectId);
    //    if (project == null)
    //    {
    //        return NotFound();
    //    }

    //    foreach (string addTag in tags)
    //    {
    //        string tagName = addTag.Trim(); // clean up the string
    //        Console.WriteLine($"\nTagname:-{tagName}-");
    //        Tag? tagToAdd = _context.Tags.FirstOrDefault(t => t.Name == tagName);

    //        if (tagToAdd == null)
    //        {
    //            Console.WriteLine($" tag did not exist -- Now adding new tag: -{tagName}-");
    //            tagToAdd = new Tag { Name = tagName };
    //            Console.WriteLine($"Adding ID:{tagToAdd.TagId} name:{tagToAdd.Name}");
    //            project.Tags.Add(tagToAdd);

    //        }
    //        else
    //        {
    //            Console.WriteLine($"tagToAdd is ID:{tagToAdd.TagId} name:{tagToAdd.Name}");
    //            if (!project.Tags.Contains(tagToAdd)) // see if we have this tag already or if it's empty
    //            {
    //                Console.WriteLine($"The tag (id {tagToAdd.TagId}) does not exist on the project. Add it.");
    //                project.Tags.Add(tagToAdd);
    //            }
    //            else
    //            {
    //                Console.WriteLine($"The tag (id {tagToAdd.TagId}) already exists on the project. Do not add it.");
    //            }
    //        }
    //        Console.WriteLine("\n end iteration");
    //    }
    //    _context.SaveChanges();
    //    return Ok();
    //}

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
