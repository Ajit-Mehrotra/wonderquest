import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut} from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";

export const firebaseCreateUser = (email, password)=>{
  return createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Handle successful signup
    return userCredential.user;
  })
  .catch((error) => {
    // Handle errors
    const errorCode = error.code;
    const errorMessage = error.message;
    throw new Error(`${errorCode}: ${errorMessage}`);
  });
}

export const firebaseLogOnUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Handle successful login
      return userCredential.user;
    })
    .catch((error) => {
      // Handle errors
      const errorCode = error.code;
      const errorMessage = error.message;
      throw new Error(`${errorCode}: ${errorMessage}`);
    });
};

export const firebaseSignOut = () => {
  return signOut(auth)
  .then(() => {
    // Handle successful sign out
  }).catch((error) => {
    // Handle errors
    const errorCode = error.code;
    const errorMessage = error.message;
    throw new Error(`${errorCode}: ${errorMessage}`);
  });
  ;
};

export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// Function to create a user profile in Firestore
export const createUserProfile = async (user) => {
  try {
    // Create a reference to the user's document in the "users" collection
    const userRef = doc(db, "users", user.uid);

    // Set the user profile data in Firestore
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "", // Include display name
      createdAt: new Date(),
    });
    console.log("User profile created successfully");
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
};