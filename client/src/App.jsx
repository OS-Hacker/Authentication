import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ResetPassword from "./components/auth/ResetPassword";
import RequestVerification from "./components/auth/RequestVerification";
import AuthProvider from "./context/AuthProvider";
import ForgotPassword from "./components/auth/ForgotPassword";
import VerifyAccount from "./components/auth/VerifyAccount";
import { Toaster } from "react-hot-toast";

const ErrorPage = () => (
  <div>
    <h1>404 Not Found</h1>
    <p>Sorry, the page you are looking for does not exist.</p>
  </div>
);
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
  {
    path: "/verify-email",
    element: (
      <PublicRoute>
        <RequestVerification />
      </PublicRoute>
    ),
  },
  {
    path: "/verify-email/:token",
    element: (
      <PublicRoute>
        <VerifyAccount />
      </PublicRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },
  {
    path: "/home",
    element: (
      <>
        <Home />
      </>
    ),
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
