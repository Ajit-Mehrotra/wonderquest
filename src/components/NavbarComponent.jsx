 import React from 'react';
 import {Container, Navbar, Nav, Button} from 'react-bootstrap'; // UI components from react-bootstrap
 import {Link } from 'react-router-dom';
 import '../styles/Navbar.css'; 

function NavbarComponent({isLoggedIn, handleLogout}) {

  return (
    <Navbar expand="lg" className="custom-navbar"> {/* Custom styling */}
    <Container>
      <Navbar.Brand as={Link} to="/" className="brand-name">Erun's Kanban</Navbar.Brand> {/* Website Name */}
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            {!isLoggedIn && ( // Conditionally render Login and Sign Up links
              <>
                <Nav.Link as={Link} to="/login" className="nav-link-custom">Login</Nav.Link>
                <Nav.Link as={Link} to="/signup" className="nav-link-custom">Sign Up</Nav.Link>
              </>
            )}
            {isLoggedIn && (
              <Nav.Link as={Link} to="/dashboard" className="nav-link-custom">Dashboard</Nav.Link>
            )}
          </Nav>
          {isLoggedIn && (
            <Button variant="outline-primary" className="custom-logout" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Navbar.Collapse>
    </Container>
  </Navbar>
  );
}

export default NavbarComponent;

 
 
