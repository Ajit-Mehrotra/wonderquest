import React, { useContext } from "react";
import { Row, Col, Spinner, Button } from "react-bootstrap";
import { DragDropContext } from "react-beautiful-dnd";
import TaskColumn from "../components/kanban-board/TaskColumn";
import { deleteTask, reorderTasks } from "../services/api";
import "../styles/Dashboard.css";
import { AuthContext } from "context/AuthContext";
import { fetchTasks, TaskContext } from "context/TaskContext";
import AddTaskButtonWithModal from "../components/kanban-board/task/AddTaskButton";

//TODO: Add Memoization and useCallback to optimize performance
//TODO: refactor dragging logic further

/**
 * TODO: SMELLY CODE, refactor later
 * Handles the end of a drag operation, updating the task's position and
 * references of adjacent tasks. Returns the updated tasks and a flag
 * indicating if a server-side update is required.
 *
 * @param {Object} dragResult - The result of the drag operation
 * @param {Object} tasks - The current tasks
 * @returns {Object} - The updated tasks and a flag indicating if a server-side
 * update is required
 */

export const handleDragEnd = (dragResult, tasks) => {
  const { destination, source, draggableId } = dragResult;

  // Return early if no change is needed
  if (
    !destination ||
    (destination.droppableId === source.droppableId &&
      destination.index === source.index)
  ) {
    return { tasks, updateRequired: false };
  }

  const newTasks = { ...tasks };
  const sourceList = [...tasks[source.droppableId]];
  const destinationList =
    destination.droppableId === source.droppableId
      ? sourceList
      : [...tasks[destination.droppableId]];

  // Update the task's position to dragged location
  const { movedTask, updatedSourceList, updatedDestinationList } =
    updateTaskPosition(
      sourceList,
      destinationList,
      source.index,
      destination.index
    );

  // Get the adjacent task IDs for the new position
  const { targetPrevTaskId, targetNextTaskId } = getAdjacentTaskIds(
    updatedDestinationList,
    destination.index
  );

  movedTask.prevTaskId = targetPrevTaskId;
  movedTask.nextTaskId = targetNextTaskId;

  // Update neighboring tasks in destination list
  if (targetPrevTaskId) {
    updatedDestinationList[destination.index + 1].nextTaskId = movedTask.id;
  }
  if (targetNextTaskId) {
    updatedDestinationList[destination.index - 1].prevTaskId = movedTask.id;
  }

  // Update tasks in their respective columns
  newTasks[source.droppableId] = updatedSourceList;
  newTasks[destination.droppableId] = updatedDestinationList;

  return {
    tasks: newTasks,
    updateRequired: true,
    reorderData: {
      taskId: draggableId,
      targetPrevTaskId,
      targetNextTaskId,
      status: destination.droppableId,
    },
  };
};
export const updateTaskPosition = (
  sourceList,
  destinationList,
  sourceIndex,
  destinationIndex
) => {
  // Remove the moved task from its original spot and return it
  const [movedTask] = sourceList.splice(sourceIndex, 1);

  // Insert the moved task into its new destination
  destinationList.splice(destinationIndex, 0, movedTask);

  return {
    movedTask,
    updatedSourceList: sourceList,
    updatedDestinationList: destinationList,
  };
};

export const getAdjacentTaskIds = (destinationList, destinationIndex) => {
  // Determine prevTaskId and nextTaskId in the new position
  let targetPrevTaskId = null;
  let targetNextTaskId = null;

  if (destinationIndex < destinationList.length - 1) {
    targetPrevTaskId = destinationList[destinationIndex + 1].id; // Previous task
  }
  if (destinationIndex > 0) {
    targetNextTaskId = destinationList[destinationIndex - 1].id; // Next task
  }
  return { targetPrevTaskId, targetNextTaskId };
};

export const updateBackend = async (
  reorderData,
  user,
  setTasks,
  originalTasks
) => {
  try {
    await reorderTasks({
      taskId: reorderData.taskId,
      targetPrevTaskId: reorderData.targetPrevTaskId,
      targetNextTaskId: reorderData.targetNextTaskId,
      status: reorderData.status,
    });

    // Refresh tasks after the change to reflect backend order
    await fetchTasks(user, setTasks);
  } catch (error) {
    console.error("Failed to update and move task:", error);
    setTasks(originalTasks); // Rollback tasks to the original state on error
    alert("Failed to move the task. Changes have been reverted.");
  }
};

const Dashboard = () => {
  const { user, authLoading } = useContext(AuthContext);
  const { tasks, setTasks } = useContext(TaskContext);

  const onDragEnd = async (dragResult) => {
    const originalTasks = { ...tasks }; // Keep a copy for potential rollback

    // Call handleDragEnd to update tasks locally
    const {
      tasks: newTasks,
      updateRequired,
      reorderData,
    } = handleDragEnd(dragResult, tasks);

    // Optimistically update the UI
    setTasks(newTasks);

    // Update the backend if changes are required
    if (updateRequired) {
      await updateBackend(reorderData, user, setTasks, originalTasks);
    }
  };

  const handleDeleteTask = async (taskId, status) => {
    const originalTasks = { ...tasks };
    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks };
      newTasks[status] = newTasks[status].filter((task) => task.id !== taskId);
      return newTasks;
    });

    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
      setTasks(originalTasks);
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
    <div className="container text-center">
      <DragDropContext onDragEnd={onDragEnd}>
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
