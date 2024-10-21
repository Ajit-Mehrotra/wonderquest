import React, { useContext } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/App.css";
import "../styles/LandingPage.css";
import { ThemeContext } from "context/ThemeContext";
import lightDemo from "../assets/demo/demoLight.gif";
import darkDemo from "../assets/demo/demoDark.gif";
import lightFocus from "../assets/demo/lightFocus.gif";
import darkFocus from "../assets/demo/darkFocus.gif";

import lightAdd from "../assets/images/lightAdd.png";
import darkAdd from "../assets/images/darkAdd.png";
import lightEdit from "../assets/images/lightEdit.png";
import darkEdit from "../assets/images/darkEdit.png";
import lightWeight from "../assets/images/lightWeights.png";
import darkWeight from "../assets/images/darkWeights.png";
import lightDone from "../assets/images/lightDone.png";
import darkDone from "../assets/images/darkDone.png";

function LandingPage() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <Container className="hero-section text-center py-5">
        <div className="hero-content">
          <h1 className="main-title">
            <span className="title-box text-info rounded-pill">the quests</span>
            <br />
            <span className="subtitle-box bg-info rounded-pill">
              given by life
            </span>
          </h1>
          <h2 className="mt-4">made simple.</h2>
          <div className="mt-4">
            <Button variant="dark" className="me-3">
              Get Started
            </Button>
            <Button variant="outline-info rounded-pill landing-button">
              Login
            </Button>
          </div>

          {/* Demo Section */}
          <div className="demo-container  mt-4">
            <div className="demo-section dotted rounded-pill">
              <img
                src={isDarkMode ? darkDemo : lightDemo}
                alt="Demo of the app"
                className="demo-gif"
              />
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <Row className="feature-cards mt-5">
          <Col md={4}>
            <Card className="feature-card">
              <Card.Body>
                <Card.Title className="feature-title">Add Tasks</Card.Title>
                <Card.Img
                  variant="top"
                  src={isDarkMode ? darkAdd : lightAdd}
                  alt="Online Recording"
                  className="feature-image"
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="feature-card">
              <Card.Body>
                <Card.Title className="feature-title">Edit Them</Card.Title>
                <Card.Img
                  variant="top"
                  src={isDarkMode ? darkEdit : lightEdit}
                  alt="Music Production"
                  className="feature-image"
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="feature-card">
              <Card.Body>
                <Card.Title className="feature-title">
                  Done Done &apos;Em
                </Card.Title>
                <Card.Img
                  variant="top"
                  src={isDarkMode ? darkDone : lightDone}
                  alt="Equipment"
                  className="feature-image"
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* About Section */}
      <section className="automate-section text-center py-5">
        <Container>
          <hr />
          <h2 className="section-title mb-4">Automate Your Priorities</h2>
          <p className="section-text mb-4">
            You set the weights. We tell you what needs to get done first. Of
            course, you can override it at any time.
          </p>
          <img
            src={isDarkMode ? darkWeight : lightWeight}
            alt="Demo of the app"
            className="demo-gif"
          />
        </Container>
      </section>

      {/* Program Section */}
      <Container className="program-section y-5">
        <hr className="mb-5" />
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start">
            <h2 className="section-title">
              Focus and <span className="text-info">lock in</span>
              <br />
              on your work
            </h2>
            <p className="program-text mt-3">
              Forget everything you&apos;ve done and focus on what you need to
              do now.
            </p>
          </Col>
          <Col md={6} className="text-center">
            <img
              src={isDarkMode ? darkFocus : lightFocus}
              alt="Demo of the app"
              className="focus-gif"
            />
          </Col>
        </Row>
        <hr className="mt-5" />
      </Container>
      {/* Bug Reporting Section */}
      <Container className="bug-reporting-section py-5 text-center">
        <h2 className="section-title">Report a Bug</h2>
        <p className="section-text mb-4">
          Encounter any issues? Let us know by filling out this form!
        </p>
        <Button
          variant="info"
          href="https://forms.gle/6LT1Wz6QUXFudyak8" // Replace with your actual Google Form link
          target="_blank"
          rel="noopener noreferrer"
        >
          Report a Bug
        </Button>
      </Container>
    </div>
  );
}

export default LandingPage;
