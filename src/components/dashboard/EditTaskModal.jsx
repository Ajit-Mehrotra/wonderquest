import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { FaSave, FaTimes } from "react-icons/fa";

// Options for dropdowns
const urgencyOptions = [
  { label: "1 - Very Low - within a month", value: 1 },
  { label: "2 - Low - within 1-2 weeks", value: 2 },
  { label: "3 - Moderate - within 4 days", value: 3 },
  { label: "4 - High - within 24-48 hrs", value: 4 },
  { label: "5 - Must be done today", value: 5 },
];

const valueOptions = [
  { label: "5 - Make or break item", value: 5 },
  { label: "4 - High - Solidly helps", value: 4 },
  { label: "3 - Moderate - Moves projects along", value: 3 },
  { label: "2 - Some Value", value: 2 },
  { label: "1 - Low Value", value: 1 },
];

const sizeOptions = [
  { label: "<15 mins", value: 1 },
  { label: "15-30 mins", value: 2 },
  { label: "1 hr", value: 3 },
  { label: "1-3 hrs", value: 4 },
  { label: "3-6 hrs", value: 5 },
];

const EditTaskModal = ({ show, task, onSave, onClose }) => {
  // Initialize the editing task with both label and value for dropdown fields
  const [editingTask, setEditingTask] = useState({
    ...task,
    size: task.size || { label: "", value: 0 },
    urgency: task.urgency || { label: "", value: 0 },
    value: task.value || { label: "", value: 0 },
    priority: task.priority || 0,
  });

  // Handle changes to dropdowns and text inputs
  const onChange = (e) => {
    const { name, value } = e.target;
    const selectedOption = e.target.options[e.target.selectedIndex];
    const label = selectedOption.text;

    // Update the task with both value and label for dropdowns
    setEditingTask({
      ...editingTask,
      [name]: { value: value, label: label },
    });
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Task Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={editingTask.name}
              onChange={(e) =>
                setEditingTask({ ...editingTask, name: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={editingTask.notes}
              onChange={(e) =>
                setEditingTask({ ...editingTask, notes: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Size</Form.Label>
            <Form.Select
              name="size"
              value={editingTask.size.value}
              onChange={onChange}
            >
              <option value="">Select Size</option>
              {sizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Urgency</Form.Label>
            <Form.Select
              name="urgency"
              value={editingTask.urgency.value}
              onChange={onChange}
            >
              <option value="">Select Urgency</option>
              {urgencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Value</Form.Label>
            <Form.Select
              name="value"
              value={editingTask.value.value}
              onChange={onChange}
            >
              <option value="">Select Value</option>
              {valueOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          <FaTimes /> Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            const priority =
              editingTask.urgency.value * 100 +
              editingTask.value.value * 60 +
              editingTask.size.value * 40;
            const taskWithPriority = { ...editingTask, priority: priority };
            onSave(taskWithPriority, setEditingTask);
          }}
        >
          <FaSave /> Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditTaskModal;

// import React, { useState } from "react";
// import { Modal, Form, Button } from "react-bootstrap";
// import { FaSave, FaTimes } from "react-icons/fa";

// const EditTaskModal = ({ show, task, onSave, onClose }) => {
//   const [editingTask, setEditingTask] = useState(task);

//   const onChange = (e) => {
//     setEditingTask({ ...editingTask, [e.target.name]: e.target.value });
//   };

//   return (
//     <Modal show={show} onHide={onClose}>
//       <Modal.Header closeButton>
//         <Modal.Title>Edit Task</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form>
//           <Form.Group className="mb-3">
//             <Form.Label>Task Name</Form.Label>
//             <Form.Control
//               type="text"
//               name="name"
//               value={editingTask.name}
//               onChange={onChange}
//             />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>Notes</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               name="notes"
//               value={editingTask.notes}
//               onChange={onChange}
//             />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>Size</Form.Label>
//             <Form.Select
//               name="size"
//               value={editingTask.size}
//               onChange={onChange}
//             >
//               <option value="<15 mins">{"<15 mins"}</option>
//               <option value="15-30 mins">15-30 mins</option>
//               <option value="1 hr">1 hr</option>
//               <option value="1-3 hrs">1-3 hrs</option>
//               <option value="3-6 hrs">3-6 hrs</option>
//             </Form.Select>
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>Urgency</Form.Label>
//             <Form.Select
//               name="urgency"
//               value={editingTask.urgency}
//               onChange={onChange}
//             >
//               <option value="1 - Very Low - within a month">
//                 1 - Very Low - within a month
//               </option>
//               <option value="2 - Low - within 1-2 weeks">
//                 2 - Low - within 1-2 weeks
//               </option>
//               <option value="3 - Moderate - within 4 days">
//                 3 - Moderate - within 4 days
//               </option>
//               <option value="4 - High - within 24-48 hrs">
//                 4 - High - within 24-48 hrs
//               </option>
//               <option value="5 - Must be done today">
//                 5 - Must be done today
//               </option>
//             </Form.Select>
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>Value</Form.Label>
//             <Form.Select
//               name="value"
//               value={editingTask.value}
//               onChange={onChange}
//             >
//               <option value="1 - Low Value">1 - Low Value</option>
//               <option value="2 - Some Value">2 - Some Value</option>
//               <option value="3 - Moderate - Moves projects along">
//                 3 - Moderate - Moves projects along
//               </option>
//               <option value="4 - High - Solidly helps">
//                 4 - High - Solidly helps
//               </option>
//               <option value="5 - Make or break item">
//                 5 - Make or break item
//               </option>
//             </Form.Select>
//           </Form.Group>
//         </Form>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onClose}>
//           <FaTimes /> Cancel
//         </Button>
//         <Button
//           variant="primary"
//           onClick={() => onSave(editingTask, setEditingTask)}
//         >
//           <FaSave /> Save Changes
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default EditTaskModal;
