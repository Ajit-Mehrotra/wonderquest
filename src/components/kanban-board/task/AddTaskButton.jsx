import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import AddTask from "./AddTaskForm";
import { fetchTasks } from "context/TaskContext";

const AddTaskButtonWithModal = () => {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  return (
    <>
      {/* Floating Action Button with Shadow and Style */}
      <Button
        variant="primary"
        onClick={() => setShowAddTaskModal(true)}
        className="position-fixed"
        style={{
          bottom: "60px",
          right: "80px",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
        }}
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
          <AddTask
            setShowAddTaskModal={setShowAddTaskModal}
            fetchTasks={fetchTasks}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddTaskButtonWithModal;
