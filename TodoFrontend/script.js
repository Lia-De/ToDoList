
function showProjects(){
    fetch('https://localhost:7217/Project')
        .then(response => response.json())
        .then(function (data){
            document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Projects`;
            
            let target = document.getElementById("contents");
            addAllElements("p", data.map(project => project.name), target);
        });
}
function showTasks(){
    fetch('https://localhost:7217/Task')
        .then(response => response.json())
        .then(function (data){
            
            document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Tasks`;
            let target = document.getElementById("contents");
            addAllElements("p", data.map(task => task.description), target);
        });
}
function showTags(){
    fetch('https://localhost:7217/Tag')
        .then(response => response.json())
        .then(function (data){
            document.getElementById("nowShowing").innerHTML = `Now showing ${data.length} Tags`;
            
            let target = document.getElementById("contents");    
            addAllElements("p", data.map(tag => tag.name), target);
        });
}

function addAllElements(elementType, data, target) {
    clearData();
    data.forEach(dataValue => {
        let newElement = document.createElement(elementType);
        newElement.innerHTML = dataValue;
        target.appendChild(newElement);
    })
}

function clearData(){
    document.getElementById("contents").innerHTML = "";
}