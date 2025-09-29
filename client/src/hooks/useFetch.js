import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useApi = (url = null, method = "GET", options = {}, autoFetch = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (overrideUrl = url, overrideOptions = {}) => {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      try {
        const response = await axios({
          url: `${import.meta.env.VITE_API_BASE_URL}${overrideUrl}`,
          method,
          signal: controller.signal,
          ...options,
          ...overrideOptions,
        });
        setData(response.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
      return () => controller.abort();
    },
    [url, method, options]
  );

  useEffect(() => {
    if (autoFetch && url) fetchData();
  }, [url, method, options, autoFetch, fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useApi;
