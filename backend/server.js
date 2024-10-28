import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import https from "https";

import { verifyToken } from "./utils/authTokenMiddleware.js";
import userRouter from "./routes/userRoutes.js";
import taskRouter from "./routes/taskRoutes.js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
let sslOptions;

try {
  sslOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/wonderquest.ajitm.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/wonderquest.ajitm.com/fullchain.pem'),
  };
} catch (error) {
  console.error("Failed to load SSL certificates:", error);
  process.exit(1); // Exit the app if the certificates cannot be loaded
}


// Configure CORS to allow requests from your frontend
app.use(
  cors({
    origin: CORS_ORIGIN, // Allow requests from your frontend URL
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

https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
  });

