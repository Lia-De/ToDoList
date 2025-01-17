// Start by showing current projects and set up a listener to change the displayed data
showProjects();
document.getElementById("navigate").addEventListener("click",navigationEventListener);



function printAddingForm(dataType){
    let target = document.getElementById("contents");
    let addingBox = document.createElement("div");
    addingBox.id = "addNewItem";
    target.appendChild(addingBox);
    let addingForm = createAddingForm(addingBox, dataType);
    return addingForm;
}
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
        addingForm.addEventListener('submit', addProjectRequest);

    } catch (error) {
        console.error('Error:', error);
        document.getElementById("nowShowing").innerHTML =`! Database is unreachable !`;
    }
}

function showTasks(){
    fetch('https://localhost:7217/Task')
        .then(response => response.json())
        .then(function (data){
            document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Tasks`;
            let target = document.getElementById("contents");
            clearData();
            createDataTable(data, "tasks");
            let addingForm = printAddingForm("addTask");
            addingForm.addEventListener('submit', addTaskRequest);
        });
        
}
function showTags(){
    fetch('https://localhost:7217/Tag')
        .then(response => response.json())
        .then(function (data){
            document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Tags`;
            let target = document.getElementById("contents");    
            clearData();
            createDataTable(data, "tags");
            let addingForm = printAddingForm("addTag");
            addingForm.addEventListener('submit', addTagRequest);
        });
}
function addElement(elementType, data, target){
    let newElement = document.createElement(elementType);
    newElement.innerHTML = data;
    target.appendChild(newElement);
    return newElement;
}

function addAllElements(elementType, data, target) {
    let targetDiv = document.createElement("div");
    data.forEach(dataValue => {
        addElement(elementType, dataValue, targetDiv);
    })
    target.appendChild(targetDiv);
    return targetDiv;
}

function clearData(){
    document.getElementById("contents").innerHTML = "";
}
function clearEdit(){
    let oldEdit = document.getElementById("edits");
    if (oldEdit != null) 
        document.getElementById("container").removeChild(oldEdit);
}
function clearAddingForm(){
    let oldAddingForm = document.getElementById("addNewItem");
    if (oldAddingForm != null)
        oldAddingForm.parentNode.removeChild(oldAddingForm);
}
function navigationEventListener(e){
    // remove the edit field
    if (document.getElementById("edits") != null) { 
        clearEdit();
    }
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
function editTask(tagID, tagName){
    let form = createEditForm(tagID, tagName);
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
                Id: id,
                Name: data
            };
            reload = showProjects;
            break;
        case "tag":
            // set vars
            fetchUrl = 'https://localhost:7217/Tag/deleteTag';
            deleteData = {
                Id: id,
                Name: data
            };
            reload = showTags;
            break;
        case "task":
            // set vars
            fetchUrl = 'https://localhost:7217/Task/deleteTask';
            deleteData = {
                Id: id,
                Description: data
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
function addProjectRequest(event) {
    event.preventDefault(); 
    let newEntry = document.getElementById('newName').value;
    
    if (!isValidInput(newEntry)){
        alert(`You have to enter (some) text`);
    } else {
        clearAddingForm();
        const formData = new FormData();
        formData.append('name', newEntry );
        sendAddRequest(formData,'https://localhost:7217/Project/addProject',"project");
    }
}
function addTaskRequest(event){
    // console.log("ADD A TASK ");
    event.preventDefault(); 
    let newEntry = document.getElementById('newName').value;
    
    if (!isValidInput(newEntry)){
        alert(`You have to enter (some) text`);
    } else {
        clearAddingForm();
        const formData = new FormData();
        formData.append('description', newEntry );
        sendAddRequest(formData,'https://localhost:7217/Task/addTask',"task");
    }
}
function addTagRequest(event){
    event.preventDefault(); 
    let newEntry = document.getElementById('newName').value;
    
    if (!isValidInput(newEntry)){
        alert(`You have to enter (some) text`);
    } else {
        clearAddingForm();
        const formData = new FormData();
        formData.append('name', newEntry );
        sendAddRequest(formData,'https://localhost:7217/Tag/addTag',"tag");
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
    let name = document.getElementById('name').value;
    
    if (!isValidInput(name)){
        alert(`You have to enter (some) text`);
    } else {
        clearEdit();
            // Data to send in the request
    let requestData = {
        Id: id,
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
        Id: id,
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
        Id: id,
        Description: name
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
    button.textContent = 'Add';
    
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
    let form = document.createElement('form');

        // Create the label for the name input
    let label = document.createElement('label');
    label.setAttribute('for', 'name');
    label.textContent = 'Name: ';

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
    button.textContent = 'Edit';

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
        const projectCell = document.createElement('td');
        projectCell.textContent =(dataType==='tasks') ? dataPoint.description: dataPoint.name;
        projectCell.className="data";
        row.appendChild(projectCell);

        // Edit button column
        const editCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className="editButton";
        editButton.addEventListener('click', () => {
            switch (dataType) {
                case 'projects':
                    editProject(dataPoint.id, dataPoint.name);
                    break;
                case 'tasks':
                    editTask(dataPoint.id, dataPoint.description);
                    break;
                case 'tags':
                    editTag(dataPoint.id, dataPoint.name);
                    break;
                default:
                    console.error(`Unknown datatype: ${dataType}`);
            }
        });
        editCell.appendChild(editButton);
        row.appendChild(editCell);

        // Delete button column
        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className="deleteButton";
        deleteButton.addEventListener('click', () => {
            console.log(`Deleting project: ${dataPoint.name} (ID: ${dataPoint.id})`);
            switch (dataType) {
                case 'projects':
                    deleteProject(dataPoint.id, dataPoint.name);
                    break;
                case 'tasks':
                    deleteTask(dataPoint.id, dataPoint.description);
                    break;
                case 'tags':
                    deleteTag(dataPoint.id, dataPoint.name);
                    break;
                default:
                    console.error(`Unknown datatype: ${dataType}`);
            }
            
        });
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        table.appendChild(row);
    });
}


