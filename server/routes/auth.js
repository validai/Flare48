import express from "express";
import dotenv from "dotenv";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import { register, login, protectedRoute } from "../controllers/authControllers.js";

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
router.get("/google", (req, res, next) => {
  console.log("Google OAuth Login Attempted...");
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

// Google OAuth Callback Route
// Google OAuth Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    if (!req.user) {
      console.error("Authentication Failed: No user data received.");
      return res.redirect("/");
    }

    console.log("Google Authentication Success:", req.user);

    // Ensure CLIENT_URL exists, fallback to localhost dashboard
    const redirectURL = process.env.CLIENT_URL
      ? `${process.env.CLIENT_URL}/dashboard`
      : "http://localhost:5173/dashboard";

    console.log("Redirecting to:", redirectURL);
    res.redirect(redirectURL);
  }
);


export default router;

