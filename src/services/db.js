import { db } from "../firebase/firebase";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";

// Create a new user profile in Firestore
export const createUserProfile = async (user) => {
  try {
    console.log(user)
    console.log(user.uid)
    console.log(user.email)
    console.log(user.displayName)
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      createdAt: new Date(),
      displayName: user.displayName|| "",
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
};

// Add a task for the user
export const addTask = async (userId, task) => {
  try {
    const tasksRef = collection(db, `users/${userId}/tasks`);
    await addDoc(tasksRef, task);
  } catch (error) {
    console.error("Error adding task:", error);
  }
};