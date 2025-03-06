import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// User Registration Controller
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required (username, email, password)" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ error: "Username or Email already exists" });

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server error during registration", details: error.message });
  }
};

// User Login Controller
export const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: "Both email/username and password are required" });
    }

    const user = await User.findOne({ 
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }] 
    });

    if (!user) return res.status(400).json({ error: "Invalid credentials (user not found)" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials (wrong password)" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "48h" }
    );

    res.json({ token, userId: user._id, username: user.username });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error during login", details: error.message });
  }
};

// Protected Route Controller
export const protectedRoute = (req, res) => {
  try {
    res.json({ message: "You have accessed a protected route", username: req.user.username });
  } catch (error) {
    console.error("Protected Route Error:", error);
    res.status(500).json({ error: "Failed to access protected route", details: error.message });
  }
};
