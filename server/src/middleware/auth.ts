import { Request, Response, NextFunction } from "express";
import { getSessionByToken, isSessionExpired } from "../models/session";
import { getUserById, User } from "../models/user";

export interface AuthRequest extends Request {
  user?: User;
  sessionToken?: string;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const cookieToken =
    req.cookies?.[process.env.SESSION_COOKIE_NAME || "session_token"];
  const token = cookieToken;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const session = await getSessionByToken(token);
  if (!session || isSessionExpired(session)) {
    res.status(401).json({ error: "Session expired or invalid" });
    return;
  }
  const user = await getUserById(session.userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  (req as AuthRequest).user = user;
  (req as AuthRequest).sessionToken = token;
  next();
}
