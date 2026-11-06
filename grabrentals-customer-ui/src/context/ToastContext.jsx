"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import ToastContainer from "@/components/ui/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", title = null, duration = 4000) => {
    if (!message) return;
    const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const newToast = { id, message, type, title, duration };

    setToasts((prev) => {
      // Limit concurrent visible toasts to 3
      const filtered = prev.slice(-2);
      return [...filtered, newToast];
    });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    error: (msg, title = "Validation Error", duration = 4000) => addToast(msg, "error", title, duration),
    warning: (msg, title = "Attention", duration = 4000) => addToast(msg, "warning", title, duration),
    success: (msg, title = "Success", duration = 3500) => addToast(msg, "success", title, duration),
    info: (msg, title = "Note", duration = 3500) => addToast(msg, "info", title, duration),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if invoked outside ToastProvider
    return {
      error: (msg) => console.error("[Toast Error]:", msg),
      warning: (msg) => console.warn("[Toast Warning]:", msg),
      success: (msg) => console.log("[Toast Success]:", msg),
      info: (msg) => console.info("[Toast Info]:", msg),
      dismiss: () => {},
    };
  }
  return context.toast;
}

