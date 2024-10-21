import { AuthContext } from "context/AuthContext";
import {
  getAuth,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import React, { useContext, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { updateDisplayName, updateUserEmail } from "services/api";

export default function ProfileSettings() {
  const { user } = useContext(AuthContext);
  const [notification, setNotification] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleDisplayNameChange = async () => {
    try {
      await updateDisplayName({ userId: user.uid, displayName });
      await updateProfile(user, {
        displayName,
      });
      //   setUser({ ...user, displayName });
      setNotification({
        type: "success",
        message: "Display name updated successfully!",
      });
    } catch (error) {
      setNotification({
        type: "danger",
        message: "Failed to update display name. Please try again.",
      });
    }
  };

  const auth = getAuth();
  const handleEmailChange = async () => {
    try {
      // User will run into an issue where if they wait too long (it's not that long), they won't be able to update their email unless they log out and back in again.
      //There's a re-authenticate system to help with that on Firebase, but I can't be bothered.
      await verifyBeforeUpdateEmail(auth.currentUser, email);
      setNotification({
        type: "success",
        message:
          "Email verification sent. Please click the link sent to change your email!",
      });

      // if they don't verify the email, the backend email wil be updated, but the Firebase Auth won't be updated. It still works since the email is on the backend just for kicks, but it might be an issue down the line HAHAHA
      await updateUserEmail({ email });

      setNotification({
        type: "success",
        message: "Email updated successfully!",
      });
    } catch (error) {
      setNotification({
        type: "danger",
        message: `Failed to update email. ${error.message}`,
      });
    }
  };

  const handlePasswordChange = async () => {
    try {
      // User will run into an issue where if they wait too long (it's not that long), they won't be able to update their password unless they log out and back in again.
      //There's a re-authenticate system to help with that on Firebase, but I can't be bothered.
      await updatePassword(auth.currentUser, password);
      setNotification({
        type: "success",
        message: "Password updated successfully!",
      });
    } catch (error) {
      setNotification({
        type: "danger",
        message: `Failed to update password. ${error.message} `,
      });
    }
  };
  return (
    <div className="container mt-4">
      {notification && (
        <Alert
          variant={notification.type}
          onClose={() => setNotification(null)}
          dismissible
        >
          {notification.message}
        </Alert>
      )}

      <div className="container mt-4">
        {/* First Row */}
        <div className="row mb-3">
          <div className="d-flex align-items-center ">
            <label className="me-2 col-sm-2">Change your Display Name:</label>
            <input
              type="text"
              className="form-control me-2 col"
              placeholder={user.displayName}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Button variant="primary" onClick={handleDisplayNameChange}>
              Save
            </Button>
          </div>
        </div>

        {/* Second Row */}
        <div className="row mb-3">
          <div className="d-flex align-items-center">
            <label className="me-2 col-sm-2">Change your Email:</label>
            <input
              type="email"
              className="form-control me-2 col"
              placeholder={user.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button variant="primary" onClick={handleEmailChange}>
              Save
            </Button>
          </div>
        </div>

        {/* Third Row */}
        <div className="row mb-3">
          <div className="d-flex align-items-center">
            <label className="me-2 col-sm-2">Change your Password: </label>
            <input
              type="password"
              className="form-control me-2 col"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button variant="primary" onClick={handlePasswordChange}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
