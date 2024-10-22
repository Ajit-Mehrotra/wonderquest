import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";
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
    // You can handle additional actions like saving user info in Firestore
    const { email, displayName } = user;
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

export const getLoginFriendlyErrorMessage = (errorCode) => {
  const errorMessages = {
    "auth/user-not-found":
      "No account found with this email. Please sign up first.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled":
      "This account has been disabled. Please contact support.",
    "Login error: Error: auth/too-many-requests":
      "Too many attempts. Please try again later.",
    "auth/invalid-credential": "Invalid Credentials. Please try again.",
    // Add other Firebase error codes as needed
  };
  return errorMessages[errorCode] || "Invalid input. Please try again.";
};
export const getSignupFriendlyErrorMessage = (errorCode) => {
  const errorMessages = {
    "auth/email-already-in-use":
      "This email is already in use. Please use a different email.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password":
      "The password is too weak. Please use a stronger password.",
    "auth/operation-not-allowed":
      "Sign up is currently disabled. Please try again later.",
    // Add other Firebase error codes as needed
  };
  return (
    errorMessages[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
};
