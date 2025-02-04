import { navigationEventListener } from "./EventListeners/eventListeners.js";
import { unhideDisclaimer, createProjectList, getQueryParam, showThisItem } from "./Components/create_items.js";

document.getElementById("navigate").addEventListener("click",navigationEventListener);
document.getElementById('disclaimer').addEventListener('click', unhideDisclaimer);

if ( window.location.href.includes("index.html")) {
    createProjectList();
} else {
    // show detail
    let projectId = getQueryParam("id");
    showThisItem(projectId, 'project');
}