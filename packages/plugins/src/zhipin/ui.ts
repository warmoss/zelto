import { ZeltoRule } from "@/types/document";

function render() {
    const target = document.querySelector<HTMLElement>(".rec-job-list");
    if (!target) {
        return;
    }

    for (const job of target.children) {
        renderJob(job as HTMLElement);
    }
}

function renderJob(root: HTMLElement) {
    const processed = root.attributes.getNamedItem("data-zelto-processed");
    if (processed) {
        return;
    }
    root.setAttribute("data-zelto-processed", "1");

    const companyNameNode = root.querySelector<HTMLElement>(".boss-name");
    const companyName = companyNameNode?.innerText?.trim() ?? "";
    const jobNameNode = root.querySelector<HTMLElement>(".job-name");
    const jobName = jobNameNode?.innerText?.trim() ?? "";

    const analyzeData = {
        "公司名字": companyName,
        "职位名字": jobName
    }
    enhanceJobAnalyzeView(root, analyzeData);

    let result;
    result = window.tries["company"]?.contains(companyName);
    if (result && result.isSuccess()) {
        const data = result.getData() as ZeltoRule;
        console.log("[zelto]company", data.action, companyName, data.keyword, data.reason)
        enhanceJobView(root, data);
        return;
    }

    result = window.tries["job"]?.contains(jobName);
    if (result && result.isSuccess()) {
        const data = result.getData() as ZeltoRule;
        console.log("[zelto]job", data.action, jobName, data.keyword, data.reason)
        enhanceJobView(root, data);
        return;
    }
}

function enhanceJobAnalyzeView(root: HTMLElement, data: { [key: string]: string }) {
    const lines = ["请分析公司与职位:"];
    for (const name in data) {
        lines.push(`${name}: ${data[name]}`)
    }
    const prompt = lines.join("\n")

    const tagsContainter = root.querySelector<HTMLElement>(".tag-list");
    if (!tagsContainter) {
        return;
    }

    const defaultStyle = { color: "blue", text: "复制提示词", hoverColor: "lightblue", }
    const successStyle = { color: "blue", text: "复制成功" }
    const promptTag = document.createElement("li");
    promptTag.setAttribute("data-v-77c56d1a", "true")
    promptTag.style.color = defaultStyle.color;
    promptTag.innerText = defaultStyle.text;
    promptTag.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await copyTextToClipboard(prompt);
        promptTag.innerText = successStyle.text;
        setTimeout(() => {
            promptTag.innerText = defaultStyle.text;
        }, 300)
        return true;
    })
    promptTag.addEventListener('mouseenter', () => promptTag.style.color = defaultStyle.hoverColor);
    promptTag.addEventListener('mouseleave', () => promptTag.style.color = defaultStyle.color);
    tagsContainter.prepend(promptTag);
}

async function copyTextToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('复制失败: ', err);
        return false;
    }
}

function enhanceJobView(root: HTMLElement, rule: ZeltoRule) {
    const color = rule.action == "block" ? "#CCC" : "yellow";

    const containter = root.querySelector<HTMLDivElement>(".job-info");
    if (containter) {
        containter.style.background = color;
    }
    const containterFooter = root.querySelector<HTMLDivElement>(".job-card-footer");
    if (containterFooter) {
        containterFooter.style.background = color;
    }

    const tagsContainter = root.querySelector<HTMLElement>(".tag-list");
    if (!tagsContainter) {
        return;
    }

    const tagColor = rule.action == "block" ? "red" : "orange";
    const keywordTag = document.createElement("li");
    keywordTag.setAttribute("data-v-77c56d1a", "true")
    keywordTag.style.color = tagColor;
    keywordTag.innerText = (rule.keyword ?? "") + "-" + (rule.reason ?? "");
    tagsContainter.prepend(keywordTag);
}

async function getContainer(selectors: string): Promise<HTMLElement | null> {
    const maxRetries = 10;
    const interval = 200;
    for (let i = 0; i < maxRetries; i++) {
        const target = document.querySelector<HTMLElement>(selectors);
        if (target) {
            return target;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    return null;
}

function callback() {
    render();
}

export async function watch() {
    const target = await getContainer(".job-recommend-result");
    if (!target) {
        console.warn("[zelto]未找到职位列表容器");
        return;
    }
    render();

    const config = { childList: true, subtree: true };
    const observer = new MutationObserver(callback);
    observer.observe(target, config);
    return observer;
}