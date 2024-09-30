import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Card, Row, Col } from "react-bootstrap";
import { auth } from "../firebase/firebase";
import { addTask } from "../services/api";

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

function AddTask() {
  const [taskData, setTaskData] = useState({
    name: "",
    notes: "",
    size: { label: "", value: 0 },
    urgency: { label: "", value: 0 },
    value: { label: "", value: 0 },
    status: "Priority Backlog",
    priority: 0,
  });

  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Listen for authentication state changes
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const selectedOption = e.target.options[e.target.selectedIndex];
    const label = selectedOption.text;

    setTaskData({
      ...taskData,
      [name]: {
        value: value,
        label: label,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("User not authenticated!");
      return;
    }
    console.log("being run");

    const priority =
      taskData.urgency.value * 100 +
      taskData.value.value * 60 +
      taskData.size.value * 40;
    const taskWithPriority = { ...taskData, priority: priority };

    const data = await addTask({ userId: user.uid, task: taskWithPriority });
    navigate("/dashboard");
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card className="p-4 shadow-lg add-task-card">
        <h2 className="text-center mb-4">Add a New Task</h2>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Task Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={taskData.name}
                  onChange={(e) =>
                    setTaskData({ ...taskData, name: e.target.value })
                  }
                  required
                  placeholder="Enter task name"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Size</Form.Label>
                <Form.Select
                  name="size"
                  value={taskData.size.value}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Size</option>
                  {sizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Urgency</Form.Label>
                <Form.Select
                  name="urgency"
                  value={taskData.urgency.value}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Urgency</option>
                  {urgencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Value</Form.Label>
                <Form.Select
                  name="value"
                  value={taskData.value.value}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Value</option>
                  {valueOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={taskData.notes}
              onChange={(e) =>
                setTaskData({ ...taskData, notes: e.target.value })
              }
              placeholder="Add any notes here"
            />
          </Form.Group>
          <div className="d-grid">
            <Button variant="primary" type="submit" className="rounded-pill">
              Add Task
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}

export default AddTask;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Form, Button, Container, Card, Row, Col } from "react-bootstrap";
// import { auth } from "../firebase/firebase";
// import { addTask } from "../services/api";

// const backendUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

// function AddTask() {
//   const [taskData, setTaskData] = useState({
//     name: "",
//     notes: "",
//     size: "",
//     urgency: "",
//     value: "",
//     status: "Priority Backlog",
//   });
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);

//   // Listen for authentication state changes
//   React.useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
//       setUser(firebaseUser);
//     });
//     return unsubscribe;
//   }, []);

//   const handleChange = (e) => {
//     setTaskData({ ...taskData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!user) {
//       alert("User not authenticated!");
//       return;
//     }
//     console.log("being run");
//     const data = await addTask({ userId: user.uid, task: taskData });
//     navigate("/dashboard");
//   };

//   return (
//     <Container className="d-flex justify-content-center align-items-center mt-5">
//       <Card className="p-4 shadow-lg add-task-card">
//         <h2 className="text-center mb-4">Add a New Task</h2>
//         <Form onSubmit={handleSubmit}>
//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Task Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="name"
//                   value={taskData.name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter task name"
//                 />
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Size</Form.Label>
//                 <Form.Select
//                   name="size"
//                   value={taskData.size}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">Select Size</option>
//                   <option value="<15 mins">{"<15 mins"}</option>
//                   <option value="15-30 mins">15-30 mins</option>
//                   <option value="1 hr">1 hr</option>
//                   <option value="1-3 hrs">1-3 hrs</option>
//                   <option value="3-6 hrs">3-6 hrs</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//           </Row>
//           <Row>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Urgency</Form.Label>
//                 <Form.Select
//                   name="urgency"
//                   value={taskData.urgency}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">Select Urgency</option>
//                   <option value="1 - Very Low - within a month">
//                     1 - Very Low - within a month
//                   </option>
//                   <option value="2 - Low - within 1-2 weeks">
//                     2 - Low - within 1-2 weeks
//                   </option>
//                   <option value="3 - Moderate - within 4 days">
//                     3 - Moderate - within 4 days
//                   </option>
//                   <option value="4 - High - within 24-48 hrs">
//                     4 - High - within 24-48 hrs
//                   </option>
//                   <option value="5 - Must be done today">
//                     5 - Must be done today
//                   </option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Value</Form.Label>
//                 <Form.Select
//                   name="value"
//                   value={taskData.value}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">Select Value</option>
//                   <option value="5 - Make or break item">
//                     5 - Make or break item
//                   </option>
//                   <option value="4 - High - Solidly helps">
//                     4 - High - Solidly helps
//                   </option>
//                   <option value="3 - Moderate - Moves projects along">
//                     3 - Moderate - Moves projects along
//                   </option>
//                   <option value="2 - Some Value">2 - Some Value</option>
//                   <option value="1 - Low Value">1 - Low Value</option>
//                 </Form.Select>
//               </Form.Group>
//             </Col>
//           </Row>
//           <Form.Group className="mb-3">
//             <Form.Label>Notes</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               name="notes"
//               value={taskData.notes}
//               onChange={handleChange}
//               placeholder="Add any notes here"
//             />
//           </Form.Group>
//           <div className="d-grid">
//             <Button variant="primary" type="submit" className="rounded-pill">
//               Add Task
//             </Button>
//           </div>
//         </Form>
//       </Card>
//     </Container>
//   );
// }

// export default AddTask;
