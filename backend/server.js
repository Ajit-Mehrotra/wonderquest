import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { verifyToken } from "./utils/authTokenMiddleware.js";
import userRouter from "./routes/userRoutes.js";
import taskRouter from "./routes/taskRoutes.js";

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

// Protect routes with the verifyToken middleware
app.use("/api", verifyToken); // Apply to all /api routes
app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);
console.log("Routes added");

// app.get("/api/test", (req, res) => {
//   res.send("CORS is configured correctly!");
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
