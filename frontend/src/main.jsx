import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/figtree";
import App from "./App.jsx";
import { applyAppearance, readCachedAppearance } from "./theme.js";
import "./styles/theme.css";
import "./styles/layout.css";
import "./styles/components.css";

applyAppearance(readCachedAppearance());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
