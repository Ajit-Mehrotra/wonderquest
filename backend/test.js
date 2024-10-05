// app.patch("/api/tasks/reorder/:taskId", async (req, res) => {
//   const { taskId } = req.params;
//   const { userId, targetPrevTaskId, targetNextTaskId, status } = req.body;

//   console.log(
//     `User ID: ${JSON.stringify(
//       userId,
//       null,
//       4
//     )} ,  Moving this task: ${JSON.stringify(
//       taskId,
//       null,
//       4
//     )}, User Target Prev ID: ${JSON.stringify(
//       targetPrevTaskId,
//       null,
//       4
//     )}, User Target Next ID: ${JSON.stringify(targetNextTaskId, null, 4)},  `
//   );

//   try {
//     const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
//     const taskDoc = await tasksRef.doc(taskId).get();

//     if (!taskDoc.exists) {
//       return res.status(404).json({ error: "Task not found" });
//     }

//     const draggedTask = taskDoc.data();
//     const { prevTaskId, nextTaskId } = draggedTask;

//     //Remove task from current position by updating its neighbors
//     if (prevTaskId) {
//       await tasksRef.doc(prevTaskId).update({
//         nextTaskId: nextTaskId || null,
//       });
//     }
//     if (nextTaskId) {
//       await tasksRef.doc(nextTaskId).update({
//         prevTaskId: prevTaskId || null,
//       });
//     }

//     if (targetPrevTaskId) {
//       // Update dragged task's previous and next task IDs
//       const targetPrevTaskDoc = await tasksRef.doc(targetPrevTaskId).get();
//       if (!targetPrevTaskDoc.exists) {
//         return res
//           .status(404)
//           .json({ error: "Previous Target Node task not found" });
//       }

//       const targetPrevTask = targetPrevTaskDoc.data();
//       const nextNode = targetPrevTask.nextTaskId;
//       console.log(
//         `Current Node: ${taskId} --- Previous Target Node: ${targetPrevTaskId} --- Previous Target Node's current Next: ${nextNode}`
//       );
//       console.log(`User states next node is: ${targetNextTaskId}`);

//       // Update the target previous task's nextTaskId to the dragged task
//       await tasksRef.doc(targetPrevTaskId).update({
//         nextTaskId: taskId,
//       });
//     }

//     if (targetNextTaskId) {
//       // Update dragged task's previous and next task IDs
//       const targetNextTaskDoc = await tasksRef.doc(targetNextTaskId).get();
//       if (!targetNextTaskDoc.exists) {
//         return res
//           .status(404)
//           .json({ error: "Next Target Node task not found" });
//       }

//       const targetNextTask = targetNextTaskDoc.data();
//       const prevNode = targetNextTask.prevTaskId;
//       console.log(
//         `Current Node: ${taskId} --- Next Target Node: ${targetNextTaskId} --- Next Target Node's current Prev: ${prevNode}`
//       );
//       console.log(`User states previous node is: ${targetPrevTaskId}`);

//       // Update the target previous task's nextTaskId to the dragged task
//       await tasksRef.doc(targetNextTaskId).update({
//         prevTaskId: taskId,
//       });
//     }

//     // Update the next task of the new position, if it exists
//     if (targetNextTaskId) {
//       await tasksRef.doc(targetNextTaskId).update({
//         prevTaskId: taskId,
//       });
//     }

//     // Update the dragged task with its new neighbors
//     await tasksRef.doc(taskId).update({
//       prevTaskId: targetPrevTaskId || null,
//       nextTaskId: targetNextTaskId || null,
//       status,
//       ignorePriority: true,
//     });

//     res.status(200).json({ message: "Task reordered successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Failed to reorder task", details: error.message });
//   }
// });

// NEW ONE STARTS HERE











// app.patch("/api/tasks/reorder/:taskId", async (req, res) => {
//   const { taskId } = req.params;
//   const { userId, targetPrevTaskId, targetNextTaskId, status } = req.body;

//   try {
//     const tasksRef = admin.firestore().collection(`users/${userId}/tasks`);
//     const userData = (
//       await admin.firestore().collection("users").doc(userId).get()
//     ).data();
//     const taskDoc = await tasksRef.doc(taskId).get();

//     if (!taskDoc.exists) {
//       return res.status(404).json({ error: "Task not found" });
//     }

//     const draggedTask = taskDoc.data();
//     const { prevTaskId, nextTaskId } = draggedTask;

//     // Determine if the task is moved within the same column or to a different column
//     const isSameColumn = draggedTask.status === status;

//     // Remove task from current position by updating its neighbors
//     if (prevTaskId) {
//       await tasksRef.doc(prevTaskId).update({
//         nextTaskId: nextTaskId || null,
//       });
//     }
//     if (nextTaskId) {
//       await tasksRef.doc(nextTaskId).update({
//         prevTaskId: prevTaskId || null,
//       });
//     }

//     // Update the next task of the new position, if it exists
//     if (targetNextTaskId) {
//       await tasksRef.doc(targetNextTaskId).update({
//         prevTaskId: taskId,
//       });
//     }

//     // Update the dragged task with its new neighbors and status
//     await tasksRef.doc(taskId).update({
//       prevTaskId: targetPrevTaskId || null,
//       nextTaskId: targetNextTaskId || null,
//       status,
//       // If moved within the same column, retain the ignorePriority flag.
//       // If moved to a different column, set ignorePriority to false.
//       ignorePriority: isSameColumn ? draggedTask.ignorePriority : false,
//     });

//     // Update the adjacent tasks in the target column
//     if (targetPrevTaskId) {
//       await tasksRef.doc(targetPrevTaskId).update({
//         nextTaskId: taskId,
//       });
//     }

//     // If the task was moved to a different column, reprioritize the entire column.
//     if (!isSameColumn) {
//       console.log("NOT SAME COLUMN!!");
//       const targetColumnSnapshot = await tasksRef
//         .where("status", "==", status)
//         .get();
//       const targetColumnTasks = targetColumnSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       // Recalculate the priority for tasks that do not ignore priority
//       const updatedTasks = targetColumnTasks.sort(
//         (a, b) => b.priority - a.priority
//       ); // Sort by priority (highest first)

//       // Update the linked list and task priorities accordingly
//       let previousTaskId = null;

//       for (const task of updatedTasks) {
//         const taskUpdates = {
//           priority: task.priority,
//           prevTaskId: previousTaskId,
//           nextTaskId: null,
//         };

//         if (previousTaskId) {
//           await tasksRef.doc(previousTaskId).update({
//             nextTaskId: task.id,
//           });
//         }

//         await tasksRef.doc(task.id).update(taskUpdates);
//         previousTaskId = task.id;
//       }
//     }

//     res.status(200).json({ message: "Task reordered successfully" });
//   } catch (error) {
//     res.status(500).json({
//       error: "Failed to reorder task",
//       details: error.message,
//     });
//   }
// });