// src/Signup.js
import React , {useEffect, useState}from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseCreateUser} from '../services/auth';
import { createUserProfile } from '../services/db';
import { auth } from '../firebase/firebase';


function Signup() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  


  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

 // Listen for authentication state changes
 useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
    setUser(firebaseUser);
    if (firebaseUser) {
      navigate('/dashboard'); // Redirect to dashboard if logged in
    }
  });
  return unsubscribe;
}, [navigate]);
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    try {
      // Sign up the user using email and password
      const userCredential = await firebaseCreateUser(email, password);
      console.log(`userCredential: ${userCredential}`);
      // Create a user profile in Firestore with display name
      await createUserProfile({
        ...userCredential, 
        displayName: name// Spread existing user properties
      });

    
      const response = await fetch(`${backendUrl}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, displayName: name }),
      });
  
      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();
      // Use token from the backend for authentication
      console.log('Login successful:', data);



     
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      // Handle signup errors (e.g., show an error message to the user)
    }
  };


  return (
    <div className="container d-flex align-items-center justify-content-center mt-5">
      <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input type="text" onChange={(e) => setName(e.target.value)} className="form-control" id="name" required />
          </div>
          <div className="mb-3">
            <label htmlFor="email"  className="form-label">Email address</label>
            <input type="email"  onChange={(e) => setEmail(e.target.value)} className="form-control" id="email" required />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" onChange={(e) => setPassword(e.target.value)} className="form-control" id="password" required />
          </div>
          <button type="submit" className="btn btn-primary w-100">Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
