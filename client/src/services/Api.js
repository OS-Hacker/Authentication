import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  withCredentials: true,
});

let accessToken = null;
let failedQueue = [];
// If a refresh request is in-flight, hold its promise here so concurrent
// 401-handling code can wait for the same refresh instead of creating a
// duplicate refresh request (race condition in StrictMode / concurrent mounts).
let refreshPromise = null;

export const setAccessToken = (token) => (accessToken = token);
export const getAccessToken = () => accessToken;

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    if (accessToken) config.headers["Authorization"] = `Bearer ${accessToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // If the refresh-token request itself fails, or the request asks to skip
    // auth-refresh handling, don't try to refresh again. This prevents a
    // recursive loop / duplicate requests when the refresh endpoint returns
    // 401 or otherwise fails.
    if (
      originalRequest &&
      (originalRequest.skipAuthRefresh ||
        (originalRequest.url &&
          originalRequest.url.includes("/auth/refresh-token")))
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      // mark this request so we don't try to refresh it multiple times
      originalRequest._retry = true;

      // If there's already a refresh in progress, wait for it and then
      // retry the original request using the token produced by that refresh.
      if (refreshPromise) {
        console.debug("Api: awaiting existing refreshPromise");
        return refreshPromise
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Otherwise, create a new refresh request and hold its promise
      refreshPromise = api
        .post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, null, {
          skipAuthRefresh: true,
        })
        .then(({ data }) => {
          setAccessToken(data.accessToken);
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${data.accessToken}`;
          processQueue(null, data.accessToken);
          return data.accessToken;
        })
        .catch((err) => {
          processQueue(err, null);
          // propagate the error so waiting callers can handle it
          throw err;
        })
        .finally(() => {
          refreshPromise = null;
        });

      // After creating refreshPromise, wait for it and retry the original request
      return refreshPromise.then((token) => {
        originalRequest.headers["Authorization"] = "Bearer " + token;
        return api(originalRequest);
      });
    }

    return Promise.reject(error);
  }
);

// Call this on logout to cancel pending requests and clear token
export const logout = () => {
  failedQueue.forEach(({ reject }) => reject(new Error("Logout")));
  failedQueue = [];
  accessToken = null;
};

export default api;
