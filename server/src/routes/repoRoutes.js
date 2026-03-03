import express from 'express';
import { cloneRepo, cleanupRepo } from '../lib/git-manager.js';
import { indexRepository } from '../controllers/repoController.js';
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

router.post('/index-repo', indexRepository);

export default router;