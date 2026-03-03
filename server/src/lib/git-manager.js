import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';
import { nanoid } from 'nanoid';

const git = simpleGit();

export const cloneRepo = async (repoUrl) => {
    const repoId = nanoid(10);
    const targetPath = path.join(process.cwd(), 'temp', repoId);
    
    // 1. Ensure temp directory exists (Varna error aa sakta hai)
    await fs.ensureDir(path.join(process.cwd(), 'temp'));
    
    try {
        console.log(`📂 Cloning started: ${repoUrl}`);
        
        // 2. Depth 1 use karein for lightning fast speed
        await git.clone(repoUrl, targetPath, ['--depth', '1']); 
        
        console.log(`✅ Clone finished at: ${targetPath}`);
        return { targetPath, repoId };
    } catch (error) {
        console.error(`❌ Git Error: ${error.message}`);
        throw new Error(`Failed to clone repository: ${error.message}`);
    }
};

export const cleanupRepo = async (directoryPath) => {
    try {
        await fs.remove(directoryPath);
        console.log(`🧹 Cleaned up temp files at: ${directoryPath}`);
    } catch (error) {
        console.error(`❌ Cleanup Error: ${error.message}`);
    }
};