interface Message {
    type: string,
    from: string,
    to: string
}

const inExtensionEnv = !!(chrome?.runtime?.sendMessage);

async function send(message: Message) {
    if (inExtensionEnv) {
        await chrome.runtime.sendMessage(message);
    }
}

export default { send }