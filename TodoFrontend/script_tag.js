import { navigationEventListener } from "./EventListeners/eventListeners.js";
import { createTagList, unhideDisclaimer, getQueryParam, showThisItem } from "./Components/create_items.js";

document.getElementById("navigate").addEventListener("click",navigationEventListener);
document.getElementById('disclaimer').addEventListener('click', unhideDisclaimer);



if ( window.location.href.includes("tags.html")) {
    createTagList();
} else {
    // show detail
    let detailId = getQueryParam("id");
    showThisItem(detailId, 'tag');
}