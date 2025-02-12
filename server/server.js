import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 6000;

// Serve static files from client folder
app.use(express.static(path.join(__dirname, "../client")));

// Handle routes
app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
