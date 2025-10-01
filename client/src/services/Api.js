import axios from "axios";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  withCredentials: true, // This enables cookies for cross-site requests
});

// Response interceptor - handles responses and errors
// apiClient.interceptors.response.use(
//   (response) => {
//     // Simply return the successful response without modification
//     return response;
//   },

//   async (error) => {
//     // Store reference to the original request configuration
//     const originalRequest = error.config;

//     // Check if error is 401 (Unauthorized) AND request hasn't been retried yet
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       // Mark this request as retried to prevent infinite loops
//       originalRequest._retry = true;

//       try {
//         // Attempt to refresh access token using refresh token
//         // Note: withCredentials: true ensures cookies (including refresh token) are sent automatically
//         await apiClient.post(
//           `/refresh-token`, // Refresh token endpoint
//           {} // Empty body since tokens are in cookies
//         );

//         // If refresh successful, retry the original request
//         // Cookies will contain the new access token automatically
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         // Refresh token request failed - likely expired or invalid
//         // Redirect user to login page for re-authentication
//         window.location.href = "/login";

//         // Optionally, you could clear any local storage or state here
//         // localStorage.removeItem('user');

//         // Reject the promise with the refresh error
//         return Promise.reject(refreshError);
//       }
//     }

//     // For all other errors (non-401 or already retried), simply reject
//     return Promise.reject(error);
//   }
// );

export default apiClient;
