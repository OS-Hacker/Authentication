import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ResetPassword from "./auth/ResetPassword";
import ForgotPassword from "./auth/ForgotPassword";
import VerifyAccount from "./auth/VerifyAccount";
import CheckEmailTem from "./auth/CheckEmailTem";
import ErrorPage from "./pages/ErrorPage";
import SideBarLayout from "./pages/dashboard/sidebar/SideBarLayout";
import Unauthorized from "./pages/Unauthorized";
import Layout from "./components/Layout";
import ProtectedRoute from "./Protect/ProtectedRoute";
import PublicRoute from "./Protect/PublicRoute";
import Users from "./components/Users";
import Settings from "./components/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="Home" replace />,
      },
      {
        path: "Home",
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
      <ProtectedRoute requiredRoles={["admin", "user"]}>
        <SideBarLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
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
