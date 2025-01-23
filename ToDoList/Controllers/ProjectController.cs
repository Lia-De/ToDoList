﻿using Microsoft.AspNetCore.Http;
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

    [HttpGet("getProjectIds")]
    public List<int> GetProjectIds()
    {
        return _context
            .Projects
            .Select(p => p.ProjectId)
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
        // By default, initialize project as active
        project.Status = ToDoStatus.Active;
        _context.Projects.Add(project);
        _context.SaveChanges();
        return Ok($"Project {name} added");
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
        if (frontendProject.Status != project.Status)
        {
            project.Status = frontendProject.Status;
        }
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

    [HttpPost("addTagsToProject/{projectId}")]
    public IActionResult AddTagsToProject(int projectId, List<string> tagCloud)
    {
        Project? project = GetProject(projectId);
        if (project == null)
        {
            return BadRequest($"Project object with ID: {projectId} not found.");
        }
        else
        {
            List<Tag> projectTags = project.Tags;
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
            return Ok();
        }
    }

    [HttpPost("removeTag/{projectId}/{tagId}")]
    public IActionResult RemoveTagFromProject(int projectId, int tagId)
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
                project.Tasks.Add(new Models.Task { Name = taskName });

            }
            _context.SaveChanges();
            return Ok();
        }
    }
}
