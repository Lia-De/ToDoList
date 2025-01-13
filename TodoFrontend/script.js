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

callTheBackend();