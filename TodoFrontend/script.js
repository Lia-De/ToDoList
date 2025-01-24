// Start by showing current projects and set up a listener to change the displayed data
import config from './config.js';

showProjects();
document.getElementById("navigate").addEventListener("click",navigationEventListener);

document.getElementById('disclaimer').addEventListener('click', unhideDisclaimer);
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
        document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Projects`;
        clearData();
        createDataTable(data, "projects");
        selectedTypeButtons("projects");
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("nowShowing").innerHTML =`Database is unreachable: Showing backup-data`;
        clearData();
        createDataTable(hardcodedData, "projects");
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
            createDataTable(data, "tags");
            selectedTypeButtons("tags");
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("nowShowing").innerHTML =`Database is unreachable: Showing backup-data`;
        clearData();
        createDataTable(hardcodedData, "projects");
    }
}
// helper functions to print out the adding form
function printAddingPlus(){
    let target = document.getElementById("contents");
    let addingBox = document.createElement("div");
    addingBox.id = "addNewItem";
    target.appendChild(addingBox);
    addElement('button', '+', addingBox);
    addingBox.addEventListener('click', (event) => printAddingFormAndAddListeners(event));

}
function printAddingFormAndAddListeners (event) {
    document.getElementById('addNewItem').remove();
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
function showThisItem(itemID, dataType, event){
    if ( event.target.classList.contains("selected")) {
        // we are already displaying an item card, so clear it and show the adding option
        clearItemCard();
        printAddingPlus();
        return
    }
    getSingleItem(itemID, dataType).then( data => {
        let target = document.getElementById('container');
            
        clearItemCard();
        
        event.target.classList.add("selected");
        // build the project card
        let divTarget = document.createElement('div');
        divTarget.id='edits';
        target.appendChild(divTarget);
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
        addElement('h3', `#${itemID} ${data.name}`, divTarget);


        // display count of useages for tags, or status and all tags for the others
        if (dataType==='tag'){
            addElement('h4', `Used in ${data.tasks.length} tasks`, divTarget);
            addElement('h4', `Used in ${data.projects.length} projects`, divTarget);
        } else {
            let status = data.status;
            let statusValue='';
            switch (status){
                case 0:
                    statusValue='Status: Planning';
                    break;
                case 1:
                    statusValue='Status: Active';
                    break;
                case 2:
                    statusValue='Status: Inactive';
                    break;
                case 3: 
                    statusValue = 'Status: Completed';
                    break;
                default:
                    statusValue = 'Unknown status';
            }
            let projectStatus = addElement('p',statusValue,divTarget)
            //display all tasks - only for projects
            if (dataType === 'project'){
                let taskBox = addElement('div','',divTarget);
                taskBox.id = 'taskBox';
                addElement('h4', 'Tasks', taskBox);
                let tasklist = addElement('ul','',taskBox);
                data.tasks.forEach(task => {
                    addElement('li', task.name, tasklist);
                });
            }
            let tagBox = addElement('div','',divTarget);
            tagBox.id='tagBox';
            addElement('h4', `Tags`, tagBox);
            let taglist = addElement('ul','',tagBox);
            data.tags.forEach(tag => {
                addElement('li', tag.name, taglist);
            });
        }
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
    clearEdit();
}
// Helper function to clear the edit form
function clearEdit(){
        // reset the selected cell in the data table

    let oldEdit = document.getElementById("edits");
    if (oldEdit != null) 
        document.getElementById("container").removeChild(oldEdit);
    let selectedDataCell = document.querySelectorAll("td.selected");
    if (selectedDataCell.length != 0) {
     selectedDataCell[0].classList.remove("selected");
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
    clearAddingForm();
    
    // reset the selected cell in the data table
    let table=document.getElementById('dataTable');
    let cells = table.querySelectorAll('td');
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

function editTag(tagID, tagName){
    let form = createEditForm(tagID, tagName);
    form.id = "editTagForm";
    form.addEventListener('submit', editTagRequest);
}
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
                Name: data
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
                Name: data
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
            console.error('Error:', error);
            alert('An unexpected error occurred.');
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
        clearAddingForm();
        const formData = new FormData();
        formData.append('name', newEntry );
        switch(dataType) {
            case 'project':
                sendAddRequest(formData`${config.apiBaseUrl}/Project/addProject`,"project");
                break;
            case 'task':
                let projectId=event.target.projectId.value;
                formData.append('projectId', projectId);
                sendAddRequest(formData,`${config.apiBaseUrl}/Task/addTask`,"task");
                break;
            case 'tag':
                sendAddRequest(formData,`${config.apiBaseUrl}/Tag/addTag`,"tag");
                break;
            default:
                console.error(`Unknown datatype: ${dataType}`);
        }
    }
}

async function sendAddRequest(formData, fetchURL, dataType){
    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            body: formData, 
        });
    
            if (response.ok) {
                if (dataType==="project")
                    showProjects();
                if (dataType==="task")
                    showTasks();
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

function editProjectRequest(event) {

    event.preventDefault(); // Prevent the default form submission

    // Get input values
    let id = parseInt(document.getElementById('id').value, 10);
    let name = document.getElementById('name').value;
    let inputTags = document.getElementById('tagCloud').value;
    let statusValue =document.querySelector('input[type=radio]:checked').value;
    let status = parseInt(statusValue, 10);
    if (!isValidInput(name)){
        alert(`You have to enter (some) text`);
    } else {
        clearEdit();
            // Data to send in the request
    let requestData = {
        ProjectId: id,
        Name: name,
        Status: status
    };
    sendEditRequest(requestData, `${config.apiBaseUrl}/Project/updateProject`, "project");
    
    // also send add tags    
    let tagArray = inputTags
                    .split(',')
                    .map(item => item.trim())
                    .filter(item => item !== '');
    addTagsToItem(id, tagArray, 'project');

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
        clearEdit();
    // Data to send in the request
    const requestData = {
        TagId: id,
        Name: name
    };
    sendEditRequest(requestData, `${config.apiBaseUrl}/Tag/updateTag`, "tag");
}
};

function editTaskRequest(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get input values
    const id = parseInt(document.getElementById('id').value);
    const name = document.getElementById('name').value;
    let deadline = document.getElementById('deadline').value;
    if (deadline===''){deadline=null;}
    let inputTags = document.getElementById('tagCloud').value;
    let statusChecked = document.querySelector('input[type=radio]:checked');
    let status=null;
    if (statusChecked!=null) {
        let statusValue =statusChecked.value;
        let status = parseInt(statusValue, 10);
    }

    if (!isValidInput(name)){
        alert(`You have to enter (some) text`);
    } else {
        clearEdit();

    // Data to send in the request
    const requestData = {
        TaskId: id,
        Name: name,
        Status: status,
        Deadline: deadline
    };
    
    sendEditRequest(requestData, `${config.apiBaseUrl}/Task/updateTask`, "task");
    let tagArray = inputTags
    .split(',')
    .map(item => item.trim())
    .filter(item => item !== '');
    addTagsToItem(id, tagArray, 'task');
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
            alert(`Failed to update ${dataType}: ${error.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred.');
    }
}
function printAddingForm(dataType){
    let target = document.getElementById("contents");
    let addingBox = document.createElement("div");
    addingBox.id = "addNewItem";
    target.appendChild(addingBox);
    let form = document.createElement("form");
    form.id = dataType;
   // Create the text input for the name
   
   let inputText = document.createElement('input');
   inputText.type = 'text';
   inputText.id = 'newName';
   inputText.name = 'newName';
    // Create the submit button
    let button = document.createElement('button');
    button.type = 'submit';
    // Create special inputs for each case
    let extraInput;
    switch(dataType) {
        case "addProject":
            button.textContent = 'Add';
            break;
        case "addTask":
            extraInput = document.createElement('select');
            extraInput.id = 'projectId';
            extraInput.name = 'projectId';

            fetchProjectIds(extraInput);
            
            button.textContent = 'Add';
            break;
        case "addTag":
            button.textContent = 'Add';
            break;
        default:
            button.textContent = 'Add';
    }
    
    // Append all elements to the form
    addElement('label', 'Name:', form);
    form.appendChild(inputText);
    if (extraInput!=null) {
        addElement('label', 'Associated project:', form);
        form.appendChild(extraInput);
    }
    form.appendChild(button);

    addingBox.appendChild(form);
    return form;
}


// helper to fetch project IDs
async function fetchProjectIds(target){
    try {
        const response = await fetch(`${config.apiBaseUrl}/Project/getProjectIds`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // populate select items in the target element
        data.forEach(dataPoint => {
            let option = addElement('option', `Project ${dataPoint}`, target);
            option.value = dataPoint;
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// function to create and populate an edit form
function createEditForm(dataID, editableText) {
    let containerTarget = document.getElementById("container")  
        // Check if we have an edit box already
        clearEdit();

        // Create the container div
    let editBox = document.createElement('div');

    editBox.id = 'edits'; 
        // Create the form
    addElement('h3', 'Editing: '+editableText, editBox);
    let form = document.createElement('form');

        // Create the label for the name input
    let label = addElement('label', 'Name: ', form)
    label.setAttribute('for', 'name');
    
    // Create the text input for the name
    let inputText = document.createElement('input');
    inputText.type = 'text';
    inputText.id = 'name';
    inputText.name = 'name';
    inputText.value = editableText; // Fill the input 
    form.appendChild(inputText);
       
    // Create the hidden input for the ID
    let inputHidden = document.createElement('input');
    inputHidden.type = 'hidden';
    inputHidden.id = 'id';
    inputHidden.name = 'id';
    inputHidden.value = dataID; // Set the hidden input value to data.id

    // Create the submit button
    let button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Save';

    // Print out all the other stuff for Project/Task switching on the active table.
    
    switch (document.getElementById('navigate').querySelector('.selected').id) {
        case "projectsbtn":

            createStatusRadioButtons(form);

            let taskLabel = addElement('label','',form);
            taskLabel.setAttribute('for','taskCloud');
            taskLabel.textContent = 'Tasks: ';

            let taskInput = addElement('input','',form);
            taskInput.type = 'text';
            taskInput.id = 'taskCloud';
            taskInput.name = 'taskCloud';
            let tagLabel = addElement('label','',form);
            tagLabel.setAttribute('for','tagCloud');
            tagLabel.textContent = 'Tags: ';
            let tagInput = addElement('input','',form);
            tagInput.type = 'text';
            tagInput.id = 'tagCloud';
            tagInput.name = 'tagCloud';
            
            // fill the form with relevant data

            getSingleItem(dataID,'project').then(itemData => {
                        
                  fillItemData(itemData);
            });
            break;
        case "tasksbtn":
                // Append all elements to the form
            createStatusRadioButtons(form);

            let taskTagLabel = addElement('label','',form);
            taskTagLabel.setAttribute('for','tagCloud');
            taskTagLabel.textContent = 'Tags: ';
            let taskTagInput = addElement('input','',form);
            taskTagInput.type = 'text';
            taskTagInput.id = 'tagCloud';
            taskTagInput.name = 'tagCloud';

            let deadlineLabel = addElement('label','',form);
            deadlineLabel.setAttribute('for','deadline');
            deadlineLabel.textContent = 'Deadline: ';
            // <input type="datetime-local" name="date" id="date">
            let deadline = addElement('input','',form);
            deadline.name='deadline';
            deadline.id = 'deadline';
            deadline.type='datetime-local';

            getSingleItem(dataID,'task').then(itemData => {
                        
                fillItemData(itemData);
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
    // editBox.appendChild(form);
    editBox.appendChild(divTarget);
    containerTarget.appendChild(editBox);
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

function fillItemData(itemData) {
    let taskCloud = document.getElementById('taskCloud');
    if (taskCloud!= null) {
        let tasks = itemData.tasks.map(task => task.name).join(', ');
        taskCloud.value=tasks;
    }

    let tags = itemData.tags.map(tag => tag.name).join(', ');
    document.getElementById('tagCloud').value = tags;

    switch (itemData.status) {
        case 0:
            document.getElementById('statusZero').checked = true;
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
// Function to create and populate the table
function createDataTable(data, dataType) {
    // Get the table element or create it if it doesn't exist
    let table = document.getElementById('dataTable');

    if (!table) {
        table = document.createElement('table');
        table.id = 'dataTable';
        document.getElementById('contents').appendChild(table);
            // Create the colgroup element
    const colgroup = document.createElement('colgroup');
    
    const col1 = document.createElement('col');
    col1.span = 1;
    colgroup.appendChild(col1);

    const col2 = document.createElement('col');
    col2.id = 'editAndDelete';
    col2.span = 2;
    colgroup.appendChild(col2);

    table.appendChild(colgroup);

    // Create the header row
    const headerRow = document.createElement('tr');

    const headers = ['Data', 'Edit', 'Delete'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);
    }

    // Add rows for each project in the data array
    data.forEach(dataPoint => {
        const row = document.createElement('tr');

        // Project name column
        const dataCell = document.createElement('td');
        dataCell.textContent = dataPoint.name;
        dataCell.className="data";
        row.appendChild(dataCell);

        // Edit button column
        const editCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Save';
        editButton.className="editButton";
      
        editCell.appendChild(editButton);
        row.appendChild(editCell);

        // Delete button column
        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Del';
        deleteButton.className="deleteButton";
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);
        
        // Set type specific listeners and data attributes
        switch (dataType) {
            case'projects':
                editButton.addEventListener('click', () => {
                    editProject(dataPoint.projectId, dataPoint.name);
                });
                deleteButton.addEventListener('click', () => {
                    deleteProject(dataPoint.projectId, dataPoint.name);
                });
                dataCell.addEventListener('click', (event) => {
                    showThisItem(dataPoint.projectId, 'project', event);
                });
                break;
            case'tasks':
                editButton.addEventListener('click', () => {
                    editTask(dataPoint.taskId, dataPoint.name);
                });
                deleteButton.addEventListener('click', () => {
                    deleteTask(dataPoint.taskId, dataPoint.name);
                });
                dataCell.addEventListener('click', (event) => {
                    showThisItem(dataPoint.taskId, 'task', event); 
                });
                break;
            case'tags':
                editButton.addEventListener('click', () => {
                    editTag(dataPoint.tagId, dataPoint.name);
                });
                deleteButton.addEventListener('click', () => {
                    deleteTag(dataPoint.tagId, dataPoint.name);
                });
                dataCell.addEventListener('click', (event) => {
                    showThisItem(dataPoint.tagId, 'tag', event);
                });
                break;
            default:
                console.error(`Unknown datatype: ${dataType}`);
            }


        table.appendChild(row);
    });
    // Also add the plus sign to add new items
    printAddingPlus();
}


async function addTagsToItem(dataid, tagArray, dataType){
    let fetchUrl='';
    switch (dataType){
    case 'project':
        fetchUrl = `${config.apiBaseUrl}/Project/addTagsToProject/${dataid}`;
        break;
    case 'task':
        fetchUrl = `${config.apiBaseUrl}/Task/addTagsToTask/${dataid}`;    
        break;
    }
    
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
    } 

}
