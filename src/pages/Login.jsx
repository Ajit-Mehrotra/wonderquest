import React, { useContext, useState } from "react";
import {
  firebaseLogOnUser,
  signInWithGoogle,
  getLoginFriendlyErrorMessage,
} from "../services/auth";
import { AuthContext } from "context/AuthContext";
import { ThemeContext } from "context/ThemeContext";

function Login() {
  const { authLoading, setAuthLoading } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const validateForm = () => {
    if (!email) return "Email is required";
    if (!password) return "Password is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setAuthLoading(true);
      await firebaseLogOnUser(email, password);
      console.debug("Logged in user");
    } catch (error) {
      console.error("Login error:", error);
      const friendlyMessage = getLoginFriendlyErrorMessage(error.code);
      setError(friendlyMessage);
    } finally {
      setAuthLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      await signInWithGoogle();
      console.debug("Logged in user");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div
      className={`container d-flex align-items-center justify-content-center mt-5  `}
    >
      <div className={`card p-4 `} style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className={`text-center mb-4 `}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className={`mb-3 ${isDarkMode ? "text-white-50" : ""} `}>
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              className={`form-control `}
              id="email"
              required
            />
          </div>
          <div className={`mb-3 ${isDarkMode ? "text-white-50" : ""}`}>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              id="password"
              required
            />
          </div>
          {error && ( // Display error message if it exists
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary w-100 "
            disabled={authLoading}
          >
            {authLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <hr />
        <button
          onClick={handleGoogleLogin}
          className="btn btn-outline-danger w-100"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
