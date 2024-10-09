import React, { useState, useEffect, useContext } from "react";

import { Container } from "react-bootstrap";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NavbarComponent from "./components/Navbar";
import Home from "./pages/Home";
import { observeAuthState, firebaseSignOut } from "./services/auth";
import { fetchUserProfile } from "services/api";
import Settings from "pages/Settings";
import { AuthContext, AuthProvider } from "context/AuthContext";

// is able to access the context because Protected Route is a child of the UserProvider function below.
function UserRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}

function VisitorRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  return children;
}

function App() {
  const [formulaWeights, setFormulaWeights] = useState({
    urgencyWeight: 100,
    valueWeight: 60,
    sizeWeight: 40,
  });
  return (
    <AuthProvider>
      <Router>
        <Container>
          <div className="container text-center my-4">
            <NavbarComponent />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/login"
                element={
                  <VisitorRoute>
                    <Login />
                  </VisitorRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <VisitorRoute>
                    <Signup />
                  </VisitorRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <UserRoute>
                    <Dashboard formulaWeights={formulaWeights} />
                  </UserRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <UserRoute>
                    <Settings
                      formulaWeights={formulaWeights}
                      setFormulaWeights={setFormulaWeights}
                    />
                  </UserRoute>
                }
              />
            </Routes>
          </div>
        </Container>
      </Router>
    </AuthProvider>
  );
}

// Export the App component as the default export
export default App;
