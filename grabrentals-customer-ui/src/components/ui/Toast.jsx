"use client";

import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed z-[99999] pointer-events-none flex flex-col gap-2.5 w-[92vw] max-w-[420px] top-4 left-1/2 -translate-x-1/2 sm:top-6 sm:right-6 sm:left-auto sm:translate-x-0"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { type = "info", message, title } = toast;

  const styles = {
    error: {
      container: "bg-rose-50/95 border-rose-300/90 text-rose-950 shadow-lg shadow-rose-900/10",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
      titleColor: "text-rose-900",
      defaultTitle: "Validation Error",
      accentBar: "bg-rose-500",
    },
    warning: {
      container: "bg-amber-50/95 border-amber-300/90 text-amber-950 shadow-lg shadow-amber-900/10",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
      titleColor: "text-amber-900",
      defaultTitle: "Notice",
      accentBar: "bg-amber-500",
    },
    success: {
      container: "bg-emerald-50/95 border-emerald-300/90 text-emerald-950 shadow-lg shadow-emerald-900/10",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
      titleColor: "text-emerald-900",
      defaultTitle: "Success",
      accentBar: "bg-emerald-500",
    },
    info: {
      container: "bg-sky-50/95 border-sky-300/90 text-sky-950 shadow-lg shadow-sky-900/10",
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
      titleColor: "text-sky-900",
      defaultTitle: "Information",
      accentBar: "bg-sky-500",
    },
  };

  const currentStyle = styles[type] || styles.info;
  const displayTitle = title || currentStyle.defaultTitle;

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 fade-in ${currentStyle.container}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${currentStyle.accentBar}`} />
      
      <div className="pl-1">{currentStyle.icon}</div>

      <div className="flex-1 min-w-0 pr-1">
        {displayTitle && (
          <h5 className={`text-xs sm:text-sm font-bold leading-tight ${currentStyle.titleColor}`}>
            {displayTitle}
          </h5>
        )}
        <p className="text-xs sm:text-[13px] font-medium leading-snug mt-0.5 opacity-90 break-words">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close notification"
        className="p-1 -mr-1 -mt-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-black/5 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

