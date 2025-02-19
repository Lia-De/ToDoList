import config from "./config.js";

document.getElementById("checkLogin").addEventListener("click", checkLogin);

function checkLogin() {
    fetch(config.apiBaseUrl+"/profile", {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept" : "application/json",
        }
    })
        .then(response => {
            console.log(response.status);
            response.json();
        }
        )
        .then(data => {
            console.log(data) 
            document.getElementById("checkresult").innerHTML = data;
    });
}


document.getElementById("loginform").addEventListener("submit", adminlogin);

function adminlogin(e) {
    e.preventDefault();
    
    let email = document.getElementById("email_log").value;
    let password = document.getElementById("password_log").value;

    fetch(config.apiBaseUrl+"/login?useCookies=true", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept" : "application/json",
        },
        body: JSON.stringify ({
            "email": email,
            "password": password,
        })
    })
        .then(response => {
            console.log('login response '+response.status);
            response.text();

        })
        .then(data => console.log(data) );


        
        
}

document.getElementById("adminform").addEventListener("submit", registerThis);

function registerThis(event) {
    event.preventDefault();
console.log("registering");

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    fetch(config.apiBaseUrl+"/profile/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept" : "application/json",
        },
        body: JSON.stringify ({
            "email": email,
            "password": password,
        })
    })
        .then(response => {
            console.log(response.status);
            response.json();
        }
        )
        .then(data => console.log(data) );
}

