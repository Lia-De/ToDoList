import {config } from '../config.js';
import {clearData, 
        clearAddingForm, 
        GetDetailId,
        printAddingPlus } from '../Components/format.js';
import {createDataCards, 
        selectedTypeButtons, 
        formatTimeSpan } from '../Components/format.js';
import {isValidInput} from '../script.js';



export async function showProjects() {
    try {
        const response = await fetch(`${config.apiBaseUrl}/Project`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        document.getElementById("nowShowing").innerHTML = `${data.length} Projects`;
        clearData();
        selectedTypeButtons("projects");
        createDataCards(data, "projects");
        printAddingPlus();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("nowShowing").innerHTML =`Database is unreachable: Showing backup-data`;
        clearData();
        createDataCards(hardcodedData, "projects");
    }
}

export async function showTasks(){
    try { 
        await fetch(`${config.apiBaseUrl}/Task`)
        .then(response => response.json())
        .then(function (data){
            document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Tasks`;
            let target = document.getElementById("contents");
            clearData();
            selectedTypeButtons("tasks");
            createDataCards(data, "tasks");
            printAddingPlus();
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("nowShowing").innerHTML =`Database is unreachable: Showing backup-data`;
        clearData();
    }
}
export async function showTags(){
    try {await fetch(`${config.apiBaseUrl}/Tag`)
        .then(response => response.json())
        .then(function (data){
            document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Tags`;
            let target = document.getElementById("contents");    
            clearData();
            selectedTypeButtons("tags");
            createDataCards(data,'tags');
            printAddingPlus();
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("nowShowing").innerHTML =`Database is unreachable`;
        clearData();
    }
}



export async function getSingleItem(itemID, dataType) {
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

export async function startTimer(piD){
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

export async function stopTimer(prId){
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
            let target=document.querySelector("[id^='detail']").querySelectorAll('.totalTime')[0];
            target.insertAdjacentElement("afterend", reportedTime);
                       

        });
        document.getElementById('timerStart').classList = '';
        document.getElementById('timerStop').classList = '';
        document.getElementById(prId).querySelector('.runningTimer').classList.remove('runningTimer');

    } catch (error) {
            console.error('Error:', error);
            document.getElementById("nowShowing").innerHTML =`Database is unreachable: Showing backup-data`;
            clearData();
            createDataCards(hardcodedData, "projects");
    }

}


export async function sendEditRequest(requestData, fetchURL, dataType){
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


export function addRequest(event, dataType) {
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

                let projectId = GetDetailId();
                
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


export async function sendAddRequest(formData, fetchURL, dataType){
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

export function addTagToTask(event){
    event.preventDefault();
    let tagCloud = 'taskTagCloud'+event.target.elements["taskId"].value;
    let inputTags = document.getElementById(tagCloud).value;
    let dataid = parseInt(event.target.elements["taskId"].value,10);
    
    let fetchUrl = `${config.apiBaseUrl}/Task/addTagsToTask/${dataid}`;    

    if (inputTags !=''){
        addTagToItem(event,inputTags, fetchUrl);
    }
}
export function addTagToProject(event){
    event.preventDefault();
    let inputTags = document.getElementById('projectTagCloud').value;
    let dataid = GetDetailId();
    let fetchUrl=`${config.apiBaseUrl}/Project/addTagsToProject/${dataid}`;
    if (dataid !=null) {      
        if (inputTags !=''){
            addTagToItem(event, inputTags, fetchUrl);
        } 
    }
}

export async function addTagToItem(event, inputTags, fetchUrl){
    let tagArray = inputTags
    .split(',')
    .map(item => item.trim())
    .filter(item => item !== '');
    event.preventDefault();
    
    const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagArray),
    });

    if (!response.ok) {
        console.log('Something went wrong with adding tags!')
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

export function deleteProject(id, name){
    const confirmDelete = confirm(`Are you sure you want to delete "${name}"?`);
            
    if (confirmDelete) {
        sendDeleteData(id, name, "project");
    }
}
export function deleteTag(id, name){
    const confirmDelete = confirm(`Are you sure you want to delete "${name}"?`);
            
    if (confirmDelete) {
        sendDeleteData(id, name, "tag");
    }
}
export function deleteTask(id, desc){
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