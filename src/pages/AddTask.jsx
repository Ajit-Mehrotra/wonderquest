import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Card, Row, Col } from 'react-bootstrap';
import { auth } from '../firebase/firebase';

const backendUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

function AddTask() {
  const [taskData, setTaskData] = useState({
    name: '',
    notes: '',
    size: '',
    urgency: '',
    value: '',
    status: 'Priority Backlog',
  });
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Listen for authentication state changes
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('User not authenticated!');
      return;
    }
    try {
      // Send a request to add a task via backend API
      const response = await fetch(`${backendUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid, task: taskData }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        alert(`Failed to add task: ${errorData.details}`);
      }
    } catch (error) {
      alert(`Error adding task: ${error.message}`);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card className="p-4 shadow-lg add-task-card">
        <h2 className="text-center mb-4">Add a New Task</h2>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Task Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={taskData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter task name"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Size</Form.Label>
                <Form.Select
                  name="size"
                  value={taskData.size}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Size</option>
                  <option value="<15 mins">{"<15 mins"}</option>
                  <option value="15-30 mins">15-30 mins</option>
                  <option value="1 hr">1 hr</option>
                  <option value="1-3 hrs">1-3 hrs</option>
                  <option value="3-6 hrs">3-6 hrs</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Urgency</Form.Label>
                <Form.Select
                  name="urgency"
                  value={taskData.urgency}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Urgency</option>
                  <option value="1 - Very Low - within a month">1 - Very Low - within a month</option>
                  <option value="2 - Low - within 1-2 weeks">2 - Low - within 1-2 weeks</option>
                  <option value="3 - Moderate - within 4 days">3 - Moderate - within 4 days</option>
                  <option value="4 - High - within 24-48 hrs">4 - High - within 24-48 hrs</option>
                  <option value="5 - Must be done today">5 - Must be done today</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Value</Form.Label>
                <Form.Select
                  name="value"
                  value={taskData.value}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Value</option>
                  <option value="5 - Make or break item">5 - Make or break item</option>
                  <option value="4 - High - Solidly helps">4 - High - Solidly helps</option>
                  <option value="3 - Moderate - Moves projects along">3 - Moderate - Moves projects along</option>
                  <option value="2 - Some Value">2 - Some Value</option>
                  <option value="1 - Low Value">1 - Low Value</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={taskData.notes}
              onChange={handleChange}
              placeholder="Add any notes here"
            />
          </Form.Group>
          <div className="d-grid">
            <Button variant="primary" type="submit" className="rounded-pill">
              Add Task
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}

export default AddTask;
