import express from 'express';
import { cloneRepo, cleanupRepo } from '../lib/git-manager.js';
import { indexRepository } from '../controllers/repoController.js';
import { askQuestion ,getChatHistory} from '../controllers/chatController.js';
import Repository from '../models/Repository.js';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();

router.post('/test-clone', async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl) return res.status(400).json({ error: "URL is required" });

  try {
    console.log(`Testing clone for: ${repoUrl}`);
    const { targetPath, repoId } = await cloneRepo(repoUrl);
    
    // Read files to verify success
    const files = await fs.readdir(targetPath, { recursive: true });
    const count = files.length;

    // Cleanup immediately since this is just a test
    await cleanupRepo(targetPath);

    res.json({ 
      success: true, 
      message: `Successfully cloned and found ${count} files/folders.`,
      repoId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// server/src/routes/repoRoutes.js
router.get('/all', async (req, res) => {
    try {
        const repos = await Repository.find({ indexingStatus: 'Ready' }); 
        
        res.status(200).json({ 
            success: true, 
            repos 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// routes/repoRoutes.js mein add karo
router.get('/all-status', async (req, res) => {
    const repos = await Repository.find({}, 'url name indexingStatus');
    res.json({ success: true, repos });
});

router.get('/file-content', async (req, res) => {
    const { repoUrl, filePath } = req.query;

    try {
        // 1. Repo dhoondo (Humne repoId store nahi kiya tha, toh folder name nikalna hoga)
        const repo = await Repository.findOne({ url: repoUrl });
        if (!repo) return res.status(404).json({ success: false, message: "Repo not found" });

        // 2. Temp folders scan karo us repoId ke liye
        // Filhal ke liye simple logic: temp folder ke andar repo name se folder search karein
        const tempBase = path.join(process.cwd(), 'temp');
        const folders = await fs.readdir(tempBase);
        
        // folder dhoondo (yahan nanoid wala logic tha, isliye humein save karna chahiye tha)
        // Temporary fix: Last created folder uthao ya repository model mein repoId save karo
        // Let's assume folder structure path exists for demo:
        const fullPath = path.join(tempBase, folders[folders.length - 1], filePath);

        const content = await fs.readFile(fullPath, 'utf-8');
        res.status(200).json({ success: true, content });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/index-repo', indexRepository);
router.post('/ask', askQuestion);
router.get('/history', getChatHistory);

export default router;