// Import necessary libraries and components
import React, { useState, useEffect } from "react"; // React and hooks for state management and side effects

import { Container } from "react-bootstrap"; // UI components from react-bootstrap

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import OldDashboard from "./pages/OldDashboard";
import NavbarComponent from "./components/NavbarComponent";
import Home from "./pages/Home";
import { observeAuthState, firebaseSignOut } from "./services/auth";
import { fetchUserProfile } from "services/api";
import Settings from "pages/Settings";

function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState(null);
  const [loadingName, setLoadingName] = useState(false);
  const [formulaWeights, setFormulaWeights] = useState({
    urgencyWeight: 100,
    valueWeight: 60,
    sizeWeight: 40,
  });

  useEffect(() => {
    // Use Firebase to observe authentication state
    const unsubscribe = observeAuthState(setUser);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let isMounted = false;
    if (user) {
      const fetchUserName = async () => {
        try {
          setLoadingName(true);
          const profile = await fetchUserProfile(user.uid);
          // console.log(profile);
          if (!isMounted) {
            setName(profile.displayName);
            setLoadingName(false);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setLoadingName(false);
        }
      };
      fetchUserName();
    }

    return () => {
      isMounted = false;
      setName(null);
      setLoadingName(false);
    };
  }, [user]);
  const handleLogout = async () => {
    try {
      await firebaseSignOut();
      setUser(null); // Update state after successful sign-out
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Render the component
  return (
    <Router>
      <Container>
        <div className="container text-center my-4">
          <NavbarComponent
            isLoggedIn={user}
            name={name}
            handleLogout={handleLogout}
            loadingName={loadingName}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                user ? (
                  <Dashboard formulaWeights={formulaWeights} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/settings"
              element={
                user ? (
                  <Settings
                    formulaWeights={formulaWeights}
                    setFormulaWeights={setFormulaWeights}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route path="/old-dashboard" element={<OldDashboard />} />
          </Routes>
        </div>
      </Container>
    </Router>
  );
}

// Export the App component as the default export
export default App;
