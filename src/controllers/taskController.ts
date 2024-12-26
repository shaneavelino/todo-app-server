import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import Fuse from "fuse.js";

import {
  createTaskSchema,
  updateTaskSchema,
  idSchema,
} from "../schemas/taskSchemas";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const getAllTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tasks = await prisma.task.findMany();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch tasks" });
  }
};

export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedId = idSchema.parse(req.params.id);
    const task = await prisma.task.findUnique({
      where: { id: validatedId },
    });

    if (!task) {
      res.status(404).json({
        error: "Task not found",
        details: { id: validatedId },
      });
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
    }
    res.status(500).json({ error: "Unable to retrieve task" });
  }
};

// export const createTask = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const validatedData = createTaskSchema.parse(req.body);
//     const task = await prisma.task.create({
//       data: validatedData,
//     });
//     res.status(201).json(task);
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       res.status(400).json({
//         error: "Invalid request",
//         details: error.errors.map((err) => ({
//           field: err.path.join("."),
//           message: err.message,
//         })),
//       });
//     }
//     res.status(500).json({ error: "Unable to create task" });
//   }
// };

// const createTaskSchema = z.object({
//   title: z.string(),
//   description: z.string(),
//   // Add other task fields
// });

// Fuse.js options
const fuseOptions = {
  keys: ["title", "color"],
  threshold: 0.3,
  includeScore: true,
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = createTaskSchema.parse(req.body);

    // Check if similar tasks exist
    const existingTasks = await prisma.task.findMany();
    const fuse = new Fuse(existingTasks, fuseOptions);

    const searchResults = fuse.search(validatedData.title);
    const similarTasks = searchResults.filter(
      (result) => result.score && result.score < 0.3
    );

    if (similarTasks.length > 0) {
      res.status(200).json({
        message: "Similar tasks found",
        similarTasks: similarTasks.map((result) => ({
          task: result.item,
          similarity: result.score,
        })),
      });
      return;
    }

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
      return;
    }
    res.status(500).json({ error: "Unable to create task" });
  }
};

export const searchTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Invalid query" });
      return;
    }
    const tasks = await prisma.task.findMany();
    const fuse = new Fuse(tasks, {
      keys: ["title", "color"],
      threshold: 0.3,
    });

    const searchResults = fuse.search(query);
    const formattedResults = searchResults.map((result) => result.item);

    res.json(formattedResults);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
};

export const updateTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedId = idSchema.parse(req.params.id);
    const validatedData = updateTaskSchema.parse(req.body);

    if (Object.keys(validatedData).length === 0) {
      res.status(400).json({
        error: "At least one field must be provided for update",
      });
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
    }

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        error: "Task not found",
        details: { id: req.params.id },
      });
    }
    res.status(500).json({ error: "Unable to update task" });
  }
};

export const deleteTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedId = idSchema.parse(req.params.id);
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
    }

    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid task ID",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    res.status(500).json({ error: "Unable to delete task" });
  }
};
