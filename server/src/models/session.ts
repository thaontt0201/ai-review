import z from "zod";
import { pool } from "../db";
import { sql } from "slonik";
import crypto from "crypto";

export type Session = {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
};

const sessionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  token: z.string(),
  expires_at: z.string(),
  created_at: z.string(),
});

// Generate a random session token
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Get session duration in hours (e.g., 24 hours)
function getSessionExpiresAt(hours: number = 1): Date {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + hours);
  return expiresAt;
}

export async function createOrUpdateSession(
  userId: number,
  sessionDurationHours: number = 24,
): Promise<Session> {
  // Check if session already exists for this user
  const existingSession = await pool?.query(
    sql.type(sessionSchema)`
      SELECT id, user_id, token, expires_at, created_at
      FROM sessions
      WHERE user_id = ${userId}
    `,
  );

  const token = generateToken();
  const expiresAt = getSessionExpiresAt(sessionDurationHours);

  if (existingSession?.rows[0]) {
    // Update existing session
    const result = await pool?.query(
      sql.type(sessionSchema)`
        UPDATE sessions
        SET token = ${token}, expires_at = ${expiresAt.toISOString()}
        WHERE user_id = ${userId}
        RETURNING id, user_id, token, expires_at, created_at
      `,
    );

    if (result?.rows[0]) {
      return mapSessionRow(result.rows[0]);
    }
  } else {
    // Create new session
    const result = await pool?.query(
      sql.type(sessionSchema)`
        INSERT INTO sessions (user_id, token, expires_at)
        VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
        RETURNING id, user_id, token, expires_at, created_at
      `,
    );

    if (result?.rows[0]) {
      return mapSessionRow(result.rows[0]);
    }
  }

  throw new Error("Failed to create or update session");
}

export async function getSessionByToken(
  token: string,
): Promise<Session | null> {
  const result = await pool?.query(
    sql.type(sessionSchema)`
      SELECT id, user_id, token, expires_at, created_at
      FROM sessions
      WHERE token = ${token}
    `,
  );

  if (result?.rows[0]) {
    return mapSessionRow(result.rows[0]);
  }

  return null;
}

export async function deleteSession(token: string): Promise<void> {
  await pool?.query(
    sql.typeAlias("void")`
      DELETE FROM sessions
      WHERE token = ${token}
    `,
  );
}

export function isSessionExpired(session: Session): boolean {
  return new Date() > new Date(session.expiresAt);
}

function mapSessionRow(row: any): Session {
  return {
    id: typeof row.id === "bigint" ? Number(row.id) : row.id,
    userId: typeof row.user_id === "bigint" ? Number(row.user_id) : row.user_id,
    token: row.token,
    expiresAt: new Date(row.expires_at),
    createdAt: new Date(row.created_at),
  };
}
