import React, { useContext, useState } from "react";
import {
  firebaseLogOnUser,
  signInWithGoogle,
  getLoginFriendlyErrorMessage,
} from "../services/auth";
import { AuthContext } from "context/AuthContext";

function Login() {
  const { setAuthLoading } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setAuthLoading(true);
      await firebaseLogOnUser(email, password);
      setAuthLoading(false);
      console.debug("Logged in user");
    } catch (error) {
      console.error("Login error:", error);
      const friendlyMessage = getLoginFriendlyErrorMessage(error.code);
      setError(friendlyMessage);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      await signInWithGoogle();
      setAuthLoading(false);
      console.debug("Logged in user");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center mt-5">
      <div className="card p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              id="email"
              required
            />
          </div>
          <div className="mb-3">
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
          <button type="submit" className="btn btn-primary w-100">
            Login
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
