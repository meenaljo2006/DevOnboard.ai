import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

async function listModels() {
    try {
        console.log("🔍 Fetching available models for your API key...");
        
        // Google SDK ka inbuilt method available models list karne ke liye
        // Hum fetch API use karenge kyunki SDK kabhi-kabhi limited list deta hai
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GENAI_API_KEY}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API Error:", data.error.message);
            return;
        }

        console.log("\n✅ Available Models:");
        const embeddingModels = data.models.filter(m => m.supportedGenerationMethods.includes('embedContent'));
        
        if (embeddingModels.length === 0) {
            console.log("⚠️ No embedding models found for this key!");
        } else {
            embeddingModels.forEach(m => {
                console.log(`- ${m.name} (Short name: ${m.name.split('/').pop()})`);
            });
        }

    } catch (error) {
        console.error("❌ Connection Error:", error.message);
    }
}

listModels();