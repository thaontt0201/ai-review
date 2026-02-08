import z from "zod";
import { pool } from "../db";
import { sql } from "slonik";

export type User = {
  id: number;
  googleId: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = z.object({
  id: z.number(),
  google_id: z.string(),
  email: z.string(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export async function findOrCreateUserByGoogleId(
  googleId: string,
  email: string,
  name: string,
): Promise<User> {
  // First, try to find existing user
  const existingUser = await pool?.query(
    sql.type(userSchema)`
      SELECT id, google_id, email, name, created_at, updated_at
      FROM users
      WHERE google_id = ${googleId}
    `,
  );

  if (existingUser?.rows[0]) {
    return mapUserRow(existingUser.rows[0]);
  }

  // If not found, create new user
  const result = await pool?.query(
    sql.type(userSchema)`
      INSERT INTO users (google_id, email, name)
      VALUES (${googleId}, ${email}, ${name})
      RETURNING id, google_id, email, name, created_at, updated_at
    `,
  );

  if (result?.rows[0]) {
    return mapUserRow(result.rows[0]);
  }

  throw new Error("Failed to create or find user");
}

export async function getUserById(userId: number): Promise<User | null> {
  const result = await pool?.query(
    sql.type(userSchema)`
      SELECT id, google_id, email, name, created_at, updated_at
      FROM users
      WHERE id = ${userId}
    `,
  );

  if (result?.rows[0]) {
    return mapUserRow(result.rows[0]);
  }

  return null;
}

function mapUserRow(row: any): User {
  return {
    id: typeof row.id === "bigint" ? Number(row.id) : row.id,
    googleId: row.google_id,
    email: row.email,
    name: row.name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
