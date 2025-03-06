import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import passport from "./config/passport.js";
import apiRoutes from "./routes/api.js";
import authRoutes from "./routes/auth.js";
import errorHandler from './middleware/errorHandler.js';

// Load environment variables from .env
dotenv.config({ path: "./.env" });

// Debug: Check if .env loaded properly
console.log("Checking .env File...");
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) console.warn(`Warning: ${key} is not defined.`);
});

console.log("Loaded Environment Variables:");
requiredEnvVars.forEach((key) => {
  console.log(`${key}:`, process.env[key] ? "Loaded" : "Not Found");
});

// Ensure Required Environment Variables Are Loaded
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`ERROR: ${key} is missing in .env file.`);
    process.exit(1);
  }
}

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Setup
console.log("Initializing Middleware...");
app.use(cors());
console.log("CORS Enabled");
app.use(express.json());
console.log("JSON Middleware Enabled");

// Express Session Setup for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" }, // Secure cookies in production
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
console.log("Passport.js Initialized");

// MongoDB Connection
console.log("Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// Debugging: Log Routes Being Loaded
console.log("Initializing API & Authentication Routes...");

// Root Route
app.get("/", (_req, res) => {
  console.log("Root Route Accessed: GET /");
  res.send("Flare48 Server is Running!");
});

// API & Authentication Routes
try {
  app.use("/api", (req, res, next) => {
    console.log(`API Route Accessed: ${req.method} ${req.originalUrl}`);
    next();
  }, apiRoutes);

  app.use("/auth", (req, res, next) => {
    console.log(`Auth Route Accessed: ${req.method} ${req.originalUrl}`);
    next();
  }, authRoutes);

  console.log("API & Auth Routes Initialized");
} catch (err) {
  console.error("Error Loading Routes:", err.message);
}

// Route Not Found Handler
app.use("*", (req, res) => {
  console.warn(`Route Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Route Not Found", path: req.originalUrl });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(errorHandler);

// The server.js file is the main entry point for the Node.js server application. It loads environment variables, sets up middleware, connects to MongoDB, defines routes, and starts the server.
// The dotenv package is used to load environment variables from a .env file.
// The express package is used to create the server and handle HTTP requests.
// The cors package is used to enable Cross-Origin Resource Sharing (CORS) for the server.