import { Trie, Objects } from "mokit";
import example from "@/common/example"
import { ZeltoRule } from "@/types/document"
import { Tries } from "@/types/default";

async function loadData(name: string): Promise<ZeltoRule[]> {
    let rules;
    const rawData = await chrome.storage.local.get(name);
    if (Objects.IsEmpty(rawData)) {
        rules = example
        await chrome.storage.local.set({ [name]: example });
    } else {
        rules = rawData[name] as ZeltoRule[];
    }
    return rules;
}

export async function initTries(): Promise<Tries> {
    const result: Tries = {};
    const rules = await loadData("zelto") as ZeltoRule[];
    for (const rule of rules) {
        for (const target of rule.targets ?? []) {
            if (!result[target]) {
                result[target] = new Trie();
            }
            result[target].add(rule.keyword ?? "", rule);
        }
    }
    return result;
}