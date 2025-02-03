import { navigationEventListener } from "./EventListeners/eventListeners.js";
import { createTagList, unhideDisclaimer } from "./Components/create_items.js";

document.getElementById("navigate").addEventListener("click",navigationEventListener);
document.getElementById('disclaimer').addEventListener('click', unhideDisclaimer);

createTagList();