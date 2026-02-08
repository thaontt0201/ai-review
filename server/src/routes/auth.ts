import express from "express";
import passport from "passport";
import { AuthRequest } from "../middleware/auth";
import { createOrUpdateSession, deleteSession } from "../models/session";

const router = express.Router();

// Route to start Google auth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    const user = (req as AuthRequest).user;
    if (!user) return res.status(500).send("Auth failed");
    const sessionDuration = Number(process.env.SESSION_DURATION_HOURS || 1);
    const sessionObj = await createOrUpdateSession(user.id, sessionDuration);
    const cookieName = process.env.SESSION_COOKIE_NAME || "session_token";
    res.cookie(cookieName, sessionObj.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.redirect("/");
  },
);

// Logout
router.post("/logout", async (req, res) => {
  const cookieName = process.env.SESSION_COOKIE_NAME || "session_token";
  const token = req.cookies?.[cookieName];
  if (token) await deleteSession(token);
  res.clearCookie(cookieName);
  res.json({ ok: true });
});

export default router;
