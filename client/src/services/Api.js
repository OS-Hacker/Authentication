import axios from "axios";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  withCredentials: true, // This enables cookies for cross-site requests
});

export default apiClient;
