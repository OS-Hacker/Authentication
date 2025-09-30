import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../../services/Api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post("/forgot-password", { email });

      if (response?.data?.success) {
        setEmail("");
        toast.success(response?.data?.message);
      } else {
        toast.error(response.data.message || "Failed to send reset email");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-[#1e1e1e] p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center text-gray-300 mb-6">
          Forgot Password
        </h1>
        <p className="text-center text-gray-400 mb-6 text-sm">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-full p-2 border text-white border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-md font-semibold text-white transition-colors ${
              loading
                ? "bg-orange-400 cursor-not-allowed opacity-70"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <button
          onClick={() => navigate("/login")}
          className="w-full text-orange-500 mt-6 hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
