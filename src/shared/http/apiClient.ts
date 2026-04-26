import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api"
    : import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      throw new Error(
        "Network error: Unable to connect to server. Please check your connection or try again later.",
      );
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
