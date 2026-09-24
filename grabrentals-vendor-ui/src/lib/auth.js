"use client";

import axios from "axios";

const SESSION_KEY = "grabrentals_vendor_session";
const TOKEN_KEY = "grabrentals_vendor_token";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const DEMO_VENDORS = [
  {
    email: "operations@royaltravelschennai.in",
    password: "fleet123",
    name: "K. Subramanian",
    company: "Royal Travels Chennai",
    role: "FLEET",
    tag: "Database Verified",
  },
  {
    email: "ops@bangaloreexpress.in",
    password: "fleet123",
    name: "Manjunath Gowda",
    company: "Bangalore Express Transports",
    role: "FLEET",
    tag: "Database Verified",
  },
  {
    email: "partner@kaveritravels.in",
    password: "password123",
    name: "Rajesh Kannan",
    company: "Kaveri Travels",
    role: "FLEET",
    tag: "Demo Fallback",
  },
];

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  try {
    const direct = localStorage.getItem(TOKEN_KEY);
    if (direct) return direct;
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      if (session?.token) return session.token;
    }
    return null;
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getCurrentUser();
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("grab_portal_role");
    localStorage.removeItem("grab_portal_email");
  }
}

export async function login(email, password) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPass = String(password || "").trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: "Please enter both email and password." };
  }

  // 1. Authenticate with Spring Boot backend via Axios
  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/auth/login`,
      { email: cleanEmail, password: cleanPass },
      { headers: { "Content-Type": "application/json" }, timeout: 15000 }
    );

    if (res.data?.success && res.data?.data?.accessToken) {
      const token = res.data.data.accessToken;
      const beUser = res.data.data.user;
      const role = beUser.role || "FLEET";

      const userObj = {
        id: beUser.id,
        email: beUser.email,
        name: beUser.name || "Fleet Partner",
        businessName: beUser.businessName || "Vendor Operations",
        role: role,
        token: token,
        source: "backend",
        loginTime: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem("grab_portal_role", role.toLowerCase());
        localStorage.setItem("grab_portal_email", beUser.email);
      }

      return {
        success: true,
        user: userObj,
        redirectUrl: "/vendor/dashboard",
      };
    }
  } catch (err) {
    // If backend returns an explicit error response (e.g., 401 Invalid Credentials, 403 Account Blocked)
    if (err.response?.data?.message) {
      return {
        success: false,
        error: err.response.data.message,
      };
    }

    console.warn("Backend login connection failed, checking local demo credentials:", err.message);
  }

  // 2. Fallback to local demo vendor credentials if backend was offline
  const demoMatch = DEMO_VENDORS.find(
    (v) => v.email.toLowerCase() === cleanEmail && v.password === cleanPass
  );

  if (demoMatch) {
    const userObj = {
      id: "demo-vendor-" + Date.now(),
      email: demoMatch.email,
      name: demoMatch.name,
      businessName: demoMatch.company,
      role: demoMatch.role,
      token: "demo-jwt-token-vendor",
      source: "local-demo",
      loginTime: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
      localStorage.setItem(TOKEN_KEY, userObj.token);
      localStorage.setItem("grab_portal_role", "vendor");
      localStorage.setItem("grab_portal_email", userObj.email);
    }

    return {
      success: true,
      user: userObj,
      redirectUrl: "/vendor/dashboard",
    };
  }

  return {
    success: false,
    error: "Invalid email or password. Please verify your credentials.",
  };
}
