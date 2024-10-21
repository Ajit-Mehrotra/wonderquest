import React, { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { fetchTasksFromApi } from "services/api";
import { WeightsContext } from "./WeightContext";

export const TaskContext = createContext(null);

export const traverseLinkedList = (taskMap, headTask) => {
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

export const fetchTasks = async (user, setTasks) => {
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

export function TaskProvider({ children }) {
  const { weights } = useContext(WeightsContext);
  const [tasks, setTasks] = useState({
    "Priority Backlog": [],
    Today: [],
    "Done Done": [],
  });

  const { user, authLoading } = useContext(AuthContext);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    let isMounted = true;
    const fetchData = async () => {
      try {
        if (isMounted) {
          await fetchTasks(user, setTasks);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user, weights, authLoading]);

  return (
    <TaskContext.Provider value={{ tasks, setTasks }}>
      {children}
    </TaskContext.Provider>
  );
}
