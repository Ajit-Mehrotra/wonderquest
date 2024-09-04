import React, {useState, useEffect} from 'react';
import { FaCaretDown, FaCaretLeft } from 'react-icons/fa'; // Icons for UI
import { Card, Button, Badge, Row, Col, Form } from 'react-bootstrap'; // UI components from react-bootstrap
import { Droppable, Draggable } from 'react-beautiful-dnd'; // Drag and drop functionality

  // Function to toggle the visibility of a task's description
  const toggleDescription = (taskId) => {
    setTasks(prevTasks => {
      const newTasks = { ...prevTasks };
      // Iterate through each column to find the task by its ID and toggle its description visibility
      for (let columnId in newTasks) {
        newTasks[columnId] = newTasks[columnId].map(task => {
          if (task.id === taskId) {
            return { ...task, showDescription: !task.showDescription };
          }
          return task;
        });
      }
      return newTasks;
    });
  };


function Dashboard() {


   // Initialize state for tasks with useState hook
  // tasks is an object with keys for each task status and an array of tasks
  const [tasks, setTasks] = useState({ 'Priority Backlog': [], 'Today': [], 'Done Done': [] });
  // State to control the visibility of the 'Done Done' column
  const [showDoneDone, setShowDoneDone] = useState(true);
 // useEffect hook to fetch tasks from an API when the component first mounts

  useEffect(() => {
    fetch('https://api.airtable.com/v0/appVXFJJlBFs4nDeq/Design%20Projects?filterByFormula=OR(%7BStatus%7D%3D%27Priority%20Backlog%27,%7BStatus%7D%3D%27Today%27,%7BStatus%7D%3D%27Done%20Done%27)&sort%5B0%5D%5Bfield%5D=Ranking%20Final&sort%5B0%5D%5Bdirection%5D=desc', {
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}` // Include API key in the request header
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`); // Handle HTTP errors
      }
      return response.json(); // Parse response as JSON
    })
    .then(data => {
      // Initialize new tasks object
      const newTasks = { 'Priority Backlog': [], 'Today': [], 'Done Done': [] };
      // Iterate over the fetched data and structure it into tasks
      data.records.forEach(record => {
        const task = {
          id: record.id,
          fields: {
            Name: record.fields.Name,
            Notes: record.fields.Notes || '', // Use empty string if no notes are available
            Size: record.fields.Size,
            'Ranking Final': record.fields['Ranking Final'],
            Value: record.fields.Value,
            Urgency: record.fields.Urgency
          },
          showDescription: false // Initially hide the task description
        };
        // Add tasks to the appropriate status column
        if (newTasks[record.fields.Status]) {
          newTasks[record.fields.Status].push(task);
        }
      });
      setTasks(newTasks); // Update state with new tasks
    });
  }, []); // Empty dependency array means this runs once when the component mounts


  return (
    <Row>
          {Object.entries(tasks).map(([columnId, tasks], index) => (
            <Col key={columnId} md={4}>
              <h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop:'40px'}}>
                  {columnId}
                  {columnId === 'Done Done' && (
                    <Form.Check 
                      type="switch"
                      id="done-done-toggle"
                      label=""
                      checked={showDoneDone}
                      onChange={() => setShowDoneDone(!showDoneDone)} // Toggle the visibility of the 'Done Done' column
                    />
                  )}
                </div>
              </h2>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {tasks.map((task, index) => (
                      (columnId !== 'Done Done' || showDoneDone) && ( // Conditionally render tasks based on 'Done Done' visibility
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <Card ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <Card.Body>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Card.Title>{task.fields.Name}</Card.Title>
                                  <div>
                                    <Badge pill className="size-badge">{task.fields.Size}</Badge>
                                    <Button variant="link" onClick={() => toggleDescription(task.id)}>
                                      {task.showDescription ? <FaCaretDown /> : <FaCaretLeft />}
                                    </Button>
                                  </div>
                                </div>
                                {task.showDescription && ( // Conditionally render task description
                                  <>
                                    <Card.Text>{task.fields.Notes}</Card.Text>
                                    <div>
                                      <span className="badge-label">Urgency: </span>
                                      <Badge pill className="urgency-badge">{task.fields.Urgency}</Badge>
                                    </div>
                                    <div>
                                      <span className="badge-label">Value: </span>
                                      <Badge pill className="value-badge">{task.fields.Value}</Badge>
                                    </div>
                                  </>
                                )}
                              </Card.Body>
                            </Card>
                          )}
                        </Draggable>
                      )
                    ))}
                    {provided.placeholder} {/* Placeholder to maintain layout during dragging */}
                  </div>
                )}
              </Droppable>
            </Col>
          ))}
        </Row>
  );
}

export default Dashboard;
