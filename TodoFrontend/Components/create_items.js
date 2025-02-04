
import { statusTexts } from '../Data/hardcoded.js';
import { deleteProject, deleteTag, deleteTask,
        fetchAllProjects, fetchAllTags, getSingleItem, 
        startProjectTimer, stopProjectTimer,
        addTagToItem, sendAddRequest, 
        sendEditRequest, 
        removeTagFromProject} from '../API_Access/apiCalls.js';
import { goToPage, addTaskListener } from '../EventListeners/eventListeners.js';

function listHelperSetupCard(id){
    let itemCard = addElement('div','',document.getElementById('contents'));
    itemCard.classList="itemCard";

    let itemdiv = addElement('div','', itemCard);
    itemdiv.classList = 'item';
    itemdiv.id = `detail-${id}`;
    return itemdiv;
}
function listHelperDeleteButton(trg){
    let deldiv = addElement('div','',trg);
    deldiv.classList = 'delete';
    let deleteButton=addElement('button','',deldiv);
    deleteButton.classList = 'deleteButton';
    return deleteButton;
}
function listHelperCreateEditButton(trg){
    if (trg==null)
        trg = document.getElementById('nowShowing').parentNode;
    let editdiv = addElement('div', '', trg);
    editdiv.classList = 'edit';
    let editButton = addElement('button','',editdiv);
    editButton.classList="editButton";
    return editButton;
}

export function createProjectList() {
    clearData();
    fetchAllProjects().then(data => {
    document.getElementById("nowShowing").innerHTML = `${data.length} Projects`;
    let timerCount = 0;
    const target = document.getElementById('contents');

    printAddNewItemButton();

    data.forEach(dataPoint => {
        if (dataPoint.hasTimerRunning) {
            timerCount +=1;
        }
        let itemdiv = listHelperSetupCard(dataPoint.projectId);
        itemdiv.addEventListener('click', (event) => {
            goToPage(`project.html?id=${parseOutId(event.currentTarget.id)}`);
        }); 

        let statuselement = addElement('p',statusTexts[dataPoint.status], itemdiv);
        statuselement.classList.add(`status${dataPoint.status}`);
        let element= addElement('h3',dataPoint.name, itemdiv);
        element = addElement('p',formatTimeSpan(dataPoint.totalWorkingTime), itemdiv);
        element.setAttribute('data',dataPoint.totalWorkingTime);
        element.classList = 'totalTime';
        if (dataPoint.hasTimerRunning) {
            element.classList.add('runningTimer');
            
        }
        let deleteButton = listHelperDeleteButton(itemdiv.parentNode);            
        deleteButton.addEventListener('click', () => {
            deleteProject(dataPoint.projectId, dataPoint.name)
            .then(()=> createProjectList());
        });
    });
    document.getElementById("nowShowing")
    .innerHTML += ` ${timerCount} timer(s) running`;
    
    });
}

export function createTagList() {
    clearData();
    fetchAllTags().then(data => {
        document.getElementById("nowShowing").innerHTML = `${data.length} Tags`;
        let contentDiv= document.getElementById('contents');
        contentDiv.classList.add('listAllTags');
        data.forEach(dataPoint => {
            let itemdiv = listHelperSetupCard(data.tagId);
            itemdiv.addEventListener('click', () => {
                goToPage('tag.html?id='+dataPoint.tagId)
            });

            addElement('h3',dataPoint.name, itemdiv);
            let projectCount = dataPoint.projectCount;
            let taskCount = dataPoint.taskCount;
            addElement('p', `Usage: ${projectCount} (${taskCount})` , itemdiv);
            let deleteButton = listHelperDeleteButton(itemdiv.parentNode);            
           deleteButton.addEventListener('click', () => {
               deleteTag(dataPoint.tagId, dataPoint.name)
               .then(()=>createTagList());
           });

        });
     });

     printAddNewItemButton();
}

// helper functions to print out the adding form
export function printAddNewItemButton(){
    if (!document.getElementById('addItemButton')) {
        let target = document.getElementById("tagsbtn");
        let addingBox = document.createElement('button');
        addingBox.innerText='+Create new';
        addingBox.id = "addItemButton"
        target.insertAdjacentElement("afterend", addingBox);
        addingBox.addEventListener('click', printAddingFormAndAddListeners);
    }
}

function printAddingFormAndAddListeners () {
    // IF I have a form already, clear it.
    if (clearAddingForm()){
        return;
    }
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


// unhideDisclaimer
import { InfoText } from '../Data/hardcoded.js';
export function unhideDisclaimer(){
    let disclaimers = document.getElementById('disclaimers');
    
    if (document.getElementById('disclaimer').innerHTML ==="Show info") {
        InfoText.forEach(line => {
        let p = document.createElement('p');
        p.textContent = line;
        p.classList='disclaimer';
        disclaimers.insertAdjacentElement('beforeend',p);
    });
        document.getElementById('disclaimer').innerHTML = "Hide";
} else {
    document.getElementById('disclaimer').innerHTML = "Show info";
    document.querySelectorAll('.disclaimer').forEach(el => el.remove());
    }
}

export function showThisItem(itemID, dataType, target){
    clearEdit();
    getSingleItem(itemID, dataType).then( data => {
        
        if (!target) {
            target = document.getElementById('contents');
        }
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
            document.getElementById('nowShowing').innerHTML = data.name;
            let tagEditButton = listHelperCreateEditButton();
            tagEditButton.addEventListener('click', () => {
                let oldEdit = document.getElementById("edits");
                if (oldEdit != null) {
                    oldEdit.parentNode.removeChild(oldEdit);        
                } else {
                    editTag(data.tagId, 'tag');
                }
            });

            if (data.projects.length > 0) {
                let allProjects = addElement('p', `Used in <b>${data.projects.length}</b> projects:`, detailDiv);
                let list = addElement('ul','',detailDiv);
                data.projects.forEach(project => {
                    let listitem=addElement('li','', list);
                    let link = addElement('a',project.name, listitem);
                    link.href="project.html?id="+project.projectId;
                });
            } else {addElement('p','Not used in any project.',detailDiv);}
            if (data.tasks.length > 0) {        
                addElement('p', `Also used in <b>${data.tasks.length}</b> tasks`, detailDiv);
            } else {
                addElement('p', `Not used in any task.`, detailDiv);
            }
        } else {
            if (dataType === 'project'){
            document.getElementById('nowShowing').innerHTML = data.name;
            let header = addElement('div','',detailDiv);
            header.classList = 'header';
            let status = data.status;
            let statusElement = addElement('p',statusTexts[status], header);
            statusElement.classList=`status${status}`;            
                        
            let time = addElement('p',formatTimeSpan(data.totalWorkingTime), header);
            time.setAttribute('data',data.totalWorkingTime);
            time.classList = 'totalTime';

            // Try adding to the page header instead of 'header'
            let editButton = listHelperCreateEditButton(header);
            editButton.addEventListener('click', () => {
                let oldEdit = document.getElementById("edits");
                if (oldEdit != null) {
                    oldEdit.parentNode.removeChild(oldEdit);        
                } else {
                    editProject(data.projectId);
                }
            });

            // print timers in Detail header only if we are not completed
            if (data.status != 3) {
                printTimerStartAndStop(null, data);
            }
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
                taskname.id=`task-${task.taskId}`;
                let deadline = addElement('p','', header);
                if (task.deadline) {
                deadline.innerHTML = formatDateTime(task.deadline);
                deadline.classList = 'deadline';
                } else {
                    deadline.classList='noDeadline';
                    deadline.addEventListener('click',printTaskDeadlinePicker);
                }
                addElement('p', task.description, taskDiv)
                let taskTagDiv = addElement('div','',taskDiv);
                taskTagDiv.classList='tagsList';
                let form = printAllTagsAndForm(task.tags, taskTagDiv, 'task');
                let hiddenId = addElement('input','',form);
                hiddenId.type="hidden";
                hiddenId.name='taskId';
                hiddenId.value = task.taskId;
                form.elements["taskTagCloud"].id=`taskTagCloud${task.taskId}`;
                // set event listener
                form.addEventListener('submit', (event) => {
                    addTagToTask(event);
                });
            });
            }
        }
        // Ensure the div#detail spans the grid properly when we resize.
        let rowSpan = Math.ceil(detailDiv.scrollHeight / 100);
        detailDiv.setAttribute('style',`grid-row: 1 / span ${rowSpan}`);
    });
}

// Helper function to add Timer start and stop buttons after the Page header
export function printTimerStartAndStop(target, data) {

    let projectTimers = document.createElement('div','');
    if (!target) {
        document.getElementById('nowShowing').insertAdjacentElement('afterend',projectTimers);
    } else {
        target.appendChild(projectTimers);
    }
    projectTimers.id='projectTimers';
    let startButton = addElement('button','Start',projectTimers);
    startButton.id = 'timerStart';
    // let stopButton = addElement('button','Stop',projectTimers);
    // stopButton.id = 'timerStop';
    if (data.hasTimerRunning){
        startButton.classList = 'running';
        // stopButton.classList = 'valid';
    }
    startButton.addEventListener('click', (event) => {
    if (event.target.classList !='running')
       {
        startTimer(data.projectId);
       } else{
        stopTimer(data.projectId);
       }
    });
    
    // stopButton.addEventListener('click', (event) => {
    // if (event.target.classList == 'valid')
    //     stopTimer(data.projectId);
    // });
}


function startTimer(projectId){
    startProjectTimer(projectId).then(data => {
        if (data ==='') {
            let button = document.getElementById('timerStart');
            button.classList.add('running');
            // document.getElementById('timerStop').classList = 'valid';
        } else {
            alert(data);
        }
    });
}

function stopTimer(prId){
    stopProjectTimer(prId).then(data => {
        let trg=document.querySelector("[id^='detail']").querySelector('.totalTime');
        trg.innerHTML += ' + '+formatTimeSpan(data);
        document.getElementById('timerStart').classList = '';
        // document.getElementById('timerStop').classList = '';
    });
}


// Helper function to print all Tags, and add Tag form for Tasks and Projects
function printAllTagsAndForm(tags, target, type){
    let tagList= addElement('ul',``,target);
    tagList.classList='tagsList';
    tags.forEach(tag => {
        let element = addElement('li', '', tagList);
        let item = addElement('a',tag.name, element)
        item.href=`tag.html?id=${tag.tagId}`;
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


// 3 functions to add and populate edit forms and set event listeners
function editProject (projectID){

    let form = createEditForm(projectID, 'project');
    form.id ="editProjectForm";
    form.addEventListener('submit', editProjectRequest);
};
function editTag(tagId){
    let form = createEditForm(tagId, 'tag');
    form.id = 'editTagForm';
    form.addEventListener('submit', editTagRequest);
}

// function to create and populate an edit form
function createEditForm(dataID, type) {
        // Check if we have an edit box already
        // edit to not change selected project?

        // Create the container div
    let editBox = document.createElement('div');
    editBox.id = 'edits'; 
        // Create the form
    addElement('h3', 'Editing', editBox);
    let form = document.createElement('form');

        // Create the label for the name input
    let label = addElement('label', 'Name: ', form)
    label.setAttribute('for', 'editName');
    
    // Create the text input for the name
    let inputText = document.createElement('input');
    inputText.type = 'text';
    inputText.id = 'editName';
    inputText.name = 'editName';
    inputText.value = document.getElementById('nowShowing').innerHTML; // Fill the input 
    form.appendChild(inputText);
       
    // Create the hidden input for the ID
    let inputHidden = document.createElement('input');
    inputHidden.type = 'hidden';
    inputHidden.id = 'editId';
    inputHidden.name = 'editId';
    inputHidden.value = dataID; // Set the hidden input value to data.id

    // Create the submit button, don't append it yet.
    let button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Save';

    // Print out all the other stuff for Project/Task switching on the active type.
    switch (type) {
        case "project":
            // <textarea id="message" name="message" rows="4" cols="50"></textarea>
            label = addElement('label','Description:', form);
            label.setAttribute('for','description');
            let textarea = addElement('textarea','',form);
            textarea.id='description';
            textarea.name='description';
            textarea.setAttribute('rows','3');

            createStatusRadioButtons(form);
            // Removing the taskCloud
            addElement('label','Current Tasks:',form);
            let delTaskDiv = addElement('div','',form);
            delTaskDiv.id='editProjectTasks';

            label = addElement('label','Current tags:',form);
            // let oldTags = addElement('input','',form);
            // oldTags.type='text';
            // oldTags.name='tagCloud';
            // oldTags.id='oldTags';
            // oldTags.disabled = true;
            let delTagsDiv = addElement('div','All Tags Go Here',form);
            delTagsDiv.id='editProjectTags';

            getSingleItem(dataID,'project').then(itemData => {
                fillItemData(itemData, form);
            });
        
            break;
        case "task":
                // Append all elements to the form
        //     createStatusRadioButtons(form);
            
        //     label = addElement('label','Current tags:',form);
        //     let oldTasks = addElement('input','',form);
        //     oldTasks.type='text';
        //     oldTasks.id='oldTags';
        //     oldTasks.disabled = true;

        //     label = addElement('label','Add new tags: ',form);
        //     label.setAttribute('for','tagCloud');
        //     label.id='tagLabel';
        //     let taskTagInput = addElement('input','',form);
        //     taskTagInput.type = 'text';
        //     taskTagInput.id = 'tagCloud';
        //     taskTagInput.name = 'tagCloud';

        //     label = addElement('label','Deadline: ',form);
        //     label.setAttribute('for','deadline');
        //     let deadline = addElement('input','',form);
        //     deadline.name='deadline';
        //     deadline.id = 'deadline';
        //     deadline.type='datetime-local';

        //     getSingleItem(dataID,'task').then(itemData => {
                        
        //         fillItemData(itemData,form);
        //         deadline.value=itemData.deadline;
        //   });
            break;
        case "tag": 
        // No extra input for editing tags
            break;
        default:
            console.error(`Unknown source of edit: ${dataType}`);
    }
 
    form.appendChild(inputHidden);
    form.appendChild(button);

    let divTarget = document.createElement('div');
    divTarget.appendChild(form);
    editBox.appendChild(divTarget);
    document.querySelector("[id^='detail-']").firstElementChild.insertAdjacentElement('afterend',editBox);
    return form;
}


function fillItemData(itemData, form) {

    // Fill in the description
    if (form.elements['description']) 
        form.elements['description'].value=itemData.description;
    // Check the box for the current status of the project.
    switch (itemData.status) {
        case 0:            form.elements['statusZero'].checked = true;
            break;
        case 1:            form.elements['statusOne'].checked = true;
            break;
        case 2:            form.elements['statusTwo'].checked = true;
            break;
        case 3:             form.elements['statusThree'].checked = true;
            break;
        }

    // print out the tasks -- change from checkboxes!
    let trg = document.getElementById('editProjectTasks');
    trg.innerHTML = ""; // Clear previous content
    itemData.tasks.forEach(task => {
        
        // <p class="deleteTask" id="task-${task.taskId}">task.name</p>
        let telement = addElement('p',task.name, trg);
        telement.id = `task-${task.taskId}`;
        telement.classList = 'deleteTask';
        telement.addEventListener('click', removeTask);
        
    });
    trg = document.getElementById('editProjectTags');
    trg.innerHTML = "";
    itemData.tags.forEach(tag => {
        let telement = addElement('p',tag.name, trg);
        telement.id = `tag-${tag.tagId}`;
        telement.classList = 'deleteTag';
        telement.addEventListener('click', removeTag);
    });
}

function removeTask(event){
    let taskId = parseOutId(event.target.id);
    let result = deleteTask(taskId, event.target.innerText);
    if (result) {
        event.target.parentNode.removeChild(event.target);
    }
}
function removeTag(event){
    let tagID=parseOutId(event.target.id);
    let projectID = GetDetailId();
    if (confirm(`Are you sure you want to remove ${event.target.innerHTML} from this project?`)) {
        if (removeTagFromProject(projectID, tagID)){
           event.target.parentNode.removeChild(event.target);
        }
    }
}
function createStatusRadioButtons(form){
    let radioLabel = addElement('label', statusTexts[0],form);
    radioLabel.setAttribute('for','statusZero');
    let radioButton = addElement('input','',form);
    radioButton.type='radio';
    radioButton.id = 'statusZero';
    radioButton.name='newStatus';
    radioButton.value=0;
    
    radioLabel =  addElement('label', statusTexts[1],form);
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



export function printAddingForm(dataType){
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

            break;
        case "addTag":
            break;
        default:
    }
    
    form.appendChild(button);

    addingBox.appendChild(form);
    return form;
}

function addTagToTask(event){
    event.preventDefault();
    let tagCloud = 'taskTagCloud'+event.target.elements["taskId"].value;
    let inputTags = document.getElementById(tagCloud).value;
    let dataid = parseInt(event.target.elements["taskId"].value,10);
    
    let fetchUrl = `/Task/addTagsToTask/${dataid}`;    

    if (inputTags !=''){
        addTagToItem(event,inputTags, fetchUrl);
    }
}
function addTagToProject(event){
    event.preventDefault();
    let inputTags = document.getElementById('projectTagCloud').value;
    let dataid = GetDetailId();
    let fetchUrl=`/Project/addTagsToProject/${dataid}`;
    if (dataid !=null) {      
        if (inputTags !=''){
            addTagToItem(event, inputTags, fetchUrl);
        } 
    }
}
function printTaskDeadlinePicker(event){
    let calendarPicker = event.currentTarget;
    let headerDiv = calendarPicker.parentNode;
    let deadlineform = document.getElementById('setDeadlineForm');
    if (deadlineform) {
        headerDiv.removeChild(deadlineform)
    } else {
        // prevent another click
        // calendarPicker.removeEventListener('click',editTaskDeadline);

        let taskId= parseOutId(event.target.previousElementSibling.id);
        // event.target.parentNode.removeChild(event.target);
        // let element = addElement('p','How does this work',event.target.parentNode);
        let form = addElement('form','',event.target.parentNode);
        form.id="setDeadlineForm";
        let newdeadline= addElement('input','',form);
        newdeadline.type = 'datetime-local';
        newdeadline.name="deadline";
        newdeadline.id="deadline";

        let inputHidden = addElement('input','',form);
        inputHidden.type = 'hidden';
        inputHidden.id = 'taskId';
        inputHidden.name = 'taskId';
        inputHidden.value = taskId; 
        
        let submit = addElement('button','Save',form);
        submit.type="submit";
        
        // Remove the old icon
        headerDiv.removeChild(calendarPicker);
        // add it back again after the calendar picker.
        headerDiv.appendChild(calendarPicker);

        form.addEventListener('submit', editTaskRequest);
    }
}

async function editProjectRequest(event) {
    event.preventDefault(); // Prevent the default form submission
    // Get input values
    let id = GetDetailId();
    let name = document.getElementById('editName').value;
    let status = document.querySelector('input[name="newStatus"]:checked');

    if (status!=null) {
        let statusValue =document.querySelector('input[type=radio]:checked').value;
        status = parseInt(statusValue, 10);
    }
    let newDesc = document.getElementById('description');
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
        
        if (await sendEditRequest(requestData, `/Project/updateProject`)) {
            window.location.replace(window.location.href); // ✅ Reload page only if successful
        }
        // also send add tags to delete?
        clearEdit();
    }
};


async function editTagRequest(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get input values
    // needs fixing?
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
        if (await sendEditRequest(requestData, '/Tag/updateTag', "tag")) {
            document.getElementById('nowShowing').innerHTML = name;
            clearEdit();    
        }
        
    }
};

function editTaskRequest(event){
    event.preventDefault();
    let form = event.currentTarget;
    let header = form.parentNode;
    let id=event.currentTarget.elements["taskId"].value;
    let deadline = event.currentTarget.elements["deadline"].value;
    if (deadline=='') {
        alert('You have to enter a date, or dismiss the picker');
    } else {
        console.log(id, deadline);
        let formData = {
            taskId: id,
            Deadline: deadline
        }
        sendEditRequest(formData, '/Task/updateTask').then((data)=>{
            header.removeChild(form);
            header.removeChild(header.lastElementChild);
            let deadline = addElement('p','', header);
            deadline.innerHTML = 'Deadline set'
            deadline.classList = 'deadline';
        });
    }
}

// Helper function to extract the ID number from the current Detail Div, or the target
export function GetDetailId(){
    const detailDiv = document.querySelector("[id^='detail-']");
    if (detailDiv) {
        return parseOutId(detailDiv.id);
    }
}
// Helper function to split out an ID following a descriptor and -
function parseOutId(input){
    const idPart = input.split("-"); // Splits at "-"
    const IDnumber = parseInt(idPart[1], 10); // Extracts the second part as an integer
    return IDnumber;
}
// Helper function to create single elements, adding them to a target and returning the new element
export function addElement(elementType, data, target){
    let newElement = document.createElement(elementType);
    newElement.innerHTML = data;
    target.appendChild(newElement);
    return newElement;
}


function formatTimeSpan(timeSpanString) {
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

function formatDateTime(dateString) {
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

export function clearData(){
    document.getElementById("contents").innerHTML = "";
}
// Helper function to clear the edit and detail form
export function clearEdit(){
    // let oldDetail = document.querySelector("[id^='detail']");
    // if (oldDetail != null) {    oldDetail.parentNode.removeChild(oldDetail);}

    let oldEdit = document.getElementById("edits");
    if (oldEdit != null) {      oldEdit.parentNode.removeChild(oldEdit);}
    
    let oldTimers = document.getElementById('projectTimers');
    if (oldTimers != null){ oldTimers.parentNode.removeChild(oldTimers);}
}
// Helper function to clear the add form when we have added an item.
export function clearAddingForm(){
    let oldAddingForm = document.getElementById("addNewItem");
    if (oldAddingForm != null) {
        oldAddingForm.parentNode.removeChild(oldAddingForm);
        return true;
    } 
    return false;
}

export function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

export function isValidInput(input) {
    // Example validation: the input should not be empty and must not contain special characters
    const regex = /^[a-zA-Z0-9\s]+$/; // Only letters, numbers, and spaces are allowed
    let onlyLetters = input.trim() !== '' && regex.test(input);
    let nullValues = input != null || input !="";
    let lengthMax = input.length <=30;

    return onlyLetters && nullValues && lengthMax;
}


export function addRequest(event, dataType) {
    event.preventDefault(); 
    let newEntry = document.getElementById('newName').value;
    let formData = new FormData();
    if (!isValidInput(newEntry)){
        alert(`You have to enter (some) text`);
    } else {
        

        switch(dataType) {
            case 'project':
                let pDesc = document.getElementById('description').value;
                if (pDesc=='') {
                    pDesc = null;
                }
                formData = {
                    Name: newEntry,
                    Description: pDesc
                }

                sendAddRequest(formData,'/Project/addProject',"project");
                break;
            case 'task':
                let desc = document.getElementById('description').value;
                if (desc=='') {
                    desc = null;
                }
                let deadline = document.getElementById('deadline').value;
                if (deadline!=null) {
                    if (deadline=='') {
                    deadline=null;
                    }
                }
                let projectId = GetDetailId();
                formData ={
                    Name: newEntry,
                    ProjectId: projectId,
                    Description: desc,
                    Deadline: deadline
                };
                
                sendAddRequest(formData,'/Task/addTask',"task");
                break;
            case 'tag':
                formData = {
                    Name: newEntry
                }
                sendAddRequest(formData,'/Tag/addTag',"tag");
                break;
            default:
                console.error(`Unknown datatype: ${dataType}`);
        }
        clearAddingForm();
    }
}
