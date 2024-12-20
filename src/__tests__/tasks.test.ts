import request from "supertest";
import { prisma } from "../config/prisma";
import app from "../index";
import { server } from "../index";

describe("Tasks API", () => {
  beforeAll(async () => {
    // Clear the database before tests
    await prisma.task.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  // Test GET /tasks
  it("should return empty array when no tasks exist", async () => {
    const response = await request(app).get("/tasks");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Test POST /tasks
  it("should create a new task", async () => {
    const taskData = {
      title: "Test Task",
      color: "BLUE",
    };

    const response = await request(app).post("/tasks").send(taskData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("title", taskData.title);
    expect(response.body).toHaveProperty("color", taskData.color);
  });

  // Test GET /tasks/:id
  it("should get a task by id", async () => {
    // First create a task
    const createResponse = await request(app)
      .post("/tasks")
      .send({ title: "Task to Get" });

    const taskId = createResponse.body.id;

    // Then get the task
    const getResponse = await request(app).get(`/tasks/${taskId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toHaveProperty("id", taskId);
    expect(getResponse.body).toHaveProperty("title", "Task to Get");
  });
});
