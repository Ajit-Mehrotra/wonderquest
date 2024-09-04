// Import necessary libraries and components
import React, { useState, useEffect } from 'react'; // React and hooks for state management and side effects
import { DragDropContext} from 'react-beautiful-dnd'; // Drag and drop functionality
import { Container} from 'react-bootstrap'; // UI components from react-bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NavbarComponent from './components/NavbarComponent';

// Main App component
function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Initialize state from localStorage if available
    return localStorage.getItem('isLoggedIn') === 'true';
  });
 
  // Simulate login action
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  useEffect(() => {
      // Persist login state changes to localStorage
      localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]); // Print whenever isLoggedIn changes

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

  // Render the component
  return (
    
    <Router>
    <DragDropContext onDragEnd={handleDragEnd}>
      <Container>
       <div className="container text-center my-4">
      <NavbarComponent isLoggedIn={isLoggedIn} handleLogout={handleLogout}/>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> :  <Navigate to="/login" />} />
        </Routes>
      </div>
      </Container>
    </DragDropContext>
    </Router>
  );
}

// Export the App component as the default export
export default App;