import { Objects } from "mokit";

const inExtensionEnv = !!(chrome?.storage?.local);

async function get(name: string) {
    if (inExtensionEnv) {
        const rawData = await chrome.storage.local.get(name);
        if (!Objects.IsEmpty(rawData)) {
            return rawData[name];
        }
    } else {
        const rawData = localStorage.getItem(name);
        if (rawData) {
            return JSON.parse(rawData);
        }
    }
    return null;
}

async function set(name: string, value: object) {
    value = JSON.parse(JSON.stringify(value))
    if (inExtensionEnv) {
        await chrome.storage.local.set({ [name]: value });
    } else {
        localStorage.setItem(name, JSON.stringify(value));
    }
}

export default { get, set }