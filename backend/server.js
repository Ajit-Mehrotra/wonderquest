import express from 'express';
import admin from 'firebase-admin';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
  credentials: true, // Allow credentials
}));

app.use(express.json());

// Read service account key from the secure location
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Test route for CORS
app.get('/api/test', (req, res) => {
  res.send('CORS is configured correctly!');
});

// Route to sign up a new user
app.post('/api/signup', async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // Create a Firestore profile
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).send({ message: 'User created successfully', userRecord });
  } catch (error) {
    res.status(400).send({ error: 'Error creating user', details: error.message });
  }
});

// Fetch tasks for the authenticated user
app.get('/api/tasks', async (req, res) => {
  const userId = req.query.userId; // Use user ID from the query or request headers
  try {
    const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
    const snapshot = await tasksRef.get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
  }
});

// Add a new task for the authenticated user
app.post('/api/tasks', async (req, res) => {
  const { userId, task } = req.body; // Expecting userId and task data in the body
  try {
    const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
    const newTask = await tasksRef.add(task);
    res.status(201).json({ message: 'Task added successfully', id: newTask.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add task', details: error.message });
  }
});

// Update a task for the authenticated user
app.patch('/api/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { userId, updates } = req.body;
  try {
    const taskRef = admin.firestore().collection(`users/${userId}/tasks`).doc(taskId);
    await taskRef.update(updates);
    res.status(200).json({ message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task', details: error.message });
  }
});

// Delete a task for the authenticated user
app.delete('/api/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.body; // Expecting userId in the body
  try {
    const taskRef = admin.firestore().collection(`users/${userId}/tasks`).doc(taskId);
    await taskRef.delete();
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});