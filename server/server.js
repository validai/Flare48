import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import passport from "./config/passport.js";
import apiRoutes from "./routes/api.js";
import authRoutes from "./routes/auth.js";
import errorHandler from "./middleware/errorHandler.js";

// 🔹 Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables
dotenv.config();

// Ensure SESSION_SECRET is loaded
if (!process.env.SESSION_SECRET) {
  console.error("ERROR: SESSION_SECRET is missing in .env file.");
  process.exit(1);
} else {
  console.log("✅ SESSION_SECRET Loaded:", process.env.SESSION_SECRET);
}

// Setup Express Session for Authentication
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Store this in your .env file
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
      httpOnly: true, // Prevents client-side JS from accessing cookies
      sameSite: "none", // Required for cross-site authentication
    },
  })
);


console.log("Express Session Initialized with Secure Secret");


// 🔹 Debug: Check if .env file is loaded properly
console.log("Checking .env File...");
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "SESSION_SECRET"
];

let missingVars = [];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Warning: ${key} is NOT defined.`);
    missingVars.push(key);
  } else {
    console.log(`${key}: Loaded`);
  }
});

// 🔹 Exit if Required Variables Are Missing
if (missingVars.length) {
  console.error(`ERROR: Missing environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}

// 🔹 Middleware Setup
console.log("Initializing Middleware...");
app.use(cors({ origin: [process.env.CLIENT_URL, process.env.VITE_FRONTEND_URL], credentials: true }));
console.log("CORS Enabled");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("JSON Middleware Enabled");

// 🔹 Express Session Setup for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// 🔹 Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());
console.log("Passport.js Initialized");

// 🔹 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// 🔹 Debugging: Log Routes Being Loaded
console.log("Initializing API & Authentication Routes...");

// 🔹 Root Route
app.get("/", (_req, res) => {
  console.log("Root Route Accessed: GET /");
  res.send("Flare48 Server is Running!");
});

// 🔹 API & Authentication Routes
try {
  app.use("/api", (req, res, next) => {
    console.log(`API Route Accessed: ${req.method} ${req.originalUrl}`);
    next();
  }, apiRoutes);
  app.use("/auth", authRoutes);

  app.use("/api/auth", (req, res, next) => {
    console.log(`Auth Route Accessed: ${req.method} ${req.originalUrl}`);
    next();
  }, authRoutes);

  console.log("API & Auth Routes Initialized");
} catch (err) {
  console.error("Error Loading Routes:", err.message);
}

// 🔹 Route Not Found Handler
app.use("*", (req, res) => {
  console.warn(`Route Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Route Not Found", path: req.originalUrl });
});

// 🔹 Global Error Handling Middleware
app.use(errorHandler);

// 🔹 Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("Loaded Routes:", app._router.stack.filter(r => r.route).map(r => r.route.path));
});
