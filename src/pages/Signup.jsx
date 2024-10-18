import React, { useContext, useState } from "react";
import { auth } from "../firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { signInWithGoogle, getSignupFriendlyErrorMessage } from "services/auth";
import { AuthContext } from "context/AuthContext";
import { createUserProfile } from "services/api";

// import { createUserProfile } from "services/api";
// import { AuthContext } from "context/AuthContext";

function Signup() {
  const { setUser, setAuthLoading } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    // Regular expression for validating an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    setError("");
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      await signInWithGoogle();
      setAuthLoading(false);
      console.debug("Logged In");
    } catch (error) {
      console.error("Google login error:", error);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); // Clear previous errors before new attempt

    if (!validateEmail(formEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      // Step 1: Create the user in Firebase Authentication (done through frontend)
      // Step 1.5: Log in the user immediately (handled automatically by Firebase Auth)
      // Step 2: Send a request (with generated auth token  token) to our backend server to create the user profile in Firestore Database as well

      // For a brief period, user will exist, but authLoading will be true. This is because the user is created in Firebase Auth, but not yet in Firestore Database.
      // This is why Dashboard and other pages should check for authLoading before rendering user-specific content.

      setAuthLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formEmail,
        password
      );

      const authUser = userCredential.user;

      await updateProfile(authUser, {
        displayName: name,
      });

      await authUser.reload();
      const updatedAuthUser = auth.currentUser;

      const { uid, email, displayName } = updatedAuthUser;
      const userProfile = { userId: uid, email, displayName };

      //Create user profile in Firestore Database because it doesn't exist yet
      await createUserProfile({
        email: email,
        displayName: displayName || "",
      });

      setUser({ ...updatedAuthUser, ...userProfile });
      console.log("[signup.jsx]", "user has been set");
      setAuthLoading(false);
    } catch (error) {
      console.error("Signup error:", error);
      const friendlyMessage = getSignupFriendlyErrorMessage(error.code);
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
              onChange={handleChange(setName)}
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
              onChange={handleChange(setFormEmail)}
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
              onChange={handleChange(setPassword)}
              className="form-control"
              id="password"
              required
            />
          </div>

          {error && (
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
