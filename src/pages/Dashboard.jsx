import React, { useContext } from "react";
import { Row, Col, Spinner, Button } from "react-bootstrap";
import { DragDropContext } from "react-beautiful-dnd";
import TaskColumn from "../components/kanban-board/TaskColumn";
import { deleteTask, reorderTasks } from "../services/api";
import "../styles/Dashboard.css";
import { AuthContext } from "context/AuthContext";
import { fetchTasks, TaskContext } from "context/TaskContext";
import AddTaskButtonWithModal from "../components/kanban-board/task/AddTaskButton";

const Dashboard = () => {
  const { user, authLoading } = useContext(AuthContext);
  const { tasks, setTasks } = useContext(TaskContext);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Make no changes if dropped in the same place
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const newTasks = { ...tasks };
    // Extract current state of tasks

    //get source column's tasks before the dragging (current state of column)
    const start = [...tasks[source.droppableId]];

    // get destination column's tasks before the dragging (current state of column)
    const finish =
      destination.droppableId === source.droppableId
        ? start
        : [...tasks[destination.droppableId]];

    // Remove the moved task from its original spot and return it
    const [movedTask] = start.splice(source.index, 1);

    // Insert the moved task into its new destination
    finish.splice(destination.index, 0, movedTask);

    // Update task status to the new column
    movedTask.status = destination.droppableId;

    // Determine prevTaskId and nextTaskId in the new position
    let targetPrevTaskId = null;
    let targetNextTaskId = null;

    if (destination.index < finish.length - 1) {
      targetPrevTaskId = finish[destination.index + 1].id; // Previous task
    }
    if (destination.index > 0) {
      targetNextTaskId = finish[destination.index - 1].id; // Next task
    }

    // This is here to make the UI load more optimistically. However, this may be overwritten by the fetchTasks API call later.
    // Will be overwritten when tasks are moved to a different column. Backend will re-prioritize based on priority number and ignorePriority boolean.

    // -- START -- might be overwritten:
    movedTask.prevTaskId = targetPrevTaskId;
    movedTask.nextTaskId = targetNextTaskId;

    // Update neighboring tasks' references if necessary
    if (targetPrevTaskId) {
      finish[destination.index + 1].nextTaskId = movedTask.id;
    }
    if (targetNextTaskId) {
      finish[destination.index - 1].prevTaskId = movedTask.id;
    }

    // Update the modified task columns
    newTasks[source.droppableId] = start;
    newTasks[destination.droppableId] = finish;
    setTasks(newTasks);
    // -- END --

    // Send the update to the backend
    try {
      await reorderTasks({
        userId: user.uid,
        taskId: draggableId,
        targetPrevTaskId,
        targetNextTaskId,
        status: movedTask.status,
      });

      // Fetch the updated tasks from the backend after the change
      // NEEDED TO REFRESH THE ORDER OF THE TASKS!!
      await fetchTasks(user, setTasks);
    } catch (error) {
      console.error("Failed to update and move task:", error);
    }
  };

  const handleDeleteTask = async (taskId, status) => {
    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks };
      newTasks[status] = newTasks[status].filter((task) => task.id !== taskId);
      return newTasks;
    });

    try {
      await deleteTask(taskId, user.uid);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-message-container">
        <div className="auth-message">
          <h2>Please Log In</h2>
          <p>You need to log in to access your dashboard.</p>
          <Button variant="primary" href="/login">
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Row>
          {Object.entries(tasks).map(([columnId]) => (
            <Col key={columnId} md={4}>
              <TaskColumn
                columnId={columnId}
                tasks={tasks[columnId] || []}
                onDeleteTask={handleDeleteTask}
              />
            </Col>
          ))}
        </Row>
      </DragDropContext>

      <AddTaskButtonWithModal />
    </div>
  );
};

export default Dashboard;
