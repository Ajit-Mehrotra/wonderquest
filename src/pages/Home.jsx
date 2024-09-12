import React from 'react';
import { Container, Row, Col, Button, Card, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaCheckCircle, FaTasks, FaUserFriends, FaCogs } from 'react-icons/fa';

function Home() {
  return (
    <div>
      {/* Header Section */}
      <header className="bg-primary text-white text-center py-5 rounded">  
        <Container className="mt-5">
          <h1 className="display-4 fw-bold">Simplify Your Workflow</h1>
          <p className="lead">Manage tasks effortlessly with real-time collaboration and intuitive drag-and-drop functionality.</p>
          <Button href="/login" variant="light" size="lg" className="mt-3 fw-bold">Get Started for Free</Button>
        </Container>
      </header>

      {/* Features Section */}
      <div id="features" className="py-5">
        <Container>
          <h2 className="text-center mb-4 fw-bold">Features</h2>
          <Row className="text-center">
            <Col md={4} className="mb-4">
              <FaTasks size={50} className="text-primary mb-3" />
              <h4>Task Management</h4>
              <p>Organize your tasks in intuitive columns like Backlog, Today, and Done. Drag and drop to prioritize.</p>
            </Col>
            <Col md={4} className="mb-4">
              <FaUserFriends size={50} className="text-primary mb-3" />
              <h4>Collaborate with Teams</h4>
              <p>Invite team members, assign tasks, and track progress in real time with seamless collaboration tools.</p>
            </Col>
            <Col md={4} className="mb-4">
              <FaCogs size={50} className="text-primary mb-3" />
              <h4>Customizable Workflows</h4>
              <p>Customize your board to match your workflow needs with adjustable columns, task settings, and more.</p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-4 fw-bold">What Our Users Say</h2>
          <Row className="text-center">
            <Col md={4} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <Card.Text>"Auto Kanban has transformed how my team manages projects. We are more productive than ever!"</Card.Text>
                  <Card.Footer className="text-muted">— Sarah L., Project Manager</Card.Footer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <Card.Text>"The drag-and-drop feature is incredibly intuitive. It’s a game-changer for task management."</Card.Text>
                  <Card.Footer className="text-muted">— David K., Software Developer</Card.Footer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <Card.Text>"I love the clean interface and real-time updates. Auto Kanban makes collaboration so easy!"</Card.Text>
                  <Card.Footer className="text-muted">— Emily R., Designer</Card.Footer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action Section */}
      <section id="cta" className="text-center py-5 bg-primary text-white">
        <Container>
          <h2 className="fw-bold">Ready to Boost Your Productivity?</h2>
          <p className="lead">Start using Auto Kanban today and take control of your workflow.</p>
          <Button href="/signup" variant="light" size="lg" className="mt-3 fw-bold">Sign Up Now</Button>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4">
        <Container>
          <p className="mb-0">© 2024 Auto Kanban. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}

export default Home;
