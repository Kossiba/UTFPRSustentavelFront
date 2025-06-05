// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './App.css' 
import { BrowserRouter } from "react-router-dom";
import { CampusProvider } from "./context/CampusContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CampusProvider>
      <App />
    </CampusProvider>
  </BrowserRouter>
);
