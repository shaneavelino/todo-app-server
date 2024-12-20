import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes";
import { prisma } from "./config/prisma";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3001",
  })
);

app.use("/tasks", taskRoutes);

export const server = app.listen(port, () => {
  console.log(`[server]: Server is running on port ${port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  server.close();
});

export default app;
