using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    public List<TagDto> Index()
    {
        return _context
              .Tags
              .Select(t => new TagDto
              {
                  TagId = t.TagId,
                  Name = t.Name,
                  ProjectCount = t.Projects.Count(),
                  TaskCount = t.Tasks.Count()
              })
              .OrderBy(t => t.Name)
              .ToList();
    }
    [HttpGet("getSingleTag/{tagId}")]
    public Models.Tag? GetTag(int tagId)
    {
        return _context
            .Tags
            .Include(p => p.Projects)
            .Include(t => t.Tasks)
            .FirstOrDefault(t => t.TagId == tagId);
    }
    //Create 
    [HttpPost("addTag")]
    public IActionResult AddTag([FromForm] string name)
    {
        if (_context.Tags.Any(t => t.Name == name))
        {
            return BadRequest("Tag already exists");
        }
        var tag = new Tag { Name = name };
        _context.Tags.Add(tag);
        _context.SaveChanges();
        return Ok($"Tag {name} added");
    }
    // Update
    [HttpPost("updateTag")]
    public IActionResult UpdateTag(Tag frontendTag)
    {
        var tag = _context.Tags.Find(frontendTag.TagId);
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
        var tag = _context.Tags.Find(frontendTag.TagId);
        if (tag == null)
        {
            return NotFound();
        }
        _context.Tags.Remove(tag);
        _context.SaveChanges();
        return Ok($"Tag {frontendTag.TagId} deleted");
    }
}