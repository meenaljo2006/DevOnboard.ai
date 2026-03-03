import 'dotenv/config';

async function listModels() {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      throw new Error("Missing GOOGLE_GENAI_API_KEY in .env file");
    }

    console.log("🔍 Fetching available models for your API key...\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", data.error.message);
      return;
    }

    if (!data.models || data.models.length === 0) {
      console.log("⚠️ No models found for this key.");
      return;
    }

    const embeddingModels = data.models.filter(m =>
      m.supportedGenerationMethods.includes("embedContent")
    );

    const generationModels = data.models.filter(m =>
      m.supportedGenerationMethods.includes("generateContent")
    );

    console.log("✅ Generation Models:");
    generationModels.forEach(m => {
      console.log(`- ${m.name}`);
    });

    console.log("\n✅ Embedding Models:");
    embeddingModels.forEach(m => {
      console.log(`- ${m.name}`);
    });

  } catch (error) {
    console.error("❌ Connection Error:", error.message);
  }
}

listModels();