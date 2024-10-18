import {
  getTasks,
  addTask,
  updateTask,
  reorderTasks,
  deleteTask,
} from "../controllers/taskController.js";

import express from "express";
const router = express.Router();

// Fetch tasks for the authenticated user
router.get("/", getTasks);

// Add New Task & re-order the linked list
router.post("/", addTask);

//Update Task based off new details & re-order the linked list
router.patch("/:taskId", updateTask);

//Reorder Dragged Tasks
router.patch("/reorder/:taskId", reorderTasks);

//Delete Task & re-order the linked list
router.delete("/:taskId", deleteTask);

export default router;
