import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

dotenv.config();

const router = express.Router();

// Verify required environment variables
const requiredVars = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "JWT_SECRET"];
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Create new user if they don't exist
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName,
            profilePicture: profile.photos[0].value
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Return both user and token
        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
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
