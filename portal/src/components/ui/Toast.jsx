"use client";

import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
          type === "success"
            ? "bg-slate-900 text-white border-slate-800"
            : "bg-rose-950 text-rose-100 border-rose-800"
        }`}
      >
        {type === "success" ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
        )}
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
