import express from "express";
import dotenv from "dotenv";
import passport from "../config/passport.js";
import { register, login, protectedRoute } from "../controllers/authControllers.js";

dotenv.config();
const router = express.Router();

// Base route to check if auth API is reachable!
router.get("/", (req, res) => {
  res.json({ message: "Auth API is working!" });
});

// User Registration Route (Moved to Controller)
router.post("/register", register);

// User Login Route (Moved to Controller)
router.post("/login", login);

// Protected Route (Moved to Controller)
router.get("/protected", verifyToken, protectedRoute);

// Middleware to Verify Token
function verifyToken(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access Denied: No token provided" });
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
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
      res.json({ message: "Google Authentication Successful", user: req.user });
  }
);

export default router;

// The auth.js file contains the routes for user registration, user login, and a protected route that requires a valid JWT token. The protected route is a simple example to demonstrate how to create a route that requires authentication.
// Special error handling is added to provide detailed error messages for debugging and validation purposes.
// The verifyToken middleware function checks for a valid JWT token in the Authorization header and verifies it using the JWT_SECRET from the environment variables.
// The User model is imported from the models/User.js file to interact with the MongoDB User collection.