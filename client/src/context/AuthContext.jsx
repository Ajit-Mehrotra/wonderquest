import React, { createContext, useState, useContext, useEffect } from "react";
import { observeAuthState } from "services/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Use Firebase to observe authentication state
    // Source of truth for global auth state
    // For a brief period, user will exist, but authLoading will be true. This is because the user is created in Firebase Auth, but not yet in Firestore Database.
    // This is why Dashboard and other pages should check for authLoading before rendering user-specific content.

    const unsubscribe = observeAuthState((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, authLoading, setAuthLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  return useContext(AuthContext);
};
