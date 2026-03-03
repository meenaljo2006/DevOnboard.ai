// 1. IMPORT DOTENV FIRST
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// 2. IMPORT DB CONFIG & ROUTES
import connectDB from './config/mongodb.js';
import repoRoutes from './routes/repoRoutes.js';

// 3. INITIALIZE DB CONNECTION
connectDB();

const app = express();

// 4. MIDDLEWARE (Order matters)
app.use(helmet()); 
app.use(cors());   
app.use(morgan('dev')); 
app.use(express.json()); // Essential for parsing repo URLs in POST requests

// 5. MOUNT ROUTES
app.use('/api/repo', repoRoutes);

// 6. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 DevOnboard.ai Server running on http://localhost:${PORT}`);
});