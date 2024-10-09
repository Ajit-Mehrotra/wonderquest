import React, { useContext, useState } from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { FaCaretDown, FaCaretLeft, FaEdit, FaTrash } from "react-icons/fa";
import EditTaskModal from "./EditTaskModal";
import { updateTaskStatus } from "services/api";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { AuthContext } from "context/AuthContext";
import { TaskContext } from "context/TaskContext";
const sortTasksByPriority = (taskList) => {
  return taskList.sort((a, b) => b.priority - a.priority);
};
function TaskCard({ provided, task, onDeleteTask }) {
  const [expanded, setExpanded] = useState(false);
  const [beingEdited, setBeingEdited] = useState(false);
  const [beingDeleted, setBeingDeleted] = useState(false);

  const user = useContext(AuthContext);
  const { setTasks } = useContext(TaskContext);

  const onSave = async (editingTask, setEditingTask) => {
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Card.Title>{task.name}</Card.Title>
            <div>
              <Badge pill className="size-badge">
                {task.size.label}
              </Badge>

              {expanded ? (
                <Button variant="link" onClick={() => setExpanded(false)}>
                  <FaCaretDown />
                </Button>
              ) : (
                <Button variant="link" onClick={() => setExpanded(true)}>
                  <FaCaretLeft />
                </Button>
              )}
            </div>
          </div>

          {expanded && (
            <>
              <Card.Text>{task.notes}</Card.Text>
              <div>
                <span className="badge-label">Urgency: </span>
                <Badge pill className="urgency-badge">
                  {task.urgency.label}
                </Badge>
              </div>
              <div>
                <span className="badge-label">Value: </span>
                <Badge pill className="value-badge">
                  {task.value.label}
                </Badge>
              </div>
              <div>
                <span className="badge-label">Priority: </span>
                <Badge pill className="urgency-badge">
                  {task.priority}
                </Badge>
              </div>
              <div className="mt-2 d-flex justify-content-end">
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
            </>
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
