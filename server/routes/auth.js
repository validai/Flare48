import express from "express";
import dotenv from "dotenv";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import { register, login, protectedRoute, saveArticle, removeArticle } from "../controllers/authControllers.js";
import User from "../models/User.js";

dotenv.config();
const router = express.Router();

console.log("Auth API is running...");

// Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log("❌ No token provided in request");
      return res.status(401).json({ error: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("❌ Token verification failed:", err.message);
        return res.status(401).json({ error: "Invalid token" });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("❌ Error in token verification:", error);
    res.status(500).json({ error: "Internal server error during token verification" });
  }
};

// ✅ Environment Variables for Configuration
const CLIENT_URL = process.env.CLIENT_URL || "http//:localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// ✅ Base Route - Health Check
router.get("/", (_req, res) => {
  res.json({ message: "Auth API is working!" });
});

// ✅ User Authentication Routes
router.post("/register", register);
router.post("/login", login);
router.get("/protected", verifyToken, protectedRoute);

// ✅ Article Management Routes
router.post("/saveArticle", verifyToken, saveArticle);
router.post("/removeArticle", verifyToken, removeArticle);

// ✅ Google OAuth Login Route
router.get("/google", passport.authenticate("google", { 
  scope: ["profile", "email"],
  prompt: "select_account"
}));

// ✅ Google OAuth Callback Route
router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("Received Google callback with query:", req.query);
    next();
  },
  passport.authenticate("google", { 
    failureRedirect: `${CLIENT_URL}/?error=auth_failed`,
    session: false 
  }),
  (req, res) => {
    try {
      console.log("✅ Google auth successful, user data:", req.user);

      if (!req.user || !req.user.user) {
        console.error("❌ Missing user data in request");
        return res.redirect(`${CLIENT_URL}/?error=missing_user_data`);
      }

      const { user, token } = req.user;

      // Create the redirect URL with token and user data
      const redirectURL = new URL("/news", CLIENT_URL);
      redirectURL.searchParams.append("token", token);
      redirectURL.searchParams.append("userId", user._id);
      redirectURL.searchParams.append("email", user.email);

      console.log("✅ Redirecting to:", redirectURL.toString());
      res.redirect(redirectURL.toString());
    } catch (error) {
      console.error("❌ Error in Google callback handler:", error);
      res.redirect(`${CLIENT_URL}/?error=server_error`);
    }
  }
);

// ✅ Get saved articles for a user
router.get("/saved-articles/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify that the token's user matches the requested userId
    if (req.user._id !== userId) {
      console.log("❌ Unauthorized access attempt:", { tokenUserId: req.user._id, requestedUserId: userId });
      return res.status(403).json({ error: "Unauthorized access to user's saved articles" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ savedArticles: user.savedArticles });
  } catch (error) {
    console.error("❌ Error fetching saved articles:", error);
    res.status(500).json({ error: "Failed to fetch saved articles", details: error.message });
  }
});

export default router;


