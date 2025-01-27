# To Do List app
Created 2025-01-08 as part of Lexicon course, fullstack C# developer.

## Initial state
The app contains three data models in their own db table (SQLite) for Project, Task and Tag. 

## Updated functions
* I can add individual new Projects, Tasks and Tags. 
* Tasks must be associated with a project, and may have identical names between projects.
* Tags must be uniquely named, can have many per project, and many per task.
* Can update all three categories.
* Projects can be edited to add one or more new tags. Can not yet add a task on the Project editing view.

Frontend styled responsively, mobile-first.

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

