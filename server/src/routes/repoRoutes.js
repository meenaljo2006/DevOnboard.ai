import express from 'express';
import auth from '../middleware/auth.js'; 
import Repository from '../models/Repository.js';
import axios from 'axios';
import { indexRepository } from '../controllers/repoController.js'; 
import { askQuestion, getChatHistory } from '../controllers/chatController.js';

const router = express.Router();

// ROUTE 1: POLL STATUS
router.get('/all-status', auth, async (req, res) => {
    try {
        const repos = await Repository.find({ userId: req.user.id }, 'url name indexingStatus');
        res.json({ success: true, repos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ROUTE 2: FETCH REAL FILE CONTENT DIRECTLY FROM GITHUB
router.get('/file-content', auth, async (req, res) => {
    const { repoUrl, filePath } = req.query;
    try {
        const repo = await Repository.findOne({ url: repoUrl, userId: req.user.id });
        if (!repo) return res.status(404).json({ success: false, message: "Repo not found" });
        const cleanRepoUrl = repoUrl.replace(/\.git$/, '');
        const rawBaseUrl = cleanRepoUrl.replace('github.com', 'raw.githubusercontent.com');
        
        let contentUrl = `${rawBaseUrl}/master/${filePath}`;
        
        try {
            const response = await axios.get(contentUrl);
            return res.json({ success: true, content: response.data });
        } catch (masterErr) {
            contentUrl = `${rawBaseUrl}/main/${filePath}`;
            const responseMain = await axios.get(contentUrl);
            return res.json({ success: true, content: responseMain.data });
        }

    } catch (error) {
        console.error("File fetch error:", error.message);
        res.status(500).json({ success: false, error: "File content fetch failed. Branch might not be main/master." });
    }
});

// ROUTE 3: INDEX REPO (Calls your Pinecone/AI logic from Step 1)
router.post('/index-repo', auth, indexRepository);

// ROUTE 4: GET ALL REPOS FOR SIDEBAR
router.get('/all', auth, async (req, res) => {
    try {
        const repos = await Repository.find({ userId: req.user.id }).sort({ _id: -1 });
        res.json({ success: true, repos });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// ROUTE 5: CHAT ROUTES
router.post('/ask', auth, askQuestion);
router.get('/history', auth, getChatHistory);

export default router;