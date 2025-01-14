
function callTheBackend() {
    fetch('https://localhost:7217/Project')
        .then(response => response.json())
        .then(function (data){
            for (const project of data){
                console.log(`Project: ${project.name}`);
            }
        });
        fetch('https://localhost:7217/Tag')
        .then(response => response.json())
        .then(function (data){
            for (const tag  of data){
                console.log(`Tag: ${tag.name}`);
            }
        });
        fetch('https://localhost:7217/Task')
        .then(response => response.json())
        .then(function (data){
            for (const task of data){
                console.log(`Task: ${task.description}`);
            }
        });
}

function showProjects(){
    fetch('https://localhost:7217/Project')
        .then(response => response.json())
        .then(function (data){
            document.getElementById("nowShowing").innerHTML = "Now showing Projects";
            clearData();
            let target = document.getElementById("projects");
            for (const project of data){
                helperMethod("h1", project.name, target);
            }
        });
}
function showTasks(){
    fetch('https://localhost:7217/Task')
        .then(response => response.json())
        .then(function (data){
            clearData();
            document.getElementById("nowShowing").innerHTML = "Now showing Tasks";
            let target = document.getElementById("tasks");
            for (const task of data){
                helperMethod("h2", task.description, target);
            }
        });
}
function showTags(){
    fetch('https://localhost:7217/Tag')
        .then(response => response.json())
        .then(function (data){
            document.getElementById("nowShowing").innerHTML = "Now showing Tags";
            clearData();
            let target = document.getElementById("tags");    
            for (const tag  of data){
                helperMethod("h3", tag.name, target);
            }
        });
}


function helperMethod(elementType, dataValue, target) {
    let newElement= document.createElement(elementType);
    //let dbData = document.createTextNode(dataValue);
    //newElement.appendChild(dbData);
    newElement.innerHTML = dataValue;
    target.appendChild(newElement);
}
function clearData(){
    document.getElementById("projects").innerHTML = "";
    document.getElementById("tags").innerHTML = "";
    document.getElementById("tasks").innerHTML = "";
}