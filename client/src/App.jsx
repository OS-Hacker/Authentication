// App.jsx
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./auth/ProtectedRoute";
import PublicRoute from "./auth/PublicRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ResetPassword from "./auth/ResetPassword";
import AuthProvider from "./context/AuthProvider";
import ForgotPassword from "./auth/ForgotPassword";
import VerifyAccount from "./auth/VerifyAccount";
import CheckEmailTem from "./auth/CheckEmailTem";
import { Toaster } from "react-hot-toast";
import ErrorPage from "./pages/ErrorPage";
import Dashboard from "./pages/dashboard/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import Layout from "./components/Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
    ],
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute restricted>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute restricted>
        <Signup />
      </PublicRoute>
    ),
  },
  {
    path: "/verify-email/:token",
    element: (
      <PublicRoute restricted>
        <VerifyAccount />
      </PublicRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicRoute restricted>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/check-email",
    element: (
      <PublicRoute restricted>
        <CheckEmailTem />
      </PublicRoute>
    ),
  },
  {
    path: "/reset-password/:token",
    element: (
      <PublicRoute restricted>
        <ResetPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        {/* Example role protection */}
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} />
    </AuthProvider>
  );
};

export default App;
