import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";


if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
  throw new Error("Missing required Google OAuth environment variables.");
}


const callbackURL =
  process.env.NODE_ENV === "production"
    ? process.env.GOOGLE_REDIRECT_URI
    : "http://localhost:3000/auth/google/callback";

console.log("Using callback URL:", callbackURL);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
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
