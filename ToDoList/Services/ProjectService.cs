using Microsoft.EntityFrameworkCore;
using System.Data.SqlTypes;
using ToDoList.Models;

namespace ToDoList.Services;

public class ProjectService
{
    private TodoContext _context;
    public ProjectService(TodoContext context)
    {
        _context = context;
    }

    // Method to give us the total working time of a Project, calculated from it's Tasks and unassigned working hours. Including soft-deleted tasks.
    public TimeSpan TotalActiveTime(int projectId)
    {
        Project? project = _context.Projects.Include(t => t.Tasks).IgnoreQueryFilters().FirstOrDefault(ti => ti.ProjectId == projectId);
        if (project!=null) { 
            TimeSpan result = project.TotalWorkingTime;
            List<Models.Task> tasks = project.Tasks;
            if (tasks.Count == 0)
            {
                return result;
            }
            foreach (var task in tasks)
            {
                    result += (TimeSpan)task.TimeSpent;
            }
            return result;
        } else
        {
            throw new Exception("Could not find the project");
        }
    }
    public DateTime StartTaskTimer(int projectId, DateTime date)
    {
        //DateTime startTime = DateTime.Now;
        DateTime startTime = date;
        // is there a running timer for the project already?
        ProjectTimer? timer = _context.ProjectTimers.FirstOrDefault(ti=> ti.ProjectId==projectId && ti.EndDate==null);
        if (timer != null) 
        {
            throw new Exception("This project already has a timer running");
        }
        Project? project = _context.Projects.FirstOrDefault(ti => ti.ProjectId==projectId);
        if (project != null) project.HasTimerRunning = true;
        _context.ProjectTimers.Add(new ProjectTimer() { ProjectId= projectId, StartDate = startTime, TaskId= null });
        _context.SaveChanges();
        return startTime;
    }
    public TimeSpan StopTaskTimer(int projectId, DateTime stopTime)
    {
        TimeSpan result = TimeSpan.Zero;
        ProjectTimer? timer = _context.ProjectTimers.FirstOrDefault(ti => ti.ProjectId == projectId && ti.EndDate == null); 
        if (timer == null)
        {
            throw new Exception($"No timers found for project {projectId}");
        }
        else
        {
            result = stopTime - timer.StartDate;
            if (result > TimeSpan.Zero)
            {
                Project? project = _context.Projects.Find(projectId);
                if (project != null)
                {
                    project.TotalWorkingTime += result;
                    project.HasTimerRunning = false;
                    timer.EndDate = stopTime;
                    project.Timers.Add(timer);
                    _context.SaveChanges();
                }
                
            }

            return result;
        }
    }
    public TimeSpan StopTaskTimer(int projectId, int taskId, DateTime stopTime)
    {

        TimeSpan result = TimeSpan.Zero;
        ProjectTimer? timer = _context.ProjectTimers.FirstOrDefault(ti => ti.ProjectId == projectId && ti.EndDate == null);
        if (timer == null)
        {
            throw new Exception($"No timers found for project {projectId}");
        }
        else
        {
            result = stopTime - timer.StartDate;
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
                        timer.EndDate = stopTime;
                    } else
                    {
                        // IF for some reason the task id is incorrect, still add this duration to the Project overall time
                        project.TotalWorkingTime += result;
                    }
                    project.HasTimerRunning = false;
                    project.Timers.Add(timer);
                }
                _context.SaveChanges();
            }
            return result;
        }
    }
}
