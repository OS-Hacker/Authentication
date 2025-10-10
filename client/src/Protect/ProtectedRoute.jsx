// components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import Loading from "../pages/Loading";

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, auth, isLoading } = useAuth();
  const location = useLocation();

  console.log(auth?.role);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required roles are specified
  if (requiredRoles.length > 0 && auth?.role) {
    const hasRequiredRole = requiredRoles.includes(auth.role);
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
