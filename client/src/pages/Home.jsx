import React from "react";
import { useAuth } from "../context/AuthProvider";

const Home = () => {
  const { auth } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <p className="mb-4 text-3xl">Welcome, {auth?.userName}</p>
      <p className="mb-4 text-3xl">Role, {auth?.role}</p>
    </div>
  );
};

export default Home;
