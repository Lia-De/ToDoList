// Start by showing current projects and set up a listener to change the displayed data
import {config } from './config.js';
import {navigationEventListener, unhideDisclaimer } from './EventListeners/eventHandlers.js';
import { printAddingForm, createEditForm, GetDetailId } from './Components/format.js';
import {clearEdit} from './Components/format.js';
import { addRequest } from './API_Access/fetching.js';


showProjects();
document.getElementById("navigate").addEventListener("click",navigationEventListener);
document.getElementById('disclaimer').addEventListener('click', unhideDisclaimer);

printAddingPlus();

import {showProjects} from './API_Access/fetching.js';

// helper functions to print out the adding form
function printAddingPlus(){
    let target = document.getElementById("tagsbtn");
    let addingBox = document.createElement('button');
    addingBox.innerText='+ New item';
    addingBox.id = "addItemButton"
    target.insertAdjacentElement("afterend", addingBox);
    addingBox.addEventListener('click', printAddingFormAndAddListeners);

}
export function printAddingFormAndAddListeners (event, dataType) {
    
    switch (document.getElementById('navigate').querySelector('.selected').id) {
        case "projectsbtn":
            let addingPForm = printAddingForm("addProject");
            addingPForm.addEventListener('submit', (event) => addRequest(event, 'project'));
            break;
        case "tasksbtn":
            // let addingTaskForm = printAddingForm("addTask");
            // addingTaskForm.addEventListener('submit', (event) => addRequest(event, 'task'));
            break;
        case "tagsbtn":
            let addingTagForm = printAddingForm("addTag");
            addingTagForm.addEventListener('submit', (event) => addRequest(event, 'tag'));
            break;
        default:
            console.error(`Unknown datatype: ${dataType}`);
    }
}



// 3 functions to add and populate edit forms and set event listeners
export function editProject (projectID, clickedProject){

    let form = createEditForm(projectID, clickedProject);
    form.id ="editProjectForm";
    form.addEventListener('submit', editProjectRequest);
};

export function editTag(tagID, tagName){
    let form = createEditForm(tagID, tagName);
    form.id = "editTagForm";
    form.addEventListener('submit', editTagRequest);
}

function editTask(taskID, taskName){
    let form = createEditForm(taskID, taskName);
    form.id = "editTaskForm";
    form.addEventListener('submit', editTaskRequest);
}

export function isValidInput(input) {
    // Example validation: the input should not be empty and must not contain special characters
    const regex = /^[a-zA-Z0-9\s]+$/; // Only letters, numbers, and spaces are allowed
    let onlyLetters = input.trim() !== '' && regex.test(input);
    let nullValues = input != null || input !="";
    let lengthMax = input.length <=30;

    return onlyLetters && nullValues && lengthMax;
}

import { showTags, showTasks, sendEditRequest } from './API_Access/fetching.js';
function editProjectRequest(event) {

    event.preventDefault(); // Prevent the default form submission
    // Get input values
    // let id = parseInt(document.getElementById('editId').value, 10);
    let id = GetDetailId();
    let name = document.getElementById('editName').value;
    let status = document.querySelector('input[name="newStatus"]:checked');

    if (status!=null) {
        let statusValue =document.querySelector('input[type=radio]:checked').value;
        status = parseInt(statusValue, 10);
    }
    let newDesc = document.getElementById('newDescription');
    let description=null;
    if (newDesc!=null){
        description = newDesc.value;
    }

    if (!isValidInput(name)){
        alert(`You have to enter (some) text`);
    } else {
            // Data to send in the request
        let requestData = {
            ProjectId: id,
            Name: name,
            Status: status,
            Description: description
        };
        sendEditRequest(requestData, `${config.apiBaseUrl}/Project/updateProject`, "project");
        // also send add tags to delete?


        clearEdit();
    }
};

function editTagRequest(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get input values
    // needs fixing
    const id = GetDetailId();
    // probably needs fixing
    const name = document.getElementById('editName').value;
    if (!isValidInput(name)){
        alert(`You have to enter (some) text`);
    } else {
        // Data to send in the request
        const requestData = {
            TagId: id,
            Name: name
        };
        sendEditRequest(requestData, `${config.apiBaseUrl}/Tag/updateTag`, "tag");
        clearEdit();
    }
};

function editTaskRequest(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get input values
    const id = parseInt(document.getElementById('id').value);
    const name = document.getElementById('name').innerText;
    let deadline = document.getElementById('deadline');
    if (deadline==null || deadline.value===''){deadline=null;}
    let desc = document.getElementById('taskCescription');
    if (desc==null){desc='';}
    let statusChecked = document.querySelector('input[type=radio]:checked');
    let status=null;
    if (statusChecked!=null) {
        let statusValue =statusChecked.value;
        status = parseInt(statusValue, 10);
    }

    if (!isValidInput(name)){
        alert(`You have to enter (some) text for the name`);
    } else {
        // Data to send in the request
        const requestData = {
            TaskId: id,
            Name: name,
            Status: status,
            Deadline: deadline,
            Description: desc,
        };
        sendEditRequest(requestData, `${config.apiBaseUrl}/Task/updateTask`, "task");
        
        clearEdit();
    }
};




















// Function to create and populate the table used only on Task view
// function createDataTable(data, dataType) {
//     // Get the table element or create it if it doesn't exist
//     let table = document.getElementById('dataTable');

//     if (!table) {
//         table = document.createElement('table');
//         table.id = 'dataTable';
//         document.getElementById('contents').appendChild(table);
//             // Create the colgroup element
//     const colgroup = document.createElement('colgroup');
    
//     const col1 = document.createElement('col');
//     col1.span = 1;
//     colgroup.appendChild(col1);

//     const col2 = document.createElement('col');
//     col2.id = 'editAndDelete';
//     col2.span = 2;
//     colgroup.appendChild(col2);

//     table.appendChild(colgroup);

//     // Create the header row
//     const headerRow = document.createElement('tr');

//     const headers = ['Data', 'Edit', 'Delete'];
//     headers.forEach(headerText => {
//         const th = document.createElement('th');
//         th.textContent = headerText;
//         headerRow.appendChild(th);
//     });

//     table.appendChild(headerRow);
//     }

//     // Add rows for each project in the data array
//     data.forEach(dataPoint => {
//         const row = document.createElement('tr');

//         // Project name column
//         const dataCell = document.createElement('td');
//         dataCell.textContent = dataPoint.name;
//         dataCell.className="data";
//         row.appendChild(dataCell);

//         // Edit button column
//         const editCell = document.createElement('td');
//         const editButton = document.createElement('button');
//         editButton.textContent = 'Save';
//         editButton.className="editButton";
      
//         editCell.appendChild(editButton);
//         row.appendChild(editCell);

//         // Delete button column
//         const deleteCell = document.createElement('td');
//         const deleteButton = document.createElement('button');
//         deleteButton.textContent = 'Del';
//         deleteButton.className="deleteButton";
//         deleteCell.appendChild(deleteButton);
//         row.appendChild(deleteCell);
        
//         // Set type specific listeners and data attributes
//         switch (dataType) {
//             case'projects':
//                 editButton.addEventListener('click', () => {
//                     editProject(dataPoint.projectId, dataPoint.name);
//                 });
//                 deleteButton.addEventListener('click', () => {
//                     deleteProject(dataPoint.projectId, dataPoint.name);
//                 });
//                 dataCell.addEventListener('click', (event) => {
//                     showThisItem(dataPoint.projectId, 'project', event);
//                 });
//                 break;
//             case'tasks':
//                 editButton.addEventListener('click', () => {
//                     editTask(dataPoint.taskId, dataPoint.name);
//                 });
//                 deleteButton.addEventListener('click', () => {
//                     deleteTask(dataPoint.taskId, dataPoint.name);
//                 });
//                 dataCell.addEventListener('click', (event) => {
//                     showThisItem(dataPoint.taskId, 'task', event); 
//                 });
//                 break;
//             case'tags':
//                 editButton.addEventListener('click', () => {
//                     editTag(dataPoint.tagId, dataPoint.name);
//                 });
//                 deleteButton.addEventListener('click', () => {
//                     deleteTag(dataPoint.tagId, dataPoint.name);
//                 });
//                 dataCell.addEventListener('click', (event) => {
//                     showThisItem(dataPoint.tagId, 'tag', event);
//                 });
//                 break;
//             default:
//                 console.error(`Unknown datatype: ${dataType}`);
//             }

//         table.appendChild(row);
//     });    
// }
