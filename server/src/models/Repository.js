import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  indexingStatus: { 
    type: String, 
    default: 'Queued' 
  },
  structure: { type: Array, default: [] }, 
  vectorNamespace: { type: String }, 
  lastIndexed: { type: Date, default: Date.now },
  fileCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Repository', repositorySchema);