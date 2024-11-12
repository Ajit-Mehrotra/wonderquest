import admin from "../firebaseConfig.js";

import { defaultWeights } from "../config.js";

/**------------------------------------------------------------------------
 *                        CRUD: Creating Users
 *------------------------------------------------------------------------**/
export const createFirebaseUser = async (email, displayName) => {
  //get userId, if exists in Firebase Auth
  const userRecord = await admin.auth().getUserByEmail(email);

  if (!userRecord) {
    throw new Error(
      "Could not create Firestore profile on DB - User does not exist in Firebase Auth"
    );
  }

  // Create a Firestore profile
  await admin.firestore().collection("users").doc(userRecord.uid).set({
    uid: userRecord.uid,
    email: userRecord.email,
    displayName,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    weights: defaultWeights,
  });
};

/**------------------------------------------------------------------------
 *                        CRUD: Reading Users
 *------------------------------------------------------------------------**/

export const getFirebaseUserData = async (userId) => {
  const userRef = admin.firestore().collection(`users`).doc(userId);
  const doc = await userRef.get();
  if (!doc.exists) {
    throw new Error("User not found");
  }
  return doc.data();
};
/**------------------------------------------------------------------------
 *                        CRUD: Updating Users
 *------------------------------------------------------------------------**/
export const updateDisplayNameInDB = async (userId, displayName) => {
  const userRef = admin.firestore().collection("users").doc(userId);
  await userRef.update({
    displayName,
  });
};

export const updateUserEmailInDB = async (userId, email) => {
  const userRef = admin.firestore().collection("users").doc(userId);
  await userRef.update({
    email,
  });
};

/**------------------------------------------------------------------------
 *                        CRUD: Deleting Users
 *------------------------------------------------------------------------**/

export const deleteUserFromDB = async (userId) => {
  // Delete Firestore document
  await admin.firestore().collection("users").doc(userId).delete();

  // Delete Firebase Auth user
  await admin.auth().deleteUser(userId);
};
