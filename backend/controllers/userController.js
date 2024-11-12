import {
  createFirebaseUser,
  getFirebaseUserData,
  updateDisplayNameInDB,
  deleteUserFromDB,
  updateUserEmailInDB,
} from "../models/userModel.js";

import { STATUS_CODE } from "../config.js";

/**------------------------------------------------------------------------
 *                        CRUD: Creating User
 *------------------------------------------------------------------------**/
export const createUser = async (req, res) => {
  const { email, displayName } = req.body;
  try {
    await createFirebaseUser(email, displayName);
    res
      .status(STATUS_CODE.CREATED)
      .send({ message: "User created successfully" });
  } catch (error) {
    res
      .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
      .send({ error: "Error creating user", details: error.message });
  }
};

/**------------------------------------------------------------------------
 *                        CRUD: Reading User
 *------------------------------------------------------------------------**/
export const getUserProfile = async (req, res) => {
  const userId = req.user.uid;

  if (typeof userId !== "string") {
    return res
      .status(STATUS_CODE.BAD_REQUEST)
      .json({ error: "Invalid user ID" });
  }

  try {
    const data = await getFirebaseUserData(userId);
    res.status(STATUS_CODE.OK).json(data);
  } catch (error) {
    res
      .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user data", details: error.message });
  }
};

/**------------------------------------------------------------------------
 *                        CRUD: Updating User
 *------------------------------------------------------------------------**/
export const updateDisplayName = async (req, res) => {
  const userId = req.user.uid;
  const { displayName } = req.body;
  try {
    await updateDisplayNameInDB(userId, displayName);
    res
      .status(STATUS_CODE.OK)
      .json({ message: "Display name updated successfully" });
  } catch (error) {
    res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      error: "Failed to update display name",
      details: error.message,
    });
  }
};

export const updateUserEmail = async (req, res) => {
  const userId = req.user.uid;
  const { email } = req.body;

  try {
    await updateUserEmailInDB(userId, email);
    res.status(STATUS_CODE.OK).json({ message: "Email updated successfully" });
  } catch (error) {
    res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      error: "Failed to update Email",
      details: error.message,
    });
  }
};

/**------------------------------------------------------------------------
 *                        CRUD: Deleting User
 *------------------------------------------------------------------------**/
export const deleteUser = async (req, res) => {
  const userId = req.user.uid;

  try {
    await deleteUserFromDB(userId);
    res
      .status(STATUS_CODE.OK)
      .send({ message: "User account deleted successfully" });
  } catch (error) {
    res
      .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
      .send({ message: `Failed to delete user account,${error}` });
  }
};
