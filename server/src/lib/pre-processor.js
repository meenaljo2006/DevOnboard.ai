import fs from 'fs-extra';
import path from 'path';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const IGNORED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.zip'];
const IGNORED_DIRS = ['node_modules', '.git', 'dist', 'build', '.next'];

export const processDirectory = async (dirPath, repoUrl) => {
    let allChunks = [];
    const files = await fs.readdir(dirPath, { recursive: true });

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        language: "js", // Dynamically adjustable based on extension
    });

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);

        if (stats.isFile() && !IGNORED_EXTENSIONS.includes(path.extname(file)) && !IGNORED_DIRS.some(d => file.includes(d))) {
            const content = await fs.readFile(filePath, 'utf-8');
            
            // Create documents with Metadata for your Killer Feature
            const docs = await splitter.createDocuments([content], [{
                fileName: file,
                repoUrl: repoUrl,
                // In a production version, we calculate line numbers by counting \n 
                // before the chunk's start index.
            }]);
            
            allChunks.push(...docs);
        }
    }
    return allChunks;
};