import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

const backendUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

export const createUserProfile = async ({ email, displayName }) => {
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const response = await fetch(`${backendUrl}/api/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, displayName }),
    });

    if (!response.ok) {
      throw new Error("Failed to add task");
    }
    return response.json();
  } catch (error) {
    console.error("Error adding task:", error);
    throw error; // Rethrow to handle errors in calling components
  }
};

export const fetchUserProfile = async (uid) => {
  const user = auth.currentUser;
  const token = await user.getIdToken();
  console.log("went here");
  const response = await fetch(`${backendUrl}/api/user-profile?userId=${uid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }
  return response.json(); // Return the user profile data
};

/**
 * Fetch tasks for a specific user from the backend.
 * @param {string} userId - The ID of the user whose tasks are to be fetched.
 * @returns {Promise<Array>} - A promise that resolves to an array of tasks.
 */
export const fetchTasksFromApi = async (userId) => {
  console.log("Hit API to Fetch Tasks from Backend:");
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();
    const response = await fetch(`${backendUrl}/api/tasks?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error; // Rethrow to handle errors in calling components
  }
};

export const reorderTasks = async ({
  userId,
  taskId,
  targetPrevTaskId,
  targetNextTaskId,
  status,
}) => {
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const response = await fetch(`${backendUrl}/api/tasks/reorder/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        targetPrevTaskId,
        targetNextTaskId,
        status,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to update task");
    }
    return response.json();
  } catch (error) {
    console.error("Error updating task:", error);
    throw error; // Rethrow to handle errors in calling components
  }
};

export const updateTaskStatus = async (taskId, userId, updates) => {
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();
    const response = await fetch(`${backendUrl}/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, updates }),
    });
    if (!response.ok) {
      throw new Error("Failed to update task");
    }
    return response.json();
  } catch (error) {
    console.error("Error updating task:", error);
    throw error; // Rethrow to handle errors in calling components
  }
};

/**
 * Delete a specific task.
 * @param {string} taskId - The ID of the task to be deleted.
 * @param {string} userId - The ID of the user who owns the task.
 * @returns {Promise<void>} - A promise that resolves when the task has been deleted.
 */
export const deleteTask = async (taskId, userId) => {
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();
    const response = await fetch(`${backendUrl}/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error; // Rethrow to handle errors in calling components
  }
};

/**
 * Add a new task for a specific user.

 * @returns {Promise<Object>} - A promise that resolves to the newly created task.
 */
export const addTask = async ({ userId, task }) => {
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const response = await fetch(`${backendUrl}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, task }),
    });
    if (!response.ok) {
      // navigate('/dashboard'); not working, but need to redirect to dashboard
      throw new Error("Failed to add task");
    }
    return response.json();
  } catch (error) {
    console.error("Error adding task:", error);
    throw error; // Rethrow to handle errors in calling components
  }
};

export const updateUserWeights = async ({ userId, weights }) => {
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const response = await fetch(`${backendUrl}/api/users/${userId}/weights`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(weights),
    });

    if (!response.ok) {
      throw new Error("Failed to update user weights and tasks");
    }
    return response.json();
  } catch (error) {
    console.error("Error updating weights and tasks:", error);
    throw error;
  }
};
