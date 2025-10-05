import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          Sorry, the page you are looking for does not exist.
        </p>
        <button
          className="cursor-pointer rounded-2xl bg-amber-600 p-3 text-xl font-bold "
          onClick={() => navigate("/login")}
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
