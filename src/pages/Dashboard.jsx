import React, { useState, useEffect } from 'react';
import { FaCaretDown, FaCaretLeft, FaEdit, FaSave, FaTimes, FaTrash } from 'react-icons/fa'; // Icons for UI
import { Card, Button, Badge, Row, Col, Form, Modal } from 'react-bootstrap'; // UI components from react-bootstrap
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd'; // Drag and drop functionality
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase'; // Firebase auth import
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS

const backendUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

function Dashboard() {
  const [tasks, setTasks] = useState({ 'Priority Backlog': [], 'Today': [], 'Done Done': [] });
  const [user, setUser] = useState(null);
  const [showDoneDone, setShowDoneDone] = useState(true);
  const [editingTask, setEditingTask] = useState(null); // State for tracking the task being edited
  const navigate = useNavigate();

  // Fetch tasks for the current user
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;

      try {
        const response = await fetch(`${backendUrl}/api/tasks?userId=${user.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const fetchedTasks = await response.json();

        const newTasks = { 'Priority Backlog': [], 'Today': [], 'Done Done': [] };
        fetchedTasks.forEach((task) => {
          newTasks[task.status].push({ ...task, showDescription: false });
        });

        setTasks(newTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [user]);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        navigate('/login'); // Redirect to login if user is not authenticated
      }
    });
    return unsubscribe;
  }, [navigate]);

  const toggleDescription = (taskId) => {
    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks };
      for (let columnId in newTasks) {
        newTasks[columnId] = newTasks[columnId].map((task) => {
          if (task.id === taskId) {
            return { ...task, showDescription: !task.showDescription };
          }
          return task;
        });
      }
      return newTasks;
    });
  };

  // Handle drag-and-drop
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const start = tasks[source.droppableId];
    const finish = tasks[destination.droppableId];
    const [movedTask] = start.splice(source.index, 1);
    finish.splice(destination.index, 0, movedTask);

    movedTask.status = destination.droppableId; // Update task status based on destination

    // Update the task in the backend
    try {
      await fetch(`${backendUrl}/api/tasks/${draggableId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid, updates: { status: movedTask.status } }),
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }

    setTasks({
      ...tasks,
      [source.droppableId]: start,
      [destination.droppableId]: finish,
    });
  };

  // Handle the editing of tasks
  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  // Handle save changes for the task
  const handleSaveTask = async () => {
    try {
      await fetch(`${backendUrl}/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid, updates: editingTask }),
      });
      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };
        for (let columnId in newTasks) {
          newTasks[columnId] = newTasks[columnId].map((task) => 
            task.id === editingTask.id ? editingTask : task
          );
        }
        return newTasks;
      });
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Handle changes in the editing form
  const handleEditChange = (e) => {
    setEditingTask({ ...editingTask, [e.target.name]: e.target.value });
  };

  // Optimistically update the UI before sending DELETE request
  const handleDeleteTask = async (taskId, status) => {
    // Optimistically update UI
    setTasks((prevTasks) => {
      const newTasks = { ...prevTasks };
      newTasks[status] = newTasks[status].filter((task) => task.id !== taskId);
      return newTasks;
    });

    try {
      const response = await fetch(`${backendUrl}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      // Rollback UI update if DELETE fails
      // Refetch tasks or add the task back to the UI state
      setTasks((prevTasks) => {
        // Optional: Rollback or refetch from server to ensure consistency
        return { ...prevTasks }; 
      });
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Row>
          {Object.entries(tasks).map(([columnId, tasks]) => (
            <Col key={columnId} md={4}>
              <h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
                  {columnId}
                  {columnId === 'Done Done' && (
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
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {tasks.map((task, index) => (
                      (columnId !== 'Done Done' || showDoneDone) && (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <Card ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="mb-3">
                              <Card.Body>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Card.Title>{task.name}</Card.Title>
                                  <div>
                                    <Badge pill className="size-badge">{task.size}</Badge>
                                    <Button variant="link" onClick={() => toggleDescription(task.id)}>
                                      {task.showDescription ? <FaCaretDown /> : <FaCaretLeft />}
                                    </Button>
                                  </div>
                                </div>
                                {task.showDescription && (
                                  <>
                                    <Card.Text>{task.notes}</Card.Text>
                                    <div>
                                      <span className="badge-label">Urgency: </span>
                                      <Badge pill className="urgency-badge">{task.urgency}</Badge>
                                    </div>
                                    <div>
                                      <span className="badge-label">Value: </span>
                                      <Badge pill className="value-badge">{task.value}</Badge>
                                    </div>
                                    <div className="mt-2 d-flex justify-content-end">
                                      <Button variant="outline-primary" size="sm" onClick={() => handleEditTask(task)}>
                                        <FaEdit /> Edit
                                      </Button>
                                      <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleDeleteTask(task.id, task.status)}>
                                        <FaTrash /> Delete
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </Card.Body>
                            </Card>
                          )}
                        </Draggable>
                      )
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Col>
          ))}
        </Row>
      </DragDropContext>

      {/* Edit Task Modal */}
      {editingTask && (
        <Modal show={true} onHide={() => setEditingTask(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Task</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Task Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editingTask.name}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={editingTask.notes}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Size</Form.Label>
                <Form.Select
                  name="size"
                  value={editingTask.size}
                  onChange={handleEditChange}
                >
                  <option value="<15 mins">{"<15 mins"}</option>
                  <option value="15-30 mins">15-30 mins</option>
                  <option value="1 hr">1 hr</option>
                  <option value="1-3 hrs">1-3 hrs</option>
                  <option value="3-6 hrs">3-6 hrs</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Urgency</Form.Label>
                <Form.Select
                  name="urgency"
                  value={editingTask.urgency}
                  onChange={handleEditChange}
                >
                  <option value="1 - Very Low - within a month">1 - Very Low - within a month</option>
                  <option value="2 - Low - within 1-2 weeks">2 - Low - within 1-2 weeks</option>
                  <option value="3 - Moderate - within 4 days">3 - Moderate - within 4 days</option>
                  <option value="4 - High - within 24-48 hrs">4 - High - within 24-48 hrs</option>
                  <option value="5 - Must be done today">5 - Must be done today</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Value</Form.Label>
                <Form.Select
                  name="value"
                  value={editingTask.value}
                  onChange={handleEditChange}
                >
                  <option value="5 - Make or break item">5 - Make or break item</option>
                  <option value="4 - High - Solidly helps">4 - High - Solidly helps</option>
                  <option value="3 - Moderate - Moves projects along">3 - Moderate - Moves projects along</option>
                  <option value="2 - Some Value">2 - Some Value</option>
                  <option value="1 - Low Value">1 - Low Value</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditingTask(null)}>
              <FaTimes /> Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveTask}>
              <FaSave /> Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}

export default Dashboard;
