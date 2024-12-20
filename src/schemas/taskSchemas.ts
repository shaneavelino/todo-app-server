import { z } from "zod";

export const createTaskSchema = z.object({
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

export const updateTaskSchema = z.object({
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

export const idSchema = z.string().min(1);
