import * as fs from 'fs';
import * as path from 'path';

function readFilesRecursively(folderPath){
    const files = fs.readdirSync(folderPath);
    let fileContents = [];

    files.forEach(fileName => {
        const filePath = path.join(folderPath, fileName);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            fileContents = fileContents.concat(readFilesRecursively(filePath));
        } else if (stats.isFile() && !fileName.includes('.spec.') && fileName.includes(".move") && !fileName.includes("test")) {
            const content = fs.readFileSync(filePath, 'utf-8');
            fileContents.push({
                content,
                name: fileName
            });
        }
    });

    return fileContents;
}

const filesFolderPath = './move';
const fileContents = readFilesRecursively(filesFolderPath);

const dataArrayString = JSON.stringify(fileContents);

const str = `export default ${dataArrayString}`;
fs.writeFileSync('./index.ts', str);