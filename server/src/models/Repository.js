import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  indexingStatus: { 
    type: String, 
    enum: ['Queued', 'Indexing', 'Ready', 'Failed'], 
    default: 'Queued' 
  },
  vectorNamespace: { type: String }, // Used to isolate this repo in Pinecone
  lastIndexed: { type: Date, default: Date.now },
  fileCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Repository', repositorySchema);