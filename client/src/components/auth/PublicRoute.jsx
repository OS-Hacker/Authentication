import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    // User is logged in, redirect to home
    return <Navigate to="/home" replace />;
  }
  return children;
};

export default PublicRoute;

// Example route structure:
// - /login (Public)
// - /signup (Public)
// - /forgot-password (Public)
// - /reset-password/:token (Public)
// - /home (Protected)
// - * (ErrorPage for undefined routes)
