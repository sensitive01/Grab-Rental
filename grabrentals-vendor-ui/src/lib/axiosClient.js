import axios from "axios";
import { getAuthToken } from "./auth.js";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Pre-configured Axios instance with Interceptors for Vendor Portal:
 * 1. Request Interceptor: Automatically injects JWT Bearer token into Authorization header
 * 2. Response Interceptor: Standardizes error handling and handles 401 Unauthorized globally
 */

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// === REQUEST INTERCEPTOR ===
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

// === RESPONSE INTERCEPTOR ===
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 && typeof window !== "undefined") {
        if (!window.location.pathname.startsWith("/login")) {
          console.warn("Vendor session expired or unauthorized (401). Redirecting to login...");
          localStorage.removeItem("grabrentals_vendor_token");
          localStorage.removeItem("grabrentals_vendor_session");
          window.location.href = "/login";
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
