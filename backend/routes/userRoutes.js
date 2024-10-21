import {
  getUserProfile,
  createUser,
  updateTaskWeights,
  getTaskWeights,
  updateDisplayName,
  deleteUser,
  updateUserEmail,
} from "../controllers/userController.js";

import express from "express";
const router = express.Router();

// Route to update user's display name
router.patch("/user-profile/email", updateUserEmail);

router.get("/user-profile", getUserProfile);

// Route to sign up a new user
router.post("/signup", createUser);

// Route to update user's display name
router.patch("/:userId", updateDisplayName);

router.delete("/:userId", deleteUser);

// Route to get user's prioritization weights
router.get("/:userId/weights", getTaskWeights);

// Route to update user's prioritization weights
router.patch("/:userId/weights", updateTaskWeights);

export default router;
