import {
  mapTasksAndFindHead,
  findInsertionPosition,
} from "../utils/helperMethods.js";

import {
  addTaskToDB,
  getTasksFromDB,
  getTaskWeightFromDB,
  getTaskFromDB,
  updateTaskPointersInDB,
  unlinkTaskInDB,
  updateTaskInDB,
  updateTaskWeightsInDB,
  deleteTaskFromDB,
  deleteAllTasksFromDB,
} from "../models/taskModel.js";

import { defaultStatus, defaultColumns, STATUS_CODE } from "../config.js";

//TODO: smelly code, refactor later

/**------------------------------------------------------------------------
 *                        CRUD: Creating Tasks
 *------------------------------------------------------------------------**/
export const addTask = async (req, res) => {
  const userId = req.user.uid;
  const { task } = req.body; // Expecting userId and task data in the body

  if (!userId || !task) {
    return res
      .status(STATUS_CODE.BAD_REQUEST)
      .json({ error: "Missing userId or task data" });
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

    res
      .status(STATUS_CODE.CREATED)
      .json({ message: "Task added successfully", id: newTaskId });
  } catch (error) {
    res
      .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to add task", details: error.message });
  }
};

/**------------------------------------------------------------------------
 *                        CRUD: Reading Tasks
 *------------------------------------------------------------------------**/
export const getTasks = async (req, res) => {
  const userId = req.user.uid;
  try {
    const tasks = await getTasksFromDB(userId);
    res.status(STATUS_CODE.OK).json(tasks);
  } catch (error) {
    res
      .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch tasks", details: error.message });
  }
};

//Task weights are stored in the user collection, not the tasks collection
export const getTaskWeights = async (req, res) => {
  const userId = req.user.uid;

  try {
    const weights = await getTaskWeightFromDB(userId);
    if (!weights) {
      throw new Error("Weights data not found for user");
    }
    res.status(STATUS_CODE.OK).json(weights);
  } catch (error) {
    res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch weights",
      details: error.message,
    });
  }
};

/**------------------------------------------------------------------------
 *                        CRUD: Updating Tasks
 *------------------------------------------------------------------------**/

/**
 * @api {patch} /tasks/:taskId Update a task
 * @apiDescription Updates a task with new values. If the priority has changed, it will re-arrange the task with the new priority.
 * @apiParam {string} taskId The ID of the task to be updated
 * @apiParam {object} updates The new values of the task. Can be any combination of the following: title, description, status, priority, ignorePriority, size, value, urgency.
 */
export const updateTask = async (req, res) => {
  const userId = req.user.uid;
  const { updates } = req.body; // Expecting userId and task updates in the body
  const { taskId } = req.params;

  try {
    // Find the task to be updated
    const taskToUpdate = await getTaskFromDB(userId, taskId);
    if (!taskToUpdate) {
      return res
        .status(STATUS_CODE.NOT_FOUND)
        .json({ error: "Task not found" });
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

    res.status(STATUS_CODE.OK).json({ message: "Task updated successfully" });
  } catch (error) {
    res
      .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to update task", details: error.message });
  }
};

/**
 * Reorders a task within a user's task list, either within the same column
 * or across different columns, updating the task pointers and database
 * references as needed.
 *
 * @param {Object} req - The request object, containing user ID, task ID, and
 *                        new position details in the request parameters and body.
 * @param {Object} res - The response object used to send back the appropriate
 *                        HTTP response.
 *
 * The function handles the unlinking of the task from its current position,
 * determines if the task is moved within the same column or to a different
 * column, updates task pointers accordingly, and persists changes to the
 * database. Sends a success response with a message and task ID, or an error
 * response with details if the operation fails.
 */
export const reorderTasks = async (req, res) => {
  const userId = req.user.uid;
  const { taskId } = req.params;
  const { targetPrevTaskId, targetNextTaskId, status } = req.body;

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

      res.status(STATUS_CODE.CREATED).json({
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

      res
        .status(STATUS_CODE.OK)
        .json({ message: "Task reordered successfully" });
    }
  } catch (error) {
    res
      .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to reorder task", details: error.message });
  }
};

//Task weights are stored in the user collection, not the tasks collection
export const updateTaskWeights = async (req, res) => {
  const userId = req.user.uid;
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

    res
      .status(STATUS_CODE.OK)
      .json({ message: "Weights and tasks updated successfully" });
  } catch (error) {
    res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      error: "Failed to update weights and tasks",
      details: error.message,
    });
  }
};

/**------------------------------------------------------------------------
 *                        CRUD: Deleting Tasks
 *------------------------------------------------------------------------**/

export const deleteTask = async (req, res) => {
  const userId = req.user.uid;
  const { taskId } = req.params;

  try {
    const taskToDelete = await getTaskFromDB(userId, taskId);

    if (!taskToDelete) {
      return res
        .status(STATUS_CODE.NOT_FOUND)
        .json({ error: "Task to delete not found" });
    }

    await unlinkTaskInDB(userId, taskToDelete);
    await deleteTaskFromDB(userId, taskId);

    res.status(STATUS_CODE.OK).json({ message: "Task deleted successfully" });
  } catch (error) {
    res
      .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to delete task", details: error.message });
  }
};

export const deleteAllTasks = async (req, res) => {
  const { user_id: userId } = req.user;
  try {
    await deleteAllTasksFromDB(userId);
    res
      .status(STATUS_CODE.OK)
      .send({ message: "All tasks deleted successfully" });
  } catch (error) {
    res
      .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
      .send({ message: `Failed to delete tasks ${error}` });
  }
};

/**------------------------------------------------------------------------
 *                        Helper Functions
 *------------------------------------------------------------------------**/
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
