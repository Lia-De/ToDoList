using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Diagnostics.Eventing.Reader;
using System.Runtime.InteropServices.Marshalling;
using System.Runtime.Intrinsics.X86;
using System.Security.Claims;
using ToDoList.DTOs;
using ToDoList.Models;
using ToDoList.Services;

namespace ToDoList.Controllers;

//[Authorize]

[ApiController]
[Route("[controller]")]
public class ProjectController : ControllerBase
{
    private TodoContext _context;
    private readonly ProjectService _projectService;
    private readonly UserManager<AppUser> _userManager;

    public ProjectController(TodoContext context, ProjectService service, UserManager<AppUser> userManager)
    {
        _context = context;
        _projectService = service;
        _userManager = userManager;
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
        var projectTotalTime = _projectService.UpdateProjectTimerTotal(projectId);
        Project? project = _context
            .Projects
            .Include(p => p.Tags)
            .Include(p => p.Tasks)
            .ThenInclude(tag => tag.Tags)
            .FirstOrDefault(p => p.ProjectId == projectId);
        if(project != null)
        {
            project.TotalWorkingTime = projectTotalTime;
        }
        return project;
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
    public IActionResult AddProject(ProjectDTO frontendProject)
    {
        string? newName = frontendProject.Name;
        if (string.IsNullOrEmpty(newName))
        {
            return BadRequest();
        }
        //var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);  //  Get logged-in user ID


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
    public IActionResult UpdateProject(ProjectDTO frontendProject)
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
    public IActionResult DeleteProject(ProjectDTO frontendProject)
    {
        var project = _context.Projects.Include(t => t.Tasks).FirstOrDefault(proj => proj.ProjectId==frontendProject.ProjectId);
        
        if (project == null)
        {
            return NotFound();
        }
        // Make sure we delete any running timers
        if (project.HasTimerRunning)
        {
            var timer = _context.ProjectTimers.FirstOrDefault(timer => timer.ProjectId == project.ProjectId && timer.EndDate == null);
            if ( timer != null)
            {
                timer.EndDate = DateTime.Now;
            }
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

    [HttpGet("getProjectTimers/{projectId}")]
    public List<ProjectTimer> GetProjectTimers(int projectId)
    {
        return _context.ProjectTimers.Where(pt=> pt.ProjectId == projectId).OrderByDescending(pt => pt.StartDate).ToList();
    }

    [HttpPost("startTimer/{projectId}")]
    public IActionResult StartTimer(TimerRequestDTO request)
    {
        try
        {
            DateTime startTime = DateTimeOffset.FromUnixTimeMilliseconds(request.Timestamp).UtcDateTime;
            DateTime result = _projectService.StartTaskTimer(request.ProjectID, startTime);

            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPost("stopTimer/{projectId}/{taskId}")]
    public IActionResult StopTimer(TimerRequestDTO request)
    {
        try
        {
            DateTime endTime = DateTimeOffset.FromUnixTimeMilliseconds(request.Timestamp).UtcDateTime;
            TimeSpan duration = _projectService.StopTaskTimer(request.ProjectID, request.TaskId, endTime);

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
