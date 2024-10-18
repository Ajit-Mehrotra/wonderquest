import React, { useContext } from "react";

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
import Settings from "pages/Settings";
import { AuthContext, AuthProvider } from "context/AuthContext";
import { TaskProvider } from "context/TaskContext";
import { WeightsProvider } from "context/WeightContext";

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
  const CombinedProviders = ({ children }) => (
    <AuthProvider>
      <WeightsProvider>
        <TaskProvider>{children}</TaskProvider>
      </WeightsProvider>
    </AuthProvider>
  );

  return (
    <CombinedProviders>
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
                    <Dashboard />
                  </UserRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <UserRoute>
                    <Settings />
                  </UserRoute>
                }
              />
            </Routes>
          </div>
        </Container>
      </Router>
    </CombinedProviders>
  );
}

// Export the App component as the default export
export default App;
