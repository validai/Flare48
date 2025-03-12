import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// User Registration Controller
export const register = async (req, res) => {
  try {
    console.log("📝 Registration attempt:", {
      email: req.body.email ? "provided" : "missing",
      password: req.body.password ? "provided" : "missing"
    });

    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ 
        error: "Missing required fields",
        details: {
          email: !email ? "Email is required" : null,
          password: !password ? "Password is required" : null
        }
      });
    }

    // Validate password length
    if (password.length < 6) {
      console.log("❌ Password too short");
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("❌ User already exists:", {
        email: existingUser.email === email
      });
      return res.status(400).json({ 
        error: "User already exists",
        details: {
          email: existingUser.email === email ? "Email already in use" : null
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword
    });

    // Save user to database
    await user.save();
    console.log("✅ User registered successfully:", { email });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send success response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error("❌ Registration error:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: "Validation Error",
        details: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        error: "Duplicate field",
        details: {
          field: Object.keys(error.keyPattern)[0],
          message: `This ${Object.keys(error.keyPattern)[0]} is already taken`
        }
      });
    }

    // Generic error response
    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred during registration"
    });
  }
};

// User Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Both email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "Invalid credentials (user not found)" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials (wrong password)" });

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "48h" }
    );

    res.json({ 
      token, 
      user: {
        _id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error during login", details: error.message });
  }
};

// Protected Route Controller
export const protectedRoute = (req, res) => {
  try {
    res.json({ 
      message: "You have accessed a protected route",
      user: {
        _id: req.user._id,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error("Protected Route Error:", error);
    res.status(500).json({ error: "Failed to access protected route", details: error.message });
  }
};

export const saveArticle = async (req, res) => {
  try {
    console.log("📝 Saving article attempt:", {
      userId: req.body.userId,
      articleUrl: req.body.article?.url
    });

    const { userId, article } = req.body;

    // Validate input
    if (!userId || !article) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ 
        error: "Missing required fields",
        details: {
          userId: !userId ? "User ID is required" : null,
          article: !article ? "Article data is required" : null
        }
      });
    }

    // Validate article data
    if (!article.title || !article.url) {
      console.log("❌ Invalid article data");
      return res.status(400).json({
        error: "Invalid article data",
        details: {
          title: !article.title ? "Article title is required" : null,
          url: !article.url ? "Article URL is required" : null
        }
      });
    }

    // Find user and check if article already exists
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    // Normalize the URL before checking for duplicates
    const normalizedUrl = normalizeUrl(article.url);

    // Check if article already exists using normalized URL
    const articleExists = user.savedArticles.some(
      savedArticle => normalizeUrl(savedArticle.url) === normalizedUrl
    );

    if (articleExists) {
      console.log("❌ Article already saved:", normalizedUrl);
      return res.status(400).json({ error: "Article already saved" });
    }

    // Add savedAt timestamp and use normalized URL
    const articleToSave = {
      ...article,
      url: normalizedUrl, // Store the normalized URL
      savedAt: new Date(),
      publishedAt: article.publishedAt || new Date()
    };

    // Save article
    user.savedArticles.push(articleToSave);
    await user.save();

    console.log("✅ Article saved successfully:", {
      userId,
      articleUrl: normalizedUrl
    });

    res.status(200).json({ 
      message: "Article saved successfully",
      savedArticle: articleToSave,
      totalSaved: user.savedArticles.length
    });

  } catch (error) {
    console.error("❌ Error saving article:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: "Validation Error",
        details: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        error: "Duplicate article",
        message: "This article has already been saved"
      });
    }

    res.status(500).json({
      error: "Failed to save article",
      message: "An unexpected error occurred while saving the article"
    });
  }
};

const normalizeUrl = (url) => {
  try {
    // Remove query parameters and trailing slashes
    return url.split('?')[0].replace(/\/$/, '');
  } catch (e) {
    return url;
  }
};

export const removeArticle = async (req, res) => {
  try {
    console.log("🗑️ Removing article attempt:", {
      userId: req.body.userId,
      articleUrl: req.body.articleUrl
    });

    const { userId, articleUrl } = req.body;

    if (!userId || !articleUrl) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        error: "Missing required fields",
        details: {
          userId: !userId ? "User ID is required" : null,
          articleUrl: !articleUrl ? "Article URL is required" : null
        }
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    const normalizedUrlToRemove = normalizeUrl(articleUrl);
    const initialLength = user.savedArticles.length;

    user.savedArticles = user.savedArticles.filter((article) => 
      normalizeUrl(article.url) !== normalizedUrlToRemove
    );

    if (user.savedArticles.length === initialLength) {
      console.log("❌ Article not found:", normalizedUrlToRemove);
      return res.status(404).json({ error: "Article not found in saved articles" });
    }

    await user.save();

    console.log("✅ Article removed successfully:", {
      userId,
      articleUrl: normalizedUrlToRemove,
      remainingArticles: user.savedArticles.length
    });

    res.status(200).json({ 
      message: "Article removed successfully", 
      savedArticles: user.savedArticles 
    });
  } catch (error) {
    console.error("❌ Error removing article:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    res.status(500).json({ 
      error: "Failed to remove article", 
      details: error.message 
    });
  }
};
