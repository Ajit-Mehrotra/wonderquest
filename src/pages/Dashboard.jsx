import React, { useState, useContext } from "react";
import { Row, Col, } from "react-bootstrap";
import { DragDropContext } from "react-beautiful-dnd";
import TaskColumn from "../components/kanban-board/TaskColumn";
import {  deleteTask, reorderTasks } from "../services/api";
import "../styles/Dashboard.css";
import { AuthContext } from "context/AuthContext";
import { fetchTasks, TaskContext } from "context/TaskContext";
import AddTaskButtonWithModal from "../components/kanban-board/task/AddTaskButton";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { tasks, setTasks } = useContext(TaskContext);
  const [showDoneDone, setShowDoneDone] = useState(true);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // No change if dropped in the same place
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Extract current state of tasks
    const start = [...tasks[source.droppableId]];
    const finish =
      destination.droppableId === source.droppableId
        ? start
        : [...tasks[destination.droppableId]];

    // Remove the moved task from the source
    const [movedTask] = start.splice(source.index, 1);
    // Insert the moved task into the destination
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
      // await fetchTasks();
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

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Row>
          {Object.entries(tasks).map(([columnId]) => (
            <Col key={columnId} md={4}>
              <TaskColumn
                columnId={columnId}
                showDoneDone={showDoneDone}
                toggleShowDoneDone={() => setShowDoneDone(!showDoneDone)}
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
