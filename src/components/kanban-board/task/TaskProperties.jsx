import React from "react";
import { Badge } from "react-bootstrap";

const TaskProperties = ({ label, value }) => (
  <div>
    <span className="badge-label">{label}: </span>
    <Badge pill className="task-badge">
      {value}
    </Badge>
  </div>
);

export default TaskProperties;
