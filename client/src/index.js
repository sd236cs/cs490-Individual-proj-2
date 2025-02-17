import React from "react";
import ReactDOM from "react-dom/client"; // For React 18+
import App from "./App"; // The main App component
import "./index.css"; // Importing styles if needed

// Create the root element for rendering the app
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the App component into the DOM
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
