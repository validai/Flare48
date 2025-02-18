import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001; // Change the port to avoid conflict
// Middleware
app.use(cors());
app.use(express.json());
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
