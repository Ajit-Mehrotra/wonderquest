import {
  getUserProfile,
  createUser,
  updateTaskWeights,
  getTaskWeights,
  updateDisplayName,
} from "../controllers/userController.js";

import express from "express";
const router = express.Router();

router.get("/user-profile", getUserProfile);

// Route to sign up a new user
router.post("/signup", createUser);

// Route to update user's display name
router.patch("/:userId", updateDisplayName);

// Route to get user's prioritization weights
router.get("/:userId/weights", getTaskWeights);

// Route to update user's prioritization weights
router.patch("/:userId/weights", updateTaskWeights);

export default router;
