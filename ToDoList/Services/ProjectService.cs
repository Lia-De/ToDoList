using ToDoList.Models;

namespace ToDoList.Services;

public class ProjectService
{
    private TodoContext _context;
    public ProjectService(TodoContext context)
    {
        _context = context;
    }


    // Method to give us the total working time of a Project, calculated from it's Tasks
    public TimeSpan TotalActiveTime(Project project)
    {
        TimeSpan result = TimeSpan.Zero;
        List<Models.Task> tasks = project.Tasks;
        if (tasks.Count == 0) {
            return TimeSpan.Zero;
        }
        foreach (var task in tasks) {
            if (task.TimeSpent != TimeSpan.Zero)
                result += (TimeSpan)task.TimeSpent;
        }
        project.TotalWorkingTime = result;
        return result;
    }
    public DateTime StartTaskTimer(int projectId)
    {
        DateTime startTime = DateTime.Now;
        // is there a timer for the project already?
        ProjectTimer? timer = _context.ProjectTimers.FirstOrDefault(ti=> ti.ProjectId==projectId);
        if (timer != null) 
        {
            throw new Exception("This project already has a timer running");
        }
        Project? project = _context.Projects.FirstOrDefault(ti => ti.ProjectId==projectId);
        if (project != null) project.HasTimerRunning = true;
        _context.ProjectTimers.Add(new ProjectTimer() { ProjectId= projectId, StartDate = startTime });
        _context.SaveChanges();
        return startTime;
    }
    public TimeSpan StopTaskTimer(int projectId)
    {
        DateTime stopTime = DateTime.Now;
        TimeSpan result = TimeSpan.Zero;
        ProjectTimer? timer = _context.ProjectTimers.FirstOrDefault(ti => ti.ProjectId == projectId); 
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
                }
                _context.ProjectTimers.Remove(timer);
                _context.SaveChanges();
            }

            return result;
        }
    }
}
