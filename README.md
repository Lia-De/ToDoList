# To Do List app
Created 2025-01-08 as part of Lexicon course, fullstack C# developer.

## Design Considerations going forward (29/1 20024)
This will be an app to keep track of time and processes for craft projects. Textile, wood, or whatever else needs a user to keep track of their time.

Often when I make a textile item I get asked: "How long did that take you to make?" and I rarely know, because who has time to write down times for all
the things you do for a project. I might be wanting to sell the results of my work, but I don't know what to charge, because I don't know how much time
it took.

### Required features
* Adding Projects, with title, some description and a way to add Tags and Tasks.
* Projects should total the time spent on them.
* Projects should have status: Planning, active, paused or completed.
* Tags should be universal, available to be applied to any and all projects and sub-tasks.
* Tasks must belong to a project.
* Tasks should have a title and possibly description, status and possibly a deadline and tags.
* Users should be able to track time per Task
* Timing for a project must be associated with a Task.
* Front end should be a website done with responsive designed mobile-first.
   * Create projects, add tasks and tags
   * List all Projects
     * Name, Description, Status, TimeSpent, Tasks and Tags
     * For Tasks: Name, Description, Status, Deadline, TimeSpent, LastProgress
     * For Tags: Name
   * List all Tags (show names and usages in Projects/Tasks)
   * Add Tags to Tasks
   * Start and stop Timers for Tasks
   * Edit fields for Project:
      * Name
      * Description
      * Status
   * Edit fields for Tasks:
      * Name
      * Descriptions
      * Status
      * Deadline
      * Manually add time spent
   * Edit name for Tags

### Possible features
* Login for users
* Ability to start timer on the project itself, not associated with a task
* Sorting projects by: Name, Status, Hours Worked, Tag
* Keep a history of DateTime stamps for each time you worked on a Task

~~--------------------------------------------------~~
### To do 2025-01-27
* ~~Added css vars for colours~~ 
* (design) Expand Figma designs
* Change to follow re-design:
  * (frontend) Finish raw html/css styling
  * (backend) Set up timers and total time for Tasks.
  * (backend) Set up methods to total time for a project
  * (frontend/backend) User input to add description text to Tasks

### To do 2025-01-24
* ~~**Global Fetch URL variables!**~~
* Enable removing tags or tasks from a project without deleting the tag
* enable removing tags from a task without deleting the tag
* ~~Set-up possibility to specify a deadline on a task~~
* Disable editing on completed tasks?

### To do 2025-01-23
* ~~Set variables for the fetch URL base parts~~
* ~~Enable adding of tasks on project panel~~
* ~~Enable making projects active/inactive~~

## Updated functions
* I can add individual new Projects, Tasks and Tags. 
* Tasks must be associated with a project, and may have identical names between projects.
* Tags must be uniquely named, can have many per project, and many per task.
* Can update all three categories.
* Projects can be edited to add one or more new tags. Can not yet add a task on the Project editing view.

Frontend styled responsively, mobile-first.

## Initial state
The app contains three data models in their own db table (SQLite) for Project, Task and Tag. 
