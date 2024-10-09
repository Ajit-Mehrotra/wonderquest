import React, { useContext } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Form } from "react-bootstrap";
import TaskCard from "./task/TaskCard";
import { TaskContext } from "context/TaskContext";

function TaskColumn({
  columnId,
  showDoneDone,
  toggleShowDoneDone,
  onDeleteTask,
}) {
  const { tasks } = useContext(TaskContext);
  const columnTasks = tasks[columnId];

  return (
    <div>
      <h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "40px",
          }}
        >
          {columnId}
          {columnId === "Done Done" && (
            <Form.Check
              type="switch"
              id="done-done-toggle"
              label=""
              checked={showDoneDone}
              onChange={toggleShowDoneDone}
            />
          )}
        </div>
      </h2>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`task-column ${
              snapshot.isDraggingOver ? "droppable-over" : ""
            }`}
          >
            {columnTasks.map(
              (task, index) =>
                (columnId !== "Done Done" || showDoneDone) && (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <TaskCard
                        provided={provided}
                        task={task}
                        onDeleteTask={onDeleteTask}
                      />
                    )}
                  </Draggable>
                )
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default TaskColumn;
