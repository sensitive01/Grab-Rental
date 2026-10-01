"use client";

const TOKEN_KEY = "rental_access_token";
const USER_KEY = "rental_user";

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  const token = getAuthToken();
  const user = getCurrentUser();
  return !!(token && user);
}

export function setAuthSession(token, user) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to persist auth session", e);
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error("Failed to clear auth session", e);
  }
}
