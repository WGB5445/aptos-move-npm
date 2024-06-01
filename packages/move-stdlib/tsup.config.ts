import { defineConfig } from 'tsup'
export default defineConfig({
    entry: ["index.ts"],
    outDir: ".",
    format: ["cjs", "esm", "iife"],
    publicDir: "move",
    dts: true
})