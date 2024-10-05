import React, { useState, useEffect } from "react";
import { Row, Col, Button, Modal } from "react-bootstrap";
import { DragDropContext } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import TaskColumn from "../components/dashboard/TaskColumn";
import FormulaWeightControls from "../components/FormulaWeightControls";
import { fetchTasksFromApi, deleteTask, reorderTasks } from "../services/api";
import { FaPlus } from "react-icons/fa";
import AddTask from "./AddTask";
import "../styles/Dashboard.css";

const Dashboard = ({ formulaWeights }) => {
  const [tasks, setTasks] = useState({
    "Priority Backlog": [],
    Today: [],
    "Done Done": [],
  });
  const [user, setUser] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showDoneDone, setShowDoneDone] = useState(true);

  const navigate = useNavigate();

  const traverseLinkedList = (taskMap, headTask) => {
    const orderedTasks = [];
    let currentTask = headTask;

    while (currentTask) {
      orderedTasks.push(currentTask);
      currentTask = currentTask.nextTaskId
        ? taskMap[currentTask.nextTaskId]
        : null;
    }

    return orderedTasks.reverse();
  };

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const fetchedTasks = await fetchTasksFromApi(user.uid);
      const newTasks = { "Priority Backlog": [], Today: [], "Done Done": [] };

      const taskMap = {};
      let headTasks = {
        "Priority Backlog": null,
        Today: null,
        "Done Done": null,
      };

      fetchedTasks.forEach((task) => {
        taskMap[task.id] = task;

        if (task.prevTaskId === null) {
          headTasks[task.status] = task;
        }
      });

      Object.keys(headTasks).forEach((column) => {
        if (headTasks[column]) {
          newTasks[column] = traverseLinkedList(taskMap, headTasks[column]);
        }
      });

      setTasks(newTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, formulaWeights]);

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

    let targetPrevTaskId = null;
    let targetNextTaskId = null;

    if (destination.index < finish.length - 1) {
      targetPrevTaskId = finish[destination.index + 1].id;
    }
    if (destination.index > 0) {
      targetNextTaskId = finish[destination.index - 1].id;
    }

    movedTask.status = destination.droppableId;

    try {
      await reorderTasks({
        userId: user.uid,
        taskId: draggableId,
        targetPrevTaskId,
        targetNextTaskId,
        status: movedTask.status,
      });

      if (targetPrevTaskId) {
        finish[destination.index + 1].nextTaskId = draggableId;
      }
      if (targetNextTaskId) {
        finish[destination.index - 1].prevTaskId = draggableId;
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }

    setTasks({
      ...tasks,
      [source.droppableId]: start,
      [destination.droppableId]: finish,
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
      {/* FormulaWeightControls omitted for brevity */}

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

      {/* Updated Floating Action Button with Shadow and Style */}
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
        backdropClassName="glass-backdrop" // Custom backdrop for glass effect
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

export default Dashboard;
