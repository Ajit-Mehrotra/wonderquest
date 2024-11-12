import { auth } from "../firebase/firebase";

const backendUrl = import.meta.env.VITE_APP_BACKEND_SERVER_URL;

//TODO: future, abstract error handling

/**
 * Makes an API call to the backend server. Automatically
 * handles authentication and serialization of JSON data.
 *
 * @param {string} url The URL of the API endpoint to call.
 * @param {object} fetchOptions Options to pass to the fetch function.
 * @returns {Promise} The response from the API call.
 */
const apiCall = async (url, fetchOptions) => {
  const user = auth.currentUser;
  const token = await user.getIdToken();

  const options = structuredClone(fetchOptions);

  options.headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  if (options.body && typeof options.body === "object") {
    options.body = JSON.stringify(options.body);
  }

  return fetch(`${backendUrl}/api/${url}`, options);
};

/**------------------------------------------------------------------------
 *                        CRUD: Creating
 *------------------------------------------------------------------------**/

export const createUserProfile = async ({ email, displayName = null }) => {
  try {
    const response = await apiCall("users/signup", {
      body: { email, displayName },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to create user profile");
    }
    return response.json();
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const addTask = async ({ task }) => {
  try {
    const response = await apiCall("tasks", {
      method: "POST",
      body: { task },
    });

    if (!response.ok) {
      throw new Error("Failed to add task");
    }
    return response.json();
  } catch (error) {
    console.error("Error adding task:", error);
    throw error;
  }
};

/**------------------------------------------------------------------------
 *                        CRUD: Reading
 *------------------------------------------------------------------------**/
export const fetchTasksFromApi = async () => {
  try {
    const response = await apiCall("tasks", { method: "GET" });
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const fetchUserWeights = async () => {
  try {
    const response = await apiCall("tasks/weights", { method: "GET" });
    if (!response.ok) {
      throw new Error("Failed to get user weights");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching weights:", error);
    throw error;
  }
};

/**------------------------------------------------------------------------
 *                        CRUD: Updating
 *------------------------------------------------------------------------**/
export const updateDisplayName = async ({ displayName }) => {
  try {
    const response = await apiCall("users/user-profile/displayName", {
      method: "PATCH",
      body: { displayName },
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
    const response = await apiCall("users/user-profile/email", {
      method: "PATCH",
      body: { email },
    });

    if (!response.ok) {
      throw new Error("Failed to update user's email");
    }
    return response.json();
  } catch (error) {
    console.error("Error updating user's email:", error);
    throw error;
  }
};

export const reorderTasks = async ({
  taskId,
  targetPrevTaskId,
  targetNextTaskId,
  status,
}) => {
  try {
    const response = await apiCall(`tasks/reorder/${taskId}`, {
      method: "PATCH",
      body: { targetPrevTaskId, targetNextTaskId, status },
    });
    if (!response.ok) {
      throw new Error("Failed to reorder tasks");
    }
    return response.json();
  } catch (error) {
    console.error("Error reordering tasks:", error);
    throw error;
  }
};

export const updateTask = async (taskId, updates) => {
  try {
    const response = await apiCall(`tasks/${taskId}`, {
      method: "PATCH",
      body: { updates },
    });
    if (!response.ok) {
      throw new Error("Failed to update task");
    }
    return response.json();
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const updateUserWeights = async ({ weights }) => {
  try {
    const response = await apiCall("tasks/weights", {
      method: "PATCH",
      body: weights,
    });
    if (!response.ok) {
      throw new Error("Failed to update user weights");
    }
    return response.json();
  } catch (error) {
    console.error("Error updating weights:", error);
    throw error;
  }
};

/**------------------------------------------------------------------------
 *                        CRUD: Deleting
 *------------------------------------------------------------------------**/
export const deleteUserAccount = async () => {
  try {
    const response = await apiCall("users/delete", { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Failed to delete user account");
    }
    return response.json();
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const response = await apiCall(`tasks/${taskId}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const deleteAllTasks = async () => {
  try {
    const response = await apiCall("tasks", { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Failed to delete all tasks");
    }
    return response.json();
  } catch (error) {
    console.error("Error deleting all tasks:", error);
    throw error;
  }
};
