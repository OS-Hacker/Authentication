import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import toast, { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./components/ResetPassword";



const App = () => {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Login route */}
        <Route path="/login" element={<Login />} />
        {/* Signup route */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/Home" element={<Home />} />
        {/* forgot-password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Optional: 404 page for unmatched routes */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;
