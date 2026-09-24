"use client";

import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toast({ type = "info", message, onClose }) {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const borders = {
    success: "border-emerald-200 bg-emerald-50/90 text-emerald-900",
    error: "border-rose-200 bg-rose-50/90 text-rose-900",
    warning: "border-amber-200 bg-amber-50/90 text-amber-900",
    info: "border-blue-200 bg-blue-50/90 text-blue-900",
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-xs max-w-md animate-in slide-in-from-bottom-3 duration-200",
        borders[type] || borders.info
      )}
    >
      {icons[type] || icons.info}
      <div className="text-xs font-medium flex-1">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-slate-800">{title || "No data found"}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
        {description || "There are no records matching your current filter criteria."}
      </p>
      {action}
    </div>
  );
}

export function LoadingSkeleton({ rows = 4, className }) {
  return (
    <div className={cn("space-y-3 animate-pulse p-4", className)}>
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded-lg w-full"></div>
        ))}
      </div>
    </div>
  );
}
