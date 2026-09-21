"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";

export default function VendorChangePasswordPage() {
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setToastMessage("Password changed successfully! You will use this new password on your next login.");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }, 700);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header & Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: "Account", href: "/vendor/profile" }, { label: "Security & Password" }]} />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-2">
          Security & Password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Update your portal authentication credentials to protect vendor dispatch data.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Current Password *</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="w-full py-2.5 pl-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">New Password *</label>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Confirm New Password *</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
              className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Security Rules Checklist */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px] text-slate-500">
            <p className="font-bold text-slate-700">Password Requirements:</p>
            <p className="flex items-center gap-1.5">✓ At least 8 alphanumeric characters</p>
            <p className="flex items-center gap-1.5">✓ At least one uppercase letter or number</p>
            <p className="flex items-center gap-1.5">✓ Cannot match previous 3 passwords</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "Updating Password..." : "Update Security Password"}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
