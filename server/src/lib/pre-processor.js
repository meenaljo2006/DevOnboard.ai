import fs from 'fs-extra';
import path from 'path';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// In extensions ko hum ignore karenge (Sirf text-based code chahiye)
const IGNORED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.zip', '.ico'];
const IGNORED_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', 'bin', 'obj'];

export const processDirectory = async (dirPath, repoUrl) => {
    let allChunks = [];
    
    // 1. Saari files ki list nikaalo
    const files = await fs.readdir(dirPath, { recursive: true });

    // 2. LangChain Splitter setup (1000 characters ka chunk)
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200, // Thoda overlap taaki context bana rahe
    });

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);

        // Filter: Sirf files honi chahiye aur ignored list mein nahi honi chahiye
        if (stats.isFile() && 
            !IGNORED_EXTENSIONS.includes(path.extname(file)) && 
            !IGNORED_DIRS.some(d => file.includes(d))) {
            
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                
                // Line numbers track karne ke liye logic
                const lines = content.split('\n');
                
                // Chunks create karo
                const docs = await splitter.createDocuments([content], [{
                    fileName: file,
                    repoUrl: repoUrl,
                    totalLines: lines.length
                }]);

                // Har chunk mein metadata add karo
                const metadataDocs = docs.map((doc, index) => ({
                    ...doc,
                    metadata: {
                        ...doc.metadata,
                        chunkIndex: index,
                        // Context ke liye hum snippet ka pehla hissa metadata mein save karte hain
                        snippet: doc.pageContent.substring(0, 200) 
                    }
                }));

                allChunks.push(...metadataDocs);
            } catch (err) {
                console.log(`⚠️ Skipping file ${file}: ${err.message}`);
            }
        }
    }
    return allChunks;
};