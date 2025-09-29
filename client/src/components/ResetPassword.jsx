import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/reset-password/${token}`,
        { password }
      );

      if (response.data.success) {
        toast.success("Password reset successfully!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(response.data.message || "Password reset failed");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid or expired token";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen font-sans bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-gray-800 text-center mb-4 text-2xl font-semibold">
          Reset Your Password
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Please enter your new password below.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength="8"
            required
            className="w-full p-3 border border-gray-300 rounded-md text-base mb-4 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-300"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md text-base mb-4 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-orange-500 text-white rounded-md font-semibold flex items-center justify-center gap-2 transition duration-300 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <button
          onClick={() => navigate("/login")}
          className="block w-full bg-transparent border-none text-orange-500 text-center mt-6 font-medium cursor-pointer p-2 hover:text-orange-600 hover:underline transition"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
