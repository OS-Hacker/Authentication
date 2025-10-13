import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

// Layout Components
import Layout from "./components/Layout";
import SideBarLayout from "./pages/dashboard/sidebar/SideBarLayout";

// Auth Components
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./auth/ResetPassword";
import ForgotPassword from "./auth/ForgotPassword";
import VerifyAccount from "./auth/VerifyAccount";
import CheckEmailTem from "./auth/CheckEmailTem";

// Page Components
import Home from "./pages/Home";
import ErrorPage from "./pages/ErrorPage";
import Unauthorized from "./pages/Unauthorized";

// Dashboard Components
import Dashboard from "./pages/dashboard/Dashboard";
import Users from "./components/Users";
import Settings from "./components/Settings";
import CreateProduct from "./pages/dashboard/CreateProduct";
import ProductList from "./pages/dashboard/ProductList";

// Route Protection
import ProtectedRoute from "./Protect/ProtectedRoute";
import PublicRoute from "./Protect/PublicRoute";

// Route configuration
const routes = [
  // Public routes with layout
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: "home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Auth routes (public only)
  {
    path: "/auth",
    children: [
      {
        path: "login",
        element: (
          <PublicRoute restricted>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "signup",
        element: (
          <PublicRoute restricted>
            <Signup />
          </PublicRoute>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <PublicRoute restricted>
            <ForgotPassword />
          </PublicRoute>
        ),
      },
      {
        path: "reset-password/:token",
        element: (
          <PublicRoute restricted>
            <ResetPassword />
          </PublicRoute>
        ),
      },
    ],
  },

  // Email verification routes
  {
    path: "/verify",
    children: [
      {
        path: "email/:token",
        element: (
          <PublicRoute restricted>
            <VerifyAccount />
          </PublicRoute>
        ),
      },
      {
        path: "check-email",
        element: (
          <PublicRoute restricted>
            <CheckEmailTem />
          </PublicRoute>
        ),
      },
    ],
  },

  // Admin Dashboard routes
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute requiredRoles={["admin", "user"]}>
        <SideBarLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/overview" replace />,
      },
      {
        path: "overview",
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "products",
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard/products/all" replace />,
          },
          {
            path: "all",
            element: <ProductList />,
          },
          {
            path: "create",
            element: <CreateProduct />,
          },
          {
            path: "edit/:id",
            element: <CreateProduct />, // You might want to create an EditProduct component
          },
        ],
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },

  // Utility routes
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },

  // Catch all route - 404
  {
    path: "*",
    element: <ErrorPage />,
  },
];

export const router = createBrowserRouter(routes);
