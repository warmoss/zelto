import typescript from "@rollup/plugin-typescript";
import dts from 'rollup-plugin-dts';

export default [
    {
        input: 'src/index.ts',
        output: {
            dir: 'dist',
            format: 'es'
        },
        plugins: [
            typescript()
        ],
        external: ['uuid'],
    },
    {
        input: {
            index: 'src/index.ts'
        },
        output: {
            dir: 'dist',
            entryFileNames: '[name].d.ts',
            format: 'es'
        },
        plugins: [
            dts()
        ],
        external: ['uuid'],
    }
];