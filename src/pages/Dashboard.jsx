import React, { useState, useEffect, useContext } from "react";
import { Row, Col, Button, Modal } from "react-bootstrap";
import { DragDropContext } from "react-beautiful-dnd";
import TaskColumn from "../components/kanban-board/TaskColumn";
import { fetchTasksFromApi, deleteTask, reorderTasks } from "../services/api";
import { FaPlus } from "react-icons/fa";
import AddTask from "../components/kanban-board/task/AddTask";
import "../styles/Dashboard.css";
import { AuthContext } from "context/AuthContext";

const Dashboard = ({ formulaWeights }) => {
  const [tasks, setTasks] = useState({
    "Priority Backlog": [],
    Today: [],
    "Done Done": [],
  });
  const { user } = useContext(AuthContext);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showDoneDone, setShowDoneDone] = useState(true);

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
    if (!user) return;
    try {
      console.debug("User exists. Trying to fetch tasks from API");
      const fetchedTasks = await fetchTasksFromApi(user.uid);
      console.debug("Fetched Tasks from API");

      // Initialize task buckets (columns)
      const newTasks = { "Priority Backlog": [], Today: [], "Done Done": [] };

      // For efficiency, create Task map to store references to tasks by ID for linked list traversal
      const taskMap = {};

      let headTasks = {
        "Priority Backlog": null,
        Today: null,
        "Done Done": null,
      };

      fetchedTasks.forEach((task) => {
        let taskStatus = task.status;

        // Add task to the appropriate column by status, if doesn't exist, create it.
        if (!newTasks[taskStatus]) {
          newTasks[taskStatus] = [];
          headTasks[taskStatus] = null; //not sure if this is right. Meant to set up the find head task for each column
        }
        if (!taskMap[taskStatus]) {
          taskMap[taskStatus] = {};
        }

        taskMap[taskStatus] = { ...taskMap[taskStatus], [task.id]: task };

        // finds the head task for each column
        if (task.prevTaskId === null) {
          headTasks[taskStatus] = task;
        }
      });

      Object.keys(headTasks).forEach((column) => {
        if (headTasks[column]) {
          newTasks[column] = traverseLinkedList(
            taskMap[column],
            headTasks[column]
          );
        }
      });

      console.log("Updating tasks");
      setTasks(newTasks);
      console.log("Tasks Updated");
      console.log(newTasks);
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
      await fetchTasks();
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
