import { promises as fs } from 'fs';
import path from 'path';

async function copyFileAsync(sourcePath, destPath) {
    try {
        await fs.access(sourcePath);
        const destDir = path.dirname(destPath);
        await fs.mkdir(destDir, { recursive: true });

        await fs.copyFile(sourcePath, destPath);
        console.log(`File copied from ${sourcePath} to ${destPath}`);
    } catch (err) {
        console.error(`Error copying file: ${err.message}`);
    }
}

const sourceFile = './package.json'; 
const destFile = './dist/package.json'; 

copyFileAsync(sourceFile, destFile);
