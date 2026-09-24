"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, getCurrentUser, DEMO_ACCOUNTS } from "@/lib/auth";
import {
  Car,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // If already logged in, redirect directly to their dashboard
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/operations/dashboard");
      }
    }
  }, [router]);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await login(email, password);
      setIsLoading(false);

      if (result && result.success) {
        window.location.href = result.redirectUrl;
      } else {
        setErrorMessage(result?.error || "Invalid email or password. Please verify credentials.");
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err?.message || "An error occurred during authentication.");
    }
  }

  function handleQuickFill(role) {
    const creds = DEMO_ACCOUNTS[role];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
      setErrorMessage("");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-500 shadow-xl shadow-blue-900/30 mb-4 ring-4 ring-slate-800">
          <Car className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Grab Rentals
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
          Unified Management Portal for Operations & Administration
        </p>
      </div>

      {/* Main card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Work Email Address
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@grabrentals.com or ops@grabrentals.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 w-4 h-4"
                />
                <span className="text-xs text-slate-400">Keep me logged in</span>
              </label>
              <span className="text-xs text-slate-500">Single Login Portal</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 active:scale-[0.99]"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Role-Based One-Click Demo Credential Chips */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500 text-center mb-3">
              One-Click Evaluation Credentials
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickFill("admin")}
                className="group p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-xs mb-0.5">
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span>Admin Role</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">admin@grabrentals.com</div>
                <div className="text-[10px] text-blue-400/80 mt-1 font-sans">
                  Target: /admin/dashboard
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("operations")}
                className="group p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs mb-0.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Operations Role</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">ops@grabrentals.com</div>
                <div className="text-[10px] text-amber-400/80 mt-1 font-sans">
                  Target: /operations/dashboard
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge note */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Spring Security JWT Ready • Role Protected Routes</span>
        </div>
      </div>
    </div>
  );
}
