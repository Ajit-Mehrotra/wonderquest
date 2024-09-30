import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { firebaseLogOnUser, signInWithGoogle } from "../services/auth";
import { auth } from "../firebase/firebase";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // RACE CONDITION: Name in the Navbar may not be updated but redirects to dashboard if user is already logged in (needs to check both).
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        navigate("/dashboard"); // Redirect to dashboard if logged in
      }
    });
    return unsubscribe;
  }, [navigate]);

  const getFriendlyErrorMessage = (errorCode) => {
    const errorMessages = {
      "auth/user-not-found":
        "No account found with this email. Please sign up first.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/user-disabled":
        "This account has been disabled. Please contact support.",
      "Login error: Error: auth/too-many-requests":
        "Too many attempts. Please try again later.",
      "auth/invalid-credential": "Invalid Credentials. Please try again.",
      // Add other Firebase error codes as needed
    };
    return errorMessages[errorCode] || "Invalid input. Please try again.";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = await firebaseLogOnUser(email, password);

      console.debug("Logged in");
    } catch (error) {
      console.error("Login error:", error);
      console.log("Full error details:", JSON.stringify(error));
      const friendlyMessage = getFriendlyErrorMessage(error.code);
      setError(friendlyMessage);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      console.debug("Logged in with Google");
    } catch (error) {
      console.error("Google login error:", error);
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
