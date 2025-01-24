# To Do List app
Created 2025-01-08 as part of Lexicon course, fullstack C# developer.
## Version 0.2 
Second hand-in with links between all three classes (Project, Task, Tag).
Most editing possibilities are realized.

## Initial state
The app contains three data models in their own db table (SQLite) for Project, Task and Tag. 

## Updated functions 2025-01-17
* I can add individual new Projects, Tasks and Tags. 
* Tasks must be associated with a project, and may have identical names between projects.
* Tags must be uniquely named, can have many per project, and many per task.
* Can update all three categories.
* Projects can be edited to add one or more new tags. Can not yet add a task on the Project editing view.

Frontend styled responsively, mobile-first.

### To do 2025-01-23
* Set variables for the fetch URL base parts
* Enable adding of tasks on project panel
* ~~Enable making projects active/inactive~~

### To do 2025-01-24
* ~~**Global Fetch URL variables!**~~
* Enable removing tags or tasks from a project without deleting the tag
* enable removing tags from a task without deleting the tag
* Set-up possibility to specify a deadline on a task
* Disable editing on completed tasks?
