import { AuthContext } from "context/AuthContext";
import React, { useContext, useState } from "react";
import { Alert, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { deleteAllTasks, deleteUserAccount } from "services/api";

export default function AccountManagement() {
  const { user, setUser } = useContext(AuthContext);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const [showDeleteAllTasksModal, setShowDeleteAllTasksModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const handleDeleteAllTasks = async () => {
    try {
      await deleteAllTasks();
      setNotification({
        type: "success",
        message: "All tasks deleted successfully!",
      });
      setShowDeleteAllTasksModal(false); // Close modal
    } catch (error) {
      setNotification({
        type: "danger",
        message: "Failed to delete tasks. Please try again.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUserAccount();
      setNotification({
        type: "success",
        message: "Account deleted successfully!",
      });
      setUser(null);
      navigate("/signup");
    } catch (error) {
      setNotification({
        type: "danger",
        message: "Failed to delete account. Please try again.",
      });
    }
  };
  return (
    <div>
      {/* Delete All Tasks */}
      {notification && (
        <Alert
          variant={notification.type}
          onClose={() => setNotification(null)}
          dismissible
        >
          {notification.message}
        </Alert>
      )}

      <h3 className="text-center mt-4">Delete All Tasks: </h3>
      <Button variant="danger" onClick={() => setShowDeleteAllTasksModal(true)}>
        Delete All Tasks
      </Button>
      <h3 className="text-center mt-4">Delete Your Account: </h3>
      <Button variant="danger" onClick={() => setShowDeleteAccountModal(true)}>
        Delete Account
      </Button>

      <Modal
        show={showDeleteAllTasksModal}
        onHide={() => setShowDeleteAllTasksModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete All Tasks</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete all tasks? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteAllTasksModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAllTasks}>
            Delete All Tasks
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showDeleteAccountModal}
        onHide={() => setShowDeleteAccountModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete your account? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteAccountModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
