import React, { memo, useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import TaskCard from "./task/TaskCard";
import DoneToggle from "./DoneToggle";

function TaskColumn({ columnId, tasks, onDeleteTask }) {
  const [showDoneDone, setShowDoneDone] = useState(true);

  return (
    <div>
      <h2>
        <div className="column-header">
          {columnId}
          {columnId === "Done Done" && (
            <DoneToggle
              showDoneDone={showDoneDone}
              onToggle={() => setShowDoneDone(!showDoneDone)}
            />
          )}
        </div>
      </h2>
      {/* <div className={showDoneDone ? "" : "d-none"}> */}
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
      {/* </div> */}
    </div>
  );
}

export default memo(TaskColumn);
