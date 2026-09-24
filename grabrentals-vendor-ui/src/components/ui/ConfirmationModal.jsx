"use client";

import Modal from "./Modal";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // "danger" | "warning" | "info" | "success"
}) {
  const isDanger = type === "danger";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDanger
                ? "bg-rose-50 text-rose-600 border border-rose-100"
                : type === "warning"
                ? "bg-amber-50 text-amber-600 border border-amber-100"
                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
            }`}
          >
            {isDanger || type === "warning" ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shadow-md active:scale-95 ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                : type === "warning"
                ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
