import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { updateUserWeights } from "../services/api";
import "../styles/Settings.css";

const Settings = ({ user, formulaWeights, setFormulaWeights }) => {
  const [weights, setWeights] = useState({ ...formulaWeights });
  const [notification, setNotification] = useState(null);
  let isMounted = true;
  const navigate = useNavigate();

  const handleWeightChange = (e, weightType) => {
    setWeights({
      ...weights,
      [weightType]: Number(e.target.value),
    });
  };

  const handleSaveChanges = async () => {
    try {
      // Update weights in the frontend state
      setFormulaWeights(weights);

      // Send PATCH request to update weights in the database and reorder tasks
      await updateUserWeights({ userId: user.uid, weights });

      // Set a success notification
      if (isMounted) {
        setNotification({
          type: "success",
          message: "Changes saved successfully, and task priorities updated!",
        });
      }

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        if (isMounted) {
          navigate("/dashboard");
        }
      }, 1000);
    } catch (error) {
      // Set an error notification
      if (isMounted) {
        setNotification({
          type: "danger",
          message: "Failed to save changes. Please try again.",
        });
      }
    }

    // Clear the notification after 3 seconds
    setTimeout(() => {
      if (isMounted) {
        setNotification(null);
      }
    }, 3000);
  };

  return (
    <Container className="settings-container mt-5">
      <h2 className="text-center mb-4">Settings</h2>

      {/* Notification */}
      {notification && (
        <Alert
          variant={notification.type}
          onClose={() => setNotification(null)}
          dismissible
        >
          {notification.message}
        </Alert>
      )}

      <Form>
        <Row className="mb-4">
          <Col md={12}>
            <Form.Group controlId="urgencyWeight">
              <Form.Label>Urgency Weight</Form.Label>
              <Form.Control
                type="number"
                value={weights.urgencyWeight}
                min={0}
                max={200}
                onChange={(e) => handleWeightChange(e, "urgencyWeight")}
                className="weight-input"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={12}>
            <Form.Group controlId="valueWeight">
              <Form.Label>Value Weight</Form.Label>
              <Form.Control
                type="number"
                value={weights.valueWeight}
                min={0}
                max={200}
                onChange={(e) => handleWeightChange(e, "valueWeight")}
                className="weight-input"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={12}>
            <Form.Group controlId="sizeWeight">
              <Form.Label>Size Weight</Form.Label>
              <Form.Control
                type="number"
                value={weights.sizeWeight}
                min={0}
                max={200}
                onChange={(e) => handleWeightChange(e, "sizeWeight")}
                className="weight-input"
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </Form>
    </Container>
  );
};

export default Settings;
