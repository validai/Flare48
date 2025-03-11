import express from "express";
import dotenv from "dotenv";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import { register, login, protectedRoute, saveArticle, removeArticle } from "../controllers/authControllers.js";

dotenv.config();
const router = express.Router();

console.log("Auth API is running...");

// Base Route - Health Check
router.get("/", (_req, res) => {
  res.json({ message: "Auth API is working!" });
});

// User Registration & Login Routes
router.post("/register", register);
router.post("/login", login);
router.get("/protected", verifyToken, protectedRoute);

router.post("/saveArticle", saveArticle)

router.post("/removeArticle", removeArticle)

// Middleware to Verify JWT Token
function verifyToken(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    console.warn("Access Denied: No Token Provided");
    return res.status(401).json({ error: "Access Denied: No Token provided" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    console.error("Invalid Token Error:", error);
    res.status(400).json({ error: "Invalid Token", details: error.message });
  }
}

// Google OAuth Login Route
router.get("/google", passport.authenticate("google", { 
  scope: ["profile", "email"],
  prompt: "select_account"
}));

// Google OAuth Callback Route
router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("Received Google callback with query:", req.query);
    next();
  },
  passport.authenticate("google", { 
    failureRedirect: "https://flare48.onrender.com/?error=auth_failed",
    session: false 
  }),
  (req, res) => {
    try {
      console.log("Google auth successful, user data:", req.user);

      if (!req.user || !req.user.user) {
        console.error("Missing user data in request");
        return res.redirect("https://flare48.onrender.com/?error=missing_user_data");
      }

      const { user, token } = req.user;

      // Create the redirect URL with token and user data
      const redirectURL = new URL("/news", "https://flare48.onrender.com");
      redirectURL.searchParams.append("token", token);
      redirectURL.searchParams.append("userId", user._id);
      redirectURL.searchParams.append("username", user.username);
      redirectURL.searchParams.append("email", user.email);

      console.log("Redirecting to:", redirectURL.toString());
      res.redirect(redirectURL.toString());
    } catch (error) {
      console.error("Error in Google callback handler:", error);
      res.redirect("https://flare48.onrender.com/?error=server_error");
    }
  }
);

export default router;

