chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log('Background received:', message);
    if (message.to == "contents") {
        await broadcastToAllContentScripts(message);
        sendResponse({ status: 'broadcasting' });
    }
})

async function broadcastToAllContentScripts(message) {
    const tabs = await chrome.tabs.query({}) ?? []
    for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, message)
            .catch(error => console.log(`[messaging]send failed. message=${message} error=${error.message}`))
    }
}