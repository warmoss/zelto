interface Options {
    url: string,
    filename: string,
    saveAs: boolean
}

const inExtensionEnv = !!(chrome?.downloads?.download);

async function download(options: Options) {
    if (inExtensionEnv) {
        await chrome.downloads.download(options);
    }
}

function readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event: ProgressEvent<FileReader>) => {
            if (event.target?.result) {
                resolve(event.target.result as string);
            } else {
                reject(new Error('读取文件失败'));
            }
        };

        reader.onerror = () => {
            reject(new Error('文件读取错误：' + reader.error?.message));
        };

        reader.readAsText(file, 'UTF-8');
    });
}

export default { download, readAsText }