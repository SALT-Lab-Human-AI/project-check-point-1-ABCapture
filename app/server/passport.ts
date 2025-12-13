import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// Serialize user for session
passport.serializeUser((user: Express.User, done) => {
  try {
    const userId = (user as User).id;
    console.log('[Passport] Serializing user:', userId);
    done(null, userId);
  } catch (error) {
    console.error('[Passport] Serialize error:', error);
    done(error as Error);
  }
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    console.log('[Passport] Deserializing user:', id);
    const user = await storage.getUser(id);
    if (!user) {
      console.error('[Passport] User not found during deserialization:', id);
      return done(null, false);
    }
    console.log('[Passport] User deserialized successfully:', user.id);
    done(null, user);
  } catch (error) {
    console.error('[Passport] Deserialize error:', error);
    done(error as Error, null);
  }
});

// Local Strategy (Email/Password)
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await storage.authenticateUser(email, password);
        
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth Strategy (only if credentials are configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('[Passport] Google OAuth configured - enabling Google login');
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5050/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile: GoogleProfile, done) => {
        console.log('[GoogleStrategy] OAuth callback received for profile:', profile.id);
        
        try {
          // Extract user information from Google profile
          const email = profile.emails?.[0]?.value;
          const displayName = profile.displayName;
          const firstName = profile.name?.givenName;
          const lastName = profile.name?.familyName;
          
          console.log('[GoogleStrategy] Extracted email:', email);
          console.log('[GoogleStrategy] Display name:', displayName);
          
          if (!email) {
            console.error('[GoogleStrategy] No email found in Google profile');
            return done(new Error("No email found in Google profile"), undefined);
          }

          // Default role for new OAuth users - you can customize this
          // For now, we'll default to "teacher" but you might want to add a role selection step
          const defaultRole = "teacher";

          console.log('[GoogleStrategy] Creating or updating user...');
          
          // Create or update user with Google OAuth
          const user = await storage.createOrUpdateGoogleUser(
            {
              googleId: profile.id,
              email,
              displayName,
              firstName,
              lastName,
            },
            defaultRole
          );

          console.log('[GoogleStrategy] User created/updated successfully:', user.id);
          return done(null, user);
        } catch (error) {
          console.error('[GoogleStrategy] Error in verify callback:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  console.log('[Passport] Google OAuth not configured - Google login disabled');
  console.log('[Passport] To enable, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
}

export default passport;
