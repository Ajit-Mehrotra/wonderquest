import React, { useState } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { auth } from "../../../firebase/firebase";
import { addTask } from "../../../services/api";

const urgencyOptions = [
  { label: "5 - Must be done today", value: 5 },
  { label: "4 - High - within 24-48 hrs", value: 4 },
  { label: "3 - Moderate - within 4 days", value: 3 },
  { label: "2 - Low - within 1-2 weeks", value: 2 },
  { label: "1 - Very Low - within a month", value: 1 },
];

const valueOptions = [
  { label: "5 - Make or break item", value: 5 },
  { label: "4 - High - Solidly helps", value: 4 },
  { label: "3 - Moderate - Moves projects along", value: 3 },
  { label: "2 - Some Value", value: 2 },
  { label: "1 - Low Value", value: 1 },
];

const sizeOptions = [
  { label: "<15 mins", value: 5 },
  { label: "15-30 mins", value: 4 },
  { label: "1 hr", value: 3 },
  { label: "1-3 hrs", value: 2 },
  { label: "3-6 hrs", value: 1 },
];

function AddTask({ setShowAddTaskModal, fetchTasks }) {
  const [taskData, setTaskData] = useState({
    name: "",
    notes: "",
    size: { label: "", value: 0 },
    urgency: { label: "", value: 0 },
    value: { label: "", value: 0 },
    status: "Priority Backlog",
    priority: 0,
    ignorePriority: false,
  });

  const [user] = useState(null);

  const handleRadioChange = (e, fieldName, options) => {
    const selectedValue = Number(e.target.value);
    const selectedOption = options.find(
      (option) => option.value === selectedValue
    );
    setTaskData({
      ...taskData,
      [fieldName]: {
        value: selectedValue,
        label: selectedOption ? selectedOption.label : "",
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("User not authenticated!");
      return;
    }

    const priority =
      taskData.urgency.value * 100 +
      taskData.value.value * 60 +
      taskData.size.value * 40;

    const taskWithPriority = { ...taskData, priority: priority };

    await addTask({ userId: user.uid, task: taskWithPriority });
    setShowAddTaskModal(false);
    fetchTasks();
  };

  return (
    <Card className="p-4 shadow-lg add-task-card" style={{ width: "100%" }}>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Left Column: Radio Buttons and Task Name */}
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold fs-5">Task Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={taskData.name}
                  onChange={(e) =>
                    setTaskData({ ...taskData, name: e.target.value })
                  }
                  required
                  placeholder="Enter task name"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold fs-5">Size</Form.Label>
                {sizeOptions.map((option) => (
                  <Form.Check
                    key={option.value}
                    type="radio"
                    label={option.label}
                    name="size"
                    value={option.value}
                    checked={taskData.size.value === option.value}
                    onChange={(e) => handleRadioChange(e, "size", sizeOptions)}
                    required
                    className="mb-2"
                  />
                ))}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold fs-5">Urgency</Form.Label>
                {urgencyOptions.map((option) => (
                  <Form.Check
                    key={option.value}
                    type="radio"
                    label={option.label}
                    name="urgency"
                    value={option.value}
                    checked={taskData.urgency.value === option.value}
                    onChange={(e) =>
                      handleRadioChange(e, "urgency", urgencyOptions)
                    }
                    required
                    className="mb-2"
                  />
                ))}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold fs-5">Value</Form.Label>
                {valueOptions.map((option) => (
                  <Form.Check
                    key={option.value}
                    type="radio"
                    label={option.label}
                    name="value"
                    value={option.value}
                    checked={taskData.value.value === option.value}
                    onChange={(e) =>
                      handleRadioChange(e, "value", valueOptions)
                    }
                    required
                    className="mb-2"
                  />
                ))}
              </Form.Group>
            </Col>

            {/* Right Column: Notes */}
            <Col md={6}>
              <Form.Group className="h-100">
                <Form.Label className="fw-bold fs-5">Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={15}
                  name="notes"
                  value={taskData.notes}
                  onChange={(e) =>
                    setTaskData({ ...taskData, notes: e.target.value })
                  }
                  placeholder="Add any notes here"
                  style={{ height: "90%" }}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-grid pt-4">
            <Button variant="primary" type="submit" className="rounded-pill">
              Add Task
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default AddTask;
