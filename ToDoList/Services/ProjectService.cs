using ToDoList.Models;

namespace ToDoList.Services;

public class ProjectService
{
    // private Dictionary for project and timer start
    

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
    public DateTime StartTaskTimer(int projectId, TodoContext context)
    {
        DateTime startTime = DateTime.Now;
        // is there a timer for the project already?
        ProjectTimer? timer = context.ProjectTimers.Find(projectId);
        if (timer != null) 
        {
            throw new InvalidOperationException("This project already has a timer running");
        }
        context.ProjectTimers.Add(new ProjectTimer() { ProjectId= projectId, StartDate = startTime });
        context.SaveChanges();
        return startTime;
    }
    public TimeSpan StopTaskTimer(int projectId, TodoContext context)
    {
        DateTime stopTime = DateTime.Now;
        TimeSpan result = TimeSpan.Zero;
        ProjectTimer? timer = context.ProjectTimers.Find(projectId) as ProjectTimer;
        if (timer == null)
        {
            throw new Exception();
        }
        result = stopTime - timer.StartDate;
        if (result > TimeSpan.Zero)
        {
            context.ProjectTimers.Remove(timer);
            context.SaveChanges();
        }

        return result;
    }
}
