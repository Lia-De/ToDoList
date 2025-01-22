﻿using Microsoft.AspNetCore.Mvc;
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
    public IActionResult AddTask([FromForm] string description)
    {
        var task = new Models.Task { Description = description };
        _context.Tasks.Add(task);
        _context.SaveChanges();
        return Ok($"Task {description} added");
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
        string oldDesc = task.Description;
        task.Description = frontendTask.Description;
        _context.SaveChanges();
        return Ok($"Task {frontendTask.Description} updated from {oldDesc}");
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
}
