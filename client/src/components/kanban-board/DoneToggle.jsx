import React from "react";
import { Form } from "react-bootstrap";

function DoneToggle({ showDoneDone, onToggle }) {
  return (
    <Form.Check
      type="switch"
      id="done-done-toggle"
      label=""
      checked={showDoneDone}
      onChange={onToggle}
    />
  );
}

export default DoneToggle;
