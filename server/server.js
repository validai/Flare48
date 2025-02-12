import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Fix `__dirname` for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 6000;

// Serve static files from the "client" directory
app.use(express.static(path.join(__dirname, "../client")));

// Handle all routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
