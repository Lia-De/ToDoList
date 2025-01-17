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
    public IActionResult UpdateTag(Tag frontendTag)
    {
        var tag = _context.Tags.Find(frontendTag.Id);
        if (tag == null)
        {
            return NotFound();
        }
        string oldName = tag.Name;
        tag.Name = frontendTag.Name;
        _context.SaveChanges();
        return Ok($"Tag {frontendTag.Name} updated from {oldName}");
    }
    // Delete
    [HttpDelete("deleteTag")]
    public IActionResult DeleteTag(Tag frontendTag)
    {
        var tag = _context.Tags.Find(frontendTag.Id);
        if (tag == null)
        {
            return NotFound();
        }
        _context.Tags.Remove(tag);
        _context.SaveChanges();
        return Ok($"Tag {frontendTag.Id} deleted");
    }
}