import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Card, Form } from "react-bootstrap";
import TaskCard from "./TaskCard";

function TaskColumn({
  columnId,
  user,
  tasks,
  setTasks,
  showDoneDone,
  toggleShowDoneDone,
  onDeleteTask,
}) {
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
            {tasks.map(
              (task, index) =>
                (columnId !== "Done Done" || showDoneDone) && (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <TaskCard
                        provided={provided}
                        user={user}
                        setTasks={setTasks}
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
