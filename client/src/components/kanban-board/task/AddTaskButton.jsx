import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import AddTaskForm from "./AddTaskForm";

const AddTaskButtonWithModal = () => {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  return (
    <>
      {/* Floating Action Button with Shadow and Style */}
      <Button
        variant="primary"
        onClick={() => setShowAddTaskModal(true)}
        className="position-fixed add-task-button"
      >
        <FaPlus style={{ fontSize: "24px", color: "white" }} />
      </Button>

      {/* Add Task Modal with Glass Effect Overlay */}
      <Modal
        show={showAddTaskModal}
        onHide={() => setShowAddTaskModal(false)}
        centered
        size="lg"
        backdropClassName="glass-backdrop"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add a New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddTaskForm setShowAddTaskModal={setShowAddTaskModal} />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddTaskButtonWithModal;
