import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const targets = [
    'dist',
    'packages/mokit/dist',
    'packages/options/dist',
    'packages/plugins/dist',

    'node_modules',
    'packages/mokit/node_modules',
    'packages/options/node_modules',
    'packages/plugins/node_modules',
];

async function destroy() {
    for (const relativeTarget of targets) {
        const targetPath = path.join(projectRoot, relativeTarget);
        await fs.rm(targetPath, { recursive: true, force: true });
    }
}

await destroy();