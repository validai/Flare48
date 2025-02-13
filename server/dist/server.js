import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
// Basic route
app.get('/', (_req, res) => {
    res.send('Flare48 Server is Running!');
});
// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
