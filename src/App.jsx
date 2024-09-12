// Import necessary libraries and components
import React, { useState, useEffect } from 'react'; // React and hooks for state management and side effects

import { Container} from 'react-bootstrap'; // UI components from react-bootstrap

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import OldDashboard from './pages/OldDashboard';
import AddTask from './pages/AddTask';
import NavbarComponent from './components/NavbarComponent';
import Home from './pages/Home';
import { observeAuthState, firebaseSignOut } from './services/auth';



function App() {

  const [user, setUser] = useState(null);
  
  
  useEffect(() => {
    // Use Firebase to observe authentication state
    const unsubscribe = observeAuthState(setUser);
    return () => unsubscribe();
  }, []);


  const handleLogout = async () => {
    try {
      await firebaseSignOut();
      setUser(null); // Update state after successful sign-out
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };



  // Render the component
  return (
    <Router>
    
      <Container>
       <div className="container text-center my-4">
      <NavbarComponent isLoggedIn={user} handleLogout={handleLogout}/>
        <Routes>
        <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={user ? <Dashboard  /> :  <Navigate to="/login" />} />
          <Route path="/add-task" element={user ? <AddTask  /> :  <Navigate to="/login" />} />
          <Route path="/old-dashboard" element={< OldDashboard/>} />
        </Routes>
      </div>
      </Container>
   
    </Router>
  );
}

// Export the App component as the default export
export default App;