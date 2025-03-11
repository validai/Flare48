import dotenv from "dotenv";
dotenv.config();  // Ensure environment variables load before anything else

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Debugging: Ensure required environment variables are loaded
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("Missing required Google OAuth environment variables.");
    throw new Error("Missing required Google OAuth environment variables.");
}

// Dynamically set the callback URL
const callbackURL = "https://flare48-j45i.onrender.com/auth/google/callback";

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
      scope: ['profile', 'email'],
      state: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile);
        
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Create new user if doesn't exist
          try {
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).slice(-4),
              profilePicture: profile.photos[0]?.value,
            });
          } catch (createError) {
            console.error("Error creating user:", createError);
            return done(createError, null);
          }
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: user._id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: "48h" }
        );

        return done(null, { user, token });
      } catch (error) {
        console.error("Google Auth Error:", error);
        return done(error, null);
      }
    }
  )
);

// Properly Serialize & Deserialize User Sessions
passport.serializeUser((userData, done) => {
  console.log("🔹 Serializing User:", userData);
  done(null, userData);
});

passport.deserializeUser((userData, done) => {
  console.log("🔹 Deserializing User:", userData);
  done(null, userData);
});

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

        // Get the base client URL
        const baseClientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        
        // Include token and user data in the redirect URL
        const token = req.user.token;
        const userData = {
            _id: req.user.user._id,
            username: req.user.user.username,
            email: req.user.user.email
        };
        
        // Create the redirect URL with token and encoded user data
        const redirectURL = `${baseClientUrl}/news?token=${token}&userData=${encodeURIComponent(JSON.stringify(userData))}`;
        
        console.log("Redirecting to:", redirectURL);
        res.redirect(redirectURL);
    }
);

// Logout Route
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Error logging out:", err);
            return res.status(500).send("Logout error");
        }
        console.log("User logged out!");
        res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
    });
});

export default passport;
