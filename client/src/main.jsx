import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/App.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode> removed because react drag and drop library does not support it. Need to change that down the line
  <App />
  // </React.StrictMode>
);
