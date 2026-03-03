import { Pinecone } from '@pinecone-database/pinecone';

if (!process.env.PINECONE_API_KEY) {
    throw new Error("❌ PINECONE_API_KEY is missing in .env file");
}
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const index = pc.index(process.env.PINECONE_INDEX);