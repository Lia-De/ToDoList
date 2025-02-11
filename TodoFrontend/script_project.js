import { navigationEventListener } from "./EventListeners/eventListeners.js";
import { unhideDisclaimer, createProjectList, getQueryParam, showThisItem, printAddNewItemButton } from "./Components/create_items.js";

document.getElementById("navigate").addEventListener("click",navigationEventListener);
document.getElementById('disclaimer').addEventListener('click', unhideDisclaimer);

// If we are on the main index - show a list of Projects and button to add new.
// If we are on project.html?id=123 Show details about project #123

if ( window.location.href.includes("index.html")) {
    createProjectList();
    printAddNewItemButton();
} else {
    // show detail
    let projectId = getQueryParam("id");
    showThisItem(projectId, 'project');
}

