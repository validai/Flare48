import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
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

// Request timeout middleware
const timeout = (req, res, next) => {
  res.setTimeout(30000, () => {
    console.error('Request timeout');
    res.status(408).send('Request timeout');
  });
  next();
};

app.use(timeout);

// CORS configuration
app.use(cors({
  origin: ["https://flare48.onrender.com", "http://localhost:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

// Increase payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🔹 Express Session with MongoDB Setup
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Secure session secret
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // MongoDB connection string
      collectionName: "sessions", // Collection name for storing sessions
      ttl: 14 * 24 * 60 * 60, // Session expires in 14 days
      autoRemove: "native", // Automatically remove expired sessions
    }),
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true, 
      sameSite: "none", 
      maxAge: 24 * 60 * 60 * 1000, // 24 hours session expiry
    },
  })
);

// 🔹 Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection with optimized settings
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
  })
  .then(async () => {
    console.log("✅ Connected to MongoDB successfully");
    
    try {
      const User = mongoose.model('User');
      await User.collection.dropIndex('savedArticles.url_1');
      console.log("✅ Dropped problematic savedArticles.url index");
    } catch (err) {
      if (err.code !== 27) {
        console.warn("Note: savedArticles.url index drop failed:", err.message);
      }
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log("📍 Environment:", process.env.NODE_ENV);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", {
      name: err.name,
      message: err.message,
      code: err.code
    });
    process.exit(1);
  });

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// API Routes with error handling
app.use("/api", (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  next();
}, apiRoutes);

app.use("/auth", (req, res, next) => {
  console.log(`Auth Request: ${req.method} ${req.originalUrl}`, {
    userId: req.body?.userId || req.params?.userId,
    hasToken: !!req.headers.authorization
  });
  next();
}, authRoutes);

// 404 Handler
app.use("*", (req, res) => {
  console.warn(`404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: "Route Not Found",
    path: req.originalUrl,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", {
    path: req.originalUrl,
    method: req.method,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    path: req.originalUrl,
    method: req.method
  });
});
