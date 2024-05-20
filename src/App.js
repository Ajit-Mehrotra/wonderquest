// Import necessary libraries and components
import React, { useState, useEffect } from 'react'; // React and hooks for state management and side effects
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'; // Drag and drop functionality
import { Card, Button, Badge, Container, Row, Col, Form } from 'react-bootstrap'; // UI components from react-bootstrap
import { FaCaretDown, FaCaretLeft } from 'react-icons/fa'; // Icons for UI
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS

// Main App component
function App() {
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

  // Function to handle the end of a drag-and-drop operation
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped in the same place, do nothing
    if (!destination) {
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Get the source and destination columns
    const start = tasks[source.droppableId];
    const finish = tasks[destination.droppableId];
    // Remove the dragged task from the source column
    const task = start.splice(source.index, 1)[0];

    if (destination.droppableId === source.droppableId) {
      // If the task is moved within the same column
      finish.splice(destination.index, 0, task); // Add the task to its new position in the same column

      let newRankingManual;
      if (destination.index === 0) {
        // If the task is moved to the top of the column
        newRankingManual = finish[1].fields['Ranking Final'] + 1;
      } else if (destination.index === finish.length - 1) {
        // If the task is moved to the bottom of the column
        newRankingManual = finish[finish.length - 2].fields['Ranking Final'] - 1;
      } else {
        // If the task is moved somewhere in the middle
        newRankingManual = (finish[destination.index - 1].fields['Ranking Final'] + finish[destination.index + 1].fields['Ranking Final']) / 2;
      }

      // Update the task's manual ranking
      task.fields['Ranking Manual'] = newRankingManual;

      // Send a PATCH request to update the task's ranking in the database
      fetch(`${process.env.REACT_APP_API_BASE_URL}/Design%20Projects/${draggableId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Ranking Manual': newRankingManual
          }
        })
      })
      .then(response => response.json())
      .then(data => console.log(data)) // Log response for debugging
      .catch(error => console.error(error)); // Log errors
    } else {
      // If the task is moved to a different column
      finish.splice(destination.index, 0, task); // Add the task to its new position in the destination column
      const newStatus = destination.droppableId === 'Done' ? 'Done Done' : destination.droppableId;

      // Send a PATCH request to update the task's status in the database
      fetch(`${process.env.REACT_APP_API_BASE_URL}/Design%20Projects/${draggableId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            Status: newStatus
          }
        })
      })
      .then(response => response.json())
      .then(data => console.log(data)) // Log response for debugging
      .catch(error => console.error(error)); // Log errors
    }

    // Update state with the new task positions
    setTasks({
      ...tasks,
      [source.droppableId]: start,
      [destination.droppableId]: finish,
    });
  };

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

  // Render the component
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Container>
        <Row>
          {Object.entries(tasks).map(([columnId, tasks], index) => (
            <Col key={columnId} md={4}>
              <h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      </Container>
    </DragDropContext>
  );
}

// Export the App component as the default export
export default App;