import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { firebaseLogOnUser } from '../services/auth'; 
import { auth } from '../firebase/firebase';

function Login() {
  const navigate = useNavigate(); // Initialize the navigate function
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  

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
    event.preventDefault(); 
    try {
      const user = await firebaseLogOnUser(email, password);
      
      console.log('Logged in:', user);

    } catch (error) {
      console.error('Login error:', error);
      
      // Handle login errors (e.g., display error message to the user)
    }
    navigate('/dashboard');
  };


 


  return (
    <div className="container d-flex align-items-center justify-content-center mt-5">
      <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" onChange={(e) => setEmail(e.target.value)} className="form-control" id="email" required />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password"  onChange={(e) => setPassword(e.target.value)} className="form-control" id="password" required />
          </div>
          <button type="submit" className="btn btn-primary w-100" >Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
