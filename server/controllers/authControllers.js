import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// User Registration Controller
export const register = async (req, res) => {
  try {
    console.log("📝 Registration attempt:", {
      email: req.body.email ? "provided" : "missing",
      username: req.body.username ? "provided" : "missing",
      password: req.body.password ? "provided" : "missing"
    });

    const { email, password, username } = req.body;

    // Validate required fields
    if (!email || !password || !username) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ 
        error: "Missing required fields",
        details: {
          email: !email ? "Email is required" : null,
          password: !password ? "Password is required" : null,
          username: !username ? "Username is required" : null
        }
      });
    }

    // Validate password length
    if (password.length < 6) {
      console.log("❌ Password too short");
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      console.log("❌ User already exists:", {
        email: existingUser.email === email,
        username: existingUser.username === username
      });
      return res.status(400).json({ 
        error: "User already exists",
        details: {
          email: existingUser.email === email ? "Email already in use" : null,
          username: existingUser.username === username ? "Username already taken" : null
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email,
      username,
      password: hashedPassword
    });

    // Save user to database
    await user.save();
    console.log("✅ User registered successfully:", { email, username });

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
        id: user._id,
        email: user.email,
        username: user.username
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

    // Check if article already exists
    const articleExists = user.savedArticles.some(
      savedArticle => savedArticle.url === article.url
    );

    if (articleExists) {
      console.log("❌ Article already saved:", article.url);
      return res.status(400).json({ error: "Article already saved" });
    }

    // Add savedAt timestamp
    const articleToSave = {
      ...article,
      savedAt: new Date(),
      publishedAt: article.publishedAt || new Date()
    };

    // Save article
    user.savedArticles.push(articleToSave);
    await user.save();

    console.log("✅ Article saved successfully:", {
      userId,
      articleUrl: article.url
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
