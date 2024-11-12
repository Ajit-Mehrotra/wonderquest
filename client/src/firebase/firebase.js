import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { GoogleAuthProvider } from "firebase/auth";

const API_KEY = import.meta.env.VITE_APP_FIREBASE_AUTH_API_KEY;
const AUTH_DOMAIN = import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN;
const PROJECT_ID = import.meta.env.VITE_APP_FIREBASE_AUTH_PROJECT_ID;
const STORAGE_BUCKET = import.meta.env.VITE_APP_FIREBASE_AUTH_STORAGE_BUCKET;
const MESSAGING_SENDER_ID = import.meta.env
  .VITE_APP_FIREBASE_AUTH_MESSAGING_SENDER_ID;
const APP_ID = import.meta.env.VITE_APP_FIREBASE_AUTH_APP_ID;
const MEASUREMENT_ID = import.meta.env.VITE_APP_FIREBASE_AUTH_MEASUREMENT_ID;

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export const db = getFirestore(app);

// Get Providers
export const googleProvider = new GoogleAuthProvider();
