import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

console.log("Initializing Google OAuth Strategy...");

// Debugging: Ensure required environment variables are loaded
if (!process.env.GOOGLE_CLIENT_ID) console.error("ERROR: GOOGLE_CLIENT_ID is missing.");
if (!process.env.GOOGLE_CLIENT_SECRET) console.error("ERROR: GOOGLE_CLIENT_SECRET is missing.");
if (!process.env.GOOGLE_REDIRECT_URI) console.error("ERROR: GOOGLE_REDIRECT_URI is missing.");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI, // Use correct redirect URI from .env
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile Retrieved:", profile);
        return done(null, profile);
      } catch (error) {
        console.error("Error in Google OAuth Strategy:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing User:", user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log("Deserializing User:", user);
  done(null, user);
});

export default passport;
