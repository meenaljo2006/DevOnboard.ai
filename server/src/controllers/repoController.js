import { cloneRepo, cleanupRepo } from '../lib/git-manager.js';
import { processDirectory } from '../lib/pre-processor.js';
import Repository from '../models/Repository.js';

export const indexRepository = async (req, res) => {
    const { repoUrl } = req.body;

    try {
        console.log(`🚀 Indexing started for: ${repoUrl}`);

        // 1. MongoDB update
        const repo = await Repository.findOneAndUpdate(
            { url: repoUrl },
            { name: repoUrl.split('/').pop(), indexingStatus: 'Indexing' },
            { upsert: true, new: true }
        );

        // 2. Clone
        const { targetPath } = await cloneRepo(repoUrl);

        // 3. Process & Chunk (Ab humne metadata add kar diya hai)
        const chunks = await processDirectory(targetPath, repoUrl);
        console.log(`📦 Generated ${chunks.length} chunks with metadata.`);

        // 4. Update Database status
        repo.indexingStatus = 'Ready';
        repo.fileCount = chunks.length;
        await repo.save();

        // 5. Cleanup temp files
        await cleanupRepo(targetPath);

        res.status(200).json({ 
            success: true, 
            message: "Successfully processed code into chunks!", 
            chunksCount: chunks.length 
        });

    } catch (error) {
        console.error("❌ Indexing Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};