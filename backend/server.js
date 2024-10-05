import express from "express";
import admin from "firebase-admin";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS to allow requests from your frontend
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from your frontend URL
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed methods
    credentials: true, // Allow credentials
  })
);

app.use(express.json());

// Read service account key from the secure location
const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split(" ")[1]; // Extract token from header
  if (!idToken) {
    return res.status(401).send("Unauthorized: No token provided");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized: Invalid token");
  }
};

// Protect routes with the verifyToken middleware
app.use("/api", verifyToken); // Apply to all /api routes

// --- START HELPER FUNCTIONS ---

// Helper function to map tasks by ID and find the head
const mapTasksAndFindHead = (currentTasks, status) => {
  const taskMap = {};
  let headTask = null;
  console.log("Passed in Status: ", status);

  currentTasks.forEach((doc) => {
    console.log(
      `${doc.data().name}: has same status as passed in ${status}: ${
        doc.data().status === status
      }`
    );
    if (doc.data().status === status) {
      const task = { id: doc.id, ...doc.data() };
      taskMap[task.id] = task;

      if (task.prevTaskId === null) {
        headTask = task;
      }
    }
  });

  return { taskMap, headTask };
};

// Helper function to traverse the linked list from the head
const traverseLinkedList = (taskMap, headTask) => {
  const orderedTasks = [];
  let currentTask = headTask;

  while (currentTask) {
    orderedTasks.push(currentTask);
    currentTask = currentTask.nextTaskId
      ? taskMap[currentTask.nextTaskId]
      : null;
  }

  return orderedTasks;
};

// Helper function to find the position to insert a new task based on priority
const findInsertionPosition = (taskMap, headTask, newTaskPriority) => {
  let prevTask = null;
  let nextTask = headTask;

  while (
    nextTask &&
    (nextTask.ignorePriority || nextTask.priority < newTaskPriority)
  ) {
    prevTask = nextTask;
    nextTask = nextTask.nextTaskId ? taskMap[nextTask.nextTaskId] : null;
  }

  return { prevTask, nextTask };
};

// Helper function to update task references after adding/updating a task
const updateTaskReferences = async (
  tasksRef,
  prevTask,
  nextTask,
  newTaskId
) => {
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

// --- END HELPER FUNCTIONS ---

app.get("/api/user-profile", async (req, res) => {
  const userId = req.query.userId;
  // console.log(userId);
  try {
    const userRef = admin.firestore().collection(`users`).doc(userId);
    const doc = await userRef.get();
    res.status(200).json(doc.data());
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch user data", details: error.message });
  }
});

// Test route for CORS
app.get("/api/test", (req, res) => {
  res.send("CORS is configured correctly!");
});

// Route to sign up a new user
app.post("/api/signup", async (req, res) => {
  const { email, displayName } = req.body;

  try {
    const userRecord = await admin.auth().getUserByEmail(email);

    // Create a Firestore profile
    await admin
      .firestore()
      .collection("users")
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        weights: {
          urgencyWeight: 100,
          valueWeight: 60,
          sizeWeight: 40,
        },
      });

    res.status(201).send({ message: "User created successfully", userRecord });
  } catch (error) {
    res
      .status(400)
      .send({ error: "Error creating user", details: error.message });
  }
});

// Route to update user's prioritization weights
app.patch("/api/users/:userId/weights", async (req, res) => {
  const { userId } = req.params;
  const { urgencyWeight, valueWeight, sizeWeight } = req.body;

  try {
    const userRef = admin.firestore().collection("users").doc(userId);
    const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);

    // Update weights in the user profile
    await userRef.update({
      weights: {
        urgencyWeight,
        valueWeight,
        sizeWeight,
      },
    });

    // Fetch all tasks for the user
    const tasksSnapshot = await tasksRef.get();
    const tasks = tasksSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });

    // Calculate new priority for each task and update `ignorePriority` to false
    const updatedTasks = tasks.map((task) => {
      const newPriority =
        task.urgency.value * urgencyWeight +
        task.value.value * valueWeight +
        task.size.value * sizeWeight;

      return {
        ...task,
        priority: newPriority,
        ignorePriority: false,
      };
    });

    // Sort tasks based on the new priority
    updatedTasks.sort((a, b) => a.priority - b.priority);

    // Update tasks in the database and re-link the linked list
    let previousTaskId = null;

    for (const task of updatedTasks) {
      const taskUpdates = {
        priority: task.priority,
        ignorePriority: false,
        prevTaskId: previousTaskId,
        nextTaskId: null,
      };

      if (previousTaskId) {
        await tasksRef.doc(previousTaskId).update({
          nextTaskId: task.id,
        });
      }

      await tasksRef.doc(task.id).update(taskUpdates);
      previousTaskId = task.id;
    }

    res.status(200).json({ message: "Weights and tasks updated successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update weights and tasks",
      details: error.message,
    });
  }
});

// Fetch tasks for the authenticated user
app.get("/api/tasks", async (req, res) => {
  const userId = req.query.userId; // Use user ID from the query
  try {
    const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
    const snapshot = await tasksRef.get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(tasks);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch tasks", details: error.message });
  }
});

// Add New Task & Re-arrange the linked list
app.post("/api/tasks", async (req, res) => {
  const { userId, task } = req.body; // Expecting userId and task data in the body
  try {
    const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
    const currentTasks = await tasksRef.get();

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
      status: "Priority Backlog",
    };

    // Add task to the database
    const newTaskRef = await tasksRef.add(newTaskData);
    const newTaskId = newTaskRef.id;

    // Update the references for previous and next tasks
    await updateTaskReferences(tasksRef, prevTask, nextTask, newTaskId);

    res.status(201).json({ message: "Task added successfully", id: newTaskId });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add task", details: error.message });
  }
});

//Update Task & Re-arrange the linked list
app.patch("/api/tasks/:taskId", async (req, res) => {
  const { userId, updates } = req.body; // Expecting userId and task updates in the body
  const { taskId } = req.params;

  try {
    const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
    const currentTasks = await tasksRef.get();

    // Map tasks and find the head
    const { taskMap, headTask } = mapTasksAndFindHead(
      currentTasks,
      updates.status
    );

    // Find the task to be updated
    const taskToUpdate = taskMap[taskId];
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
      if (taskToUpdate.prevTaskId) {
        await tasksRef.doc(taskToUpdate.prevTaskId).update({
          nextTaskId: taskToUpdate.nextTaskId,
        });
      }
      if (taskToUpdate.nextTaskId) {
        await tasksRef.doc(taskToUpdate.nextTaskId).update({
          prevTaskId: taskToUpdate.prevTaskId,
        });
      }

      // Find the correct new position for the updated task
      const { prevTask, nextTask } = findInsertionPosition(
        taskMap,
        headTask,
        updates.priority
      );

      updatedTask.prevTaskId = prevTask ? prevTask.id : null;
      updatedTask.nextTaskId = nextTask ? nextTask.id : null;

      // Update the references for the previous and next tasks
      await updateTaskReferences(tasksRef, prevTask, nextTask, taskId);
    }

    // Update the task in Firestore
    await tasksRef.doc(taskId).update(updatedTask);

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update task", details: error.message });
  }
});

app.patch("/api/tasks/reorder/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { userId, targetPrevTaskId, targetNextTaskId, status } = req.body;

  console.log(
    `User ID: ${JSON.stringify(
      userId,
      null,
      4
    )} ,  Moving this task: ${JSON.stringify(
      taskId,
      null,
      4
    )}, User Target Prev ID: ${JSON.stringify(
      targetPrevTaskId,
      null,
      4
    )}, User Target Next ID: ${JSON.stringify(targetNextTaskId, null, 4)},  `
  );

  try {
    const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
    const taskDoc = await tasksRef.doc(taskId).get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const draggedTask = taskDoc.data();
    const isSameColumn = draggedTask.status === status;
    const { prevTaskId, nextTaskId } = draggedTask;

    //Remove task from current position by updating its neighbors
    if (prevTaskId) {
      await tasksRef.doc(prevTaskId).update({
        nextTaskId: nextTaskId || null,
      });
    }
    if (nextTaskId) {
      await tasksRef.doc(nextTaskId).update({
        prevTaskId: prevTaskId || null,
      });
    }

    // - updated old column
    if (!isSameColumn) {
      console.log("Is Different Column");
      // Add a new task to the same column
      const currentTasks = await tasksRef.get();

      const { taskMap, headTask } = mapTasksAndFindHead(currentTasks, status);
      console.log("Task Map", JSON.stringify(taskMap, null, 4));
      console.log("Head Task", JSON.stringify(headTask, null, 4));

      // Find the correct position to insert the new task based on priority
      const { prevTask, nextTask } = findInsertionPosition(
        taskMap,
        headTask,
        draggedTask.priority
      );

      console.log("NEW Prev Task ", JSON.stringify(prevTask, null, 4));
      console.log("NEW Next Task ", JSON.stringify(nextTask, null, 4));

      const newTaskData = {
        ...draggedTask,
        prevTaskId: prevTask ? prevTask.id : null,
        nextTaskId: nextTask ? nextTask.id : null,
        status,
        ignorePriority: false,
      };

      // Update current task to the database
      await tasksRef.doc(taskId).update(newTaskData);

      // Update the references for previous and next tasks
      await updateTaskReferences(tasksRef, prevTask, nextTask, taskId);

      console.log("Updated all task references");
      console.log(
        "Current Task",
        taskId,
        "Prev Task: ",
        JSON.stringify(prevTask, null, 4),
        "Next Task: ",
        JSON.stringify(nextTask, null, 4)
      );

      res.status(201).json({
        message: "Task moved and inserted successfully",
        id: taskId,
      });
    } else {
      console.log("column was NOT changed");
      // if not same column, do what we're doing already
      if (targetPrevTaskId) {
        // Update dragged task's previous and next task IDs
        const targetPrevTaskDoc = await tasksRef.doc(targetPrevTaskId).get();
        if (!targetPrevTaskDoc.exists) {
          return res
            .status(404)
            .json({ error: "Previous Target Node task not found" });
        }
        // Update the target previous task's nextTaskId to the dragged task
        await tasksRef.doc(targetPrevTaskId).update({
          nextTaskId: taskId,
        });
      }

      if (targetNextTaskId) {
        // Update dragged task's previous and next task IDs
        const targetNextTaskDoc = await tasksRef.doc(targetNextTaskId).get();
        if (!targetNextTaskDoc.exists) {
          return res
            .status(404)
            .json({ error: "Next Target Node task not found" });
        }
        // Update the target previous task's nextTaskId to the dragged task
        await tasksRef.doc(targetNextTaskId).update({
          prevTaskId: taskId,
        });
      }

      // Update the dragged task with its new neighbors
      await tasksRef.doc(taskId).update({
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
});

//Delete Task & Re-arrange the linked list
app.delete("/api/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.body; // Assuming the userId is sent in the request body

  try {
    const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
    const taskDoc = await tasksRef.doc(taskId).get();

    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }

    const taskToDelete = taskDoc.data();
    const { prevTaskId, nextTaskId } = taskToDelete;

    // Update the previous task's nextTaskId to point to the next task
    if (prevTaskId) {
      await tasksRef.doc(prevTaskId).update({
        nextTaskId: nextTaskId || null,
      });
    }

    // Update the next task's prevTaskId to point to the previous task
    if (nextTaskId) {
      await tasksRef.doc(nextTaskId).update({
        prevTaskId: prevTaskId || null,
      });
    }

    // Delete the task
    await tasksRef.doc(taskId).delete();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete task", details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
