import { generateEmbeddings } from '../config/google-ai.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Message from '../models/Message.js'; 
import Repository from '../models/Repository.js'; 

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

// Source Citations and Context-Aware Augmented Prompting

export const askQuestion = async (req, res) => {
    const { question, repoUrl } = req.body;

    try {
        console.log(`🔍 Processing question for repo: ${repoUrl}`);

        // 0. Database se Repository dhoondho
        const repo = await Repository.findOne({ url: repoUrl });
        if (!repo) {
            return res.status(404).json({ success: false, message: "Repository not found in DB. Please index it first." });
        }

        // 1. Fetch History - Last 6 messages (Conversation Memory)
        const historyDocs = await Message.find({ repository: repo._id })
            .sort({ timestamp: -1 })
            .limit(6);
        
        // History ko seedha (chronological) order mein karo
        const history = historyDocs.reverse().map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

        // 2. User ke sawal ka Embedding banao (3072 dimensions)
        const queryVector = await generateEmbeddings(question);

        // 3. Pinecone Semantic Search (Code Context Retrieval)
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
        
        // FEATURE 1: Metadata Mapping (File Names + Line Numbers)
        const citations = queryResult.matches?.map(match => ({
            fileName: match.metadata.fileName,
            lines: match.metadata.snippet || "Lines not specified", 
            score: match.score 
        })) || [];

        // Context block for LLM
        const context = queryResult.matches?.length > 0 
            ? queryResult.matches.map(match => `FILE: ${match.metadata.fileName} (${match.metadata.snippet})\nCONTENT: ${match.metadata.text}`).join("\n\n---\n\n")
            : "No specific code context found in the vector database.";

        // 4. Gemini 2.5 Flash Call with Augmented Prompting
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

        // FEATURE 2: Senior Architect Roleplay & Instruction Enforcement
        const prompt = `
            ROLE: You are "DevOnboard AI", a world-class Senior Software Architect. 
            Your task is to help a developer understand this codebase using the provided context and history.

            ---
            RECENT CHAT HISTORY:
            ${history || "No previous conversation history."}
            ---
            CODE CONTEXT FROM PINECONE (Relevant Snippets):
            ${context}
            ---

            USER QUESTION: 
            ${question}

            STRICT INSTRUCTIONS:
            1. BASE TRUTH: Answer strictly based on the provided Code Context. 
            2. CITATIONS: For every technical explanation, explicitly mention the file name and the line range (e.g., "In main.js (Lines 10-25)...").
            3. NO HALLUCINATION: If the answer is not in the context, say: "Bhai, is specific part ka data mere paas abhi nahi hai."
            4. STYLE: Professional, concise, and helpful. Use Markdown for code blocks.
            5. STRUCTURE: Give a brief summary first, followed by a technical deep-dive with citations.

            Final Technical Answer:
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 5. SAVE TO MONGODB (Persistence)
        await Message.create([
            { repository: repo._id, role: 'user', content: question },
            { repository: repo._id, role: 'assistant', content: responseText }
        ]);

        console.log("✅ Chat Response Generated with Citations!");
        
        // 6. Return Response + Sources for Frontend UI
        res.status(200).json({ 
            success: true, 
            answer: responseText,
            sources: citations 
        });

    } catch (error) {
        console.error("❌ Chat Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Chat History Fetching Route
export const getChatHistory = async (req, res) => {
    const { repoUrl } = req.query;
    try {
        const repo = await Repository.findOne({ url: repoUrl });
        if (!repo) return res.status(404).json({ success: false, message: "Repository not found" });

        const messages = await Message.find({ repository: repo._id }).sort({ timestamp: 1 });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};