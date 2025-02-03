// navigationEventListener
// Event listener to switch between the different data types
import {showProjects, 
        showTasks, 
        showTags, 
        addRequest} from '../API_Access/fetching.js';
import { printAddingForm } from '../Components/format.js';


export function navigationEventListener(e){
    // Find which data to show and display it
    let target = e.target;
    if(target.id === "projectsbtn"){
        showProjects();
    } else if(target.id === "tasksbtn"){
        showTasks();
    } else if(target.id === "tagsbtn"){
        showTags();
    }
 }

// unhideDisclaimer
export function unhideDisclaimer(){
    let disclaimers = document.getElementById('disclaimers');
    
    if (document.getElementById('disclaimer').innerHTML ==="Show info") {
        disclaimers.classList='visible';
    document.getElementById('disclaimer').innerHTML = "Hide";
} else {
    document.getElementById('disclaimer').innerHTML = "Show info";
    disclaimers.classList='';}
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