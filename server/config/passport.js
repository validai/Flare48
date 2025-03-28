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
      callbackURL: "https://flare48.onrender.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            profilePicture: profile.photos[0].value
          });
        }

        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

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

        const baseClientUrl = process.env.CLIENT_URL || "http://localhost:5173";

        const token = req.user.token;
        const userData = {
            _id: req.user.user._id,
            email: req.user.user.email
        };

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
