import React, { useContext } from "react";
import { Container, Navbar, Nav, Button } from "react-bootstrap"; // UI components from react-bootstrap
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import { AuthContext } from "context/AuthContext";
import { firebaseSignOut } from "services/auth";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "context/ThemeContext";
import ThemeToggle from "./settings/ThemeToggle";
import logoDark from "../assets/logos/logoDark.png";
import logoLight from "../assets/logos/logoLight.png";

function NavbarComponent() {
  const { user, setUser } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
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

  const UserLinks = () => {
    return (
      <>
        <Nav>
          <Nav.Link as={Link} to="/dashboard" className="nav-link-custom ">
            Dashboard
          </Nav.Link>
          <Nav.Link as={Link} to="/settings" className="nav-link-custom">
            Settings
          </Nav.Link>
        </Nav>
        <Button
          variant="outline-primary "
          className="custom-logout"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </>
    );
  };

  const GuestLinks = () => {
    return (
      <>
        <Nav.Link as={Link} to="/login" className="nav-link-custom">
          Login
        </Nav.Link>
        <Nav.Link as={Link} to="/signup" className="nav-link-custom">
          Sign Up
        </Nav.Link>
      </>
    );
  };
  console.log("isDarkMode", isDarkMode);
  return (
    <Navbar
      expand="lg"
      className={`custom-navbar container text-center mt-4 ${
        isDarkMode ? "bg-dark" : "bg-white"
      }`}
    >
      {/* Custom styling */}
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-name">
          <div className="brand-logo-container">
            <img
              src={isDarkMode ? logoDark : logoLight}
              alt="WonderQuest Logo"
              className="brand-logo"
            />
          </div>
        </Navbar.Brand>{" "}
        {/* Website Name */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <ThemeToggle />
          {user ? <UserLinks /> : <GuestLinks />}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
