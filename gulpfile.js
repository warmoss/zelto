import fs from 'fs/promises';
import { series } from "gulp";

const target = "dist/zelto";
async function clean(cb) {
    await fs.rm('dist', { recursive: true, force: true });
    await fs.mkdir(target, { recursive: true });
    cb();
}

async function dist(cb) {
    await fs.cp('packages/extension', target, { recursive: true });
    await fs.cp('packages/plugins/dist', target + "/scripts", { recursive: true });
    await fs.cp('packages/options/dist', target + "/views/options", { recursive: true });
    cb();
}

export default series(clean, dist)