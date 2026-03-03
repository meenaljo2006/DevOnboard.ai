import { generateEmbeddings } from '../config/google-ai.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

export const askQuestion = async (req, res) => {
    const { question, repoUrl } = req.body;

    try {
        console.log(`🔍 Processing question for repo: ${repoUrl}`);

        // 1. Question Embedding (3072 dimensions)
        const queryVector = await generateEmbeddings(question);

        // 2. Pinecone Semantic Search
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
        
        if (!queryResult.matches || queryResult.matches.length === 0) {
            return res.status(200).json({ 
                success: true, 
                answer: "Bhai, is codebase mein mujhe isse related kuch nahi mila. Kya aap kuch aur poochna chahenge?" 
            });
        }

        // 3. Context 
        const context = queryResult.matches
            .map(match => `File: ${match.metadata.fileName}\nCode: ${match.metadata.text}`)
            .join("\n\n---\n\n");

        // 4. Gemini LLM Call
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

        const prompt = `
            You are "DevOnboard AI", a world-class Software Engineer and Technical Architect.
            Your goal is to help a developer understand this codebase using the provided snippets.

            ---
            CODE CONTEXT FROM PINECOE:
            ${context}
            ---

            USER QUESTION: 
            ${question}

            INSTRUCTIONS:
            1. ANALYZE: First, look at the file names and imports in the context to understand the project's architecture (e.g., Is it MVC? Is it a MERN stack?).
            2. NO README CASE: If a README is not provided in the context, infer the project's purpose from 'package.json' dependencies or main entry points like 'index.js' or 'app.js'.
            3. ACCURACY: Answer ONLY based on the provided context. If the information is missing, say: "Bhai, is specific part ka code mere paas abhi nahi hai. Kya aap kisi aur file ya logic ke baare mein poochna chahenge?"
            4. STYLE: Keep the tone professional yet helpful. Use Markdown for code blocks.
            5. EXPLAIN 'WHY': Don't just say what the code does; explain WHY it is written that way if the context allows.

            Final Answer:
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log("✅ Chat Response Generated!");
        res.status(200).json({ success: true, answer: responseText });

    } catch (error) {
        console.error("❌ Chat Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};