import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { publicApi } from "../services/Api";

// The Standard Flow: Registration -> Verification -> Login -> Tokens
const Signup = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validation = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required";
    } else if (formData.userName.length < 3) {
      newErrors.userName = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validation()) return;

    setIsLoading(true);

    try {
      const { data } = await publicApi.post(`/auth/signup`, formData);

      if (data?.success) {
        toast.success(data.message);
        navigate("/check-email", { state: { email: formData.email } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[93vh] font-sans p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[400px] p-10 bg-[#1e1e1e] rounded-lg shadow-lg"
      >
        <h1 className="text-orange-500 text-center mb-6 text-2xl font-semibold">
          Register
        </h1>

        {errors.server && (
          <div className="text-red-500 bg-red-500/10 p-3 rounded-md mb-6 text-center text-sm">
            {errors.server}
          </div>
        )}

        {/* Username */}
        <div className="mb-6">
          <label
            htmlFor="username"
            className="block mb-2 font-medium text-gray-300 text-sm"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder="Enter your username"
            disabled={isLoading}
            className={`w-full p-2 rounded-md text-base bg-[#2d2d2d] text-white border ${
              errors.userName ? "border-red-500" : "border-[#333]"
            } placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 ${
              errors.userName ? "focus:ring-red-300" : "focus:ring-orange-300"
            } disabled:bg-[#3d3d3d] disabled:cursor-not-allowed`}
          />
          {errors.userName && (
            <span className="text-red-500 text-xs mt-1 block">
              {errors.userName}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block mb-2 font-medium text-gray-300 text-sm"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={isLoading}
            className={`w-full p-2 rounded-md text-base bg-[#2d2d2d] text-white border ${
              errors.email ? "border-red-500" : "border-[#333]"
            } placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 ${
              errors.email ? "focus:ring-red-300" : "focus:ring-orange-300"
            } disabled:bg-[#3d3d3d] disabled:cursor-not-allowed`}
          />
          {errors.email && (
            <span className="text-red-500 text-xs mt-1 block">
              {errors.email}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block mb-2 font-medium text-gray-300 text-sm"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            disabled={isLoading}
            className={`w-full p-2 rounded-md text-base bg-[#2d2d2d] text-white border ${
              errors.password ? "border-red-500" : "border-[#333]"
            } placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 ${
              errors.password ? "focus:ring-red-300" : "focus:ring-orange-300"
            } disabled:bg-[#3d3d3d] disabled:cursor-not-allowed`}
          />
          {errors.password && (
            <span className="text-red-500 text-xs mt-1 block">
              {errors.password}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-2 bg-orange-500 text-white rounded-md font-medium flex items-center justify-center gap-2 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:bg-orange-300 disabled:cursor-not-allowed"
        >
          {isLoading && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          )}
          {isLoading ? "Registering..." : "Register"}
        </button>

        {/* Login Link */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-orange-500 hover:underline">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;
