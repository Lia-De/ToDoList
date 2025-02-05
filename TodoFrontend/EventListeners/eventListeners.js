
import { createProjectList, createTagList, createEditForm,
        unhideDisclaimer, editProjectRequest, editTagRequest, editTaskRequest,
        printAddingForm, addRequest} from "../Components/create_items.js";
import { sendDeleteData } from "../API_Access/apiCalls.js";

document.getElementById("navigate").addEventListener("click",navigationEventListener);
document.getElementById('disclaimer').addEventListener('click', unhideDisclaimer);
// ********************************************************************************/
//      Navigation listeners - loads the right page
// ********************************************************************************/
export function navigationEventListener(e){
    // Find which data to show and display it
    let target = e.target;
    if (target.id === "projectsbtn"){
        if (!window.location.href.includes('index.html')) {
            goToPage('index.html');
        } else {
            createProjectList();    
        }
    } 
    if (target.id === "tagsbtn"){
        if (!window.location.href.includes('tags.html')) {
            goToPage('tags.html');
        } else {
            createTagList();
        }
    }
 }
// ********************************************************************************/
//      Helper to print Edit forms, and set listeners 
//            Toggle functionality
// ********************************************************************************/
export function editListener(data, type){
    let oldEdit = document.getElementById("edits");
    if (oldEdit != null) {
        oldEdit.parentNode.removeChild(oldEdit);        
    } else {
        if (type=='tag') {
            let form = createEditForm(data, 'tag');
            form.id = 'editTagForm';
            form.addEventListener('submit', editTagRequest);
        }
        if (type=='project'){
            let form = createEditForm(data, 'project');
            form.id ="editProjectForm";
            form.addEventListener('submit', editProjectRequest);
        }
        if (type=='task') {
            let form=createEditForm(data,'task');
            form.id = "editTaskForm";
            form.addEventListener('submit', editTaskRequest)
        }
    }
}
// ********************************************************************************/
//      Helper to print adding Task form, and set listeners 
//            Toggle functionality
// ********************************************************************************/
export function addTaskListener(event) {
    let trg = document.getElementById('addNewItem');
    if (trg==null) {
        event.target.classList.add('clicked');
        let addingTaskForm = printAddingForm("addTask");
        addingTaskForm.addEventListener('submit', (event) => addRequest(event, 'task'));
    }
    else {
        trg.parentNode.removeChild(trg);
        event.target.classList.remove('clicked');
    } 
}
// ********************************************************************************/ 
//              Helper functions - Sends user to page: trg
// ********************************************************************************/
 export function goToPage(trg) {
        window.location.href = trg;
} 
// ********************************************************************************/
//      Helper to print adding form for Tag and Project, and set listeners 
//            Toggle functionality
// ********************************************************************************/
export function printAddingFormAndAddListeners () {
    switch (document.getElementById('navigate').querySelector('.selected').id) {
        case "projectsbtn":
            let addingPForm = printAddingForm("addProject");
            addingPForm.addEventListener('submit', (event) => addRequest(event, 'project'));
            break;
        case "tagsbtn":
            let addingTagForm = printAddingForm("addTag");
            addingTagForm.addEventListener('submit', (event) => addRequest(event, 'tag'));
            break;
        default:
            console.error(`Unknown datatype: ${dataType}`);
    }
}


// ********************************************************************************/ 
//              DELETE functions - Asks for confirmation and sends to backend
// ********************************************************************************/
export function deleteProject(id, name){
    const confirmDelete = confirm(`Are you sure you want to delete "${name}"?`);
            
    if (confirmDelete) {
        return sendDeleteData(id, name, "project");
    }
}
// ********************************************************************************/
export function deleteTag(id, name){
    const confirmDelete = confirm(`Are you sure you want to delete "${name}"?`);
            
    if (confirmDelete) {
        return sendDeleteData(id, name, "tag");
    }
}
// ********************************************************************************/
export function deleteTask(id, desc){
    const confirmDelete = confirm(`Are you sure you want to delete "${desc}"?`);
            
    if (confirmDelete) {
        return sendDeleteData(id, desc, "task");
    }
}
// ********************************************************************************/