import dotenv from "dotenv";
dotenv.config();  // Ensure environment variables load before anything else

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Debugging: Ensure required environment variables are loaded
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    throw new Error("Missing required Google OAuth environment variables.");
}

// Dynamically set the callback URL
const callbackURL = "https://flare48j451.onrender.com/auth/google/callback";


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Create new user if doesn't exist
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).slice(-4),
            profilePicture: profile.photos[0]?.value,
          });
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
passport.serializeUser((user, done) => {
  console.log("🔹 Serializing User:", user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log("🔹 Deserializing User:", user);
  done(null, user);
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

        // Ensure CLIENT_URL exists, fallback to localhost
        const redirectURL = process.env.CLIENT_URL || "http://localhost:5173/Home";
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
