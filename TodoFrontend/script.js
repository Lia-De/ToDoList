// Start by showing current projects and set up a listener to change the displayed data
showProjects();
document.getElementById("navigate").addEventListener("click",navigationEventListener);
document.getElementById("contents").addEventListener("click", contentListener);
printAddingForm();


function printAddingForm(){
    let target = document.getElementById("container");
    let addingBox = document.createElement("div");
    addingBox.id = "addNewItem";
    target.appendChild(addingBox);
    let form = createAddingForm(addingBox);
    return form;

}
async function showProjects() {
    try {
        const response = await fetch('https://localhost:7217/Project');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Projects`;
        // clearData();
        createProjectsTable(data);

        let target = document.getElementById("contents");
        let divTarget = addAllElements("p", data.map(project => project.name), target);
        divTarget.className = "names";
        let divTarget2 = addAllElements("p", data.map(project => project.id), target);
        divTarget2.className = "editProject";
        
        document.getElementById("addNewItem").className="addProject";
        document.getElementsByClassName('addProject')[0].addEventListener('submit', sendAddProjectRequest);

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
            let divTarget = addAllElements("p", data.map(task => task.description), target); 
            divTarget.className="names";
            let divTarget2 = addAllElements("p", data.map(task => task.id), target);
            divTarget2.className="editTask";
        });
        document.getElementById("addNewItem").className="addTask";
        
}
function showTags(){
    fetch('https://localhost:7217/Tag')
        .then(response => response.json())
        .then(function (data){
            document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Tags`;
            let target = document.getElementById("contents");    
            clearData();
            let divTarget = addAllElements("p", data.map(tag => tag.name), target);
            divTarget.className="names";
            let divTarget2 = addAllElements("p", data.map(tag => tag.id), target );
            divTarget2.className="editTag";
        });
        document.getElementById("addNewItem").className="addTag";
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

    
function contentListener(e) {
    let target = e.target;

    let children = Array.from(e.target.parentNode.children); // Get all children of the parent
    let index = children.indexOf(target);   // Find the index of the clicked child
    let itemNames = document.getElementsByClassName("names")[0];
    let clickedItem = itemNames.children[index].innerHTML;

    if (target.parentNode.className === "editProject") {
        // Create and show an edit form
        editProject(e.target.innerHTML, clickedItem);
    }
    if (target.parentNode.className ==="editTag") {
        editTag(e.target.innerHTML, clickedItem);
    }
    if (target.parentNode.className ==="editTask") {
        editTask(e.target.innerHTML, clickedItem);
    }
}


function editProject (projectID, clickedProject){
    // Create the form and append it to the box
    const form = createEditForm(projectID, clickedProject);
    form.id ="editForm";
    // Add event listener
    form.addEventListener('submit', sendEditProjectRequest);
};

function editTag(tagID, tagName){
    let form = createEditForm(tagID, tagName);
    form.id = "tagForm";
    form.addEventListener('submit', sendEditTagRequest);
}
function editTask(tagID, tagName){
    let form = createEditForm(tagID, tagName);
    form.id = "taskForm";
    form.addEventListener('submit', sendEditTaskRequest);
}

function createAddingForm(target){
    let form = document.createElement("form");
    form.id ="addForm";
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
}

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

function isValidInput(input) {
    // Example validation: the input should not be empty and must not contain special characters
    const regex = /^[a-zA-Z0-9\s]+$/; // Only letters, numbers, and spaces are allowed
    let onlyLetters = input.trim() !== '' && regex.test(input);
    let nullValues = input != null || input !="";
    let lengthMax = input.length <=30;

    return onlyLetters && nullValues && lengthMax;
}

async function sendAddProjectRequest(event) {
    event.preventDefault(); 
    let newEntry = document.getElementById('newName').value;
    
    if (!isValidInput(newEntry)){
        alert(`You have to enter (some) text`);
    } else {
        // clearEdit();
    const formData = new FormData();
    formData.append('name', newEntry );
    try {
    const response = await fetch('https://localhost:7217/Project/addProject', {
        method: 'POST',
        body: formData, 
    });

        if (response.ok) {
            showProjects();

        } else {
            const error = await response.json();
            alert(`Failed to update project: ${error.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred.');
    }
}
}

async function sendEditProjectRequest(event) {

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

    try {
        // Send the POST request to the updateProject endpoint
        const response = await fetch('https://localhost:7217/Project/updateProject', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            showProjects();

        } else {
            const error = await response.json();
            alert(`Failed to update project: ${error.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred.');
    }
}
};

async function sendEditTagRequest(event) {
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

    try {
        // Send the POST request to the updateProject endpoint
        const response = await fetch('https://localhost:7217/Tag/updateTag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            showTags();

        } else {
            const error = await response.json();
            alert(`Failed to update tag: ${error.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred.');
    }
}
};

async function sendEditTaskRequest(event) {
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

    try {
        // Send the POST request to the updateProject endpoint
        const response = await fetch('https://localhost:7217/Task/updateTask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            showTasks();

        } else {
            const error = await response.json();
            alert(`Failed to update task: ${error.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred.');
    }
}
};

/* 
<table id="projectsList">
<colgroup>
<col span="1">
<col id="editAndDelete" span="2">
</colgroup>
<tr>
    <th>Project</th>
    <th>Edit</th>
    <th>Delete</th>
</tr>
<tr>
    <td>project </td>
    <td class="editable">1</td>
    <td>del</td>
</tr>
</table> 
*/

// Function to create and populate the table
function createProjectsTable(data) {
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

    const headers = ['Project', 'Edit', 'Delete'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);
    }

    // Add rows for each project in the data array
    data.forEach(project => {
        const row = document.createElement('tr');

        // Project name column
        const projectCell = document.createElement('td');
        projectCell.textContent = project.name;
        row.appendChild(projectCell);

        // Edit button column
        const editCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className="editButton";
        editButton.addEventListener('click', () => {
            console.log(`Editing project: ${project.name} (ID: ${project.id})`);
        });
        editCell.appendChild(editButton);
        row.appendChild(editCell);

        // Delete button column
        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className="deleteButton";
        deleteButton.addEventListener('click', () => {
            console.log(`Deleting project: ${project.name} (ID: ${project.id})`);
        });
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        table.appendChild(row);
    });
}


