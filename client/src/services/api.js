import { auth } from "../firebase/firebase";

const backendUrl = import.meta.env.VITE_APP_BACKEND_SERVER_URL;

export const createUserProfile = async ({ email, displayName = null }) => {
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const response = await fetch(`${backendUrl}/api/users/signup`, {
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

export const updateDisplayName = async ({ userId, displayName }) => {
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const response = await fetch(`${backendUrl}/api/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ displayName }),
    });

    if (!response.ok) {
      throw new Error("Failed to update user's displayName");
    }
    return response.json();
  } catch (error) {
    console.error("Error updating user's displayName:", error);
    throw error;
  }
};

export const updateUserEmail = async ({ email }) => {
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const response = await fetch(`${backendUrl}/api/users/user-profile/email`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("Failed to update user's email");
    }
    return response.json();
  } catch (error) {
    console.error("Error updating user's email:", error.message);
    throw error;
  }
};

export const fetchUserProfile = async (uid) => {
  const user = auth.currentUser;
  const token = await user.getIdToken();
  const response = await fetch(`${backendUrl}/api/user-profile?userId=${uid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    // User profile not found; return null
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch user profile: ${response.status} ${errorText}`
    );
  }
  return response.json(); // Return the user profile data
};

// Delete User Account
export const deleteUserAccount = async (userId) => {
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const response = await fetch(`${backendUrl}/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete user account");
    }
    return response.json();
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};

export const fetchTasksFromApi = async (userId) => {
  console.log("Trying to hit API to Fetch Tasks from Backend:");
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

export const fetchUserWeights = async (userId) => {
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const response = await fetch(`${backendUrl}/api/users/${userId}/weights`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user weights");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching weights:", error);
    throw error;
  }
};

// Delete All Tasks
export const deleteAllTasks = async () => {
  try {
    const user = auth.currentUser;
    const token = await user.getIdToken();

    const response = await fetch(`${backendUrl}/api/tasks/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete all tasks");
    }
    return response.json();
  } catch (error) {
    console.error("Error deleting all tasks:", error);
    throw error;
  }
};
