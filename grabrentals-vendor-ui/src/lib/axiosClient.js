import axios from "axios";
import { 
  getAuthToken, 
  getVendorAuthToken, 
  getDriverAuthToken, 
  isDriverContext, 
  logout 
} from "./auth.js";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Pre-configured Axios instance with Interceptors for Vendor Portal:
 * 1. Request Interceptor: Automatically injects JWT Bearer token into Authorization header
 *    - Uses Driver token for /api/driver requests or /driver routes
 *    - Uses Vendor token for /api/vendor requests or /vendor routes
 * 2. Response Interceptor: Handles 401 Unauthorized globally without wiping cross-portal sessions
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
    let token = null;
    const isDriverReq = config.url?.startsWith("/api/driver") || isDriverContext();
    if (isDriverReq) {
      token = getDriverAuthToken() || getAuthToken();
    } else {
      token = getVendorAuthToken() || getAuthToken();
    }

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
let isRedirecting = false;

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 && typeof window !== "undefined") {
        const pathname = window.location.pathname;
        const isAuthPage =
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/reset-password") ||
          pathname.startsWith("/driver/login");

        if (!isAuthPage) {
          const isDriver = pathname.startsWith("/driver") || error.config?.url?.startsWith("/api/driver");
          
          // Clear only the appropriate session so vendor and driver in different tabs don't conflict
          if (isDriver) {
            logout("driver");
          } else {
            logout("vendor");
          }

          if (!isRedirecting) {
            isRedirecting = true;
            const loginPath = isDriver ? "/driver/login" : "/login";
            console.warn(`Session expired or unauthorized (401). Redirecting to ${loginPath}...`);
            const redirectUrl = pathname && pathname !== "/" ? `${loginPath}?redirect=${encodeURIComponent(pathname)}` : loginPath;
            window.location.href = redirectUrl;
          }
        }
      }
    } else if (error.request) {
      if (error.code !== "ERR_CANCELED") {
        console.error("No response received from backend:", error.message);
      }
    } else {
      console.error("Axios setup error:", error.message);
    }
    return Promise.reject(error);
  }
);
