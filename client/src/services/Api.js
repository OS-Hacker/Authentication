import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  withCredentials: true,
});

let refreshInProgress = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors and only if we're not already refreshing
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !refreshInProgress
    ) {
      originalRequest._retry = true;
      refreshInProgress = true;

      try {
        // Attempt refresh
        await apiClient.post("/refresh-token", {});

        // If successful, retry the original request exactly once
        const response = await apiClient(originalRequest);
        refreshInProgress = false;
        return response;
      } catch (refreshError) {
        refreshInProgress = false;

        // If refresh fails, redirect to login and don't retry
        if (refreshError.response?.status === 401) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // For any other case, including if we're already refreshing, just reject
    return Promise.reject(error);
  }
);

export default apiClient;
