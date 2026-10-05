"use client";

import axios from "axios";

const SESSION_KEY = "grabrentals_vendor_session";
const TOKEN_KEY = "grabrentals_vendor_token";
const ONBOARDING_KEY = "grabrentals_vendor_onboarding";
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

export function getOnboardingData() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveOnboardingData(updates) {
  if (typeof window === "undefined") return;
  try {
    const existing = getOnboardingData() || {};
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to save onboarding progress:", err);
  }
}

export function clearOnboardingData() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ONBOARDING_KEY);
  }
}

export async function sendOtp(phone, options = {}) {
  const cleanPhone = String(phone || "").trim();
  if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, "").length < 10) {
    return { success: false, error: "Please enter a valid 10-digit phone number." };
  }

  const payload = { phone: cleanPhone };
  if (options.purpose) {
    payload.purpose = options.purpose;
  }

  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/auth/otp/send`,
      payload,
      { headers: { "Content-Type": "application/json" }, timeout: 15000 }
    );

    if (res.data?.success) {
      return {
        success: true,
        message: res.data.message || "Verification code sent to your phone.",
        devOtp: res.data.data?.devOtp,
        expiresInSeconds: res.data.data?.expiresInSeconds || 300,
        userExists: res.data.data?.userExists,
        existingRole: res.data.data?.existingRole,
      };
    }

    return {
      success: false,
      error: res.data?.message || "Failed to send verification code. Please try again.",
    };
  } catch (err) {
    const msg = err.response?.data?.message || "Unable to send verification code. Please try again.";
    const isExistingUser =
      msg.toLowerCase().includes("already registered") ||
      msg.toLowerCase().includes("already exists") ||
      (err.response?.status === 400 && msg.toLowerCase().includes("log in"));

    return {
      success: false,
      error: msg,
      userExists: isExistingUser,
    };
  }
}

export async function verifyVendorOtp({ phone, otp, name, businessName, purpose = "LOGIN" }) {
  const cleanPhone = String(phone || "").trim();
  const cleanOtp = String(otp || "").trim();

  if (!cleanPhone || !cleanOtp) {
    return { success: false, error: "Please provide both phone number and verification code." };
  }

  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/auth/otp/verify`,
      {
        phone: cleanPhone,
        otp: cleanOtp,
        role: "FLEET",
        purpose: purpose,
        name: name ? String(name).trim() : undefined,
        businessName: businessName ? String(businessName).trim() : undefined,
      },
      { headers: { "Content-Type": "application/json" }, timeout: 15000 }
    );

    if (res.data?.success && res.data?.data?.accessToken) {
      const token = res.data.data.accessToken;
      const beUser = res.data.data.user;
      const role = beUser.role || "FLEET";
      const isNewUser = res.data.data.isNewUser ?? true;

      const userObj = {
        id: beUser.id,
        email: beUser.email,
        phone: cleanPhone,
        name: beUser.name || name || "Vendor Partner",
        businessName: beUser.businessName || businessName || "Fleet Partner",
        role: role,
        token: token,
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
        isNewUser: isNewUser,
        message: "Phone verified successfully.",
      };
    }

    return {
      success: false,
      error: res.data?.message || "Invalid or expired verification code.",
    };
  } catch (err) {
    const msg = err.response?.data?.message || "Verification failed. Please check the code and try again.";
    return { success: false, error: msg };
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
      error: "Unable to sign in. Please verify your connection and try again.",
    };
  }
}

export async function registerVendor({ name, email, phone, password, businessName }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPass = String(password || "").trim();
  const cleanName = String(name || "").trim();
  const cleanPhone = String(phone || "").trim();
  const cleanBiz = String(businessName || "").trim();

  if (!cleanName || !cleanEmail || !cleanPhone || !cleanPass || !cleanBiz) {
    return { success: false, error: "Please fill in all required fields." };
  }

  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/auth/register/vendor`,
      {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: cleanPass,
        businessName: cleanBiz,
      },
      { headers: { "Content-Type": "application/json" }, timeout: 15000 }
    );

    if (res.data?.success) {
      return {
        success: true,
        data: res.data.data,
        message: res.data.message || "Vendor registered successfully.",
      };
    }

    return {
      success: false,
      error: res.data?.message || "Registration failed. Please try again.",
      fieldErrors: res.data?.data || null,
    };
  } catch (err) {
    if (err.response?.data) {
      const respData = err.response.data;
      return {
        success: false,
        error: respData.message || "Registration failed. Please verify your details.",
        fieldErrors: typeof respData.data === "object" ? respData.data : null,
      };
    }

    return {
      success: false,
      error: "Unable to register. Please check your connection and try again.",
    };
  }
}
