
import { statusTexts, InfoText } from '../Data/hardcoded.js';
import { fetchAllProjects, fetchAllTags, getSingleItem, getAllTimers,
        startProjectTimer, stopProjectTimer,
        addTagToItem, sendAddRequest, 
        sendEditRequest, removeTagFromProject, removeTagFromTask} from '../API_Access/apiCalls.js';
import {deleteProject, deleteTag, deleteTask, goToPage, addTaskListener, editListener } from '../EventListeners/eventListeners.js';

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
    let editdiv = document.createElement('div');
    editdiv.classList = 'edit';
    let editButton = addElement('button','',editdiv);
    editButton.classList="editButton";
    trg.insertAdjacentElement('afterbegin',editdiv)
    return editButton;
}
// ********************************************************************************/
// Fetch all projects from the database and display them in a list.
// Displays: Name, Status, TimeSpent 
//           Event Listeners: Go to detail page, Delete Project
//
// Uses helper functions to print items that we re-use (itemCard, deleteButton)
// ********************************************************************************/

export function createProjectList() {
    clearData();
    fetchAllProjects().then(data => {
    if (data!=null){
        document.getElementById("nowShowing").innerHTML = `${data.length} Projects`;
        let timerCount = 0;

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
        document.getElementById("nowShowing").innerHTML += ((timerCount>0)? ` ${timerCount} timer(s) running`: '');
    } else {
        document.getElementById("nowShowing").innerHTML += "-Not Authorized";
    }
    });
}

// ********************************************************************************/
// // Fetch all tags from the database and display them in a cloud.
// Displays: Name, Usage
//           Event Listeners: Go to detail page, Delete Project
//
// Uses helper functions to print items that we re-use (itemCard, deleteButton)
// ********************************************************************************/
export function createTagList() {
    clearData();
    fetchAllTags().then(data => {
        document.getElementById("nowShowing").innerHTML = `${data.length} Tags`;
        let contentDiv= document.getElementById('contents');
        contentDiv.classList.add('listAllTags');
        data.forEach(dataPoint => {
            let itemdiv = listHelperSetupCard(dataPoint.tagId);
            itemdiv.addEventListener('click', () => {
                goToPage('tag.html?id='+dataPoint.tagId)
            });

            let tagName=addElement('h3',dataPoint.name, itemdiv);
            tagName.classList.add('tagName');
            let projectCount = dataPoint.projectCount;
            let taskCount = dataPoint.taskCount;
            let usageText=addElement('p', `${projectCount} (${taskCount})` , itemdiv);
            usageText.classList.add('usage');
            let deleteButton = listHelperDeleteButton(itemdiv.parentNode);            
           deleteButton.addEventListener('click', () => {
               deleteTag(dataPoint.tagId, dataPoint.name)
               .then(()=>createTagList());
           });

        });
     });
}

// ********************************************************************************/
//   The main display of all details for a single tag, or Project.
//      Creates document structure and sets classes for styling.
//      Removes all previous content, and inserts the data in div#contents. 
// 
//  Tag:
//        Display: Name, Usage in projects and tasks.
//        Links to all projects that uses the tag.
//      * Event listeners: Edit -> opens form to edit tag-name.
//
// Project:
//     Display: Name, Status, Description, Timer, Recorded Time, +Tags, +Tasks
//          Tags: Name => link to tag.html
//          Tasks: Name, Status, Deadline, Description, Tags
//    * Event listeners: Edit Project
//                       Start/Stop timer
//                       Add Tag
//                       Add Task
//                            Set Deadline if not set
//                            Add Tag to Task
// 
// ********************************************************************************/
export function showThisItem(itemID, dataType){
    clearEdit();
    getSingleItem(itemID, dataType).then( data => {
        let target = document.getElementById('contents');
        
        // Set title and print edit button
        document.getElementById('nowShowing').innerHTML = data.name;
        let editButton = listHelperCreateEditButton();

        // build the project card
        let detailDiv = addElement('div','',target)
        let itemID;
        switch (dataType){
            case 'project': itemID = data.projectId;
                break;
            case 'tag': itemID = data.tagId;
                break;
            default:
                itemID = 0;
        }
        detailDiv.id='detail-'+itemID;
        
        if (dataType==='tag'){
            // Set listener for edit button
            editButton.addEventListener('click', ()=> editListener(data.tagId,'tag'));

            if (data.projects.length > 0) {
                addElement('p', `Used in <b>${data.projects.length}</b> projects:`, detailDiv);
                let list = addElement('ul','',detailDiv);
                data.projects.forEach(project => {
                    let listitem=addElement('li','', list);
                    let link = addElement('a',project.name, listitem);
                    link.href="project.html?id="+project.projectId;
                });
            } else {                 addElement('p','Not used in any project.',detailDiv);             }
            if (data.tasks.length > 0) {        
                addElement('p', `Also used in <b>${data.tasks.length}</b> tasks`, detailDiv);
            } else {                 addElement('p', `Not used in any task.`, detailDiv);             }
        } 
        if (dataType === 'project'){
            // Set listener for edit button
            editButton.addEventListener('click',()=> editListener(data.projectId,'project'));
            
            let header = addElement('div','',detailDiv);
            header.classList = 'header';
            let status = data.status;
            let statusElement = addElement('p',statusTexts[status], header);
            statusElement.classList=`status${status}`;                        
            let time = addElement('p',formatTimeSpan(data.totalWorkingTime), header);
        
            time.classList = 'totalTime';

            // Set an event listener to show 
            time.addEventListener('click', printTotalTimeBreakdown);

            //        Print timer only if we are not Status = Completed          //
            if (data.status != 3) {
                printTimerStartAndStop(data);
            }
            addElement('p',data.description,detailDiv);
            
            let tagBox = addElement('div','',detailDiv);
            tagBox.id='tagBox';
            tagBox.classList='tagsList';
            let ptform = printAllTagsAndForm(data.tags, tagBox, 'project');
            ptform.addEventListener('submit', (event) => addTagToProject(event));

            //              Header for Tasks                //
            header = addElement('div','',detailDiv);
            header.classList = 'header';
            addElement('h3', 'Tasks', header);
            let element = addElement('p','',header);
            element.id='addingBox';
            let addButton = addElement('button','+', element);
            addButton.id="addTaskButton";
            addButton.addEventListener('click', (event) => addTaskListener(event) );

            //            Display info for each task of the project          //
            const result = data.tasks.filter((task)=> !task.isDeleted); // Show only the non soft-deleted tasks
            result.forEach(task => {
                let taskDiv = addElement('div','',detailDiv);
                taskDiv.classList='detailTask shadowbox';
                header = addElement('div','',taskDiv);
                header.classList = 'header';
                if (task.isDeleted){
                    let status = task.status;
                    let statusValue=statusTexts[status];
                    let statusElement = addElement('p',statusValue, header);
                    statusElement.classList=`status${status}`;
                    let taskname=addElement('h4','(Deleted Task) '+task.name, header);
                    taskname.id=`task-${task.taskId}`;
                    let element = addElement('p',formatTimeSpan(task.timeSpent),taskDiv);
                    element.classList.add('totalTime')
                    addElement('p', task.description, taskDiv)

                } else {
                    // inserting edit button
                    let editButton = listHelperCreateEditButton(header);
                    editButton.addEventListener('click',()=> editListener(task.taskId,'task'));

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
                    let element = addElement('p',formatTimeSpan(task.timeSpent),taskDiv);
                    element.classList.add('totalTime')
                    addElement('p', task.description, taskDiv)
                    
                    let taskTagDiv = addElement('div','',taskDiv);
                    taskTagDiv.classList='tagsList';
                    let form = printAllTagsAndForm(task.tags, taskTagDiv, 'task');
                    let hiddenId = addElement('input','',form);
                    hiddenId.type="hidden";
                    hiddenId.name='taskId';
                    hiddenId.value = task.taskId;
                    form.elements["taskTagCloud"].id=`taskTagCloud${task.taskId}`;
                    //                 set event listener to Add new Tags to the Task             //
                    form.addEventListener('submit', (event) => { addTagToTask(event); });
                }
            }); //      END Each Task                                       //
        }       //      if type = project                                   //
    });         //     END FETCH SINGLE ITEM                                //
}

// ********************************************************************************/
// Adds Information from hardcoded to the page.
//
//          Toggle functionality
// ********************************************************************************/
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
// ********************************************************************************/
//   Helper function to put the timer Start button on the page. 
//       Sets event listener: Toggle timer to start or stop.
// ********************************************************************************/
export function printTimerStartAndStop({hasTimerRunning, projectId}) {
    let projectTimers = document.createElement('div','');  
    document.getElementById('nowShowing').insertAdjacentElement('afterend',projectTimers);
    projectTimers.id='projectTimers';
    let startButton = addElement('button','Start',projectTimers);
    startButton.id = 'timerStart';
    if (hasTimerRunning){
        startButton.classList = 'running';
    }
    
    startButton.addEventListener('click', (event) => {
        if (event.target.classList !='running')
        {
            startTimer(projectId);
        } else {
            stopTimer(projectId);
        }
    });
}
// ********************************************************************************/
//    startTimer - Sets a timer in the backend
// ********************************************************************************/
function startTimer(projectId){
    let date = Date.now();
    startProjectTimer(projectId, date).then(data => {
        if (data ==='') {
            let button = document.getElementById('timerStart');
            button.classList.add('running');
        } else {
            alert(data);
        }
    });
}
// ********************************************************************************/
//    stopTimer - Removes a timer in the backend which returns a TimeSpan.
//                Displays how much time was added on the page.
// Updated functionality : Prints out a form to choose which task to apply the time to

// ********************************************************************************/
function stopTimer(prId){
    let date = Date.now();
    document.getElementById('timerStart').classList = '';
    let trg = document.getElementById('projectTimers');
    let allTasks = document.querySelectorAll("[id^='task-']");
    let form = addElement('form','',trg);
    form.id='chooseTaskForm';
    addElement('p','If the timer applies to a particular task, pick the right one here',form);
    let radioLabel = addElement('label', 'Apply to project',form);
    radioLabel.setAttribute('for',0);
    let radioButton = addElement('input','',form);
    radioButton.type='radio';
    radioButton.id = 'task-0';
    radioButton.checked = true;
    radioButton.name='appliedToTask';
    radioButton.value=0;
    allTasks.forEach(taskDiv => {
        if (taskDiv.previousSibling.classList!="status3") {
            let radioLabel = addElement('label', taskDiv.innerHTML,form);
            radioLabel.setAttribute('for',taskDiv.id);
            let radioButton = addElement('input','',form);
            radioButton.type='radio';
            radioButton.id = taskDiv.id;
            radioButton.name='appliedToTask';
            radioButton.value=parseOutId(taskDiv.id);
        }
    });

    let submit = addElement('button','Apply',form);
    submit.type='submit';
    submit.addEventListener('click',(event) => {
        event.preventDefault();
        let taskValue =document.querySelector('input[type=radio]:checked').value;
        let taskId = parseInt(taskValue, 10);

        stopProjectTimer(prId, taskId, date).then(data => {
            let trg=document.querySelector("[id^='detail']").querySelector('.totalTime');
            
            trg.innerHTML += ' + '+formatTimeSpan(data);
            // document.getElementById('projectTimers').removeChild(form);
            form.remove();
        });
    }); 
}

// ********************************************************************************/
//    Helper function to print all Tags in a list
//           Add form to add new tag to the list.
//          Returns the form - for setting listeners.
//   tags = <List>Tag, 
//   target = HTML element, 
//   type = 'project'/'task'
// ********************************************************************************/
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
    } 
    if (type == 'project') {
        tagDiv.id='projectTagAdding';
        tagInput.id = 'projectTagCloud';
        tagInput.name = 'projectTagCloud';
    }
    return form;
}

// ********************************************************************************/
//   Create and populate an edit form given an object ID and type
// type = 'tag' / 'task' / 'project'
// ********************************************************************************/
export function createEditForm(dataID, type) {
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
    let inputText = addElement('input','',form);
    inputText.type = 'text';
    inputText.id = 'editName';
    inputText.name = 'editName';
    if (type=='task') {
        inputText.value = document.querySelector("#task-"+dataID).innerHTML
    } else {
        inputText.value = document.getElementById('nowShowing').innerHTML;  
    }
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
    
    //      Common edit fields for project and tags below      //
    if (type!='tag') {     
        label = addElement('label','About:', form);
        label.setAttribute('for','description');
        let textarea = addElement('textarea','',form);
        textarea.id='description';
        textarea.name='description';
        textarea.setAttribute('rows','3');

        createStatusRadioButtons(form);
        let element = addElement('p','Click to remove Tags',form);
        element.classList.add('span2');
        if (type=='project') {
            element.innerHTML = 'Click to remove Tasks or Tags';
            addElement('label','Tasks:',form);
            let delTaskDiv = addElement('div','',form);
            delTaskDiv.id='editProjectTasks';
        }
        label = addElement('label','Tags:',form);
        let delTagsDiv = addElement('div','All Tags Go Here',form);
        delTagsDiv.name='tagCloud';
        
        if (type=='task'){
            label = addElement('label','Deadline: ',form);
            label.setAttribute('for','deadline');
            let deadline = addElement('input','',form);
            deadline.name='deadline';
            deadline.id = 'deadline';
            deadline.type='datetime-local';
            
            delTagsDiv.id='editTaskTags'; 

            getSingleItem(dataID,'task').then(itemData => {      
                fillItemData(itemData,form);
                deadline.value=itemData.deadline;
            });
        }
        if (type=='project') {
            delTagsDiv.id='editProjectTags';

            getSingleItem(dataID,'project').then(itemData => {
                fillItemData(itemData, form);
            });
        }
    }
    form.appendChild(inputHidden);
    form.appendChild(button);

        // Place it in the right spot on the page
    let divTarget = document.createElement('div');
    divTarget.appendChild(form);
    editBox.appendChild(divTarget);

    if (type=='task') {
        document.querySelector("#task-"+dataID).parentNode.insertAdjacentElement('afterend',editBox);
    } else  {
        document.querySelector("[id^='detail-']").insertAdjacentElement('afterbegin',editBox);
    }
    return form;
}


// ********************************************************************************/
//   Gets the full item data to fill in the Edit form with ids, and set listeners
//        Given the ObjectData and the form.
// ********************************************************************************/
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

    // Fill in the tasks, if the container exists
    let trg = document.getElementById('editProjectTasks');
    if (trg) {
        trg.innerHTML = ""; // Clear previous content
        itemData.tasks.forEach(task => {
            let telement = addElement('p',task.name, trg);
            telement.id = `task-${task.taskId}`;
            telement.classList = 'deleteTask';
            telement.addEventListener('click', removeTask);
        });
    }
    // Fill in all project tags, if the container exists
    trg = document.getElementById('editProjectTags');
    if  (trg) {
        trg.innerHTML = "";
        itemData.tags.forEach(tag => {
            let telement = addElement('p',tag.name, trg);
            telement.id = `tag-${tag.tagId}`;
            telement.classList = 'deleteTag';
            telement.addEventListener('click', removeTag);
        });
    }
    // Fill in all Task tags, if the container exists
    trg = document.getElementById('editTaskTags');
    if  (trg) {
        trg.innerHTML = "";
        itemData.tags.forEach(tag => {
            let telement = addElement('p',tag.name, trg);
            telement.id = `tag-${tag.tagId}`;
            telement.classList = 'deleteTag';
            telement.addEventListener('click', removeTagFromThisTask);
        });
    }
}

// ********************************************************************************/
// Helper function to print out the button to add new Project or Tag
//          Does not print if it already is present on the page.
// ********************************************************************************/
export function printAddNewItemButton(){
    if (!document.getElementById('addItemButton')) {
        let target = document.getElementById("tagsbtn");
        let addingBox = document.createElement('button');
        addingBox.innerText='+';
        addingBox.id = "addItemButton"
        target.insertAdjacentElement("afterend", addingBox);
        addingBox.addEventListener('click', printAddingFormAndAddListeners);
    }
}

// ********************************************************************************/
// Helper function to set up the adding form for new items, and set
// event listeners to send add request to the backend.
// 
//       Print Project/Tag form based on Navigation Button Selected
//       Toggle functionality 
// ********************************************************************************/
function printAddingFormAndAddListeners () {
    // If I have a form already, clear it, don't print out a new one.
    if (clearAddingForm()){
        return;
    }
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
//       Sets the task and project ID from the event/page, and sends to the backend
//       If deletion was OK - remove the Task from the visible list
// ********************************************************************************/
function removeTask(event){
    let taskId = parseOutId(event.target.id);
    let result = deleteTask(taskId, event.target.innerText);
    if (result) {
        event.target.parentNode.removeChild(event.target);
    }
}

// ********************************************************************************/
//       Sets the tag and project ID from the event/page, and sends to the backend
//       If deletion was OK - remove the tag from the visible list
// ********************************************************************************/
function removeTag(event){
    let tagID=parseOutId(event.target.id);
    let projectID = GetDetailId();
    if (confirm(`Are you sure you want to remove ${event.target.innerHTML} from this project?`)) {
        if (removeTagFromProject(projectID, tagID)){
           event.target.parentNode.removeChild(event.target);
        }
    }
}

// ********************************************************************************/
//       Sets the tag and task ID from the event/form, and sends to the backend
//       If deletion was OK - remove the tag from the visible list
// ********************************************************************************/
function removeTagFromThisTask(event){
    let tagID = parseOutId(event.currentTarget.id);
    let taskID = document.querySelector('#editTaskForm').elements['editId'].value;
    if (confirm("Are you sure you want to remove this tag from the task?")) {
        if (removeTagFromTask(taskID, tagID)) {
            document.querySelector("#editTaskTags").removeChild(event.currentTarget);
            
        }
    }
}

// ********************************************************************************/
//    Prints out Labels+Radio buttons for Status setting in a form.
//         Sets text-content from hardcoded Status struct. Update to match backend.
// ********************************************************************************/
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

    radioLabel =  addElement('label', statusTexts[2],form);
    radioLabel.setAttribute('for','statusTwo');
    radioButton = addElement('input','',form);
    radioButton.type='radio';
    radioButton.id = 'statusTwo';
    radioButton.name='newStatus';
    radioButton.value=2;

    radioLabel =  addElement('label', statusTexts[3],form);
    radioLabel.setAttribute('for','statusThree');
    radioButton = addElement('input','',form);
    radioButton.type='radio';
    radioButton.id = 'statusThree';
    radioButton.name='newStatus';
    radioButton.value=3;
}

// ********************************************************************************/
//      printAddingForm ( datatype = 'addTask' /'addTag' / 'addProject' )
//            Header row followed by custom form
// ********************************************************************************/
export function printAddingForm(dataType){
    let addingBox = document.createElement("div");
    addingBox.id = "addNewItem";
    addingBox.classList.add('shadowbox');
    if (dataType != "addTask") {
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

            let extraInput = addElement('input','',form);
            extraInput.type='hidden';
            extraInput.id = 'projectId';
            extraInput.name = 'projectId';
            extraInput.value = GetDetailId();
            
            label = addElement('label','Optional Deadline: ', form);
            label.setAttribute('for','deadline');
            let deadline= addElement('input','',form);
            deadline.type = 'datetime-local';
            deadline.name="deadline";
            deadline.id="deadline";
            break;
        default:
    }
    form.appendChild(button);
    addingBox.appendChild(form);
    return form;
}

// ********************************************************************************/
//            addTagToTask
//  Helper function to get input from user to set new tags for a task
//  After receiving input from the backend, update taglist on the page
// ********************************************************************************/
function addTagToTask(event){
    event.preventDefault();
    let tagCloud = 'taskTagCloud'+event.target.elements["taskId"].value;
    let inputTags = document.getElementById(tagCloud).value;
    let dataid = parseInt(event.target.elements["taskId"].value,10);
    
    let fetchUrl = `/Task/addTagsToTask/${dataid}`;    

    if (inputTags !=''){
        addTagToItem(event,inputTags, fetchUrl)
        .then(tags=>{
            updateTagsOnPage(event, tags);
        });
    }
}
// ********************************************************************************/
//            addTagToProject
//  Helper function to get input from user to set new tags for a project
//  After receiving input from the backend, update taglist on the page
// ********************************************************************************/
function addTagToProject(event){
    event.preventDefault();
    let inputTags = document.getElementById('projectTagCloud').value;
    let dataid = GetDetailId();
    let fetchUrl=`/Project/addTagsToProject/${dataid}`;
    if (dataid !=null) {      
        if (inputTags !=''){
            addTagToItem(event, inputTags, fetchUrl)
            .then(tags=>{
                updateTagsOnPage(event, tags);
            });
        } 
    }
}

// ********************************************************************************/
//      updateTagsOnPage ( event , tags )
//   Updates the taglist with updated information sent from the backend on the page
// ********************************************************************************/
function updateTagsOnPage(event, tags){
    event.target.querySelector('input').value = '';
    let tagList = event.target.parentNode.previousElementSibling;
    tagList.innerHTML = '';
    tags.forEach(tag => {
        let li = document.createElement('li');
        li.textContent = tag.name; // Assuming the API returns an array of tag names
        tagList.appendChild(li);
    });
}

// ********************************************************************************/
//      printTaskDeadlinePicker ( event  )
// Helper function to print out the form to set a new deadline for a project.
//          Toggle functionality
// ********************************************************************************/
function printTaskDeadlinePicker(event){
    let calendarPicker = event.currentTarget;
    let headerDiv = calendarPicker.parentNode;
    let deadlineform = document.getElementById('setDeadlineForm');
    if (deadlineform) {
        headerDiv.removeChild(deadlineform)
    } else {
        let taskId= parseOutId(event.target.previousElementSibling.id);
        let form = addElement('form','',event.target.parentNode);
        form.id="setDeadlineForm";
        let newdeadline= addElement('input','',form);
        newdeadline.type = 'datetime-local';
        newdeadline.name="deadline";
        newdeadline.id="deadline";

        let inputHidden = addElement('input','',form);
        inputHidden.type = 'hidden';
        inputHidden.id = 'editId';
        inputHidden.name = 'editId';
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

// ********************************************************************************/
//              Helper function to show a list of all times
//              the project has been worked on
//      Toggle functionality
// ********************************************************************************/
import {calculateTotalTimePerDay} from '../Data/calendar-report.js'
function printTotalTimeBreakdown(event){
    let reportDiv = document.getElementById('timeReport');
    if (reportDiv) {
        reportDiv.parentNode.removeChild(reportDiv);
    } else {
        let projectId = GetDetailId();
        getAllTimers(projectId).then(data => {
            let trg = event.target.parentNode;
            let timeReportDiv = document.createElement('div');
            timeReportDiv.id='timeReport';
            timeReportDiv.classList.add('shadowbox');
            addElement('h4','Report of all the times worked on this project',timeReportDiv);
            trg.insertAdjacentElement('afterend',timeReportDiv);
            let allDetails = false;
            let btn=addElement('button','Toggle Dates vs All Reported',timeReportDiv);
            btn.addEventListener('click', () => {
                console.log(allDetails);
                if (allDetails) {
                    document.getElementById('dateDetails').classList='';
                    document.getElementById('totalDetails').classList='hide';
                } else {    
                    document.getElementById('dateDetails').classList='hide';
                    document.getElementById('totalDetails').classList='';
                }
                allDetails = !allDetails;
            })

            let tmp = calculateTotalTimePerDay(data);
            let dateDetails=addElement('div','',timeReportDiv);
            dateDetails.id="dateDetails";
            tmp.forEach(({date, totalTime}) => {
                addElement('p',`${date} : ${totalTime}`, dateDetails);
            });
            let totalDetails=addElement('div','',timeReportDiv);
            totalDetails.classList='hide';
            totalDetails.id="totalDetails";
            data.forEach(timer => {
                let rep=addElement('p',formatDateTime(timer.startDate)+' until '+formatDateTime(timer.endDate), totalDetails);
                if (timer.taskId!=null) {
                    let taskName=document.querySelector(`[id^='task-${timer.taskId}']`).innerHTML;
                    rep.innerHTML += ' ('+taskName+')';
                }
            });
        });
    }

}
// ********************************************************************************/
//          Edit functions - Project
//    Fills variables from page input, Updates info on page if successful
// ********************************************************************************/
export async function editProjectRequest(event) {
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
        let requestData = {
            ProjectId: id,
            Name: name,
            Status: status,
            Description: description
        };
        if (await sendEditRequest(requestData, `/Project/updateProject`)) {
            window.location.replace(window.location.href); // Reload page only if successful
        }
        clearEdit();
    }
};

// ********************************************************************************/
//          Edit functions - Tag
// ********************************************************************************/
export async function editTagRequest(event) {
    event.preventDefault(); // Prevent the default form submission
    const id = GetDetailId();
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

// ********************************************************************************/
//          Edit functions - Task
//   Sets deadline       Or      Edits full task details
// ********************************************************************************/
export function editTaskRequest(event){
    event.preventDefault();
    let id=event.currentTarget.elements["editId"].value;
    let form = event.currentTarget;
    let header = document.querySelector('#task-'+id).parentNode;
    let deadline = form.elements["deadline"].value;
    let formData;
    if (form.id=='setDeadlineForm'){
        if (deadline=='') {
            alert('You have to enter a date, or dismiss the picker');
            return;
        } else {
            // Have to send along status, because I allow it to be null in the backend
            let statusElement = header.querySelector("[class^='status']").classList;
            let status = extractStatus(statusElement.value);
            formData = {
                taskId: id,
                Deadline: deadline,
                Status: status
            }
        }
     } else {
        let status = document.querySelector('input[name="newStatus"]:checked');
        if (status!=null) {
            let statusValue =document.querySelector('input[type=radio]:checked').value;
            status = parseInt(statusValue, 10);
        }
        deadline = deadline == ''? null: deadline;
        formData = {
            taskId: id,
            Deadline: deadline,
            Description: form.elements['description'].value,
            Name: form.elements['editName'].value,
            Status: status
        }
    }
    sendEditRequest(formData, '/Task/updateTask').then(()=>{
        if (form.id=='setDeadlineForm') {
            header.removeChild(form);
            header.removeChild(header.lastElementChild);
            let deadline = addElement('p','', header);
            deadline.innerHTML = 'Deadline set'
            deadline.classList = 'deadline';
        } else {
            window.location.replace(window.location.href); // Reload page only if successful
        }
    });
}
// ********************************************************************************/
//              Helper functions - get status value from classList
// ********************************************************************************/
function extractStatus(statusValue) {
    const match = statusValue.replace(/^status/, ""); // Remove 'status'
    return /^\d+$/.test(match) ? match : null; // Return digit or null
}
// ********************************************************************************/
//              Helper functions - get ID set on the Detail div
// ********************************************************************************/
export function GetDetailId(){
    const detailDiv = document.querySelector("[id^='detail-']");
    if (detailDiv) {
        return parseOutId(detailDiv.id);
    }
}
// ********************************************************************************/
//              Helper functions - get ID given a string of "text-ID"
// ********************************************************************************/
function parseOutId(input){
    const idPart = input.split("-"); // Splits at "-"
    const IDnumber = parseInt(idPart[1], 10); // Extracts the second part as an integer
    return IDnumber;
}
// ********************************************************************************/
//              Helper functions - Create element and append it to target
// ********************************************************************************/
export function addElement(elementType, data, target){
    let newElement = document.createElement(elementType);
    newElement.innerHTML = data;
    target.appendChild(newElement);
    return newElement;
}
// ********************************************************************************/
//              Helper functions - formats TimeSpan to human readable form
//                 Extract dd:hh:mm:ss from "dd.hh:mm:ss.ffffff"
// ********************************************************************************/
function formatTimeSpan(timeSpanString) {
    if (!timeSpanString || timeSpanString === "00:00:00") {
        return 'No time recorded';
    }

    let days = 0, hours = 0, minutes = 0, seconds = 0;

    // Split on "." to separate days from hh:mm:ss
    let parts = timeSpanString.split(".");
    if (parts.length === 2) {
        let secondparts = parts[1].split(":");
        if (secondparts.length===1) {
            [hours, minutes, seconds] = parts[0].split(":").map(Number);
        } else {
            days = parseInt(parts[0], 10); // Days before the dot
            [hours, minutes, seconds] = parts[1].split(":").map(Number);
        }
    } else {
        [hours, minutes, seconds] = parts[0].split(":").map(Number);
    }

    // Round seconds to remove microseconds
    seconds = Math.floor(seconds);

    // Build the output dynamically
    let formattedParts = [];
    if (days > 0) formattedParts.push(`${days}d`);
    if (hours > 0) formattedParts.push(`${hours}h`);
    if (minutes > 0) formattedParts.push(`${minutes}m`);
    if (seconds > 0) formattedParts.push(`${seconds}s`);

    return formattedParts.length > 0 ? formattedParts.join(" ") : 'No time recorded';
}
// ********************************************************************************/
//              Helper functions - formats DateTime Deadline to human readable form
// ********************************************************************************/
function formatDateTime(dateString) {
    let date = new Date(dateString);
    let now = new Date();
    let year = date.getFullYear();
    let month = date.toLocaleString('en-US', { month: 'short' }); 
    let day = date.getDate();
    let hours = date.getHours().toString().padStart(2, '0'); // Ensure two-digits
    let minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two-digits
    // If the year is the current year, omit it
    let showYear = year !== now.getFullYear();
    // Format string based on condition
    return showYear
        ? `${month} ${day}, ${year} @ ${hours}:${minutes}`
        : `${month} ${day} @ ${hours}:${minutes}`;
}
// ********************************************************************************/
//              Helper functions - clears out main div#contents
// ********************************************************************************/
export function clearData(){
    document.getElementById("contents").innerHTML = "";
}
// ********************************************************************************/
//              Helper functions - clears out editforms
// ********************************************************************************/
export function clearEdit(){
    let oldEdit = document.getElementById("edits");
    if (oldEdit != null) {
        oldEdit.parentNode.removeChild(oldEdit);
    }
}
// ********************************************************************************/
//              Helper functions - clears out addingform
//          Toggle functionality
// ********************************************************************************/
export function clearAddingForm(){
    let oldAddingForm = document.getElementById("addNewItem");
    if (oldAddingForm != null) {
        oldAddingForm.parentNode.removeChild(oldAddingForm);
        return true;
    } 
    return false;
}
// ********************************************************************************/
//              Helper functions - Gets the ID set on the url
// ********************************************************************************/
export function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
// ********************************************************************************/
//              Helper functions - Checks the input is text and max 30 letters
// ********************************************************************************/
export function isValidInput(input) {
    // Example validation: the input should not be empty and must not contain special characters
    const regex = /^[a-zA-Z0-9\s]+$/; // Only letters, numbers, and spaces are allowed
    let onlyLetters = input.trim() !== '' && regex.test(input);
    let nullValues = input != null || input !="";
    let lengthMax = input.length <=30;

    return onlyLetters && nullValues && lengthMax;
}

// ********************************************************************************/
//              Helper functions 
// Populates variables from input form and sends to backend to add new Items
// ********************************************************************************/
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
