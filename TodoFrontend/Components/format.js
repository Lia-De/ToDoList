
import {getSingleItem, 
        startTimer, 
        stopTimer, 
        deleteProject,
         deleteTag} from '../API_Access/fetching.js';
import {statusTexts} from '../Data/hardcoded.js';
import { addTagToTask, 
        addTagToProject } from '../API_Access/fetching.js';
import {editProject, 
        editTag} from '../script.js';
import { addTaskListener } from '../EventListeners/eventHandlers.js';


export function showThisItem(itemID, dataType, target){
    if ( target.classList.contains("selected")) {
        // we are already displaying an item card, so clear it and show the adding option
        clearItemCard();
        return
    }
    getSingleItem(itemID, dataType).then( data => {
        clearItemCard();
        
        target.classList.add("selected");
        // build the project card
        let detailDiv = document.createElement('div');
        target.insertAdjacentElement("afterend", detailDiv);

        // Create the header row
        let itemID;
        switch (dataType){
            case 'project': itemID = data.projectId;
                break;
            case 'task': itemID = data.taskId;
                break;
            case 'tag': itemID = data.tagId;
                break;
            default:
                itemID = 0;
        }
        // Set the detail div ID to include the selected item ID
        detailDiv.id='detail-'+itemID;
        // display count of useages for tags, or status and all tags for the others
        if (dataType==='tag'){
            let header = addElement('div','',detailDiv);
            header.classList.add('header');
            addElement('h3', `${data.name}`, header);
            let editthisTag = addElement('div','',header);
            editthisTag.classList="edit";
            let tagEditButton = addElement('button','',editthisTag);
            tagEditButton.classList="editButton";
            tagEditButton.addEventListener('click', () => {
                let oldEdit = document.getElementById("edits");
                if (oldEdit != null) {
                    oldEdit.parentNode.removeChild(oldEdit);        
                } else {
                    editTag(data.tagId, data.name);
                }
            });

            if (data.projects.length > 0) {
                let allProjects = addElement('p', `Used in <b>${data.projects.length}</b> projects:`, detailDiv);
                let list = addElement('ul','',detailDiv);
                data.projects.forEach(project => {
                    addElement('li',project.name, list);
                });
            } else {addElement('p','Not used in any project.',detailDiv);}
            if (data.tasks.length > 0) {        
                addElement('p', `Also used in <b>${data.tasks.length}</b> tasks`, detailDiv);
            } else {
                addElement('p', `Not used in any task.`, detailDiv);
            }
        } else {
            if (dataType === 'project'){
            let header = addElement('div','',detailDiv);
            header.classList = 'header';
            let status = data.status;
            let statusElement = addElement('p',statusTexts[status], header);
            statusElement.classList=`status${status}`;            
            let title = addElement('h2',data.name, header);
            title.id="itemtitle";
            
            let editdiv = addElement('div', '', header);
            editdiv.classList = 'edit';
            let editButton = addElement('button','',editdiv);
            editButton.classList="editButton";
            editButton.addEventListener('click', () => {
                let oldEdit = document.getElementById("edits");
                if (oldEdit != null) {
                    oldEdit.parentNode.removeChild(oldEdit);        
                } else {
                    editProject(data.projectId, data.name);
                }
            });

            let time = addElement('p',formatTimeSpan(data.totalWorkingTime), header);
            time.classList = 'totalTime';
            // print timers in header
            printTimerStartAndStop(target, data);
            let pDescription = addElement('p',data.description,detailDiv);
            
            let tagBox = addElement('div','',detailDiv);
            tagBox.id='tagBox';
            tagBox.classList='tagsList';

            let ptform = printAllTagsAndForm(data.tags, tagBox, 'project');
            ptform.addEventListener('submit', (event) => addTagToProject(event));

            // header for Tasks
            header = addElement('div','',detailDiv);
            header.classList = 'header';
            addElement('h3', 'Tasks', header);
            let element = addElement('p','',header);
            element.id='addingBox';
            let addButton = addElement('button','+', element);
            
            addButton.id="addTaskButton";
            addButton.addEventListener('click', (event) => {
                addTaskListener(event)
            });

            // Each task for the project:
            data.tasks.forEach(task => {
                let taskDiv = addElement('div','',detailDiv);
                taskDiv.classList='detailTask shadowbox';
                header = addElement('div','',taskDiv);
                header.classList = 'header';
                let status = task.status;
                let statusValue=statusTexts[status];
                let statusElement = addElement('p',statusValue, header);
                statusElement.classList=`status${status}`;
                let taskname=addElement('h4',task.name, header);
                taskname.id=`task#${task.taskId}`;
                let deadline = addElement('p','', header);
                if (task.deadline) {
                deadline.innerHTML = formatDateTime(task.deadline);
                deadline.classList = 'deadline';
                } else {
                    deadline.classList='noDeadline';
                }
                addElement('p', task.description, taskDiv)
                let taskTagDiv = addElement('div','',taskDiv);
                taskTagDiv.classList='tagsList';
                let form = printAllTagsAndForm(task.tags, taskTagDiv, 'task');
                let hiddenId = addElement('input','',form);
                // hiddenId.id = 'taskid';
                hiddenId.type="hidden";
                hiddenId.name='taskId';
                hiddenId.value = task.taskId;
                form.elements["taskTagCloud"].id=`taskTagCloud${task.taskId}`;
                // set event listener
                form.addEventListener('submit', (event) => addTagToTask(event));
            });
            }
        }
        // Ensure the div#detail spans the grid properly when we resize.
        let rowSpan = Math.ceil(detailDiv.scrollHeight / 100);
        detailDiv.setAttribute('style',`grid-row: 1 / span ${rowSpan}`);
    });
}

export function fillItemData(itemData, form) {
    let trg = document.getElementById('editProjectTasks');
    trg.innerHTML = ""; // Clear previous content

    itemData.tasks.forEach(task => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `task-${task.taskId}`;
        checkbox.name = "tasks";
        checkbox.value = task.taskId;

        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.textContent = task.name;


        trg.appendChild(checkbox);
        trg.appendChild(label);
    });

    // let taskCloud = document.getElementById('taskCloud');
    // if (taskCloud!= null) {
    //     let tasks = itemData.tasks.map(task => task.name).join(', ');
    //     taskCloud.value=tasks;
    // }

    let tags = itemData.tags.map(tag => tag.name).join(', ');
    
    document.getElementById('oldTags').value = tags;

    switch (itemData.status) {
        case 0:
            form.elements['statusZero'].checked = true;
            // document.getElementById('statusZero').checked = true;
            break;
        case 1:
            document.getElementById('statusOne').checked = true;
            break;
        case 2:
            document.getElementById('statusTwo').checked = true;
            break;
        case 3:
            document.getElementById('statusThree').checked = true;
            break;
        }
}
export function createStatusRadioButtons(form){
    let radioLabel = addElement('label', 'Planning',form);
    radioLabel.setAttribute('for','statusZero');
    let radioButton = addElement('input','',form);
    radioButton.type='radio';
    radioButton.id = 'statusZero';
    radioButton.name='newStatus';
    radioButton.value=0;
    
    radioLabel =  addElement('label', 'Active',form);
    radioLabel.setAttribute('for','statusOne');
    radioButton = addElement('input','',form);
    radioButton.type='radio';
    radioButton.id = 'statusOne';
    radioButton.name='newStatus';
    radioButton.value=1;

    radioLabel =  addElement('label', 'Inactive',form);
    radioLabel.setAttribute('for','statusTwo');
    radioButton = addElement('input','',form);
    radioButton.type='radio';
    radioButton.id = 'statusTwo';
    radioButton.name='newStatus';
    radioButton.value=2;

    radioLabel =  addElement('label', 'Completed',form);
    radioLabel.setAttribute('for','statusThree');
    radioButton = addElement('input','',form);
    radioButton.type='radio';
    radioButton.id = 'statusThree';
    radioButton.name='newStatus';
    radioButton.value=3;
}
export function createDataCards(data, dataType){
    let timerCount = 0;
    const target = document.getElementById('contents');
    data.forEach(dataPoint => {
   
   
    if (dataType=='projects' && dataPoint.hasTimerRunning) {
        timerCount +=1;
    }
    let itemCard = addElement('div','',target);
    itemCard.classList="itemCard";

    let itemdiv = addElement('div','', itemCard);
    itemdiv.classList = 'item';
    
    
    itemdiv.id = dataType=='projects'? dataPoint.projectId : dataPoint.tagId;
    
    if (dataType=='projects'){
    let statuselement = addElement('p',statusTexts[dataPoint.status], itemdiv);
    statuselement.classList.add(`status${dataPoint.status}`);
    }
    
    let element= addElement('h3',dataPoint.name, itemdiv);

    if (dataType=='projects'){
        element = addElement('p',formatTimeSpan(dataPoint.totalWorkingTime), itemdiv);
        element.classList = 'totalTime';
        if (dataPoint.hasTimerRunning) {
            element.classList.add('runningTimer');
        }
        // do not print out edit button
    } else {
        let projectCount = dataPoint.projectCount;
        let taskCount = dataPoint.taskCount;
        addElement('p', `Usage: ${projectCount} (${taskCount})` , itemdiv);
    }


    let deldiv = addElement('div','',itemCard);
    deldiv.classList = 'delete';
    let deleteButton=addElement('button','',deldiv);
    deleteButton.classList = 'deleteButton';
    if (dataType =='projects') {

        deleteButton.addEventListener('click', () => {
            deleteProject(dataPoint.projectId, dataPoint.name);
        });
        itemdiv.addEventListener('click', (event) => {
            if (event.target.parentNode.id!="projectTimers") {
                showThisItem(dataPoint.projectId, 'project', itemCard);
            }
        });
    } 
    if (dataType=='tags') {

        deleteButton.addEventListener('click', () => {
            deleteTag(dataPoint.tagId, dataPoint.name);
        });
        itemdiv.addEventListener('click', () => {
            showThisItem(dataPoint.tagId, 'tag', itemCard);
        });
    }
});
    if (dataType == 'projects') {
        document.getElementById("nowShowing")
        .innerHTML += ` ${timerCount} timer(s) running`;
    }
}


// Helper function to create single elements, adding them to a target and returning the new element
export function addElement(elementType, data, target){
    let newElement = document.createElement(elementType);
    newElement.innerHTML = data;
    target.appendChild(newElement);
    return newElement;
}

export function printAddingForm(dataType){
    clearAddingForm();
    let addingBox = document.createElement("div");
    addingBox.id = "addNewItem";
    addingBox.classList.add('shadowbox');
    if (dataType != "addTask")
    {
        let title = dataType=='addProject' ? 'project': 'tag';
        addElement('h4',`Add ${title}`,addingBox);
        let target = document.getElementById("contents");
        target.insertAdjacentElement("afterbegin", addingBox);
    } else {
        let target = document.getElementById('addingBox').parentNode;
        target.insertAdjacentElement('afterend',addingBox);
    }
    
    let form = document.createElement("form");
    form.id = dataType;
   // Create the text input for the name
   let label = addElement('label', 'Name:', form);
   label.setAttribute('for', 'newName');
   let inputText = addElement('input','',form);
   inputText.type = 'text';
   inputText.id = 'newName';
   inputText.name = 'newName';

   // Create the submit button
    let button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Add';
    
    
    // Create special inputs for each case
    
    switch(dataType) {
        case "addProject":
            label = addElement('label','Description', form);
            label.setAttribute('for','description');
            inputText = addElement('input','',form);
            inputText.id='description';
            inputText.name='description';
            inputText.type='text';
            break;
        case "addTask":
            label = addElement('label','Description', form);
            label.setAttribute('for','description');
            inputText = addElement('input','',form);
            inputText.id='description';
            inputText.name='description';
            inputText.type='text';

            let extraInput = document.createElement('input');
            extraInput.type='hidden';
            extraInput.id = 'projectId';
            extraInput.name = 'projectId';
            extraInput.value = GetDetailId();
            // fill the select field with projects
            form.appendChild(extraInput);
            label = addElement('label','Optional Deadline: ', form);
            label.setAttribute('for','deadline');
            let deadline= addElement('input','',form);
            deadline.type = 'datetime-local';
            deadline.name="deadline";
            deadline.id="deadline";
            deadline.setAttribute('step','900');

            break;
        case "addTag":
            break;
        default:
    }
    
    form.appendChild(button);

    addingBox.appendChild(form);
    return form;
}

// function to create and populate an edit form
export function createEditForm(dataID, editableText) {
        // Check if we have an edit box already
        // edit to not change selected project?
    // clearEdit();

        // Create the container div
    let editBox = document.createElement('div');
    editBox.id = 'edits'; 
        // Create the form
    addElement('h3', 'Editing: '+editableText, editBox);
    let form = document.createElement('form');

        // Create the label for the name input
    let label = addElement('label', 'Name: ', form)
    label.setAttribute('for', 'editName');
    
    // Create the text input for the name
    let inputText = document.createElement('input');
    inputText.type = 'text';
    inputText.id = 'editName';
    inputText.name = 'editName';
    inputText.value = editableText; // Fill the input 
    form.appendChild(inputText);
       
    // Create the hidden input for the ID
    let inputHidden = document.createElement('input');
    inputHidden.type = 'hidden';
    inputHidden.id = 'editId';
    inputHidden.name = 'editId';
    inputHidden.value = dataID; // Set the hidden input value to data.id

    // Create the submit button
    let button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Save';

    // Print out all the other stuff for Project/Task switching on the active table.
    
    switch (document.getElementById('navigate').querySelector('.selected').id) {
        case "projectsbtn":

            createStatusRadioButtons(form);

            label = addElement('label','Tasks: ',form);
            label.setAttribute('for','taskCloud');
            let taskInput = addElement('input','',form);
            taskInput.type = 'text';
            taskInput.id = 'taskCloud';
            taskInput.name = 'taskCloud';
            addElement('label','Check to remove',form);
            let delTaskDiv = addElement('div','',form);
            delTaskDiv.id='editProjectTasks';

            label = addElement('label','Current tags:',form);
            let oldTags = addElement('input','',form);
            oldTags.type='text';
            oldTags.name='tagCloud';
            oldTags.id='oldTags';
            oldTags.disabled = true;

            label = addElement('label','Add new tags:',form);
            label.setAttribute('for','tagCloud');
            label.id='tagLabel';
            let tagInput = addElement('input','',form);
            tagInput.type = 'text';
            tagInput.id = 'tagCloud';
            tagInput.name = 'tagCloud';
            
            // fill the form with relevant data. Might not have to go to the db to fetch..
            // let ul = document.getElementById("tagBox").querySelector('.tagsList');
            // let items = ul.querySelectorAll("li");
            // console.log(items);

            getSingleItem(dataID,'project').then(itemData => {
                fillItemData(itemData, form);
                // populateTaskList(itemData.tasks, delTaskDiv);
            });
        
            break;
        case "tasksbtn":
                // Append all elements to the form
            createStatusRadioButtons(form);
            
            label = addElement('label','Current tags:',form);
            let oldTasks = addElement('input','',form);
            oldTasks.type='text';
            oldTasks.id='oldTags';
            oldTasks.disabled = true;

            label = addElement('label','Add new tags: ',form);
            label.setAttribute('for','tagCloud');
            label.id='tagLabel';
            let taskTagInput = addElement('input','',form);
            taskTagInput.type = 'text';
            taskTagInput.id = 'tagCloud';
            taskTagInput.name = 'tagCloud';

            label = addElement('label','Deadline: ',form);
            label.setAttribute('for','deadline');
            let deadline = addElement('input','',form);
            deadline.name='deadline';
            deadline.id = 'deadline';
            deadline.type='datetime-local';

            getSingleItem(dataID,'task').then(itemData => {
                        
                fillItemData(itemData,form);
                deadline.value=itemData.deadline;
          });
            break;
        case "tagsbtn":
                // Append all elements to the form

            break;
        default:
            console.error(`Unknown source of edit: ${dataType}`);
    }
 
    form.appendChild(inputHidden);
    form.appendChild(button);


    let divTarget = document.createElement('div');
    divTarget.appendChild(form);
    editBox.appendChild(divTarget);
    
    document.querySelector("[id^='detail']").firstElementChild.insertAdjacentElement('afterend',editBox);
    
    return form;
}


//helper to fill in tasks with delete functionality
function populateTaskList(tasks, trg) {
    
    trg.innerHTML = ""; // Clear previous content

    tasks.forEach(task => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `task-${task.taskId}`;
        checkbox.name = "tasks";
        checkbox.value = task.taskId;

        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.textContent = task.name;


        trg.appendChild(checkbox);
        trg.appendChild(label);
    });
}


// Helper function to clear the data from the contents div ready to be filled anew
export function clearData(){
    
    document.getElementById("contents").innerHTML = "";
    clearItemCard();
    clearAddingForm();
}
// Helper function to clear the edit and detail form
export function clearEdit(){
    
    let oldDetail = document.querySelector("[id^='detail']");

    if (oldDetail != null) {
        oldDetail.parentNode.removeChild(oldDetail);        
    }

    let oldEdit = document.getElementById("edits");
    if (oldEdit != null) {
        oldEdit.parentNode.removeChild(oldEdit);        
    }
    // reset the selected cell 
    let selectedDataCell = document.getElementById('contents').querySelectorAll("div.itemCard.selected");
    selectedDataCell.forEach(item => item.classList.remove("selected"));

    let oldTimers = document.getElementById('projectTimers');
    if (oldTimers != null){
        oldTimers.parentNode.removeChild(oldTimers);
    }
}
// Helper function to clear the add form when we have added an item.
export function clearAddingForm(){
    
    let oldAddingForm = document.getElementById("addNewItem");
    if (oldAddingForm != null)
        oldAddingForm.parentNode.removeChild(oldAddingForm);
}

export function clearItemCard() {
    //clear the decks for new card
    clearEdit();
    // reset the selected cell in the data table
    let table=document.getElementById('contents');
    let cells = table.querySelectorAll('itemCard');
    cells.forEach(cell => { 
        cell.classList.remove("selected");
    });

}

// Helper function to switch which button is selected in the nav bar
export function selectedTypeButtons(selectedType){
    let selectedButton = document.querySelectorAll("button.selected");
    selectedButton[0].classList.remove('selected');

    document.getElementById(selectedType+"btn").classList.add("selected");
}

export function formatTimeSpan(timeSpanString) {
    // Extract hh:mm:ss from "hh:mm:ss.ffffff"
    if (timeSpanString === "00:00:00") {
        return 'No time recorded';
    }

    let [hours, minutes, seconds] = timeSpanString.split(":").map(Number);

    // Round seconds to remove microseconds
    seconds = Math.floor(seconds);

    // Convert hours to days and get remaining hours
    let days = Math.floor(hours / 24);
    hours = hours % 24;

    // Build the output dynamically
    let parts = [];
    
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.length > 0 ? parts.join(" ") : 'No time recorded';
}

export function formatDateTime(dateString) {
    let date = new Date(dateString);
    let now = new Date();

    // Extract components
    let year = date.getFullYear();
    let month = date.toLocaleString('en-US', { month: 'short' }); // "Feb"
    let day = date.getDate();
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two-digit minutes

    // If the year is the current year, omit it
    let showYear = year !== now.getFullYear();
    
    // Format string based on condition
    return showYear
        ? `${month} ${day}, ${year} @ ${hours}:${minutes}`
        : `${month} ${day} @ ${hours}:${minutes}`;
}

// Helper function to print all Tags, and add Tag form for Tasks and Projects
function printAllTagsAndForm(tags, target, type){
    let tagList= addElement('ul',``,target);
    tagList.classList='tagsList';
    tags.forEach(tag => {
        addElement('li', tag.name, tagList);
    });
    let tagDiv = addElement('div','',target);
    
    let form = addElement('form','',tagDiv);
    let addTags = addElement('button', 'Add Tags',form);
    addTags.type='submit';
    let tagInput = addElement('input','',form);
    tagInput.type = 'text';
    tagInput.setAttribute('placeholder','Add tag');
    if (type =='task') {
        tagDiv.id='taskTagAdding';
        tagInput.name = 'taskTagCloud';
    } else {
        tagDiv.id='projectTagAdding';
        tagInput.id = 'projectTagCloud';
        tagInput.name = 'projectTagCloud';
    }
    return form;
}

// Helper function to print timers stop and start

export function printTimerStartAndStop(target, data) {
    let projectTimers = document.createElement('div','');
    target.firstChild.querySelectorAll('h3')[0].insertAdjacentElement('afterend',projectTimers);
    projectTimers.id='projectTimers';
    let startButton = addElement('button','Start',projectTimers);
    startButton.id = 'timerStart';
    let stopButton = addElement('button','Stop',projectTimers);
    stopButton.id = 'timerStop';
    if (data.hasTimerRunning){
        startButton.classList = 'running';
        stopButton.classList = 'valid';
    }
    startButton.addEventListener('click', (event) => {
    if (event.target.classList !='running')
        startTimer(data.projectId);
    });
    
    stopButton.addEventListener('click', (event) => {
    if (event.target.classList == 'valid')
        stopTimer(data.projectId);
    });
}

// Helper function to extract the ID number from the current Detail Div
export function GetDetailId(){
    const detailDiv = document.querySelector("[id^='detail-']");

    if (detailDiv) {
        const idParts = detailDiv.id.split("-"); // Splits at "-"
        const IDnumber = parseInt(idParts[1], 10); // Extracts the second part as an integer
    return IDnumber;
}
}