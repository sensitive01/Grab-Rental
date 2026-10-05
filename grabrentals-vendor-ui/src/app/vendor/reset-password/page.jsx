"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Loader2,
  ArrowLeft
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";
import { vendorApi } from "@/lib/vendorApi";

export default function VendorResetPasswordPage() {
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(true);
  const [isNewAccount, setIsNewAccount] = useState(true);

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
  }, []);

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
      setError("New password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      await vendorApi.changePassword({
        currentPassword: isNewAccount ? undefined : formData.currentPassword.trim(),
        newPassword: formData.newPassword.trim(),
      });

      setLoading(false);
      setToastMessage(
        isNewAccount
          ? "Password created successfully! You can now log in using your password."
          : "Password updated successfully! Please use your new password on your next login."
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("grabrentals_vendor_has_password", "true");
      }

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setIsNewAccount(false);
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update password. Please check your inputs and try again."
      );
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header & Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: "Account", href: "/vendor/profile" }, { label: "Reset Password" }]} />
        <div className="pt-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <KeyRound className="w-7 h-7 text-amber-500" />
            <span>Reset Password</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isNewAccount
              ? "Create your secure account password to enable email & password sign in."
              : "Change or reset your vendor partner account password for maximum security."}
          </p>
        </div>
      </div>

      {/* Security Hero Banner Photo */}
      <div className="relative h-40 rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <img
          src="/images/login-hero.jpg"
          alt="Vendor Security & Authentication"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-5 text-white">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Account Protection</span>
          <h2 className="text-xl font-black text-white">Security & Access Credentials</h2>
          <p className="text-xs text-slate-200">Keep your fleet data, driver KYC, and bank settlements protected with strong login credentials.</p>
        </div>
      </div>

      {checkingAccount ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-semibold text-slate-600">Verifying account credentials...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Current Password Field - only shown for existing accounts with a password */}
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
                    className="w-full py-2.5 pl-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
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
                  className="w-full py-2.5 pl-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
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

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Confirm New Password *</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full py-2.5 pl-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
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

            {/* Security Rules Checklist */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px] text-slate-500">
              <p className="font-bold text-slate-700">Password Requirements:</p>
              <p className="flex items-center gap-1.5">✓ At least 8 characters long</p>
              <p className="flex items-center gap-1.5">✓ Use letters and numbers for higher security</p>
              <p className="flex items-center gap-1.5">✓ Both password fields must match exactly</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Password...</span>
                  </>
                ) : (
                  <span>{isNewAccount ? "Set Account Password" : "Reset & Save Password"}</span>
                )}
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
}
