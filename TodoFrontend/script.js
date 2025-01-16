showProjects();
function showProjects(){
    fetch('https://localhost:7217/Project')
        .then(response => response.json())
        .then(function (data){
            document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Projects`;
            
            clearData();
            let target = document.getElementById("contents");
            let divTarget = addAllElements("p", data.map(project => project.name), target);
            divTarget.className="names";            
            let divTarget2 = addAllElements("p", data.map(project => project.id), target);
            divTarget2.className="editProject";
        
            
        });
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
        let newElement = document.createElement(elementType);
        newElement.innerHTML = dataValue;
        
        targetDiv.appendChild(newElement);
        target.appendChild(targetDiv);
    })
    return targetDiv;
}

function clearData(){
    document.getElementById("contents").innerHTML = "";
}

document.getElementById("navigate").addEventListener("click",eventListener);

function eventListener(e){
    // remove the edit field
    if (document.getElementById("edits") != null) { 
        document.getElementById("container").removeChild(document.getElementById("edits"));
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

document.getElementById("contents").addEventListener("click", function(e){
    let target = e.target;
    
    let children = Array.from(e.target.parentNode.children); // Get all children of the parent
    let index = children.indexOf(target);   // Find the index of the clicked child

    if (target.parentNode.className === "editProject") {
        // Create and show an edit form
        let projectNames = document.getElementsByClassName("names")[0];
        let clickedProject = projectNames.children[index].innerHTML;
        editProject(e.target.innerHTML, clickedProject);
    };
    });


    
function editProject (projectID, clickedProject){
    let containerTarget = document.getElementById("container")  
    let projectName = clickedProject;
    // Check if we have an edit box already
    let oldEdit = document.getElementById("edits");
    if (oldEdit != null) containerTarget.removeChild(oldEdit);

    // Create the container div
    const editBox = document.createElement('div');
    editBox.id = 'edits'; 
    // Create the form and append it to the box
    const form = createForm(projectID, projectName);
    editBox.appendChild(form);
    form.id ="editForm";
    // Append the container div to the context
    containerTarget.appendChild(editBox);
    // Add event listener
    document.getElementById('editForm').addEventListener('submit', sendEditRequest);
};

function createForm(projectID, projectName) {
  // Create the form
  const form = document.createElement('form');
  

  // Create the label for the name input
  const label = document.createElement('label');
  label.setAttribute('for', 'name');
  label.textContent = 'Name: ';

  // Create the text input for the name
  const inputText = document.createElement('input');
  inputText.type = 'text';
  inputText.id = 'name';
  inputText.name = 'name';
  inputText.value = projectName; // Fill the input 
  
  // Create the hidden input for the ID
  const inputHidden = document.createElement('input');
  inputHidden.type = 'hidden';
  inputHidden.id = 'id';
  inputHidden.name = 'id';
  inputHidden.value = projectID; // Set the hidden input value to data.id

  // Create the submit button
  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Edit';

  // Append all elements to the form
  form.appendChild(label);
  form.appendChild(inputText);
  form.appendChild(inputHidden);
  form.appendChild(button);
  return form;
}


async function sendEditRequest(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get input values
    const id = parseInt(document.getElementById('id').value);
    const name = document.getElementById('name').value;
    

    // Data to send in the request
    const requestData = {
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
};
