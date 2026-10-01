import axios from "axios";
import { getAuthToken, logout } from "./auth.js";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Bearer Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized Globally
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 && typeof window !== "undefined") {
        if (!window.location.pathname.startsWith("/login")) {
          console.warn("Customer session expired or unauthorized (401). Redirecting to login...");
          logout();
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    } else if (error.request) {
      console.error("No response received from backend:", error.message);
    } else {
      console.error("Axios setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
