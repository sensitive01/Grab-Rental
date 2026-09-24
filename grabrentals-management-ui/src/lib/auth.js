"use client";

const SESSION_KEY = "grabrentals_mgmt_session";
const TOKEN_KEY = "grabrentals_jwt_token";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const DEMO_ACCOUNTS = {
  admin: {
    email: "admin@grabrentals.com",
    password: "admin123",
    role: "ADMIN",
    name: "System Administrator",
    avatar: "SA",
    redirectUrl: "/admin/dashboard",
    badge: "Admin Access",
  },
  operations: {
    email: "ops@grabrentals.com",
    password: "ops123",
    role: "OPERATIONS",
    name: "Karthik Narayanan",
    avatar: "KN",
    redirectUrl: "/operations/dashboard",
    badge: "Operations Dispatch",
  },
};

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

export async function login(email, password) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPass = String(password || "").trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: "Please enter both email and password." };
  }

  // 1. Try real backend authentication first if available
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data?.accessToken) {
        const token = result.data.accessToken;
        const beUser = result.data.user;
        const role = beUser.role || "ADMIN";
        const userObj = {
          id: beUser.id,
          email: beUser.email,
          name: beUser.name,
          role: role,
          avatar: beUser.name ? beUser.name.slice(0, 2).toUpperCase() : "SA",
          badge: role === "ADMIN" ? "Admin Access" : "Operations Dispatch",
          loginTime: new Date().toISOString(),
          token: token,
          source: "backend",
        };

        if (typeof window !== "undefined") {
          localStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
          localStorage.setItem(TOKEN_KEY, token);
        }

        const redirectUrl = role === "ADMIN" ? "/admin/dashboard" : "/operations/dashboard";
        return { success: true, user: userObj, redirectUrl };
      }
    }
  } catch (err) {
    // Backend offline or network issue, gracefully fallback to local demo accounts
    console.info("Backend login not reached, verifying with local credentials:", err.message);
  }

  // 2. Demo & local credentials fallback
  const isAdminMatch =
    (cleanEmail === DEMO_ACCOUNTS.admin.email.toLowerCase() && cleanPass === DEMO_ACCOUNTS.admin.password) ||
    (cleanEmail === "admin@example.com" && cleanPass === "Admin@123456");

  if (isAdminMatch) {
    const user = {
      email: cleanEmail,
      name: "System Administrator",
      role: "ADMIN",
      avatar: "SA",
      badge: "Admin Access",
      loginTime: new Date().toISOString(),
      source: "local",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
    return { success: true, user, redirectUrl: "/admin/dashboard" };
  }

  if (cleanEmail === DEMO_ACCOUNTS.operations.email.toLowerCase() && cleanPass === DEMO_ACCOUNTS.operations.password) {
    const user = {
      email: DEMO_ACCOUNTS.operations.email,
      name: DEMO_ACCOUNTS.operations.name,
      role: "OPERATIONS",
      avatar: DEMO_ACCOUNTS.operations.avatar,
      badge: DEMO_ACCOUNTS.operations.badge,
      loginTime: new Date().toISOString(),
      source: "local",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
    return { success: true, user, redirectUrl: "/operations/dashboard" };
  }

  return {
    success: false,
    error: "Invalid email or password. Use demo buttons below or check credentials.",
  };
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
  return "/login";
}
