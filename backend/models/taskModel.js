import admin from "../firebaseConfig.js";

/**------------------------------------------------------------------------
 *                        CRUD: Creating Tasks
 *------------------------------------------------------------------------**/

export const addTaskToDB = async (userId, newTask) => {
  const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
  const newTaskRef = await tasksRef.add(newTask);
  return newTaskRef.id;
};

/**------------------------------------------------------------------------
 *                        CRUD: Reading Tasks
 *------------------------------------------------------------------------**/

export const getTaskFromDB = async (userId, taskId) => {
  const taskRef = admin
    .firestore()
    .collection(`users/${userId}/tasks`)
    .doc(taskId);
  const doc = await taskRef.get();
  if (!doc.exists) {
    throw new Error("Task not found");
  }
  return { id: doc.id, ...doc.data() };
};

export const getTasksFromDB = async (userId) => {
  const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
  const snapshot = await tasksRef.get();
  const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return tasks;
};

export const getTaskWeightFromDB = async (userId) => {
  const userRef = admin.firestore().collection("users").doc(userId);
  const doc = await userRef.get();
  if (!doc.exists) {
    throw new Error("User not found");
  }
  const weights = doc.data().weights;
  return weights;
};

/**------------------------------------------------------------------------
 *                        CRUD: Updating Tasks
 *------------------------------------------------------------------------**/
export const updateTaskInDB = async (userId, taskId, updatedTask) => {
  const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
  await tasksRef.doc(taskId).update(updatedTask);
};
export const updateTaskWeightsInDB = async (
  userId,
  urgencyWeight,
  valueWeight,
  sizeWeight
) => {
  const userRef = admin.firestore().collection("users").doc(userId);
  await userRef.update({
    weights: {
      urgencyWeight,
      valueWeight,
      sizeWeight,
    },
  });
};


/**
 * Updates the task pointers (prevTaskId and nextTaskId) for a given task.
 * When a task is inserted between two existing tasks, the pointers of the
 * previous and next tasks need to be updated accordingly.
 * @param {string} userId User ID
 * @param {Object} prevTask Previous task. If null, no update is needed.
 * @param {Object} nextTask Next task. If null, no update is needed.
 * @param {string} newTaskId ID of the new task to be inserted.
 */
export const updateTaskPointersInDB = async (
  userId,
  prevTask,
  nextTask,
  newTaskId
) => {
  const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
  // Update the previous task's nextTaskId if there was a previous task
  if (prevTask) {
    await tasksRef.doc(prevTask.id).update({
      nextTaskId: newTaskId,
    });
  }

  // Update the next task's prevTaskId if there was a next task
  if (nextTask) {
    await tasksRef.doc(nextTask.id).update({
      prevTaskId: newTaskId,
    });
  }
};

/**
 * Unlinks a task from the doubly-linked list of tasks in the database.
 * @param {string} userId - The ID of the user that owns the task.
 * @param {Object} taskId - The ID of the task to unlink, and its prevTaskId and nextTaskId.
 */
export const unlinkTaskInDB = async (userId, taskId) => {
  const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
  const prevTask = taskId.prevTaskId;
  const nextTask = taskId.nextTaskId;

  if (prevTask) {
    await tasksRef.doc(prevTask).update({
      nextTaskId: nextTask,
    });
  }
  if (nextTask) {
    await tasksRef.doc(nextTask).update({
      prevTaskId: prevTask,
    });
  }
};

/**------------------------------------------------------------------------
 *                        CRUD: Deleting Tasks
 *------------------------------------------------------------------------**/

export const deleteTaskFromDB = async (userId, taskId) => {
  const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
  await tasksRef.doc(taskId).delete();
};

export const deleteAllTasksFromDB = async (userId) => {
  const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
  const snapshot = await tasksRef.get();

  const batch = admin.firestore().batch();
  snapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};
