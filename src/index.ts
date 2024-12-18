import express, { Express, Request, Response, RequestHandler } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
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
  completed_status: z.boolean().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
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
  completed_status: z.boolean().optional(),
});

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.task.findMany();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch tasks" });
  }
};

export const getTaskById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const validatedId = z.string().min(1).parse(req.params.id);
    const task = await prisma.task.findUnique({
      where: { id: validatedId },
    });

    if (!task) {
      res.status(404).json({
        error: "Task not found",
        details: { id: validatedId },
      });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid task ID",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }
    res.status(500).json({ error: "Unable to retrieve task" });
  }
};

export const createTask = async (req: Request, res: Response) => {
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
};

export const updateTaskById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const validatedId = z.string().min(1).parse(req.params.id);
    const validatedData = updateTaskSchema.parse(req.body);

    if (Object.keys(validatedData).length === 0) {
      res.status(400).json({
        error: "At least one field must be provided for update",
      });
      return;
    }

    await prisma.task.update({
      where: { id: validatedId },
      data: validatedData,
    });

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid request",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        error: "Task not found",
        details: { id: req.params.id },
      });
      return;
    }
    res.status(500).json({ error: "Unable to update task" });
  }
};

export const deleteTaskById: RequestHandler = async (req, res) => {
  try {
    const validatedId = z.string().min(1).parse(req.params.id);

    await prisma.task.delete({
      where: { id: validatedId },
    });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        error: "Task not found",
        details: { id: req.params.id },
      });
      return;
    }

    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid task ID",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    res.status(500).json({ error: "Unable to delete task" });
  }
};

app.get("/tasks", getAllTasks);
app.get("/tasks/:id", getTaskById);
app.post("/tasks", createTask);
app.put("/tasks/:id", updateTaskById);
app.delete("/tasks/:id", deleteTaskById);

const server = app.listen(port, () => {
  console.log(`[server]: Server is running on port ${port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  server.close();
});
