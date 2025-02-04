
import { createProjectList, createTagList, unhideDisclaimer, 
        printAddingForm, addRequest} from "../Components/create_items.js";


document.getElementById("navigate").addEventListener("click",navigationEventListener);
document.getElementById('disclaimer').addEventListener('click', unhideDisclaimer);

export function navigationEventListener(e){
    // Find which data to show and display it
    let target = e.target;
    if(target.id === "projectsbtn"){
        if (!window.location.href.includes('index.html')) {
            goToPage('index.html');
        } else {
            createProjectList();    
        }
        
    } else if(target.id === "tagsbtn"){
        if (!window.location.href.includes('tags.html')) {
            goToPage('tags.html');
        } else {
            createTagList();
        }

    }
 }

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

 export function goToPage(trg) {
        window.location.href = trg;  // Redirects to tags.html
} 

export function printAddingFormAndAddListeners () {
    
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