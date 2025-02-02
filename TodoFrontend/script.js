// Start by showing current projects and set up a listener to change the displayed data
import config from './config.js';
const statusTexts = ["Planning", "Active", "Inactive", "Complete"];

showProjects();
document.getElementById("navigate").addEventListener("click",navigationEventListener);
document.getElementById('disclaimer').addEventListener('click', unhideDisclaimer);

printAddingPlus();


async function startTimer(piD){
    try {
        const response = await fetch(`${config.apiBaseUrl}/Project/startTimer/${piD}`, {
            method: 'POST',
            body: piD, 
        });
        if (!response.ok) {
            response.text()
            .then(data => {
                alert(data); 
            });
        } 
        document.getElementById('timerStart').classList = 'running';
        document.getElementById('timerStop').classList = 'valid';
        showProjects();

    } catch (error) {
            console.error('Error:', error);
            document.getElementById("nowShowing").innerHTML =`Database is unreachable: Showing backup-data`;
            clearData();
            // createDataTable(hardcodedData, "projects");
    }

}

async function stopTimer(prId){
    try {
        const response = await fetch(`${config.apiBaseUrl}/Project/stopTimer/${prId}`, {
            method: 'POST',
            body: prId, 
        });
        if (!response.ok) {
            response.text()
            .then(data => {
                alert(data); 
            });
        } 
        response.text().then(data => {
            let reportedTime = document.createElement('p');
            reportedTime.innerHTML = ` ${formatTimeSpan(data)} will be added to the running time of this Project`;
            
            reportedTime.classList = "timerReport";
            let target=document.getElementById('detail').querySelectorAll('.totalTime')[0];
            target.insertAdjacentElement("afterend", reportedTime);
                       

        });
        document.getElementById('timerStart').classList = '';
        document.getElementById('timerStop').classList = '';
        document.getElementById(prId).querySelector('.runningTimer').classList.remove('runningTimer');
        
        

        

    } catch (error) {
            console.error('Error:', error);
            document.getElementById("nowShowing").innerHTML =`Database is unreachable: Showing backup-data`;
            clearData();
            createDataTable(hardcodedData, "projects");
    }

}

function unhideDisclaimer(){
    let disclaimers = document.getElementById('disclaimers');
    
    if (document.getElementById('disclaimer').innerHTML ==="Show info") {
        disclaimers.classList='visible';
    document.getElementById('disclaimer').innerHTML = "Hide";
} else {
    document.getElementById('disclaimer').innerHTML = "Show info";
    disclaimers.classList='';}
}

async function showProjects() {
    try {
        const response = await fetch(`${config.apiBaseUrl}/Project`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        document.getElementById("nowShowing").innerHTML = `${data.length} Projects`;
        clearData();
        createDataCards(data, "projects");
        selectedTypeButtons("projects");
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("nowShowing").innerHTML =`Database is unreachable: Showing backup-data`;
        clearData();
        createDataCards(hardcodedData, "projects");
    }
}

async function showTasks(){
    try { 
        await fetch(`${config.apiBaseUrl}/Task`)
        .then(response => response.json())
        .then(function (data){
            document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Tasks`;
            let target = document.getElementById("contents");
            clearData();
            createDataTable(data, "tasks");
            selectedTypeButtons("tasks");
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("nowShowing").innerHTML =`Database is unreachable: Showing backup-data`;
        clearData();
    }
}
async function showTags(){
    try {await fetch(`${config.apiBaseUrl}/Tag`)
        .then(response => response.json())
        .then(function (data){
            document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Tags`;
            let target = document.getElementById("contents");    
            clearData();
            createDataCards(data,'tags');
            selectedTypeButtons("tags");
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("nowShowing").innerHTML =`Database is unreachable`;
        clearData();
    }
}
// helper functions to print out the adding form
function printAddingPlus(){
    let target = document.getElementById("tagsbtn");
    let addingBox = document.createElement('button');
    addingBox.innerText='+ New item';
    addingBox.id = "addItemButton"
    target.insertAdjacentElement("afterend", addingBox);
    addingBox.addEventListener('click', (event) => printAddingFormAndAddListeners(event));

}
function printAddingFormAndAddListeners (event, dataType) {
    
    switch (document.getElementById('navigate').querySelector('.selected').id) {
        case "projectsbtn":
            let addingPForm = printAddingForm("addProject");
            addingPForm.addEventListener('submit', (event) => addRequest(event, 'project'));
            break;
        case "tasksbtn":
            let addingTaskForm = printAddingForm("addTask");
            addingTaskForm.addEventListener('submit', (event) => addRequest(event, 'task'));
            break;
        case "tagsbtn":
            let addingTagForm = printAddingForm("addTag");
            addingTagForm.addEventListener('submit', (event) => addRequest(event, 'tag'));
            break;
        default:
            console.error(`Unknown datatype: ${dataType}`);
    }
}
// Show all details on a single item
function showThisItem(itemID, dataType, target){
    if ( target.classList.contains("selected")) {
        // we are already displaying an item card, so clear it and show the adding option
        clearItemCard();
        return
    }
    getSingleItem(itemID, dataType).then( data => {
        // let target = event.target.closest('.itemCard');   
        clearItemCard();
        
        target.classList.add("selected");
        // build the project card
        let detailDiv = document.createElement('div');
        detailDiv.id='detail';
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
        
        // display count of useages for tags, or status and all tags for the others
        if (dataType==='tag'){
            addElement('h3', `#${itemID} ${data.name}`, detailDiv);
            
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
            // ADD LISTENER TO CREATE TASK FORM for ths
            addButton.id="addTaskButton";
            addButton.addEventListener('click', (event) => {
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
                
            });

            // Each task:
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
function printTimerStartAndStop(target, data) {
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

// Helper function to switch which button is selected in the nav bar
function selectedTypeButtons(selectedType){
    let selectedButton = document.querySelectorAll("button.selected");
    selectedButton[0].classList.remove('selected');

    document.getElementById(selectedType+"btn").classList.add("selected");
}

// Helper function to create single elements, adding them to a target and returning the new element
function addElement(elementType, data, target){
    let newElement = document.createElement(elementType);
    newElement.innerHTML = data;
    target.appendChild(newElement);
    return newElement;
}

// Helper function to clear the data from the contents div ready to be filled anew
function clearData(){
    
    document.getElementById("contents").innerHTML = "";
    clearItemCard();
    clearAddingForm();
}
// Helper function to clear the edit and detail form
function clearEdit(){
    
    let oldDetail = document.getElementById("detail");

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
function clearAddingForm(){
    
    let oldAddingForm = document.getElementById("addNewItem");
    if (oldAddingForm != null)
        oldAddingForm.parentNode.removeChild(oldAddingForm);
}

function clearItemCard() {
    
    //clear the decks for new card
    clearEdit();

    
    // reset the selected cell in the data table
    let table=document.getElementById('contents');
    let cells = table.querySelectorAll('itemCard');
    cells.forEach(cell => { 
        cell.classList.remove("selected");
    });

}

// Event listener to switch between the different data types
function navigationEventListener(e){
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
// 3 functions to add and populate edit forms and set event listeners
function editProject (projectID, clickedProject){

    let form = createEditForm(projectID, clickedProject);
    form.id ="editProjectForm";
    form.addEventListener('submit', editProjectRequest);
};

// function editTag(tagID, tagName){
//     let form = createEditForm(tagID, tagName);
//     form.id = "editTagForm";
//     form.addEventListener('submit', editTagRequest);
// }
function editTask(taskID, taskName){
    let form = createEditForm(taskID, taskName);
    form.id = "editTaskForm";
    form.addEventListener('submit', editTaskRequest);
}

function deleteProject(id, name){
    const confirmDelete = confirm(`Are you sure you want to delete "${name}"?`);
            
    if (confirmDelete) {
        sendDeleteData(id, name, "project");
    }
}
function deleteTag(id, name){
    const confirmDelete = confirm(`Are you sure you want to delete "${name}"?`);
            
    if (confirmDelete) {
        sendDeleteData(id, name, "tag");
    }
}
function deleteTask(id, desc){
    const confirmDelete = confirm(`Are you sure you want to delete "${desc}"?`);
            
    if (confirmDelete) {
        sendDeleteData(id, desc, "task");
    }
}

// async function to request to delete data from the database
async function sendDeleteData(id, data, dataType) {
    let fetchUrl;
    let deleteData;
    let reload;
    switch (dataType) {
        case  "project":
            // set vars
            fetchUrl = `${config.apiBaseUrl}/Project/deleteProject`;
            deleteData = {
                projectId: id,
                name: data
            };
            reload = showProjects;
            break;
        case "tag":
            // set vars
            fetchUrl = `${config.apiBaseUrl}/Tag/deleteTag`;
            deleteData = {
                tagId: id,
                Name: data
            };
            reload = showTags;
            break;
        case "task":
            // set vars
            fetchUrl = `${config.apiBaseUrl}/Task/deleteTask`;
            deleteData = {
                taskId: id,
                name: data,
            };
            reload = showTasks;
            break;
        default:
            console.error(`Unknown datatype: ${dataType}`);
    }
    try {
        const response = await fetch(fetchUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deleteData),
        });
    
            if (response.ok) {
                reload();
    
            } else {
                const error = await response.json();
                alert(`Failed to update project: ${error.message}`);
            }
        } catch (error) {
            console.error(`Error:${error.message}`, error);
            alert(`An unexpected error occurred.`);
        }

}

function isValidInput(input) {
    // Example validation: the input should not be empty and must not contain special characters
    const regex = /^[a-zA-Z0-9\s]+$/; // Only letters, numbers, and spaces are allowed
    let onlyLetters = input.trim() !== '' && regex.test(input);
    let nullValues = input != null || input !="";
    let lengthMax = input.length <=30;

    return onlyLetters && nullValues && lengthMax;
}
function addRequest(event, dataType) {
    event.preventDefault(); 
    let newEntry = document.getElementById('newName').value;
    
    if (!isValidInput(newEntry)){
        alert(`You have to enter (some) text`);
    } else {
        
        let formData = new FormData();
        formData.append('name', newEntry );
        switch(dataType) {
            case 'project':
                let pDesc = document.getElementById('description').value;
                if (pDesc=='') {
                    pDesc = null;
                }
                formData.append('Description', pDesc);
                sendAddRequest(formData,`${config.apiBaseUrl}/Project/addProject`,"project");
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
                let projectId= document.getElementById('detail').previousElementSibling.firstElementChild.id;
                
                formData ={
                    Name: newEntry,
                    ProjectId: projectId,
                    Description: desc,
                    Deadline: deadline
                };

                sendAddRequest(formData,`${config.apiBaseUrl}/Task/addTask`,"task");
                break;
            case 'tag':
                sendAddRequest(formData,`${config.apiBaseUrl}/Tag/addTag`,"tag");
                break;
            default:
                console.error(`Unknown datatype: ${dataType}`);
        }
        clearAddingForm();
    }
}

async function sendAddRequest(formData, fetchURL, dataType){
    if (dataType==="task"){
        try {
            const response = await fetch(fetchURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
        if (response.ok) {
            showProjects();
        }   
        } catch (error) {
            console.error('Error:', error);
            alert('An unexpected error occurred.');
        }
    } else { 
    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            body: formData, 
        });
    
            if (response.ok) {
                if (dataType==="project")
                    showProjects();
                if (dataType ==="tag")
                    showTags();
    
            } else {
                const error = await response.json();
                alert(`Failed to add ${dataType}: ${error.message}`);
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('An unexpected error occurred.');
        }
    }
}

function editProjectRequest(event) {

    event.preventDefault(); // Prevent the default form submission
    // Get input values
    let id = parseInt(document.getElementById('editId').value, 10);
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
console.log(requestData);
    sendEditRequest(requestData, `${config.apiBaseUrl}/Project/updateProject`, "project");
    // also send add tags
    // addTagToProject();
    clearEdit();
}
};

function editTagRequest(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get input values
    const id = parseInt(document.getElementById('id').value);
    const name = document.getElementById('name').value;
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
    addTagToTask();
    clearEdit();
}
};

async function sendEditRequest(requestData, fetchURL, dataType){
    try {
        // Send the POST request to the updateProject endpoint
        const response = await fetch(fetchURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            switch (dataType) {
                case  "project":
                    showProjects();
                    break;
                case "task":
                    showTasks();
                    break;
                case "tag":
                    showTags();
                    break;
                default:
                    console.error(`Unknown datatype: ${dataType}`);
            }
        } else {
            const error = await response.json();
            alert(`Failed to update ${dataType}: ${error.message} `);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred.');
        console.log(error.message);
    }
}
function printAddingForm(dataType){
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
            extraInput.value = document.getElementById('contents').querySelector('.selected').id;
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
function createEditForm(dataID, editableText) {
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
            let ul = document.getElementById("tagBox").querySelector('.tagsList');
            let items = ul.querySelectorAll("li");
            console.log(items);
            // let list = createEditableTagList(item);
            
















            getSingleItem(dataID,'project').then(itemData => {
                        
                fillItemData(itemData, form);
                
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
    
    document.getElementById('detail').firstElementChild.insertAdjacentElement('afterend',editBox);
    
    return form;
}


async function getSingleItem(itemID, dataType) {
    let fetchURL;
    switch (dataType) {
        case 'project':
            fetchURL = `${config.apiBaseUrl}/Project/getSingleProject/${itemID}`;
            break;
        case 'task':
            fetchURL = `${config.apiBaseUrl}/Task/getSingleTask/${itemID}`;
            break;
        case 'tag':
            fetchURL = `${config.apiBaseUrl}/Tag/getSingleTag/${itemID}`;
            break;
        default:
            fetchURL='';
    }
    try {
        const response = await fetch(fetchURL);
        if (!response.ok) {
            console.error('Failed to fetch item:', response.statusText);
            return null;
        }
        const itemData = await response.json();
        return itemData;
    } catch (error) {
        console.error('Error fetching item:', error);
        return null;
    }
}

function fillItemData(itemData, form) {
    
    let taskCloud = document.getElementById('taskCloud');
    if (taskCloud!= null) {
        let tasks = itemData.tasks.map(task => task.name).join(', ');
        taskCloud.value=tasks;
    }

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
function createStatusRadioButtons(form){
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
function createDataCards(data, dataType){
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

function addTagToTask(event){
    event.preventDefault();
    let tagCloud = 'taskTagCloud'+event.target.elements["taskId"].value;
    let inputTags = document.getElementById(tagCloud).value;
    
    if (inputTags !=''){
        addTagToItem(event,'task');
    }
}
function addTagToProject(event){
    event.preventDefault();
    let inputTags = document.getElementById('projectTagCloud').value;
    if (inputTags !=''){
        addTagToItem(event, 'project');
    } 
    
}
async function addTagToItem(event, dataType){
    event.preventDefault();
    let inputTags;
    let dataid;
    let fetchUrl='';
    switch (dataType){
    case 'project':
        inputTags = document.getElementById('projectTagCloud').value;
        dataid= document.getElementById('contents').querySelector('.itemCard.selected').firstElementChild.id;
        if (dataid ==null) {
            // showProjects();
            break;
        }
        fetchUrl = `${config.apiBaseUrl}/Project/addTagsToProject/${dataid}`;
        break;
    case 'task':    
        let tagCloud = 'taskTagCloud'+event.target.elements["taskId"].value;
        inputTags = document.getElementById(tagCloud).value;
        dataid = parseInt(event.target.elements["taskId"].value,10);
        
        fetchUrl = `${config.apiBaseUrl}/Task/addTagsToTask/${dataid}`;    
        break;
    }
    
    let tagArray = inputTags
    .split(',')
    .map(item => item.trim())
    .filter(item => item !== '');
    
    const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagArray),
    });

    if (!response.ok) {
        console.log('Something went wrong with adding tags!')
        alert('Something went wrong when adding tags to a project');
    } else {
        // Update tag list showing
    
        response.json().then(tags => {
            // Clear the input
            event.target.querySelector('input').value = '';
            // Select the <ul> element
            let tagList = event.target.parentNode.previousElementSibling;
            // Clear existing <li> elements
            tagList.innerHTML = '';
    
            // Add new <li> elements from the returned tags
            tags.forEach(tag => {
                let li = document.createElement('li');
                li.textContent = tag.name; // Assuming the API returns an array of tag names
                tagList.appendChild(li);
            });
        });

    }

}


















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
