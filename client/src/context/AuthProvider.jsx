// Import necessary React hooks and other dependencies
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import Loading from "../pages/Loading";
import apiClient from "../services/Api";

// Create an authentication context to share auth state across components
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // State for storing authenticated user data
  const [auth, setAuth] = useState(null);

  const [loading, setLoading] = useState(true);

  // Function to check if user is authenticated
  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/auth/current-user`);
      setAuth(data.success ? data.user : null);
    } catch (err) {
      // On error, clear auth state
      setAuth(null);
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this is created once

  // Effect to check authentication status when component mounts
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Logout function
  // const logout = useCallback(async () => {
  //   try {
  //     // Make API request to logout endpoint
  //     await apiClient.post(`/auth/logout`);
  //     setAuth(null);
  //     navigate("/login");
  //   } catch (err) {
  //     toast.error("Logout failed", { position: "top-center" });
  //     console.error("Logout error:", err);
  //   }
  // }, [navigate]); // Only recreate if navigate changes

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      auth,
      loading,
      isAuthenticated: !!auth, // Boolean indicating auth status
      checkAuth,
    }),
    [auth, loading, checkAuth] // Only recalculate when these change
  );

  // Render the provider with context value
  return (
    <AuthContext.Provider value={contextValue}>
      {/* Show loading spinner or children based on loading state */}
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
};

// Export the provider component
export default AuthProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  // Get context from nearest AuthProvider
  const context = useContext(AuthContext);
  // Throw error if used outside AuthProvider
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context; // Return auth context values
};
