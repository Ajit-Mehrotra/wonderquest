// Converts task array from Firebase to hashMap for more efficient access of tasks in future.
// Also returns the head task of the linked list.
export const mapTasksAndFindHead = (currentTasks, status, excludeTaskId = null) => {
  const taskMap = {};
  let headTask = null;

  currentTasks.forEach((task) => {
    if (task.status === status && task.id !== excludeTaskId) {
      taskMap[task.id] = task;

      if (task.prevTaskId === null) {
        headTask = task;
      }
    }
  });

  return { taskMap, headTask };
};

// Helper function to traverse the linked list from the head
export const traverseLinkedList = (taskMap, headTask) => {
  const orderedTasks = [];
  let currentTask = headTask;

  while (currentTask) {
    orderedTasks.push(currentTask);
    currentTask = currentTask.nextTaskId
      ? taskMap[currentTask.nextTaskId]
      : null;
  }

  return orderedTasks;
};

// Helper function to find the position to insert a new task based on priority
export const findInsertionPosition = (taskMap, headTask, newTaskPriority) => {
  let prevTask = null;
  let nextTask = headTask;

  while (
    nextTask &&
    (nextTask.ignorePriority || nextTask.priority < newTaskPriority)
  ) {
    prevTask = nextTask;
    nextTask = nextTask.nextTaskId ? taskMap[nextTask.nextTaskId] : null;
  }

  return { prevTask, nextTask };
};
