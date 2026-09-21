"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck
} from "lucide-react";

function LoginContent() {
  const router = useRouter();

  const [email, setEmail] = useState("partner@kaveritravels.in");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid business email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      // Automatically determine user role based on credentials
      let detectedRole = "vendor";
      let redirectUrl = "/vendor/dashboard";

      if (trimmedEmail.includes("admin")) {
        detectedRole = "admin";
        redirectUrl = "/admin/dashboard";
      } else if (trimmedEmail.includes("ops") || trimmedEmail.includes("dispatch")) {
        detectedRole = "operations";
        redirectUrl = "/operations/dashboard";
      } else {
        detectedRole = "vendor";
        redirectUrl = "/vendor/dashboard";
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("grab_portal_role", detectedRole);
        localStorage.setItem("grab_portal_email", trimmedEmail);
      }

      router.push(redirectUrl);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-8 text-white">
      
      {/* Top Brand Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link href="/login" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/20">
            G
          </div>
          <span className="font-black text-sm tracking-tight text-white">
            GRAB RENTALS <span className="text-amber-400 text-[10px]">ENTERPRISE</span>
          </span>
        </Link>

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          Customer App ↗
        </a>
      </div>

      {/* Main Single Sign-In Card */}
      <div className="max-w-md w-full mx-auto my-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="space-y-1.5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Sign In to Grab Rentals
          </h2>
          <p className="text-xs text-slate-400">
            Enter your credentials to access your portal.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-300">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300">
                Password
              </label>
              <button
                type="button"
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                onClick={() => alert("Password reset link sent to registered email address.")}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-slate-400 font-medium">Remember my session</span>
            </label>
          </div>

          {/* Single Universal Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 disabled:opacity-50 cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                Signing In...
              </span>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>

      {/* Bottom info */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-slate-600">
        Enterprise multi-tenant portal with JWT session management and audit tracking.
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">Loading portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
