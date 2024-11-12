import { handleDragEnd } from "../src/pages/Dashboard";
import { describe, it, expect } from "vitest";

describe("handleDragEnd", () => {
  const mockTasks = {
    column1: [
      { id: "task1", priority: 1 },
      { id: "task2", priority: 2 },
      { id: "task3", priority: 3 },
    ],
    column2: [{ id: "task4", priority: 1 }],
  };

  it("should return tasks unchanged if task is dropped in the same position", () => {
    const result = {
      source: { droppableId: "column1", index: 1 },
      destination: { droppableId: "column1", index: 1 },
      draggableId: "task2",
    };
    const { tasks: newTasks, updateRequired } = handleDragEnd(
      result,
      mockTasks
    );
    expect(updateRequired).toBe(false);
    expect(newTasks).toEqual(mockTasks);
  });

  it("should move task within the same column to a new position, overriding priority order", () => {
    const result = {
      source: { droppableId: "column1", index: 0 },
      destination: { droppableId: "column1", index: 2 },
      draggableId: "task1",
    };
    const { tasks: newTasks, updateRequired } = handleDragEnd(
      result,
      mockTasks
    );
    expect(updateRequired).toBe(true);
    expect(newTasks.column1[2].id).toBe("task1");
    expect(newTasks.column1[0].id).toBe("task2");
    expect(newTasks.column1[1].id).toBe("task3");
  });

  it("should move task between columns and sort by priority in the destination column", () => {
    const result = {
      source: { droppableId: "column1", index: 0 },
      destination: { droppableId: "column2", index: 0 },
      draggableId: "task1",
    };
    const { tasks: newTasks, updateRequired } = handleDragEnd(
      result,
      mockTasks
    );
    expect(updateRequired).toBe(true);
    expect(newTasks.column2[0].id).toBe("task1");
    expect(newTasks.column2[1].id).toBe("task4");
  });

  it("should move task to the beginning of the column", () => {
    const result = {
      source: { droppableId: "column1", index: 2 },
      destination: { droppableId: "column1", index: 0 },
      draggableId: "task3",
    };
    const { tasks: newTasks, updateRequired } = handleDragEnd(
      result,
      mockTasks
    );
    expect(updateRequired).toBe(true);
    expect(newTasks.column1[0].id).toBe("task3");
    expect(newTasks.column1[1].id).toBe("task1");
    expect(newTasks.column1[2].id).toBe("task2");
  });

  it("should move task to the end of the column", () => {
    const result = {
      source: { droppableId: "column1", index: 0 },
      destination: { droppableId: "column1", index: 2 },
      draggableId: "task1",
    };
    const { tasks: newTasks, updateRequired } = handleDragEnd(
      result,
      mockTasks
    );
    expect(updateRequired).toBe(true);
    expect(newTasks.column1[2].id).toBe("task1");
  });
});
