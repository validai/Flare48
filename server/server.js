import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import apiRoutes from "./routes/api.js";
import authRoutes from "./routes/auth.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure Environment Variables Are Loaded
if (!process.env.MONGO_URI) {
    console.error(" Error: MONGO_URI is not defined in .env file.");
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error(" Error: JWT_SECRET is not defined in .env file.");
    process.exit(1);
}

// MongoDB Connection with Enhanced Error Logging
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log(" MongoDB connected successfully"))
    .catch(err => {
        console.error(" MongoDB connection error:", err.message);
        process.exit(1);
    });

// Basic Route
app.get("/", (_req, res) => {
    res.send(" Flare48 Server is Running!");
});

// Debugging: Check if Routes Are Loaded
console.log("✅ API routes and authentication routes are being initialized");

// API & Authentication Routes
try {
    app.use("/api", apiRoutes);
    app.use("/api/auth", authRoutes);
} catch (err) {
    console.error(" Error loading routes:", err.message);
}

// Route Not Found Handler (For Debugging 404 Errors)
app.use((req, res, next) => {
    console.warn(`⚠️ 404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: "Route Not Found", path: req.originalUrl });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(" Global Server Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// The server.js file is the main entry point for the Node.js server application. It loads environment variables, sets up middleware, connects to MongoDB, defines routes, and starts the server.
// The dotenv package is used to load environment variables from a .env file.
// The express package is used to create the server and handle HTTP requests.
// The cors package is used to enable Cross-Origin Resource Sharing (CORS) for the server.