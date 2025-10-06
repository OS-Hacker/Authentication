import axios from "axios";

// Private API (needs access token + refresh)
const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  withCredentials: true,
});

let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => (accessToken = token);
export const getAccessToken = () => accessToken;

// Request interceptor for private API
api.interceptors.request.use(
  (config) => {
    if (accessToken) config.headers["Authorization"] = `Bearer ${accessToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for private API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (
      originalRequest &&
      (originalRequest.skipAuthRefresh ||
        originalRequest.url.includes("/auth/refresh-token"))
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (refreshPromise) {
        return refreshPromise.then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      refreshPromise = api
        .post(`/auth/refresh-token`, null, { skipAuthRefresh: true })
        .then(({ data }) => {
          setAccessToken(data.accessToken);
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${data.accessToken}`;
          return data.accessToken;
        })
        .finally(() => {
          refreshPromise = null;
        });

      return refreshPromise.then((token) => {
        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    return Promise.reject(error);
  }
);

// --------------------
// Public API (no auth, no interceptors)
const publicApi = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  withCredentials: false, // don't send cookies unless needed
});

export { api, publicApi };
