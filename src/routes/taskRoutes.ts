import express from "express";
import * as taskController from "../controllers/taskController";

const router = express.Router();

// Define routes
router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);
router.post("/", taskController.createTask);
router.put("/:id", taskController.updateTaskById);
router.delete("/:id", taskController.deleteTaskById);

export default router;
