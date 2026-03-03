import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';
import { nanoid } from 'nanoid';

const git = simpleGit();

export const cloneRepo = async (repoUrl) => {
    const repoId = nanoid(10);
    const targetPath = path.join(process.cwd(), 'temp', repoId);
    
    try {
        await git.clone(repoUrl, targetPath);
        return { targetPath, repoId };
    } catch (error) {
        throw new Error(`Failed to clone repository: ${error.message}`);
    }
};

export const cleanupRepo = async (directoryPath) => {
    await fs.remove(directoryPath);
};