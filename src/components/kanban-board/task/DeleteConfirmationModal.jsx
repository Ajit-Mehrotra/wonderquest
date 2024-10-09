import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaTrash, FaTimes } from 'react-icons/fa';

const DeleteConfirmationModal = ({ show, onConfirm, onCancel, taskName }) => {
  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete the task "<strong>{taskName}</strong>"?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          <FaTimes /> Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          <FaTrash /> Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;
