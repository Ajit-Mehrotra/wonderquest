import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, Button, Badge, Container, Row, Col, Form } from 'react-bootstrap';
import { FaCaretDown, FaCaretUp, FaCaretLeft } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [tasks, setTasks] = useState({ 'Priority Backlog': [], 'Today': [], 'Done Done': [] });
  const [showDoneDone, setShowDoneDone] = useState(true);

  useEffect(() => {
    fetch('https://api.airtable.com/v0/appVXFJJlBFs4nDeq/Design%20Projects?filterByFormula=OR(%7BStatus%7D=\'Priority%20Backlog\',%7BStatus%7D=\'Today\',%7BStatus%7D=\'Done%20Done\')&sort%5B0%5D%5Bfield%5D=Ranking%20Final&sort%5B0%5D%5Bdirection%5D=desc', {
      headers: {
        'Authorization': 'Bearer patCRuvQNJDTr3dWj.a91f0bad66dc0006062fafebee44d99d20233350c1bc9cbfedcf70eab3283b44'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const newTasks = { 'Priority Backlog': [], 'Today': [], 'Done Done': [] };
      data.records.forEach(record => {
        const task = {
          id: record.id,
          fields: {
            Name: record.fields.Name,
            Notes: record.fields.Notes || '',
            Size: record.fields.Size,
            'Ranking Final': record.fields['Ranking Final'],
            Value: record.fields.Value, // Add this line
            Urgency: record.fields.Urgency // Add this line
          },
          showDescription: false
        };
        if (newTasks[record.fields.Status]) {
          newTasks[record.fields.Status].push(task);
        }
      });
      setTasks(newTasks);
    });
  }, []);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = tasks[source.droppableId];
    const finish = tasks[destination.droppableId];
    const task = start.splice(source.index, 1)[0];

    if (destination.droppableId === source.droppableId) {
      // Moving within the same column
      finish.splice(destination.index, 0, task);

      let newRankingManual;
      if (destination.index === 0) {
        // Moved to the top
        newRankingManual = finish[1].fields['Ranking Final'] + 1;
      } else if (destination.index === finish.length - 1) {
        // Moved to the bottom
        newRankingManual = finish[finish.length - 2].fields['Ranking Final'] - 1;
      } else {
        // Moved in between
        newRankingManual = (finish[destination.index - 1].fields['Ranking Final'] + finish[destination.index + 1].fields['Ranking Final']) / 2;
      }

      task.fields['Ranking Manual'] = newRankingManual;

      fetch(`https://api.airtable.com/v0/appVXFJJlBFs4nDeq/Design%20Projects/${draggableId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer patCRuvQNJDTr3dWj.a91f0bad66dc0006062fafebee44d99d20233350c1bc9cbfedcf70eab3283b44',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Ranking Manual': newRankingManual
          }
        })
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
    } else {
      // Moving to a different column
      finish.splice(destination.index, 0, task);
      const newStatus = destination.droppableId === 'Done' ? 'Done Done' : destination.droppableId;

      fetch(`https://api.airtable.com/v0/appVXFJJlBFs4nDeq/Design%20Projects/${draggableId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer patCRuvQNJDTr3dWj.a91f0bad66dc0006062fafebee44d99d20233350c1bc9cbfedcf70eab3283b44',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            Status: newStatus
          }
        })
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
    }

    setTasks({
      ...tasks,
      [source.droppableId]: start,
      [destination.droppableId]: finish,
    });
  ;

    const newStatus = destination.droppableId === 'Done' ? 'Done Done' : destination.droppableId;
    fetch(`https://api.airtable.com/v0/appVXFJJlBFs4nDeq/Design%20Projects/${draggableId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer patCRuvQNJDTr3dWj.a91f0bad66dc0006062fafebee44d99d20233350c1bc9cbfedcf70eab3283b44',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          Status: newStatus
        }
      })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
  };

  const toggleDescription = (taskId) => {
    setTasks(prevTasks => {
      const newTasks = { ...prevTasks };
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
                                {task.showDescription && (
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
                    {provided.placeholder}
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

export default App;