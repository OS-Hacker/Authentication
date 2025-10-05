// src/context/AuthContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import Loading from "../pages/Loading";
import { authAPI } from "../services/Api";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ useCallback ensures stable reference
  const checkAuth = useCallback(async () => {
    try {
      const data = await authAPI.getCurrentUser();
      if (data?.success && data.user) {
        setAuth(data.user);
      } else {
        setAuth(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuth(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ run only once on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ✅ useMemo prevents unnecessary context re-creation
  const value = useMemo(
    () => ({
      auth,
      isLoading,
      isAuthenticated: !!auth,
      checkAuth,
      setAuth,
    }),
    [auth, isLoading, checkAuth]
  );

  if (isLoading) return <Loading />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
// Hook for consuming the AuthContext
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
