import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { auth, db, googleProvider } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createUserProfile } from "./api";

export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

export const firebaseLogOnUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Handle successful login
      return userCredential.user;
    })
    .catch((error) => {
      throw error;
    });
};

export const firebaseSignOut = () => {
  return signOut(auth)
    .then(() => {
      // Handle successful sign out
    })
    .catch((error) => {
      throw error;
    });
};

// Function for Google Sign-In using Popup
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Google User:", user);
    // You can handle additional actions like saving user info in Firestore
    const { uid, email, displayName } = user;
    await createUserProfile({ email, displayName });
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
  }
};

// Alternative method using redirect
export const signInWithGoogleRedirect = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
    // Handle post-sign-in logic after redirect
  } catch (error) {
    console.error("Error during Google Sign-In with redirect:", error);
  }
};
