import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(express.json());

// Validation schema
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  color: z
    .enum([
      "RED",
      "ORANGE",
      "YELLOW",
      "GREEN",
      "BLUE",
      "INDIGO",
      "PURPLE",
      "PINK",
      "BROWN",
    ])
    .optional(),
});

app.get("/tasks", async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.task.findMany();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch tasks" });
  }
});

app.post("/tasks", async (req: Request, res: Response) => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    const task = await prisma.task.create({
      data: validatedData,
    });
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid request",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    } else {
      res.status(500).json({ error: "Unable to create task" });
    }
  }
});

const server = app.listen(port, () => {
  console.log(`[server]: Server is running on port ${port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  server.close();
});
