import {
  createFirebaseUser,
  getFirebaseUserData,
  updateDisplayNameInDB,
  deleteUserFromDB,
  updateUserEmailInDB,
} from "../models/userModel.js";
import {
  getTasksFromDB,
  updateTaskInDB,
  updateTaskWeightsInDB,
  getTaskWeightFromDB,
} from "../models/taskModel.js";
import { defaultColumns } from "../config.js";

export const getUserProfile = async (req, res) => {
  const userId = req.query.userId;

  if (typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const data = await getFirebaseUserData(userId);
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch user data", details: error.message });
  }
};

export const createUser = async (req, res) => {
  const { email, displayName } = req.body;
  try {
    await createFirebaseUser(email, displayName);
    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    res
      .status(400)
      .send({ error: "Error creating user", details: error.message });
  }
};

// This method is in here instead of taskController because the weights are stored in the user profile
export const updateTaskWeights = async (req, res) => {
  const { userId } = req.params;
  const { urgencyWeight, valueWeight, sizeWeight } = req.body;

  try {
    // Update weights in the user profile
    await updateTaskWeightsInDB(userId, urgencyWeight, valueWeight, sizeWeight);

    // Fetch all tasks for the user
    const tasks = await getTasksFromDB(userId);

    // Initialize task columns
    const newTasks = defaultColumns();

    //Update Weights, Reset ignorePriority Flag, and Sort tasks by Column Name
    for (let task of tasks) {
      // @ts-ignore
      const { urgency, value, size } = task;

      if (!urgency || !value || !size) {
        throw new Error("Task is missing urgency, value, or size");
      }

      const newPriority =
        urgency.value * urgencyWeight +
        value.value * valueWeight +
        size.value * sizeWeight;

      const updatedTask = {
        ...task,
        priority: newPriority,
        ignorePriority: false,
      };

      // @ts-ignore
      const taskStatus = updatedTask.status;

      // Add task to the appropriate column by status, if doesn't exist, create it.
      if (!newTasks[taskStatus]) {
        newTasks[taskStatus] = [];
      }

      newTasks[taskStatus].push(updatedTask);
    }

    await sortTasksByPriority(newTasks, userId);

    res.status(200).json({ message: "Weights and tasks updated successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update weights and tasks",
      details: error.message,
    });
  }
};

export const sortTasksByPriority = async (tasks, userId) => {
  // Sort Tasks by Priority, Set new prevTaskIds and nextTaskIds, Send update to Firestore
  for (let column in tasks) {
    //get the column of tasks
    const tasksArray = tasks[column];

    // sort the array by priority
    tasksArray.sort((a, b) => a.priority - b.priority);

    for (let i = 0; i < tasksArray.length; i++) {
      const currentTask = tasksArray[i];

      if (i === 0) {
        currentTask.prevTaskId = null;
      } else {
        currentTask.prevTaskId = tasksArray[i - 1].id;
      }
      if (i === tasksArray.length - 1) {
        currentTask.nextTaskId = null;
      } else {
        currentTask.nextTaskId = tasksArray[i + 1].id;
      }

      await updateTaskInDB(userId, tasksArray[i].id, {
        ...currentTask,
        prevTaskId: currentTask.prevTaskId,
        nextTaskId: currentTask.nextTaskId,
      });
    }
  }
};

// This method is in here instead of taskController because the weights are stored in the user profile
export const getTaskWeights = async (req, res) => {
  const { userId } = req.params;

  try {
    const weights = await getTaskWeightFromDB(userId);
    if (!weights) {
      throw new Error("Weights data not found for user");
    }
    res.status(200).json(weights);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch weights",
      details: error.message,
    });
  }
};

export const updateDisplayName = async (req, res) => {
  const { userId } = req.params;
  const { displayName } = req.body;
  try {
    await updateDisplayNameInDB(userId, displayName);
    res.status(200).json({ message: "Display name updated successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update display name",
      details: error.message,
    });
  }
};

export const updateUserEmail = async (req, res) => {
  const { user_id: userId } = req.user;
  const { email } = req.body;

  try {

    await updateUserEmailInDB(userId, email);
    res.status(200).json({ message: "Email updated successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update Email",
      details: error.message,
    });
  }
};

// Delete User Account
export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    await deleteUserFromDB(userId);
    res.status(200).send({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).send({ message: "Failed to delete user account" });
  }
};
