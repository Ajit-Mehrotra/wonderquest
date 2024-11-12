import { AuthContext } from "context/AuthContext";
import { WeightsContext } from "context/WeightContext";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { fetchUserWeights, updateUserWeights } from "services/api";

export default function WeightSettings() {
  const { user } = useContext(AuthContext);
  const { weights, setWeights } = useContext(WeightsContext);
  const [formWeights, setFormWeights] = useState({ ...weights });
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadUserWeights = async () => {
      if (user && isMounted) {
        try {
          const fetchedWeights = await fetchUserWeights();
          if (isMounted) {
            setWeights(fetchedWeights);
            setFormWeights(fetchedWeights);
          }
        } catch (error) {
          console.error("Failed to fetch user weights", error);
        }
      }
    };

    loadUserWeights();

    return () => {
      isMounted = false; // Cleanup function to set isMounted to false when the component unmounts
    };
  }, [user]);

  const handleWeightChange = (e, weightType) => {
    setFormWeights({
      ...formWeights,
      [weightType]: Number(e.target.value),
    });
  };

  const handleSaveChanges = async () => {
    let isMounted = true;

    try {
      await updateUserWeights({ weights: formWeights });
      setWeights(formWeights);

      if (isMounted) {
        setNotification({
          type: "success",
          message: "Changes saved successfully, and task priorities updated!",
        });
      }

      const timeoutId = setTimeout(() => {
        if (isMounted) {
          navigate("/dashboard");
        }
      }, 1000);

      // Cleanup timeout on unmount
      return () => clearTimeout(timeoutId);
    } catch (error) {
      if (isMounted) {
        setNotification({
          type: "danger",
          message: "Failed to save changes. Please try again.",
        });
      }
    }

    // Clear notification after 3 seconds
    const clearNotificationTimeout = setTimeout(() => {
      if (isMounted) {
        setNotification(null);
      }
    }, 3000);

    // Cleanup both timeouts
    return () => {
      isMounted = false;
      clearTimeout(clearNotificationTimeout);
    };
  };

  return (
    <Container className="settings-container mt-5">
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
                value={formWeights.urgencyWeight}
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
                value={formWeights.valueWeight}
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
                value={formWeights.sizeWeight}
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
}
