import fs from 'fs-extra';
import path from 'path';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Ignore these extensions
const IGNORED_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.zip', 
    '.ico', '.json', '.lock', '.md', '.txt' 
];

// Ignore directories (node_modules is the main culprit)
const IGNORED_DIRS = [
    'node_modules', 
    '.git', 
    'dist', 
    'build', 
    '.next', 
    'bin', 
    'obj', 
    'public', 
    'coverage'
];

export const processDirectory = async (dirPath, repoUrl) => {
    let allChunks = [];
    const files = await fs.readdir(dirPath, { recursive: true });

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        const isIgnoredDir = IGNORED_DIRS.some(d => {
            const pathParts = file.split(path.sep);
            return pathParts.includes(d);
        });

        if (stats.isFile() && 
            !IGNORED_EXTENSIONS.includes(path.extname(file)) && 
            !isIgnoredDir &&
            !file.includes('package-lock.json') && 
            !file.includes('yarn.lock')) {
            
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                if (!content.trim()) continue;

                const docs = await splitter.createDocuments([content], [{
                    fileName: file,
                    repoUrl: repoUrl
                }]);

                const metadataDocs = docs.map((doc, index) => {
                    const startIndex = content.indexOf(doc.pageContent);
                    const linesBefore = content.substring(0, startIndex).split('\n').length;
                    const chunkLines = doc.pageContent.split('\n').length;

                    const startLine = linesBefore;
                    const endLine = linesBefore + chunkLines - 1;

                    return {
                        ...doc,
                        metadata: {
                            ...doc.metadata,
                            chunkIndex: index,
                            snippet: `Lines ${startLine}-${endLine}` 
                        }
                    };
                });

                allChunks.push(...metadataDocs);
            } catch (err) {
                console.log(`⚠️ Skipping file ${file}: ${err.message}`);
            }
        }
    }

    console.log(`Total Chunks Generated: ${allChunks.length}`); 
    return allChunks;
};