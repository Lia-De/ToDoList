using Microsoft.EntityFrameworkCore;
using System.Data.SqlTypes;
using System.Threading.Tasks;
using ToDoList.Models;

namespace ToDoList.Services;

public class ProjectService
{
    private TodoContext _context;
    public ProjectService(TodoContext context)
    {
        _context = context;
    }

    TimeSpan? GetDuration(ProjectTimer timer)
    {
        return timer.EndDate.HasValue ? timer.EndDate - timer.StartDate : null;
    }
    ProjectTimer? GetActiveProjectTimer(int projectId)
    {
        return _context.ProjectTimers.FirstOrDefault(pt => pt.ProjectId == projectId && pt.EndDate == null);
    }

    // Method to give us the total working time of a Project, calculated from it's Tasks and unassigned working hours.
    // Including soft-deleted tasks.
    public TimeSpan UpdateProjectTimerTotal(int projectId)
    {
        Project? project = _context.Projects
                        .Include(t => t.Tasks)
                        .Include(p=> p.Timers)
                        .IgnoreQueryFilters().FirstOrDefault(ti => ti.ProjectId == projectId);
        if (project!=null) {
            //TimeSpan result = TimeSpan.Zero;
            long result = 0;
            List<Models.Task> tasks = project.Tasks;
            List<ProjectTimer> oldTimers = project.Timers.Where(pt => pt.EndDate.HasValue).ToList();
            
            foreach (var timer in oldTimers)
            {
                var duration = GetDuration(timer);
                if (duration!= null)
                {
                    result += (long)duration.Value.TotalSeconds;
                }
            }
            // Also update the status of the project if we find a lost timer.
            var activeTimer = GetActiveProjectTimer(projectId);
            if (activeTimer != null)
            {
                project.HasTimerRunning = true;
            }
            //project.TotalWorkingTime = result;
            project.TotalWorkingTimeSeconds = result;
            
            _context.SaveChanges();
            return TimeSpan.FromSeconds(result);
            
        } else
        {
            throw new Exception("Could not find the project");
        }
    }
    public DateTime StartTaskTimer(int projectId, DateTime date)
    {
        DateTime startTime = date;
        // is there a running timer for the project already?
        ProjectTimer? timer = GetActiveProjectTimer(projectId);
        Project? project = _context.Projects.FirstOrDefault(ti => ti.ProjectId == projectId);
        if (timer != null) 
        {
            if (project!=null) project.HasTimerRunning = true;
            throw new Exception("This project already has a timer running");
        }
        
        if (project != null) project.HasTimerRunning = true;
        _context.ProjectTimers.Add(new ProjectTimer() { ProjectId= projectId, StartDate = startTime, TaskId= null });
        _context.SaveChanges();
        return startTime;
    }
    public TimeSpan StopTaskTimer(int projectId, int taskId, DateTime stopTime)
    {
        TimeSpan result = TimeSpan.Zero;
        ProjectTimer? timer = GetActiveProjectTimer(projectId);
        if (timer != null)
        {
            result = TimeSpan.FromSeconds((stopTime - timer.StartDate).TotalSeconds);
            if (result > TimeSpan.Zero)
            {
              Project? project =  _context.Projects.Include(t => t.Tasks).FirstOrDefault(p => p.ProjectId == projectId);
                if (project != null)
                {
                    Models.Task? task = project.Tasks.FirstOrDefault(t => t.TaskId == taskId);
                    if (task != null)
                    {
                        timer.TaskId = task.TaskId;
                        task.TimeSpent += result;   
                    }
                    project.TotalWorkingTime += result;
                    project.TotalWorkingTimeSeconds += (long)result.TotalSeconds;
                    project.HasTimerRunning = false;
                    timer.EndDate = stopTime;
                    _context.SaveChanges();
                }
            }
        }
        return result;
    }
}
