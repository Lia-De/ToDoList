# To Do List app
Created 2025-01-08 as part of Lexicon course, fullstack C# developer.

## Design Considerations going forward (29/1 2024)
This will be an app to keep track of time and processes for craft projects. Textile, wood, or whatever else needs a user to keep track of their time.

Often when I make a textile item I get asked: "How long did that take you to make?" and I rarely know, because who has time to write down times for all
the things you do for a project. I might be wanting to sell the results of my work, but I don't know what to charge, because I don't know how much time
it took.

### Required features
- [x] Adding Projects, with title, some description and a way to add Tags and Tasks.
- [x] Projects should total the time spent on them.
- [x] Projects should have status: Planning, active, paused or completed.
- [X] Tags should be universal, available to be applied to any and all projects and sub-tasks.
- [X] Tasks must belong to a project.
- [x] Tasks should have a title and possibly description, status and possibly a deadline and tags.
- [x] Users should be able to track time per Project.
- [x] Front end should be a website done with responsive designed mobile-first.
   - [x] Create projects, add tasks and tags
   - [x] List all Projects
     - [X] Name, Description, Status, TimeSpent, Tasks and Tags
     - [X] For Tasks: Name, Description, Status, Deadline, (TimeSpent)
     - [X] For Tags: Name
   - [X] List all Tags (show names and usages in Projects/Tasks)
   - [X] Add Tags to Tasks
   - [x] Start and stop Timers for Projects
   - [x] Edit fields for Project:
      - [x] Name
      - [x] Description
      - [x] Status
   - [x] Edit fields for Tasks:
      - [x] Name
      - [x] Descriptions
      - [x] Status
      - [x] Deadline
   - [x] Edit name for Tags

### Possible features
- [ ] Login for users
- [ ] Ability to start timer on the each task
- [ ] Sorting projects by: Name, Status, Hours Worked, Tag
    - [x] Sort by status
- [ ] Keeping time per Task as well as for whole Project
- [ ] Keep a history of DateTime stamps for each time you worked on a Task
- [ ] Manually add time spent
- [ ] Fields for StartDate and CompleteDate For total time of project.
   - Maybe a list of all changes of status { Status, DateTime } to keep track of that

Lo-fi prototype: [Find it on Figma](https://www.figma.com/proto/CZhjlhFft9ezpkyJNBcyUX/Crafting-To-Do?node-id=17-78&t=J5iyQDHvTie9OMjz-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=17%3A77)

--------------------------------------------------
### To Do 2025-02-05 - Version 0.4
* App can now add and remove tasks from project, add and remove tags from projects and tasks.
* Start and stop timer and total time per project.
* List all projects in order of Running timers first, then Status, then name
* Can edit all fields of Project.
- [x]  Editing of Tasks:
  - [x] Deadline
  - [x] Name
  - [x] Description
  - [x] Status
- [ ] Add time worked on a project manually (after the fact registration)
- [ ] Add fields for StartDate and CompleteDate for Projects and Tasks to be set when you change project to Active and Completed respectively.

### To Do 2025-02-03 - Version 0.4
* After refactoring the javascript into separate files: check over and make sure things are in the right spot
* ~~Create separate page to show a single project~~
  * ~~To enable linking from tags to the project it is used in~~
* Edit for tasks: edit options for a single task
   * ~~enable setting of deadline (editable once set or no?)~~
* ~~Editing project: add functionality to delete tasks and remove tags from the project.~~
* Work on figma mock-ups for project detail page

### To do 2025-01-30
* ~~Map js methods for showing editing form~~
* ~~Add description options in user input~~
* ~~Expand creation of Task with more than name and deadline~~
* ~~Re-design and code viewing of Tags~~

### To do 2025-01-27
* ~~Added css vars for colours~~ 
* (design) Expand Figma designs
* Change to follow re-design:
  * ~~(frontend) Finish raw html/css styling~~
  * (backend) Set up timers and total time for Tasks.
  * ~~(backend) Set up methods to total time for a project~~
  * ~~(frontend/backend) User input to add description text to Tasks (at creation)~~

### To do 2025-01-24
* ~~**Global Fetch URL variables!**~~
* ~~Enable removing tags or tasks from a project without deleting the tag~~
* ~~enable removing tags from a task without deleting the tag~~
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
