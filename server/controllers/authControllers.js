import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// User Registration Controller
export const register = async (req, res) => {
  console.log("📩 Incoming Request Headers:", req.headers);
  console.log("📩 Incoming Request Body:", req.body);

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or not parsed" });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required (username, email, password)" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ error: "Username or Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "48h" }
    );

    // Return user data and token
    res.status(201).json({ 
      message: "User registered successfully",
      token,
      userId: newUser._id,
      username: newUser.username
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ error: "Server error during registration", details: error.message });
  }
};

// User Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Both email/username and password are required" });
    }

    const user = await User.findOne({ email: email });

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

export const saveArticle = async (req, res) => {
  try {
    const { userId, article } = req.body; 

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.savedArticles.some((savedArticle) => savedArticle.url === article.url)) {
      return res.status(400).json({ error: "Article already saved" });
    }

    user.savedArticles.push(article);
    await user.save();

    res.status(200).json({ message: "Article saved successfully", savedArticles: user.savedArticles });
  } catch (error) {
    console.error("Error saving article:", error);
    res.status(500).json({ error: "Failed to save article", details: error.message });
  }
};

export const removeArticle = async (req, res) => {
  try {
    const { userId, articleUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.savedArticles = user.savedArticles.filter((article) => article.url !== articleUrl);
    await user.save();

    res.status(200).json({ message: "Article removed successfully", savedArticles: user.savedArticles });
  } catch (error) {
    console.error("Error removing article:", error);
    res.status(500).json({ error: "Failed to remove article", details: error.message });
  }
};
