// src/components/FormulaWeightControls.jsx
import React, { useState } from "react";
import { Form, Row, Col, Card } from "react-bootstrap";
import "../styles/FormulaWeightControls.css"; 

const FormulaWeightControls = ({ onWeightChange }) => {
  const [weights, setWeights] = useState({
    urgencyWeight: 100,
    valueWeight: 60,
    sizeWeight: 40,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedWeights = { ...weights, [name]: Number(value) };
    setWeights(updatedWeights);
    onWeightChange(updatedWeights);
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <h5 className="mb-3">Adjust Formula Weights</h5>
        <Form>
          <Row className="align-items-center">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Urgency Weight</Form.Label>
                <Form.Control
                  type="number"
                  name="urgencyWeight"
                  value={weights.urgencyWeight}
                  onChange={handleChange}
                  className="text-center"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Value Weight</Form.Label>
                <Form.Control
                  type="number"
                  name="valueWeight"
                  value={weights.valueWeight}
                  onChange={handleChange}
                  className="text-center"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Size Weight</Form.Label>
                <Form.Control
                  type="number"
                  name="sizeWeight"
                  value={weights.sizeWeight}
                  onChange={handleChange}
                  className="text-center"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormulaWeightControls;
