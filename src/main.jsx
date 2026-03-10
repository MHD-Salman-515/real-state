import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationsProvider } from "./components/notifications/NotificationsProvider";
import "./index.css";
import "./styles/creos.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <NotificationsProvider>
      <App />
    </NotificationsProvider>
  </AuthProvider>
);
