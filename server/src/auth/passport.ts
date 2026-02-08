import passport from "passport";
import { findOrCreateUserByGoogleId, getUserById } from "../models/user";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export default function initPassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value || "";
          const name = profile.displayName || "";
          const user = await findOrCreateUserByGoogleId(googleId, email, name);
          done(null, user);
        } catch (err) {
          done(err as any);
        }
      },
    ),
  );
  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const u = await getUserById(id);
    done(null, u || null);
  });
}
