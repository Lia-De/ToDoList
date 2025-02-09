import {config } from '../config.js';
// ********************************************************************************/
//           FETCHING DB INFO
// ********************************************************************************/
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
        document.getElementById("nowShowing").innerHTML =`Database is unreachable`;

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
        document.getElementById("nowShowing").innerHTML =`Database is unreachable`;
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
// ********************************************************************************/
//           REMOVING DATA
// ********************************************************************************/
export async function sendDeleteData(id, data, dataType) {
    let fetchUrl;
    let deleteData;
    switch (dataType) {
        case  "project":
            // set vars
            fetchUrl = `${config.apiBaseUrl}/Project/deleteProject`;
            deleteData = {
                projectId: id,
                name: data
            };
            
            break;
        case "tag":
            // set vars
            fetchUrl = `${config.apiBaseUrl}/Tag/deleteTag`;
            deleteData = {
                tagId: id,
                Name: data
            };
            
            break;
        case "task":
            // set vars
            fetchUrl = `${config.apiBaseUrl}/Task/deleteTask`;
            deleteData = {
                taskId: id,
                name: data,
            };
            
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
                return true;
    
            } else {
                const error = await response.json();
                alert(`Failed to update project: ${error.message}`);
                return false;
            }
        } catch (error) {
            console.error(`Error:${error.message}`, error);
            alert(`An unexpected error occurred.`);
        }

}

// ********************************************************************************/
//           UPDATING DATA
// ********************************************************************************/
export function removeTagFromProject(projectID, tagID){
    let fetchURL =`${config.apiBaseUrl}/Project/removeTag/${projectID}/${tagID}`;
    return removeTagFromItem(fetchURL, 'project');
}

export function removeTagFromTask(taskID, tagID){
    let fetchURL = `${config.apiBaseUrl}/Task/removeTag/${taskID}/${tagID}`;
    return removeTagFromItem(fetchURL, 'task');
}

async function removeTagFromItem(fetchURL, type){
    try {
        const response = await fetch(fetchURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
            if (response.ok) {
                return true;
            } else {
                const error = await response.json();
                alert(`Failed to remove tag from ${type}: ${error.message}`);
                return false;
            }
        } catch (error) {
            console.error(`Error:${error.message}`, error);
            alert(`An unexpected error occurred trying to remove a tag.`);
        }
}

export async function sendEditRequest(requestData, fetchURL){
    console.log(requestData);
    try {
        const response = await fetch(config.apiBaseUrl+fetchURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });
       
        if (response.ok) {
            return true;
        } return false;
        
    } catch (error) {
        console.log('send edit request'+error.message);
    }
}

export async function startProjectTimer(projectId){
    try {
        const response = await fetch(`${config.apiBaseUrl}/Project/startTimer/${projectId}`, {
            method: 'POST',
            body: projectId, 
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

export async function stopProjectTimer(projectId){
    try {
        let taskId=-1;
        const response = await fetch(`${config.apiBaseUrl}/Project/stopTimer/${projectId}/${taskId}`, {
            method: 'POST',
            body: projectId, 
        });
        if (!response.ok) {
            response.text()
            .then(data => {
                alert(data); 
            });
        } 
        return response.json();

    } catch (error) {
            console.error('Error:', error);
    }
}

// ********************************************************************************/
//           ADDING NEW DATA
// ********************************************************************************/
export async function sendAddRequest(formData, fetchURL){
    try {
        const response = await fetch(config.apiBaseUrl+fetchURL, {
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
}

export async function addTagToItem(event, inputTags, fetchUrl){
    let tagArray = inputTags.split(',')
                    .map(item => item.trim())
                    .filter(item => item !== '');
    event.preventDefault();

    const response = await fetch(config.apiBaseUrl+fetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagArray),
    });

    if (!response.ok) {
        console.error('Something went wrong with adding tags!');
    } else {
        // Return the new taglist to update the page
        return response.json();

    }
}
