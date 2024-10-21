import React, { useContext, useState } from "react";
import { Card, Button, Badge, Collapse } from "react-bootstrap";
import { FaCaretLeft, FaEdit, FaTrash } from "react-icons/fa";
import EditTaskModal from "./EditTaskModal";
import { updateTaskStatus } from "services/api";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { AuthContext } from "context/AuthContext";
import { TaskContext } from "context/TaskContext";
import TaskProperties from "./TaskProperties";

const sortTasksByPriority = (taskList) => {
  return taskList.sort((a, b) => b.priority - a.priority);
};
function TaskCard({ provided, task, onDeleteTask }) {
  const [expanded, setExpanded] = useState(false);
  const [beingEdited, setBeingEdited] = useState(false);
  const [beingDeleted, setBeingDeleted] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useContext(AuthContext);
  const { setTasks } = useContext(TaskContext);

  const propertiesToRender = [
    { label: "Urgency", value: task.urgency.label },
    { label: "Value", value: task.value.label },
    { label: "Priority", value: task.priority },
  ];

  const onSave = async (editingTask) => {
    if (!user) {
      setError("User not authenticated!");
      return;
    }
    try {
      await updateTaskStatus(editingTask.id, user.uid, editingTask);
      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };
        for (let columnId in newTasks) {
          newTasks[columnId] = newTasks[columnId].map((task) =>
            task.id === editingTask.id ? editingTask : task
          );
          newTasks[columnId] = sortTasksByPriority(newTasks[columnId]);
        }
        return newTasks;
      });
      setBeingEdited(false);
    } catch (error) {
      console.error("Failed to save task:", error);
      setError("Failed to save task. Please try again.");
    }
  };

  return (
    <div>
      <Card
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className="mb-3"
      >
        <Card.Body>
          <div className="task-card">
            <Card.Title>{task.name}</Card.Title>
            <div>
              <Badge pill className="task-badge">
                {task.size.label}
              </Badge>
              <Button variant="link" onClick={() => setExpanded(!expanded)}>
                <FaCaretLeft
                  className={`caret-icon ${expanded ? "caret-rotated" : ""}`}
                />
              </Button>
            </div>
          </div>
          <Collapse in={expanded}>
            <div>
              <Card.Text>{task.notes}</Card.Text>
              {propertiesToRender.map(({ label, value }) => (
                <TaskProperties key={label} label={label} value={value} />
              ))}
              <div className="mt-4 d-flex justify-content-end">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setBeingEdited(true)}
                >
                  <FaEdit /> Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="ms-2"
                  onClick={() => setBeingDeleted(true)}
                >
                  <FaTrash /> Delete
                </Button>
              </div>
            </div>
          </Collapse>

          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}
        </Card.Body>
      </Card>

      {beingEdited && (
        <EditTaskModal
          show={!!beingEdited}
          task={task}
          onSave={onSave}
          onClose={() => setBeingEdited(false)}
        />
      )}

      {beingDeleted && (
        <DeleteConfirmationModal
          show={!!beingDeleted}
          taskName={task.name}
          onConfirm={() => onDeleteTask(task.id, task.status)}
          onCancel={() => setBeingDeleted(false)}
        />
      )}
    </div>
  );
}

export default TaskCard;
