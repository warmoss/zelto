import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import resolve from "@rollup/plugin-node-resolve";

const defaultOptions = {
    output: {
        dir: 'dist',
        format: 'iife',
        entryFileNames: '[name].min.js',
        sourcemap: false
    },
    plugins: [
        typescript(),
        resolve(),
        terser()
    ]
}

export default [
    {
        input: {
            zpin: 'src/zpin/index.ts'
        },
        ...defaultOptions
    },
    {
        input: {
            yupao: 'src/yupao/index.ts'
        },
        ...defaultOptions
    },
    {
        input: {
            zhipin: 'src/zhipin/index.ts'
        },
        ...defaultOptions
    }
];