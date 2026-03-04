import fs from 'fs-extra';
import path from 'path';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const IGNORED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.zip', '.ico'];
const IGNORED_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', 'bin', 'obj'];

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

        if (stats.isFile() && 
            !IGNORED_EXTENSIONS.includes(path.extname(file)) && 
            !IGNORED_DIRS.some(d => file.includes(d))) {
            
            try {
                const content = await fs.readFile(filePath, 'utf-8');
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
    return allChunks;
};