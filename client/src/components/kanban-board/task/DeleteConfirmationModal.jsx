import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaTrash, FaTimes } from "react-icons/fa";

const DeleteConfirmationModal = ({ show, onConfirm, onCancel, children }) => {
  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onCancel}
          aria-label="Cancel deletion"
        >
          <FaTimes /> Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          aria-label="Confirm deletion"
        >
          <FaTrash /> Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;
