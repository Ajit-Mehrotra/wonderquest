# Task Management App

## Overview

This project is a task management application built with React, utilizing the react-beautiful-dnd library for drag-and-drop functionality. It also uses react-bootstrap for styling and layout, and react-icons for icons. The application allows users to manage tasks across different columns, update task details, and reorder tasks using drag-and-drop.

## Features

	•	Drag and Drop: Reorder tasks within and across columns using drag-and-drop.
	•	Task Details: View and toggle detailed descriptions of tasks.
	•	Task Status Update: Automatically update task statuses when moved between columns.
	•	Dynamic Task Loading: Fetch tasks from an API upon application load.

## Installation

### Prerequisites

	•	Node.js (v12.x or later)
	•	npm (v6.x or later)

### Steps

1.	**Clone the repository:**

```bash
git clone https://github.com/your-username/task-management-app.git
cd task-management-app
```
2.	**Install dependencies:**
```bash
npm install
```

3.	**Set up environment variables:**

Create a .env file in the root directory of the project and add your API URL and API key:
```
REACT_APP_API_URL=https://your-api-url.com/endpoint
REACT_APP_API_KEY=your-api-key
```
4.	**Run the application:**
```bash
npm start
```

The application will be available at http://localhost:3000.

## Usage

### Columns

The application has three main columns for task management:

	1.	Priority Backlog: Tasks that need to be addressed.
	2.	Today: Tasks scheduled for today.
	3.	Done Done: Completed tasks.

### Drag and Drop

	•	Within the Same Column: Reorder tasks by dragging them to the desired position.
	•	Between Columns: Move tasks between columns to update their status.

### Task Details

Click the caret icon next to a task to toggle its detailed view, which includes notes, urgency, and value.

## Code Structure

	•	src/App.js: Main component managing the state and rendering the UI.
	•	src/index.js: Entry point of the application.

### Detailed Code Explanation

#### State Initialization

	•	Tasks State: Manages the tasks in different columns.
	•	Show Done Done State: Controls the visibility of the ‘Done Done’ column.

#### useEffect Hook

	•	Fetches tasks from the API when the component mounts and updates the tasks state.

#### handleDragEnd Function

	•	Handles the logic for when a drag-and-drop operation ends.
	•	Updates task positions and statuses in the state and sends PATCH requests to update the database.

#### toggleDescription Function

	•	Toggles the visibility of a task’s description when the caret icon is clicked.

#### Rendering

	•	DragDropContext: Wraps the entire component to provide drag-and-drop functionality.
	•	Droppable: Defines droppable areas (columns).
	•	Draggable: Defines draggable items (tasks).

## Contributing

	1.	Fork the repository.
	2.	Create a new branch for your feature or bugfix.
	3.	Commit your changes.
	4.	Push to the branch.
	5.	Create a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

	•	React: A JavaScript library for building user interfaces.
	•	react-beautiful-dnd: A library for creating beautiful, accessible drag-and-drop experiences.
	•	react-bootstrap: Bootstrap components built with React.
	•	react-icons: Popular icons as React components.