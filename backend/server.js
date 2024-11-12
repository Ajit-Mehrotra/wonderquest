import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import https from "https";

import { verifyToken } from "./utils/authTokenMiddleware.js";
import userRouter from "./routes/userRoutes.js";
import taskRouter from "./routes/taskRoutes.js";

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
let sslOptions;

// Check for SSL files only in production
if (process.env.NODE_ENV === "production") {
  try {
    sslOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    };
    console.log("SSL certificates loaded.");
  } catch (error) {
    console.error("Failed to load SSL certificates:", error);
    process.exit(1);
  }
}

// Allow requests from frontend
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(express.json());

// Middleware and routes
app.use("/api", verifyToken);
app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);

// if SSL files are loaded, create an HTTPS server, otherwise create HTTP
if (sslOptions) {
  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`HTTPS server running`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
  });
}
