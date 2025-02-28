import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import apiRoutes from "./routes/api.js";
import authRoutes from "./routes/auth.js";

// Load environment variables from .env
dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 3000;

// Debug: Log loaded environment variables
console.log("🔍 Loaded Environment Variables:");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Loaded" : "❌ Not Found");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Loaded" : "❌ Not Found");

// Ensure Required Environment Variables Are Loaded
if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing in .env file.");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is missing in .env file.");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with Improved Error Handling
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// Debugging: Log Routes are Being Loaded
console.log("🔄 Initializing API & Authentication Routes");

// Basic Route
app.get("/", (_req, res) => {
  res.send("🚀 Flare48 Server is Running!");
});

// API & Authentication Routes
try {
  app.use("/api", apiRoutes);
  app.use("/auth", authRoutes);
  console.log("✅ API & Auth Routes Initialized");
} catch (err) {
  console.error("❌ Error Loading Routes:", err.message);
}

// Route Not Found Handler
app.use("*", (req, res) => {
  console.warn(`⚠️ Route Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Route Not Found", path: req.originalUrl });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Global Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


// The server.js file is the main entry point for the Node.js server application. It loads environment variables, sets up middleware, connects to MongoDB, defines routes, and starts the server.
// The dotenv package is used to load environment variables from a .env file.
// The express package is used to create the server and handle HTTP requests.
// The cors package is used to enable Cross-Origin Resource Sharing (CORS) for the server.