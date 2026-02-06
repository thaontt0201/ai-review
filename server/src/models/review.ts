import z from "zod";
import { pool } from "../db";
import { sql } from "slonik";

type Review = {
  id: number;
  code: string;
  feedback: string;
  title: string;
  language: string;
  modelName: string;
  createdAt: Date;
  updatedAt: Date;
};
const reviewSchema = z.object({
  id: z.bigint(),
  title: z.string().optional(),
  language: z.string().default("javascript"),
  code: z.string(),
  feedback: z.string(),
  modelName: z.string().optional().default("llama3.2"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

type ReviewInput = Omit<Review, "id" | "createdAt" | "updatedAt">;

export async function createReview(input: ReviewInput): Promise<Review> {
  const { code, feedback, title, language, modelName } = input;
  const result = await pool?.query(sql.type(reviewSchema)`
    INSERT INTO reviews (code, feedback, title, language, model_name)
    VALUES (${code}, ${feedback}, ${title}, ${language}, ${modelName})
    RETURNING id, code, feedback, title, language, model_name AS "modelName", created_at AS "createdAt", updated_at AS "updatedAt"
  `);
  return result?.rows[0] as unknown as Review;
}
