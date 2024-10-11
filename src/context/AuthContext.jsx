import React, { createContext, useState, useContext, useEffect } from "react";
import { observeAuthState } from "services/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Use Firebase to observe authentication state
    // Source of truth for global auth state
    const unsubscribe = observeAuthState(setUser);

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  return useContext(AuthContext);
};
