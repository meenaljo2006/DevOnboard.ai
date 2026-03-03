import { generateEmbeddings } from '../config/google-ai.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Message from '../models/Message.js'; 
import Repository from '../models/Repository.js'; 

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

export const askQuestion = async (req, res) => {
    const { question, repoUrl } = req.body;

    try {
        console.log(`🔍 Processing question for repo: ${repoUrl}`);

        // 0. search repo from db
        const repo = await Repository.findOne({ url: repoUrl });
        if (!repo) {
            return res.status(404).json({ success: false, message: "Repository not found in DB" });
        }

        // 1. fetch the history - last 6 msges
        const historyDocs = await Message.find({ repository: repo._id })
            .sort({ timestamp: -1 })
            .limit(6);
        
        // History - Chronological order
        const history = historyDocs.reverse().map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

        // 2. Question Embedding (3072 dimensions)
        const queryVector = await generateEmbeddings(question);

        // 3. Pinecone Semantic Search
        const queryResponse = await fetch(`${process.env.PINECONE_HOST}/query`, {
            method: 'POST',
            headers: {
                'Api-Key': process.env.PINECONE_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vector: queryVector,
                topK: 5,
                includeMetadata: true
            })
        });

        const queryResult = await queryResponse.json();
        
        const context = queryResult.matches?.length > 0 
            ? queryResult.matches.map(match => `File: ${match.metadata.fileName}\nCode: ${match.metadata.text}`).join("\n\n---\n\n")
            : "No specific code context found.";

        // 4. Gemini LLM Call with History
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

        const prompt = `
            You are "DevOnboard AI", a world-class Software Engineer.
            Use the Chat History and Code Context to answer the user's question.

            ---
            RECENT CHAT HISTORY:
            ${history || "No previous conversation."}
            ---
            CODE CONTEXT FROM PINECOE:
            ${context}
            ---

            USER QUESTION: 
            ${question}

            INSTRUCTIONS:
            1. Use the history to understand what the user is referring to (like "this file" or "that function").
            2. If README is missing, infer purpose from package.json or main entry points.
            3. Answer ONLY based on context. If unknown, say: "Bhai, iska data mere paas nahi hai."
            4. Keep it professional but helpful. Use Markdown.

            Final Answer:
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 5. SAVE TO DB 
        await Message.create([
            { repository: repo._id, role: 'user', content: question },
            { repository: repo._id, role: 'assistant', content: responseText }
        ]);

        console.log("✅ Chat Response Generated and Saved!");
        res.status(200).json({ success: true, answer: responseText });

    } catch (error) {
        console.error("❌ Chat Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getChatHistory = async (req, res) => {
    const { repoUrl } = req.query;
    try {
        const repo = await Repository.findOne({ url: repoUrl });
        if (!repo) return res.status(404).json({ success: false, message: "Repo not found" });

        const messages = await Message.find({ repository: repo._id }).sort({ timestamp: 1 });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};