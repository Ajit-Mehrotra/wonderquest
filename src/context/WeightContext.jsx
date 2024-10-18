import React, { createContext, useState, useEffect, useContext } from "react";
import { fetchUserWeights } from "../services/api";
import { AuthContext } from "./AuthContext";

export const WeightsContext = createContext(null);

export const WeightsProvider = ({ children }) => {
  const { user, authLoading } = useContext(AuthContext);

  const [weights, setWeights] = useState(null);

  useEffect(() => {
    const loadUserWeights = async () => {
      if (authLoading) return;
      if (user) {
        try {
          const fetchedWeights = await fetchUserWeights(user.uid);
          setWeights(fetchedWeights);
        } catch (error) {
          console.error("Failed to fetch user weights", error);
        }
      } else {
        setWeights(null);
      }
    };

    loadUserWeights();
  }, [user, authLoading]);

  return (
    <WeightsContext.Provider value={{ weights, setWeights }}>
      {children}
    </WeightsContext.Provider>
  );
};
