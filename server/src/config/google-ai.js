import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

export const generateEmbeddings = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001"});
        const result = await model.embedContent(text);
        
        if (result && result.embedding && result.embedding.values) {
            return result.embedding.values;
        }
        throw new Error("Invalid embedding response from Google");
    } catch (error) {
        console.error("❌ Embedding Error inside config:", error.message);
        throw error;
    }
};