"use client";

import axios from "axios";

const SESSION_KEY = "grabrentals_vendor_session";
const TOKEN_KEY = "grabrentals_vendor_token";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
        name: beUser.name || "Vendor Partner",
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

    return {
      success: false,
      error: res.data?.message || "Login failed. Please check your credentials.",
    };
  } catch (err) {
    if (err.response?.data?.message) {
      return {
        success: false,
        error: err.response.data.message,
      };
    }

    return {
      success: false,
      error: "Unable to connect to the authentication server. Please check your network and backend status.",
    };
  }
}
