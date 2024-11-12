import {
  getUserProfile,
  createUser,

  updateDisplayName,
  deleteUser,
  updateUserEmail,
} from "../controllers/userController.js";

import express from "express";
const router = express.Router();

/**------------------------------------------------------------------------
 *                        CRUD: Creating User
 *------------------------------------------------------------------------**/
router.post("/signup", createUser);

/**------------------------------------------------------------------------
 *                        CRUD: Reading User
 *------------------------------------------------------------------------**/
router.get("/user-profile", getUserProfile);

/**------------------------------------------------------------------------
 *                        CRUD: Updating User
 *------------------------------------------------------------------------**/

router.patch("/user-profile/displayName", updateDisplayName);
router.patch("/user-profile/email", updateUserEmail);

/**------------------------------------------------------------------------
 *                        CRUD: Deleting User
 *------------------------------------------------------------------------**/
router.delete("/delete", deleteUser);

export default router;
