import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(express.json());

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
    const { title, color } = req.body;
    const task = await prisma.task.create({
      data: { title, color },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Unable to create task" });
  }
});

const server = app.listen(port, () => {
  console.log(`[server]: Server is running on port ${port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  server.close();
});
