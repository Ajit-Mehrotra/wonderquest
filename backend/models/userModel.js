import admin from "../firebaseConfig.js";

import { defaultWeights } from "../config.js";

export const getFirebaseUserData = async (userId) => {
  const userRef = admin.firestore().collection(`users`).doc(userId);
  const doc = await userRef.get();
  if (!doc.exists) {
    throw new Error("User not found");
  }
  return doc.data();
};

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

export const updateDisplayNameInDB = async (userId, displayName) => {
  const userRef = admin.firestore().collection("users").doc(userId);
  await userRef.update({
    displayName,
  });
};
