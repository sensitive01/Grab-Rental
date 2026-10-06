"use client";

import { useState, useEffect } from "react";
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  ShieldCheck
} from "lucide-react";
import { vendorApi } from "@/lib/vendorApi";

export default function ResetPasswordModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [isNewAccount, setIsNewAccount] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      // Reset form on close
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setError("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      return;
    }

    async function checkAccountStatus() {
      try {
        setCheckingAccount(true);
        const profile = await vendorApi.getProfile().catch(() => null);
        if (profile && typeof profile.hasPassword === "boolean") {
          setIsNewAccount(!profile.hasPassword);
        } else {
          const storedHasPassword = typeof window !== "undefined"
            ? localStorage.getItem("grabrentals_vendor_has_password")
            : null;
          setIsNewAccount(storedHasPassword !== "true");
        }
      } catch (err) {
        console.warn("Could not retrieve account status:", err);
      } finally {
        setCheckingAccount(false);
      }
    }

    checkAccountStatus();
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isNewAccount && !formData.currentPassword.trim()) {
      setError("Please enter your current password.");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    setLoading(true);
    try {
      await vendorApi.changePassword({
        currentPassword: isNewAccount ? undefined : formData.currentPassword.trim(),
        newPassword: formData.newPassword.trim(),
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("grabrentals_vendor_has_password", "true");
      }

      setLoading(false);
      if (onSuccess) {
        onSuccess(
          isNewAccount
            ? "Password created successfully! You can now log in using your password."
            : "Password updated successfully!"
        );
      }
      onClose();
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update password. Please check your current password and try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
        onClick={() => !loading && onClose()} 
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-lg border border-slate-200 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  {isNewAccount ? "Set Account Password" : "Reset Password"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isNewAccount 
                    ? "Create a secure password for your vendor dashboard account" 
                    : "Update your login credentials securely"}
                </p>
              </div>
            </div>
            <button
              onClick={() => !loading && onClose()}
              disabled={loading}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {checkingAccount ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
                <p className="text-xs font-semibold text-slate-600">Checking account security status...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Current Password Field (for existing accounts) */}
                {!isNewAccount && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Current Password *</label>
                    <div className="relative">
                      <input
                        type={showCurrent ? "text" : "password"}
                        required={!isNewAccount}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        className="w-full py-2.5 pl-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* New Password Field */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    {isNewAccount ? "Create New Password *" : "New Password *"}
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Minimum 8 characters"
                      className="w-full py-2.5 pl-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Confirm New Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      className="w-full py-2.5 pl-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-150 space-y-1 text-[11px] text-slate-500">
                  <p className="font-bold text-slate-700">Requirements:</p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    At least 8 characters in length
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Both passwords must match exactly
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>{isNewAccount ? "Set Password" : "Save New Password"}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
