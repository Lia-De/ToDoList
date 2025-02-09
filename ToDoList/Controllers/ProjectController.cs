using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Eventing.Reader;
using System.Runtime.InteropServices.Marshalling;
using System.Runtime.Intrinsics.X86;
using ToDoList.Models;
using ToDoList.Services;

namespace ToDoList.Controllers;
[ApiController]
[Route("[controller]")]
public class ProjectController : ControllerBase
{
    private TodoContext _context;
    private readonly ProjectService _projectService;

    public ProjectController(TodoContext context, ProjectService service)
    {
        _context = context;
        _projectService = service;
    }

    // Adding CRUD methods
    // Read
    [HttpGet]
    public List<Project> Index()
    {
        return _context
            .Projects
            .OrderByDescending(p => p.HasTimerRunning)          // First, sort by HasTimerRunning (true first)
            .ThenBy(p => p.Status != ToDoStatus.Active)         // Then, sort by Status (Active)
            .ThenBy(p => p.Status)
            .ThenBy(p => p.Name)                                // Finally, sort alphabetically by Name
            .ToList();

    }

    [HttpGet("getSingleProject/{projectId}")]
    public Project? GetProject(int projectId)
    {
        return _context
            .Projects
            .Include(p => p.Tags)
            .Include(t => t.Tasks)
            .ThenInclude(tag => tag.Tags)
            .FirstOrDefault(p => p.ProjectId == projectId);
    }
    [HttpGet("setStatus/{projectId}/{status}")]
    public IActionResult SetStatus(int projectId, int status)
    {
        Project? project = _context.Projects.FirstOrDefault(p => p.ProjectId == projectId);
        if (project == null)
        {
            return NotFound();
        }
        else 
        {
            if (project.Status != (ToDoStatus)status)
            {
                project.Status = (ToDoStatus)status;
                _context.SaveChanges();
            }
                return Ok();
        }
    }

    // Create
    [HttpPost("addProject")]
    public IActionResult AddProject(ProjectDto frontendProject)
    {
        string? newName = frontendProject.Name;
        if (string.IsNullOrEmpty(newName))
        {
            return BadRequest();
        }
        var project = new Project { Name = newName };
        if (frontendProject.Description != null)
        {
            project.Description = frontendProject.Description;
        }
        
        // By default, initialize project as planning
        project.Status = ToDoStatus.Planning;
        _context.Projects.Add(project);
        _context.SaveChanges();
        return Ok(project);
    }
  
    // Update
    [HttpPost("updateProject")]
    public IActionResult UpdateProject(ProjectDto frontendProject)
    {
        
        
        var project = GetProject(frontendProject.ProjectId);
        if (project == null)
        {
            return NotFound();
        }
        
        if ((frontendProject.Status >= 0) && (frontendProject.Status != project.Status))
        {
            project.Status = (ToDoStatus)frontendProject.Status;
            
        }
        string oldName = project.Name;
        if (!string.IsNullOrEmpty(frontendProject.Name))
        {
            project.Name = frontendProject.Name;
            
        }
        if (!string.IsNullOrEmpty(frontendProject.Description))
        {
            project.Description = frontendProject.Description;
            
        }
        _context.SaveChanges();
        
        return Ok(project);
        
    }


    // Delete
    [HttpDelete("deleteProject")]
    public IActionResult DeleteProject(Project frontendProject)
    {
        var project = _context.Projects.Include(t => t.Tasks).FirstOrDefault(proj => proj.ProjectId==frontendProject.ProjectId);
        
        if (project == null)
        {
            return NotFound();
        }
        // Make sure we delete any running timers
        if (project.HasTimerRunning)
        {
            StopTimer(project.ProjectId,-1);
        }

        _context.Tasks.RemoveRange(project.Tasks);
        _context.Projects.Remove(project);

        _context.SaveChanges();
        return Ok($"Project {project.Name} deleted");
    }

    [HttpPost("addTagsToProject/{projectId}")]
    public IActionResult AddTagsToProject(int projectId, List<string> tagCloud)
    {
        Project? project = _context.Projects
                            .Include(p => p.Tags)
                            .FirstOrDefault(p => p.ProjectId == projectId);
        if (project == null)
        {
            return BadRequest($"Project object with ID: {projectId} not found.");
        }
        else
        {
            List<Tag> projectTags = project.Tags;

            foreach (string tag in tagCloud)
            {
                // Make sure the tag is not already set on this project
                if (!projectTags.Any(pt => pt.Name == tag))
                {
                    // See if it is an already existing tag, if so add it.
                    Tag? existingTag = _context.Tags.FirstOrDefault(pt => pt.Name == tag);
                    if (existingTag != null)
                    {
                        project.Tags.Add(existingTag);
                    }
                    else
                    {
                        // Otherwise make new tag and add it to the project.
                        project.Tags.Add(new Tag { Name = tag });
                    }
                }
            }
            _context.SaveChanges();
            return Ok(project.Tags);
        }
    }

    [HttpPost("removeTag/{projectId}/{tagId}")]
    public IActionResult removeTag(int projectId, int tagId)
    {
        Project? project = GetProject(projectId);
        if (project == null)
        {
            return BadRequest($"Project object with ID: {projectId} not found.");
        }
        else
        {
            Tag? tag = _context.Tags.Find(tagId);
            if (tag == null)
            {
                return BadRequest($"Tag object with ID: {tagId} not found.");
            }
            else
            {
                project.Tags.Remove(tag);
                _context.SaveChanges();
                return Ok();
            }
        }
    }
    [HttpPost("addTaskToProject/{projectId}")]
    public IActionResult AddTaskToProject(int projectId, [FromForm] string taskName)
    {
        Project? project = GetProject(projectId);
        if (project == null)
        {
            return BadRequest($"Project object with ID: {projectId} not found.");
        }
        else
        {
            Models.Task? task = _context.Tasks.ToList().FirstOrDefault(task => task.Name == taskName);
            if (task!=null)
            {
                if ( !project.Tasks.Contains(task) ) project.Tasks.Add(task);
            }
            else
            {
                project.Tasks.Add(new Models.Task { Name = taskName, ProjectId = projectId, Project = project });
            }
            _context.SaveChanges();
            return Ok();
        }
    }

    [HttpGet("getProjecTimers")]
    public List<ProjectTimer> GetProjectTimers()
    {
        return _context.ProjectTimers.ToList();
    }

    [HttpPost("startTimer/{projectId}")]
    public IActionResult StartTimer(int projectId)
    {
        try
        {
            DateTime result = _projectService.StartTaskTimer(projectId);

            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPost("stopTimer/{projectId}/{taskId}")]
    public IActionResult StopTimer(int projectId, int taskId)
    {
        try
        {
            TimeSpan duration;
            if (taskId < 0)
            {
                duration =_projectService.StopTaskTimer(projectId);
            }
            else
            {
                duration = _projectService.StopTaskTimer(projectId, taskId);
            }
            if (duration > TimeSpan.Zero)
            {
                return Ok(duration);
            }
            else
            {
                return BadRequest("There was no timer, or something else went wrong.");
            }
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
        
    }

}
