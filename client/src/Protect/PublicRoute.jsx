// components/PublicRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import Loading from "../pages/Loading";

const PublicRoute = ({ children, restricted = false }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  // If route is restricted (like login/signup) and user is authenticated, redirect to home
  if (restricted && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicRoute;
