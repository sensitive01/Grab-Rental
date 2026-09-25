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
  ShieldCheck,
  Loader2
} from "lucide-react";
import { login } from "@/lib/auth";

function LoginContent() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
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

    try {
      const result = await login(trimmedEmail, password);

      if (result.success) {
        router.push(result.redirectUrl || "/vendor/dashboard");
      } else {
        setError(result.error || "Authentication failed. Please verify your credentials.");
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between bg-slate-950 text-white selection:bg-amber-500 selection:text-slate-950 overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between relative z-10">
        <Link href="/login" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
            G
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block">
              GRAB RENTALS
            </span>
            <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block -mt-0.5">
              Vendor Portal
            </span>
          </div>
        </Link>

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-900/60 border border-transparent hover:border-slate-800"
        >
          <span>Customer App</span>
          <span className="text-[10px]">↗</span>
        </a>
      </header>

      {/* Centered Sign-In Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-[420px] bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/70 space-y-6">
          
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 mx-auto flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Vendor Partner Sign In
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Enter your vendor account credentials to access your fleet dashboard.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">
                Vendor Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operations@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-xs"
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
                  onClick={() => alert("Please contact Grab Rentals Vendor Operations at +91 98400 99887 for password assistance.")}
                >
                  Need help?
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-xs"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] disabled:opacity-75 cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-center text-[11px] text-slate-500 relative z-10">
        <span>© 2026 Grab Rentals • B2B Vendor Fleet Portal</span>
      </footer>

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
