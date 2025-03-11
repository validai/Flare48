import dotenv from "dotenv";
dotenv.config();  // Ensure environment variables load before anything else

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import express from "express";

const router = express.Router();

// Debugging: Ensure required environment variables are loaded
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    throw new Error("Missing required Google OAuth environment variables.");
}

// Dynamically set the callback URL
const callbackURL = process.env.GOOGLE_REDIRECT_URI;


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI, // Ensure this matches Google Cloud
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Google Profile Retrieved:", profile);
      console.log("Access Token:", accessToken);
      console.log("Refresh Token:", refreshToken);
      return done(null, profile);
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
        const redirectURL = process.env.CLIENT_URL || "http://localhost:5173/dashboard";
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
