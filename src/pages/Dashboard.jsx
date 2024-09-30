import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { DragDropContext } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import TaskColumn from "../components/dashboard/TaskColumn";
import FormulaWeightControls from "../components/FormulaWeightControls";
import {
  fetchTasksFromApi,
  updateTaskStatus,
  deleteTask,
} from "../services/api";

const Dashboard = () => {
  const [tasks, setTasks] = useState({
    "Priority Backlog": [],
    Today: [],
    "Done Done": [],
  });
  const [user, setUser] = useState(null);
  const [showDoneDone, setShowDoneDone] = useState(true);

  // Add state for formula weights
  const [formulaWeights, setFormulaWeights] = useState({
    urgencyWeight: 100,
    valueWeight: 60,
    sizeWeight: 40,
  });

  const navigate = useNavigate();

  const calculateTaskPriority = (task) => {
    return (
      task.urgency.value * formulaWeights.urgencyWeight +
      task.value.value * formulaWeights.valueWeight +
      task.size.value * formulaWeights.sizeWeight
    );
  };

  const sortTasksByPriority = (taskList) => {
    return taskList.sort((a, b) => b.priority - a.priority);
  };

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const fetchedTasks = await fetchTasksFromApi(user.uid);
      const newTasks = { "Priority Backlog": [], Today: [], "Done Done": [] };
      fetchedTasks.forEach((task) => {
        // Calculate priority using custom weights
        task.priority = calculateTaskPriority(task);
        newTasks[task.status].push({ ...task });
      });
      newTasks["Priority Backlog"] = sortTasksByPriority(
        newTasks["Priority Backlog"]
      );
      newTasks.Today = sortTasksByPriority(newTasks.Today);
      newTasks["Done Done"] = sortTasksByPriority(newTasks["Done Done"]);
      setTasks(newTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, formulaWeights]); // Re-fetch tasks whenever formulaWeights change

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const start = [...tasks[source.droppableId]];
    const finish =
      destination.droppableId === source.droppableId
        ? start
        : [...tasks[destination.droppableId]];

    const [movedTask] = start.splice(source.index, 1);
    finish.splice(destination.index, 0, movedTask);

    let newPriority;
    if (destination.index === 0) {
      newPriority = finish[1] ? finish[1].priority + 1 : 100;
    } else if (destination.index === finish.length - 1) {
      newPriority = finish[finish.length - 2].priority - 1;
    } else {
      const prevTaskPriority = finish[destination.index - 1].priority;
      const nextTaskPriority = finish[destination.index + 1].priority;
      newPriority = (prevTaskPriority + nextTaskPriority) / 2;
    }

    movedTask.priority = newPriority;
    movedTask.status = destination.droppableId;

    try {
      await updateTaskStatus(draggableId, user.uid, {
        status: movedTask.status,
        priority: movedTask.priority,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }

    setTasks({
      ...tasks,
      [source.droppableId]: start,
      [destination.droppableId]: sortTasksByPriority(finish),
    });
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
    <>
      <FormulaWeightControls onWeightChange={setFormulaWeights} />
      <DragDropContext onDragEnd={handleDragEnd}>
        <Row>
          {Object.entries(tasks).map(([columnId, tasks]) => (
            <Col key={columnId} md={4}>
              <TaskColumn
                columnId={columnId}
                user={user}
                tasks={tasks}
                setTasks={setTasks}
                showDoneDone={showDoneDone}
                toggleShowDoneDone={() => setShowDoneDone(!showDoneDone)}
                onDeleteTask={handleDeleteTask}
              />
            </Col>
          ))}
        </Row>
      </DragDropContext>
    </>
  );
};

export default Dashboard;
