import React, {  useState } from "react";
import { auth } from "../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithGoogle } from "services/auth";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const backendUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

  const validateEmail = (email) => {
    // Regular expression for validating an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getFriendlyErrorMessage = (errorCode) => {
    const errorMessages = {
      "auth/email-already-in-use":
        "This email is already in use. Please use a different email.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/weak-password":
        "The password is too weak. Please use a stronger password.",
      "auth/operation-not-allowed":
        "Sign up is currently disabled. Please try again later.",
      // Add other Firebase error codes as needed
    };
    return (
      errorMessages[errorCode] ||
      "An unexpected error occurred. Please try again."
    );
  };
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      console.debug("Logged in with Google");
    } catch (error) {
      console.error("Google login error:", error);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); // Clear previous errors before new attempt

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      // Step 1: Create the user in Firebase Authentication
      // Step 2: Log in the user immediately (handled automatically by Firebase Auth)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      console.debug("User signed up and logged in on Firebase Auth");

      // Step 3: Send a request (with generated auth token  token) to our backend server to create the user profile in Firestore Database as well
      const response = await fetch(`${backendUrl}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, displayName: name }),
      });
      console.debug("Added user to Firebase DB");
      if (!response.ok) throw new Error("Sign up failed");

      console.debug("Sign up successful.");
    } catch (error) {
      console.error("Signup error:", error);
      const friendlyMessage = getFriendlyErrorMessage(error.code);
      setError(friendlyMessage || "An error occurred during sign up.");
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center mt-5">
      <div className="card p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="form-control"
              id="name"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
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
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
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
            Sign Up
          </button>
        </form>
        <hr />
        <button
          onClick={handleGoogleLogin}
          className="btn btn-outline-danger w-100"
        >
          Sign Up with Google
        </button>
      </div>
    </div>
  );
}

export default Signup;
