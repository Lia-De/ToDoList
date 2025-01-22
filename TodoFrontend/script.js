// Start by showing current projects and set up a listener to change the displayed data
showProjects();
document.getElementById("navigate").addEventListener("click",navigationEventListener);

async function showProjects() {
    try {
        const response = await fetch('https://localhost:7217/Project');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Projects`;
        clearData();
        createDataTable(data, "projects");
        let addingForm = printAddingForm("addProject");
        addingForm.addEventListener('submit', (event) => addRequest(event, 'project'));
        selectedTypeButtons("projects");
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("nowShowing").innerHTML =`Database is unreachable: Showing backup-data`;
        clearData();
        createDataTable(hardcodedData, "projects");
    }
}

async function showThisItem(fetchURL, dataType, event){
    try { 
        await fetch(fetchURL)
        .then(response => response.json())
        .then(function (data){

            let target = document.getElementById('container');
            
            clearItemCard();
            
            event.target.classList.add("selected");
            // build the project card
            let divTarget = document.createElement('div');
            divTarget.id='edits';
            target.appendChild(divTarget);
            // Create the header row
            addElement('h3', `${data.name}`, divTarget);

            //display all tasks - only for projects
            if (dataType === 'projects'){
                let taskBox = addElement('div','',divTarget);
                taskBox.id = 'taskBox';
                addElement('h4', 'Tasks', taskBox);
                let tasklist = addElement('ul','',taskBox);
                data.tasks.forEach(task => {
                    addElement('li', task.name, tasklist);
                });
            }
            // display count of useages for tags, or all tags for the others
            if (dataType==='tags'){
                addElement('p', `Used in ${data.tasks.length} tasks`, divTarget);
                addElement('p', `Used in ${data.projects.length} projects`, divTarget);
            } else {
                let tagBox = addElement('div','',divTarget);
                tagBox.id='tagBox';
                addElement('h4', `Tags`, divTarget);
                let taglist = addElement('ul','',divTarget);
                data.tags.forEach(tag => {
                    addElement('li', tag.name, taglist);
                });
            }
        });
    } catch (error) {
        console.error('Error loading one project:', error);
    }
}

async function showTasks(){
    try { 
        await fetch('https://localhost:7217/Task')
        .then(response => response.json())
        .then(function (data){
            document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Tasks`;
            let target = document.getElementById("contents");
            clearData();
            createDataTable(data, "tasks");
            let addingForm = printAddingForm("addTask");
            addingForm.addEventListener('submit', (event) => addRequest(event, 'task'));
            selectedTypeButtons("tasks");
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("nowShowing").innerHTML =`Database is unreachable: Showing backup-data`;
        clearData();
        // createDataTable(hardcodedData, "projects");
    }
}
async function showTags(){
    try {await fetch('https://localhost:7217/Tag')
        .then(response => response.json())
        .then(function (data){
            document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Tags`;
            let target = document.getElementById("contents");    
            clearData();
            createDataTable(data, "tags");
            let addingForm = printAddingForm("addTag");
            addingForm.addEventListener('submit', (event) => addRequest(event, 'tag'));
            selectedTypeButtons("tags");
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("nowShowing").innerHTML =`Database is unreachable: Showing backup-data`;
        clearData();
        createDataTable(hardcodedData, "projects");
    }
}
// Helper function to switch which button is selected in the nav bar
function selectedTypeButtons(selectedType){
    let buttons = document.querySelectorAll("#navigate button");
    buttons.forEach(button => {
        button.classList.remove("selected");
    });
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
    let rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        let cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            cell.classList.remove("selected");
        });
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
    const form = createEditForm(projectID, clickedProject);
    form.id ="editForm";
    form.addEventListener('submit', editProjectRequest);
};

function editTag(tagID, tagName){
    let form = createEditForm(tagID, tagName);
    form.id = "tagForm";
    form.addEventListener('submit', editTagRequest);
}
function editTask(taskID, taskName){
    let form = createEditForm(taskID, taskName);
    form.id = "taskForm";
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
            fetchUrl = 'https://localhost:7217/Project/deleteProject';
            deleteData = {
                projectId: id,
                Name: data
            };
            reload = showProjects;
            break;
        case "tag":
            // set vars
            fetchUrl = 'https://localhost:7217/Tag/deleteTag';
            deleteData = {
                tagId: id,
                Name: data
            };
            reload = showTags;
            break;
        case "task":
            // set vars
            fetchUrl = 'https://localhost:7217/Task/deleteTask';
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
                sendAddRequest(formData,'https://localhost:7217/Project/addProject',"project");
                break;
            case 'task':
                sendAddRequest(formData,'https://localhost:7217/Task/addTask',"task");
                break;
            case 'tag':
                sendAddRequest(formData,'https://localhost:7217/Tag/addTag',"tag");
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
                alert(`Failed to update ${dataType}: ${error.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An unexpected error occurred.');
        }
}

function editProjectRequest(event) {

    event.preventDefault(); // Prevent the default form submission

    // Get input values
    let id = parseInt(document.getElementById('id').value);
    console.log(`trying to send edit for project ${id}`);
    let name = document.getElementById('name').value;
    
    if (!isValidInput(name)){
        alert(`You have to enter (some) text`);
    } else {
        clearEdit();
            // Data to send in the request
    let requestData = {
        ProjectId: id,
        Name: name
    };
    sendEditRequest(requestData, 'https://localhost:7217/Project/updateProject', "project");
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
    sendEditRequest(requestData, 'https://localhost:7217/Tag/updateTag', "tag");
}
};

function editTaskRequest(event) {
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
        TaskId: id,
        Name: name
    };
    sendEditRequest(requestData, 'https://localhost:7217/Task/updateTask', "task");
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
            alert(`Failed to update${dataType}: ${error.message}`);
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
    let addingForm = createAddingForm(addingBox, dataType);
    return addingForm;
}
//function to create an add new data form
function createAddingForm(target, dataType){
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
    switch(dataType) {
        case "addProject":
            button.textContent = 'Add Project';
            break;
        case "addTask":
            button.textContent = 'Add Task';
            break;
        case "addTag":
            button.textContent = 'Add Tag';
            break;
        default:
            button.textContent = 'Add';
    }
    
    // Append all elements to the form
    form.appendChild(inputText);
    form.appendChild(button);

    target.appendChild(form);
    return form;
}

// function to create and populate an edit form
function createEditForm(projectID, editableText) {
    let containerTarget = document.getElementById("container")  
        // Check if we have an edit box already
        clearEdit();

        // Create the container div
    let editBox = document.createElement('div');

    editBox.id = 'edits'; 
        // Create the form
        addElement('h3', 'Edit: '+editableText, editBox);
    let form = document.createElement('form');

        // Create the label for the name input
    let label = document.createElement('label');
    label.setAttribute('for', 'name');
    // label.textContent = 'Name: ';

    // Create the text input for the name
    let inputText = document.createElement('input');
    inputText.type = 'text';
    inputText.id = 'name';
    inputText.name = 'name';
    inputText.value = editableText; // Fill the input 
    
    // Create the hidden input for the ID
    let inputHidden = document.createElement('input');
    inputHidden.type = 'hidden';
    inputHidden.id = 'id';
    inputHidden.name = 'id';
    inputHidden.value = projectID; // Set the hidden input value to data.id

    // Create the submit button
    let button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Save';

    // Append all elements to the form
    form.appendChild(label);
    form.appendChild(inputText);
    form.appendChild(inputHidden);
    form.appendChild(button);

    editBox.appendChild(form);
    containerTarget.appendChild(editBox);
    return form;
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
                    showThisItem('https://localhost:7217/Project/getSingleProject/'+dataPoint.projectId, dataType, event);
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
                    showThisItem('https://localhost:7217/Task/getSingleTask/'+dataPoint.taskId, dataType, event); 
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
                    showThisItem('https://localhost:7217/Tag/getSingleTag/'+dataPoint.tagId, dataType, event);
                });
                break;
            default:
                console.error(`Unknown datatype: ${dataType}`);
            }


        table.appendChild(row);
    });
}


async function testAddTags(dataid){
    let fetchUrl = 'https://localhost:7217/Project/addTagsToProject/'+dataid;
    requestData = ['wool','cotton'];
    const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    });

    if (response.ok) {

    }

}

// testAddTags(9);