using Microsoft.AspNetCore.Mvc;
using ToDoList.Models;
namespace ToDoList.Controllers;

[ApiController]
[Route("[controller]")]

public class TagController : ControllerBase
{
    private TodoContext _context;

    public TagController(TodoContext context)
    {
        _context = context;
    }
    // Read
    [HttpGet]
    public List<Tag> Index()
    {
        return _context.Tags.ToList();
    }
    //Create 
    [HttpPost("addTag")]
    public IActionResult AddTag([FromForm] string name)
    {
        var tag = new Tag { Name = name };
        _context.Tags.Add(tag);
        _context.SaveChanges();
        return Ok($"Tag {name} added");
    }
    // Update
    [HttpPost("updateTag")]
    public IActionResult UpdateTag([FromForm] int id, [FromForm] string name)
    {
        var tag = _context.Tags.Find(id);
        if (tag == null)
        {
            return NotFound();
        }
        string oldName = tag.Name;
        tag.Name = name;
        _context.SaveChanges();
        return Ok($"Tag {name} updated from {oldName}");
    }
    // Delete
    [HttpDelete("deleteTag/{id}")]
    public IActionResult DeleteTag(int id)
    {
        var tag = _context.Tags.Find(id);
        if (tag == null)
        {
            return NotFound();
        }
        _context.Tags.Remove(tag);
        _context.SaveChanges();
        return Ok($"Tag {id} deleted");
    }
}