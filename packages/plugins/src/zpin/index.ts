import * as service from "@/common/service";
import * as ui from "./ui";
import { Tries } from "@/types/default";

declare global {
    interface Window {
        watcher?: MutationObserver;
        tries: Tries;
    }
}

async function run() {
    window.tries = await service.initTries();
    window.watcher = ui.watch();
}
run();

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'options_changed') {
        console.log('Received broadcast:', message);
        location.reload();
    }
})
