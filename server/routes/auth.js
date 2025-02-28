import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// User Registration with Error Handling
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required (username, email, password)" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ error: "Username or Email already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(" Registration Error:", error);
    res.status(500).json({ error: "Server error during registration", details: error.message });
  }
});

// User Login with Better Error Messages
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: "Both email/username and password are required" });
    }

    // Find user by email or username
    const user = await User.findOne({ 
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }] 
    });

    if (!user) return res.status(400).json({ error: "Invalid credentials (user not found)" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials (wrong password)" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "48h" }
    );

    res.json({ token, userId: user._id, username: user.username });
  } catch (error) {
    console.error(" Login Error:", error);
    res.status(500).json({ error: "Server error during login", details: error.message });
  }
});

// Protected Route Example
router.get("/protected", verifyToken, (req, res) => {
  try {
    res.json({ message: "You have accessed a protected route", username: req.user.username });
  } catch (error) {
    console.error(" Protected Route Error:", error);
    res.status(500).json({ error: "Failed to access protected route", details: error.message });
  }
});

// Middleware to Verify Token with Error Handling
function verifyToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) {
    console.warn("⚠️ Unauthorized Access Attempt: Missing Token");
    return res.status(401).json({ error: "Access Denied: No token provided" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    console.error(" Invalid Token Error:", error);
    res.status(400).json({ error: "Invalid Token", details: error.message });
  }
}

export default router;

// The auth.js file contains the routes for user registration, user login, and a protected route that requires a valid JWT token. The protected route is a simple example to demonstrate how to create a route that requires authentication.
// Special error handling is added to provide detailed error messages for debugging and validation purposes.
// The verifyToken middleware function checks for a valid JWT token in the Authorization header and verifies it using the JWT_SECRET from the environment variables.
// The User model is imported from the models/User.js file to interact with the MongoDB User collection.
// The bcrypt library is used to hash passwords for secure storage and comparison during login.