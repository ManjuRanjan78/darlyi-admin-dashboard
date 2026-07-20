import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import State from "./Contex/State.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <State>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: "#1C485F",
                padding: "14px",
                color: "#FFF",
                fontWeight: "bold",
                letterSpacing: "0.2px",
              },
            },
            error: {
              style: {
                background: "#bf1d08",
                padding: "14px",
                color: "#FFFFFF",
                fontWeight: "bold",
                letterSpacing: "0.2px",
              },
              iconTheme: {
                primary: "#FFF",
                secondary: "red",
              },
            },
          }}
        />
      </BrowserRouter>
    </State>
  </React.StrictMode>
);
