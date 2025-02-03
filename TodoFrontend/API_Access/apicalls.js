import { createProjectList, createTagList, GetDetailId } from '../Components/create_items.js';
import {config } from '../config.js';

export async function fetchAllProjects() {
    try {
        const response = await fetch(`${config.apiBaseUrl}/Project`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("nowShowing").innerHTML =`Database is unreachable: Showing backup-data`;
    }
}

export async function fetchAllTags() {
    try {
        const response = await fetch(`${config.apiBaseUrl}/Tag`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("nowShowing").innerHTML =`Database is unreachable: Showing backup-data`;
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



// DELETE FUNCTIONS
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
            reload = createProjectList;
            break;
        case "tag":
            // set vars
            fetchUrl = `${config.apiBaseUrl}/Tag/deleteTag`;
            deleteData = {
                tagId: id,
                Name: data
            };
            reload = createTagList;
            break;
        case "task":
            // set vars
            fetchUrl = `${config.apiBaseUrl}/Task/deleteTask`;
            deleteData = {
                taskId: id,
                name: data,
            };
            // reload = showTasks;
            
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


export async function startProjectTimer(piD){
    try {
        const response = await fetch(`${config.apiBaseUrl}/Project/startTimer/${piD}`, {
            method: 'POST',
            body: piD, 
        });
        if (!response.ok) {
            return response.text();
        } else {
            return '';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function stopProjectTimer(prId){
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
        return response.text();

    } catch (error) {
            console.error('Error:', error);
    }
}

// EDIT FUNCTIONS


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
            window.location.replace(window.location.href);
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
                window.location.replace(window.location.href);
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
