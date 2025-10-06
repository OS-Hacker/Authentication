import React, { useCallback } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/Api";

const Home = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Make API request to logout endpoint using `api` which sets withCredentials
      await api.delete(`/auth/logout`);
      setAuth(null);

      navigate("/login");
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      // Even if API call fails, clear local auth state
      setAuth(null);
    }
  }, [navigate, setAuth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <p className="mb-4">Welcome, {auth?.userName}</p>
      <button
        onClick={logout}
        className="bg-red-500 text-white p-2 rounded cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};

export default Home;
