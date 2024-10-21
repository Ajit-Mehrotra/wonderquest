import React, { useContext } from "react";
import { Form, Stack } from "react-bootstrap";
import { ThemeContext } from "../../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa"; // Importing icons

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <Stack direction="horizontal" gap={2} className="me-3">
      {isDarkMode ? <FaMoon /> : <FaSun />}
      <Form.Check
        type="switch"
        className="theme-toggle "
        checked={isDarkMode}
        onChange={toggleTheme}
      />
    </Stack>
  );
}
