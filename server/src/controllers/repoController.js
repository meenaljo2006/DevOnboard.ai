import { cloneRepo, cleanupRepo } from '../lib/git-manager.js';
import { processDirectory } from '../lib/pre-processor.js';
import Repository from '../models/Repository.js';
import { generateEmbeddings } from '../config/google-ai.js';
import fs from 'fs-extra';
import path from 'path';

const generateTree = async (dirPath, relativePath = "") => {
    const items = await fs.readdir(dirPath);
    let tree = [];
    for (const item of items) {
        if (['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) continue;
        const fullPath = path.join(dirPath, item);
        const relPath = path.join(relativePath, item);
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory()) {
            tree.push({
                name: item, type: 'folder', path: relPath,
                children: await generateTree(fullPath, relPath)
            });
        } else {
            tree.push({ name: item, type: 'file', path: relPath });
        }
    }
    return tree.sort((a, b) => (a.type === b.type ? 0 : a.type === 'folder' ? -1 : 1));
};

export const indexRepository = async (req, res) => {
    const { repoUrl } = req.body;
    try {
        // Step 1: Initialize
        let repo = await Repository.findOneAndUpdate(
            { url: repoUrl },
            { name: repoUrl.split('/').pop(), indexingStatus: 'Cloning Repository...' },
            { upsert: true, returnDocument: 'after' }
        );

        // Instant response taaki UI block na ho
        res.status(202).json({ success: true, message: "Indexing started..." });

        // Step 2: Clone
        const { targetPath } = await cloneRepo(repoUrl);
        repo.indexingStatus = 'Generating File Tree...';
        await repo.save();

        // Step 3: Tree
        const repoStructure = await generateTree(targetPath);
        repo.indexingStatus = 'Processing & Chunking...';
        await repo.save();

        // Step 4: Chunks
        const chunks = await processDirectory(targetPath, repoUrl);
        
        // Step 5: Embeddings Loop
        const vectors = [];
        for (let i = 0; i < chunks.length; i++) {
            const progress = Math.round(((i + 1) / chunks.length) * 100);
            // Har 10% par status update karein DB mein
            if (progress % 10 === 0) {
                repo.indexingStatus = `Generating Vectors (${progress}%)...`;
                await repo.save();
            }

            const chunk = chunks[i];
            try {
                const embedding = await generateEmbeddings(chunk.pageContent);
                if (embedding) {
                    vectors.push({
                        id: `${repo._id}_${Math.random().toString(36).substring(2, 11)}`,
                        values: embedding,
                        metadata: {
                            text: chunk.pageContent,
                            fileName: chunk.metadata.fileName,
                            repoUrl: chunk.metadata.repoUrl,
                            snippet: chunk.metadata.snippet
                        }
                    });
                }
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (e) { continue; }
        }

        // Step 6: Upsert
        repo.indexingStatus = 'Finalizing with Pinecone...';
        await repo.save();

        if (vectors.length > 0) {
            await fetch(`${process.env.PINECONE_HOST}/vectors/upsert`, {
                method: 'POST',
                headers: { 'Api-Key': process.env.PINECONE_API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({ vectors })
            });
        }

        // Success
        repo.indexingStatus = 'Ready';
        repo.structure = repoStructure;
        repo.fileCount = chunks.length;
        await repo.save();
        // await cleanupRepo(targetPath);

    } catch (error) {
        console.error("Indexing Error:", error.message);
        await Repository.findOneAndUpdate({ url: repoUrl }, { indexingStatus: 'Failed' });
    }
};