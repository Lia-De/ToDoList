﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDoList.DTOs;
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
    
    // Create
    [HttpPost("addTask")]
    public IActionResult AddTask(TaskDTO newTask)
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
        return Ok(task);
    }
    // Update
    [HttpPost("updateTask")]
    public IActionResult UpdateTask(TaskDTO frontendTask)
    {
        var task = _context.Tasks.FirstOrDefault(t => t.TaskId == frontendTask.TaskId);
        if (task == null)
        {
            return NotFound();
        }
        
        if (!string.IsNullOrEmpty(frontendTask.Name))
        {
            if (!task.Name.Equals(frontendTask.Name))
                task.Name = frontendTask.Name;
        }

        if (frontendTask.Status!=task.Status)
        {
            // Task.Status may be null
            task.Status = frontendTask.Status;
        }

        if (frontendTask.Deadline!= task.Deadline)
        {
            task.Deadline = frontendTask.Deadline;
        }
        if (frontendTask.Description != null && !frontendTask.Description.Equals(task.Description))
        {
            task.Description = frontendTask.Description;
        }

        _context.SaveChanges();
        return Ok(task);
    }

    [HttpPost("removeTag/{taskId}/{tagId}")]
    public IActionResult RemoveTag(int taskId, int tagId)
    {
        var task = _context.Tasks.Include(t=>t.Tags).FirstOrDefault(t => t.TaskId == taskId);
        if (task == null)
        {
            return BadRequest($"Task object with ID: {taskId} not found.");
        }
        else
        {
            Tag? tag = _context.Tags.Include(t=>t.Tasks).FirstOrDefault(t=> t.TagId==tagId);
            if (tag == null)
            {
                return BadRequest($"Tag object with ID: {tagId} not found.");
            }
            else
            {
                task.Tags.Remove(tag);   
                _context.SaveChanges();
                return Ok(task);
            }
        }
    }

    // Delete
    [HttpDelete("deleteTask")]
    public IActionResult DeleteTask(TaskDTO task)
    {
        var taskToDelete = _context.Tasks.Find(task.TaskId);
        if (taskToDelete == null)
        {
            return NotFound();
        }
        taskToDelete.IsDeleted = true;
        _context.SaveChanges();
        return Ok();
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
            return Ok(task.Tags);
        }
    }


}
