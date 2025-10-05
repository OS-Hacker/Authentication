// services/api.js
import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  withCredentials: true, // Important for cookies
  timeout: 10000, // 10 seconds timeout
});

// In-memory storage for access token
let accessToken = null;
let refreshPromise = null; // To prevent multiple refresh calls

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add common headers
    config.headers["Content-Type"] =
      config.headers["Content-Type"] || "application/json";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh tokens (will use the singleton promise)
        await authAPI.refreshTokens();

        // Update the authorization header and retry
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await authAPI.logout();

        // Redirect to login page if we're not already there
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle other common errors
    if (error.response) {
      // Server responded with error status
      console.error("API Error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network Error:", error.message);
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  // Set access token in memory
  setAccessToken(token) {
    accessToken = token;
  },

  // Get access token from memory
  getAccessToken() {
    return accessToken;
  },

  // Clear access token
  clearAccessToken() {
    accessToken = null;
    refreshPromise = null;
  },

  // Login user
  async login(email, password) {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      accessToken = data.accessToken;
      return data;
    } catch (error) {
      this.clearAccessToken();
      throw error;
    }
  },

  // Refresh tokens with concurrency control
  async refreshTokens() {
    // If a refresh is already in progress, return that promise
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const { data } = await api.post("/auth/refresh-token");
          accessToken = data.accessToken;
          return data;
        } catch (error) {
          this.clearAccessToken();
          throw error;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    return refreshPromise;
  },

  // Get current user
  async getCurrentUser() {
    const { data } = await api.get("/auth/me");
    return data;
  },

  // Logout user
  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
      // Still clear tokens even if API call fails
    } finally {
      this.clearAccessToken();

      // Clear any stored data
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    }
  },

  // Register new user
  async register(userData) {
    const { data } = await api.post("/auth/signup", userData);
    return data;
  },

  // Forgot password
  async forgotPassword(email) {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },

  // Reset password
  async resetPassword(token, newPassword) {
    const { data } = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return data;
  },
};



export default api;
