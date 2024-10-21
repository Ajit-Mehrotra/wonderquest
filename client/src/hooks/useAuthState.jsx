import { useState, useEffect, useContext } from "react";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "context/AuthContext";

// Unused hook due to the VisitorRoute and UserRoute components in App.jsx.
// Kept here just in case needed for future use.
export const useAuthState = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  return user;
};
