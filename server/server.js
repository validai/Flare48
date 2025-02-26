import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import apiRoutes from './routes/api.js' ;

// Load environment variables 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI is not defined in .env file");
    process.exit(1);
  }
  
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Basic route
app.get('/', (_req, res) => {
    res.send('Flare48 Server is Running!');
});

// API root route
app.get('/api', (_req, res) => {
    res.json({ message: "API root is working!" });
});

// Test API route
app.get('/api/test', (_req, res) => {
    res.json({ message: "API is working!" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
