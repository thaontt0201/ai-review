import { createPool, DatabasePool, sql } from "slonik";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

let pool: DatabasePool | null = null;

if (!pool) {
  createPool(DATABASE_URL)
    .then((createdPool) => {
      pool = createdPool;
      console.log("Database connection pool created");
    })
    .catch((error) => {
      console.error("Error creating database connection pool:", error);
    });
}

export { sql, pool };
