import { defineConfig } from 'tsup'
export default defineConfig({
    entry: ["index.ts"],
    format: ["cjs", "esm", "iife"],
    publicDir: "move",
    dts: true,
    clean: true,
})