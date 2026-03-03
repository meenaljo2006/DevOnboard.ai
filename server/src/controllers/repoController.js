import { cloneRepo, cleanupRepo } from '../lib/git-manager.js';
import { processDirectory } from '../lib/pre-processor.js';
import Repository from '../models/Repository.js';
import { generateEmbeddings } from '../config/google-ai.js';

export const indexRepository = async (req, res) => {
    const { repoUrl } = req.body;

    try {
        console.log(`🚀 Indexing started for: ${repoUrl}`);

        // 1. MongoDB Status Update
        const repo = await Repository.findOneAndUpdate(
            { url: repoUrl },
            { 
                name: repoUrl.split('/').pop(), 
                indexingStatus: 'Indexing' 
            },
            { upsert: true, returnDocument: 'after' } 
        );

        // 2. Git Clone
        const { targetPath } = await cloneRepo(repoUrl);

        // 3. File Processing & Chunking
        const chunks = await processDirectory(targetPath, repoUrl);
        
        if (!chunks || chunks.length === 0) {
            await cleanupRepo(targetPath);
            return res.status(400).json({ 
                success: false, 
                message: "No processable files found in the repository." 
            });
        }

        console.log(`🧠 Generating Embeddings for ${chunks.length} chunks...`);

        const vectors = [];
        
        // 4. Ingestion Loop (Generating Embeddings)
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            try {
                const embedding = await generateEmbeddings(chunk.pageContent);
                
                if (embedding && embedding.length > 0) {
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

                // Rate Limit Se Bachne ke liye break
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (chunkError) {
                console.error(`⚠️ Skipping chunk in ${chunk.metadata.fileName}:`, chunkError.message);
                continue; 
            }
        }

        // 5. Pinecone REST API Upsert (THE ULTIMATE FIX)
        if (vectors.length > 0) {
            console.log(`📤 Sending ${vectors.length} vectors via REST API to Pinecone...`);
            
            const response = await fetch(`${process.env.PINECONE_HOST}/vectors/upsert`, {
                method: 'POST',
                headers: {
                    'Api-Key': process.env.PINECONE_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    vectors: vectors // Pure JSON structure
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(`Pinecone API Error: ${result.message || response.statusText}`);
            }
            
            console.log("✅ Pinecone Upsert Successful!");
        } else {
            throw new Error("No vectors were generated successfully.");
        }

        // 6. Mark as Ready in MongoDB
        repo.indexingStatus = 'Ready';
        repo.fileCount = chunks.length;
        await repo.save();

        // 7. Cleanup Temporary Files
        await cleanupRepo(targetPath);
        
        console.log(`✅ Success: ${repo.name} is now searchable!`);

        res.status(200).json({ 
            success: true, 
            message: "Indexing and Vectorization complete!", 
            chunksCount: chunks.length 
        });

    } catch (error) {
        console.error("❌ Indexing Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};