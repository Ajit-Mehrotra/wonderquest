import React, { memo, useContext, useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Form } from "react-bootstrap";
import TaskCard from "./task/TaskCard";
import "../../styles/KanbanBoard.css";

function TaskColumn({ columnId, tasks, onDeleteTask }) {
  const [showDoneDone, setShowDoneDone] = useState(true);

  return (
    <div>
      <h2>
        <div className="column-header">
          {columnId}
          {columnId === "Done Done" && (
            <Form.Check
              type="switch"
              id="done-done-toggle"
              label=""
              checked={showDoneDone}
              onChange={() => setShowDoneDone(!showDoneDone)}
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

export default memo(TaskColumn);
