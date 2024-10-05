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
    const visitedTasks = new Set(); // Track visited tasks to avoid loops
    while (currentTask) {
      if (visitedTasks.has(currentTask.id)) {
        console.error("Infinite loop detected in linked list traversal");
        break;
      }
      visitedTasks.add(currentTask.id);
      orderedTasks.push(currentTask);
      currentTask = currentTask.nextTaskId
        ? taskMap[currentTask.nextTaskId]
        : null;
    }

    return orderedTasks.reverse();
  };

  const fetchTasks = async () => {
    console.log("in fetchTasks");
    if (!user) return;
    try {
      console.log("User exists. Trying to fetch tasks from API");
      const fetchedTasks = await fetchTasksFromApi(user.uid);
      console.log(
        "fetched Tasks from API",
        JSON.stringify(fetchedTasks, null, 2)
      );
      const newTasks = { "Priority Backlog": [], Today: [], "Done Done": [] };

      const taskMap = {};
      let headTasks = {
        "Priority Backlog": null,
        Today: null,
        "Done Done": null,
      };

      console.log("About to enter loop");
      fetchedTasks.forEach((task) => {
        console.log("In loop");
        taskMap[task.id] = task;

        if (task.prevTaskId === null) {
          headTasks[task.status] = task;
        }
      });
      console.log("Out of first loop");

      Object.keys(headTasks).forEach((column) => {
        console.log("In second loop");
        if (headTasks[column]) {
          newTasks[column] = traverseLinkedList(taskMap, headTasks[column]);
        }
      });

      console.log("Setting new tasks");
      setTasks(newTasks);
      console.log("Tasks are set");
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // relates to race-case with fetching data asynchronously in hook.
  useEffect(() => {
    let isMounted = true; // track if the component is still mounted
    const fetchData = async () => {
      try {
        if (isMounted) {
          await fetchTasks();
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false; // cleanup function to mark component as unmounted
    };
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

    // Debugging information
    console.log("Being moved on frontend", draggableId);
    console.log(
      "TargetPrevTaskID: ",
      targetPrevTaskId,
      "TargetNextTaskID: ",
      targetNextTaskId,
      "Status: ",
      movedTask.status
    );

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
      await fetchTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
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
