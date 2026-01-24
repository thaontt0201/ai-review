import express from "express";
import cors from "cors";
// import { PrismaClient } from "./generated/prisma-client";
import { z } from "zod";
import "dotenv/config";
import { Ollama } from "ollama";
import { router, publicProcedure, createContext } from "./trpc";
import * as trpcExpress from "@trpc/server/adapters/express";

const reviewSchema = z.object({
  title: z.string().optional(),
  language: z.string().default("javascript"),
  code: z.string(),
  feedback: z.string().optional(),
  modelName: z.string().optional().default("llama3.2"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const app = express();
// const prisma = new PrismaClient();
const ollama = new Ollama({ host: "http://localhost:11434" });
const PORT = process.env.PORT || 8000;

const appRouter = router({
  submitCode: publicProcedure
    .input(reviewSchema)
    .mutation(async ({ input }) => {
      const systemPrompt = `Train a machine learning model to analyze and provide feedback on code written in [ programming language(s) of choice, e.g., Python, JavaScript, Java]. The model should be able to identify common coding mistakes, suggest improvements, and recommend best practices. It should also be able to handle different types of code, including but not limited to:

        - Functionality
        - Structure
        - Performance optimization
        - Security considerations

        The model should learn from a large dataset of annotated code examples, where each example is labeled with relevant feedback, such as:
        - Error messages for syntax errors or runtime exceptions
        - Code suggestions for improvement, e.g., reducing duplication or using more efficient data structures
        - Code quality assessments, e.g., suggesting improvements to readability or performance

        The model should be able to take a piece of code as input and generate human-readable feedback with suggestions for improvement.

        Learning objectives:
        - Identify common coding mistakes, such as syntax errors, undefined variables, or runtime exceptions.
        - Suggest improvements to code structure, including reducing duplication, improving modularity, and using more efficient data structures.
        - Recommend best practices for performance optimization, security considerations, and code readability.
        - Learn from a large dataset of annotated code examples and adapt to new programming languages and coding styles.

        Evaluation criteria:
        - Accuracy of feedback on common coding mistakes
        - Quality of suggestions for improvement
        - Ability to handle different types of code and learn from large datasets

        Provide the model with a diverse set of code examples, including both correct and incorrect implementations, as well as various programming languages and styles.`;
      const userPrompt = `Language: ${input.language ?? "unknown"}
        Code: ${input.code ?? "no code provided"}
        Please analyze the above code and provide constructive feedback with suggestions for improvement.`;
      const completion = await ollama.chat({
        model: input.modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      console.log("test", completion);
      return completion;
    }),
});
export type AppRouter = typeof appRouter;

// app.use(express.json());
app.use(cors());

// Handle clients that send JSON:API content-type (e.g. application/vnd.api+json)
// by normalizing it to application/json for the tRPC endpoint.
// app.use("/trpc", (req, _res, next) => {
//   const ct = req.headers["content-type"];
//   if (ct && typeof ct === "string" && ct.includes("application/vnd.api+json")) {
//     (req.headers as any)["content-type"] = "application/json";
//   }
//   next();
// });

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

// app.post("/app/reviews", async (req, res) => {
//   try {
//     const parsedData = reviewSchema.parse(req.body);
//     const systemPrompt = `Train a machine learning model to analyze and provide feedback on code written in [ programming language(s) of choice, e.g., Python, JavaScript, Java]. The model should be able to identify common coding mistakes, suggest improvements, and recommend best practices. It should also be able to handle different types of code, including but not limited to:

//         - Functionality
//         - Structure
//         - Performance optimization
//         - Security considerations

//         The model should learn from a large dataset of annotated code examples, where each example is labeled with relevant feedback, such as:
//         - Error messages for syntax errors or runtime exceptions
//         - Code suggestions for improvement, e.g., reducing duplication or using more efficient data structures
//         - Code quality assessments, e.g., suggesting improvements to readability or performance

//         The model should be able to take a piece of code as input and generate human-readable feedback with suggestions for improvement.

//         Learning objectives:
//         - Identify common coding mistakes, such as syntax errors, undefined variables, or runtime exceptions.
//         - Suggest improvements to code structure, including reducing duplication, improving modularity, and using more efficient data structures.
//         - Recommend best practices for performance optimization, security considerations, and code readability.
//         - Learn from a large dataset of annotated code examples and adapt to new programming languages and coding styles.

//         Evaluation criteria:
//         - Accuracy of feedback on common coding mistakes
//         - Quality of suggestions for improvement
//         - Ability to handle different types of code and learn from large datasets

//         Provide the model with a diverse set of code examples, including both correct and incorrect implementations, as well as various programming languages and styles.`;

//     const userPrompt = `Language: ${parsedData.language ?? "unknown"}
//         Code: ${parsedData.code ?? "no code provided"}
//         Please analyze the above code and provide constructive feedback with suggestions for improvement.`;

//     const completion = await ollama.chat({
//       model: parsedData.modelName,
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userPrompt },
//       ],
//     });
//     console.log("test", completion);
//     res.send(completion);
//   } catch (error) {
//     console.error("Error creating review:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
