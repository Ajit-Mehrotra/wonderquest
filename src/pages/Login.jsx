import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Login({onLogin}) {
  const navigate = useNavigate(); // Initialize the navigate function
  const handleSubmit = (event) => {
    event.preventDefault();
    // Simulate successful login
    onLogin();
    navigate('/dashboard'); // Use navigate to programmatically redirect to the dashboard
  };
  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" className="form-control" id="email" required />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" required />
          </div>
          <button type="submit" className="btn btn-primary w-100" >Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
