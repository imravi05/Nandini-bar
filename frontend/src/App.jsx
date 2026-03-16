import React from "react";
import { HashRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/Routes";
import "./App.css";

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
      <AppRoutes />
    </Router>
  );
}

export default App;
