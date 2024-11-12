import {
  addTask,
  getTasks,
  getTaskWeights,
  updateTask,
  reorderTasks,
  updateTaskWeights,
  deleteTask,
  deleteAllTasks,
} from "../controllers/taskController.js";

import express from "express";
const router = express.Router();

/**------------------------------------------------------------------------
 *                        CRUD: Creating Tasks
 *------------------------------------------------------------------------**/
router.post("/", addTask);

/**------------------------------------------------------------------------
 *                        CRUD: Reading Tasks
 *------------------------------------------------------------------------**/
router.get("/", getTasks);
router.get("/weights", getTaskWeights);

/**------------------------------------------------------------------------
 *                        CRUD: Updating Tasks
 *------------------------------------------------------------------------**/
router.patch("/:taskId", updateTask);
router.patch("/reorder/:taskId", reorderTasks);
router.patch("/weights", updateTaskWeights);

/**------------------------------------------------------------------------
 *                        CRUD: Deleting Tasks
 *------------------------------------------------------------------------**/
router.delete("/:taskId", deleteTask); // --> also reorders list after deletion
router.delete("/", deleteAllTasks);

export default router;
