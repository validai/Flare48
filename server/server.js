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

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins temporarily for debugging
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization', 'Content-Length', 'X-Requested-With'],
  maxAge: 86400, // 24 hours in seconds
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

// Parse JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Express Session Setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true, // Required for secure cookies behind a proxy
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: 'none', // Required for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
  })
);

// 🔹 Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(async () => {
    console.log("✅ Connected to MongoDB successfully");
    
    // Drop the problematic index
    try {
      const User = mongoose.model('User');
      await User.collection.dropIndex('savedArticles.url_1');
      console.log("✅ Dropped problematic savedArticles.url index");
    } catch (err) {
      // Ignore if index doesn't exist
      if (err.code !== 27) {
        console.warn("Note: savedArticles.url index drop failed (this is okay if it didn't exist):", err.message);
      }
    }

    // Start server only after successful DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log("📍 Environment:", process.env.NODE_ENV);
      console.log("🛣️ Loaded Routes:", app._router.stack.filter(r => r.route).map(r => r.route.path));
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
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
  
  // Log all auth requests
  app.use("/auth", (req, res, next) => {
    console.log(`Auth Route Accessed: ${req.method} ${req.originalUrl}`, {
      headers: req.headers,
      body: req.body
    });
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
