import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css"; // ← هذا مهم جداً للستايل

ReactDOM.createRoot(document.getElementById("root")).render(

    <AuthProvider>   
        <App />   
    </AuthProvider>

);
