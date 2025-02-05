import { navigationEventListener } from "./EventListeners/eventListeners.js";
import { createTagList, unhideDisclaimer, getQueryParam, showThisItem, printAddNewItemButton } from "./Components/create_items.js";

document.getElementById("navigate").addEventListener("click",navigationEventListener);
document.getElementById('disclaimer').addEventListener('click', unhideDisclaimer);


// If we are on the Main listing, fetch all tags and display them, also add button to add new tag.
// If we are on a detail page, tag.html?id=123, fetch all info about tag #123.

if ( window.location.href.includes("tags.html")) {
    createTagList();
    printAddNewItemButton();
} else {
    // show detail
    let detailId = getQueryParam("id");
    showThisItem(detailId, 'tag');
}