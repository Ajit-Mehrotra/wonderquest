
import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBUXzuHWGi4vHXzN2CDSvqn6iJmPagCCvw",
    authDomain: "auto-kanban.firebaseapp.com",
    projectId: "auto-kanban",
    storageBucket: "auto-kanban.appspot.com",
    messagingSenderId: "769788129508",
    appId: "1:769788129508:web:1237f78c8d61131110bcf1",
    measurementId: "G-V0Y7K6K190"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  
  // Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);

  
  
  