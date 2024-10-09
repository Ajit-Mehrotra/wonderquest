import React, { useContext, useEffect } from "react";
import { Container, Navbar, Nav, Button, Spinner } from "react-bootstrap"; // UI components from react-bootstrap
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import { AuthContext } from "context/AuthContext";
import { firebaseSignOut } from "services/auth";
import { useNavigate } from "react-router-dom";

function NavbarComponent() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await firebaseSignOut();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Navbar expand="lg" className="custom-navbar">
      {" "}
      {/* Custom styling */}
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-name">
          Auto-Kanban
        </Navbar.Brand>{" "}
        {/* Website Name */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            {!user && ( // Conditionally render Login and Sign Up links
              <>
                <Nav.Link as={Link} to="/login" className="nav-link-custom">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/signup" className="nav-link-custom">
                  Sign Up
                </Nav.Link>
              </>
            )}
            {user && (
              <>
                <Nav.Link as={Link} to="/dashboard" className="nav-link-custom">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/settings" className="nav-link-custom">
                  Settings
                </Nav.Link>
              </>
            )}
          </Nav>
          {user && (
            <Button
              variant="outline-primary"
              className="custom-logout"
              onClick={handleLogout}
            >
              Logout
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
