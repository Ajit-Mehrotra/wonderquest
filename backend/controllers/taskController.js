import {
  mapTasksAndFindHead,
  findInsertionPosition,
} from "../utils/helperMethods.js";

import {
  getTasksFromDB,
  addTaskToDB,
  updateTaskPointersInDB,
  unlinkTaskInDB,
  updateTaskInDB,
  getTaskFromDB,
  deleteTaskFromDB,
  deleteAllTasksFromDB,
} from "../models/taskModel.js";
import { defaultStatus } from "../config.js";

export const getTasks = async (req, res) => {
  const userId = req.query.userId;
  try {
    const tasks = await getTasksFromDB(userId);
    res.status(200).json(tasks);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch tasks", details: error.message });
  }
};

export const addTask = async (req, res) => {
  const { userId, task } = req.body; // Expecting userId and task data in the body

  if (!userId || !task) {
    return res.status(400).json({ error: "Missing userId or task data" });
  }

  try {
    const currentTasks = await getTasksFromDB(userId);

    const { taskMap, headTask } = mapTasksAndFindHead(
      currentTasks,
      task.status
    );

    // Find the correct position to insert the new task based on priority
    const { prevTask, nextTask } = findInsertionPosition(
      taskMap,
      headTask,
      task.priority
    );

    const newTaskData = {
      ...task,
      prevTaskId: prevTask ? prevTask.id : null,
      nextTaskId: nextTask ? nextTask.id : null,
      status: defaultStatus,
    };

    // Add task to the database
    const newTaskId = await addTaskToDB(userId, newTaskData);

    // Update the references for previous and next tasks
    await updateTaskPointersInDB(userId, prevTask, nextTask, newTaskId);

    res.status(201).json({ message: "Task added successfully", id: newTaskId });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add task", details: error.message });
  }
};

export const updateTask = async (req, res) => {
  const { userId, updates } = req.body; // Expecting userId and task updates in the body
  const { taskId } = req.params;

  try {
    // Find the task to be updated
    const taskToUpdate = await getTaskFromDB(userId, taskId);
    if (!taskToUpdate) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Update the task with new values
    const updatedTask = {
      ...taskToUpdate,
      ...updates,
      ignorePriority: false,
    };

    // If priority has changed, re-arrange the task
    if (updates.priority && updates.priority !== taskToUpdate.priority) {
      // Remove the task from its current position

      await unlinkTaskInDB(userId, taskToUpdate);

      const currentTasks = await getTasksFromDB(userId);

      // Map tasks and find the head
      const { taskMap, headTask } = mapTasksAndFindHead(
        currentTasks,
        updates.status,
        taskId
      );

      // Find the correct new position for the updated task
      const { prevTask, nextTask } = findInsertionPosition(
        taskMap,
        headTask,
        updates.priority
      );

      updatedTask.prevTaskId = prevTask ? prevTask.id : null;
      updatedTask.nextTaskId = nextTask ? nextTask.id : null;

      // Update the references for the new previous and next tasks

      await updateTaskPointersInDB(userId, prevTask, nextTask, taskId);
    }

    // Update the task in Firestore

    await updateTaskInDB(userId, taskId, updatedTask);

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update task", details: error.message });
  }
};

export const reorderTasks = async (req, res) => {
  const { taskId } = req.params;
  const { userId, targetPrevTaskId, targetNextTaskId, status } = req.body;

  try {
    const draggedTask = await getTaskFromDB(userId, taskId);
    const isSameColumn = draggedTask.status === status;
    const currentTasks = await getTasksFromDB(userId);

    // Unlink the dragged task from its current position
    await unlinkTaskInDB(userId, draggedTask);

    // Logic to update the task if it's moved to a different column
    if (!isSameColumn) {
      // get current column head and hashmap of tasks
      const { taskMap, headTask } = mapTasksAndFindHead(currentTasks, status);

      // Find the correct position to insert the new task based on priority
      const { prevTask, nextTask } = findInsertionPosition(
        taskMap,
        headTask,
        draggedTask.priority
      );

      const newTaskData = {
        ...draggedTask,
        prevTaskId: prevTask ? prevTask.id : null,
        nextTaskId: nextTask ? nextTask.id : null,
        status,
        ignorePriority: false,
      };

      // Update current task to the database
      await updateTaskInDB(userId, taskId, newTaskData);

      // Update the references for previous and next tasks
      await updateTaskPointersInDB(userId, prevTask, nextTask, taskId);

      res.status(201).json({
        message: "Task moved and inserted successfully",
        id: taskId,
      });
    } else {
      // Logic to update the task if it's moved within the same column

      let prevTask = null;
      let nextTask = null;

      if (targetPrevTaskId !== null) {
        prevTask = await getTaskFromDB(userId, targetPrevTaskId);
      }

      if (targetNextTaskId !== null) {
        nextTask = await getTaskFromDB(userId, targetNextTaskId);
      }

      await updateTaskPointersInDB(userId, prevTask, nextTask, taskId);

      // Update the dragged task with its new neighbors
      await updateTaskInDB(userId, taskId, {
        ...draggedTask,
        prevTaskId: targetPrevTaskId || null,
        nextTaskId: targetNextTaskId || null,
        status,
        ignorePriority: true,
      });

      res.status(200).json({ message: "Task reordered successfully" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to reorder task", details: error.message });
  }
};

export const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.body; // Assuming the userId is sent in the request body

  try {
    const taskToDelete = await getTaskFromDB(userId, taskId);

    if (!taskToDelete) {
      return res.status(404).json({ error: "Task to delete not found" });
    }

    await unlinkTaskInDB(userId, taskToDelete);
    await deleteTaskFromDB(userId, taskId);

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete task", details: error.message });
  }
};

export const deleteAllTasks = async (req, res) => {
  const { user_id: userId } = req.user;
  try {
    await deleteAllTasksFromDB(userId);
    res.status(200).send({ message: "All tasks deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: `Failed to delete tasks ${error}` });
  }
};
