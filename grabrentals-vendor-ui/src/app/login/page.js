"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Lock, 
  Mail, 
  Phone,
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { login, sendOtp, verifyVendorOtp, isAuthenticated } from "@/lib/auth";

function LoginContent() {
  const router = useRouter();

  const [authMethod, setAuthMethod] = useState("PHONE"); // "PHONE" | "EMAIL"

  // Phone OTP state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Email password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Countdown timer
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // If already logged in, redirect directly to vendor dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirectUrl = params?.get("redirect") || "/vendor/dashboard";
      router.replace(redirectUrl);
    }
  }, [router]);

  // Handle Phone Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessNotice("");

    const clean = phone.replace(/[^0-9]/g, "");
    if (clean.length < 10) {
      setError("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    setLoading(true);
    const res = await sendOtp(clean);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setOtpCountdown(60);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
        setOtp(res.devOtp);
      }
      setSuccessNotice("Verification code sent to +91 " + clean);
    } else {
      setError(res.error || "Unable to send verification code.");
    }
  };

  // Handle Phone Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessNotice("");

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    const res = await verifyVendorOtp({
      phone,
      otp: otp.trim(),
    });
    setLoading(false);

    if (res.success) {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirectUrl = params?.get("redirect") || "/vendor/dashboard";
      router.push(redirectUrl);
    } else {
      setError(res.error || "Verification failed. Please check the code.");
    }
  };

  // Handle Email Password Login
  const handleEmailSubmit = async (e) => {
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
        const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const redirectParam = params?.get("redirect");
        router.push(redirectParam || result.redirectUrl || "/vendor/dashboard");
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

        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30"
          >
            Become a Partner
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
        </div>
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
              Access your fleet dispatch, vehicles, chauffeurs, and earnings.
            </p>
          </div>

          {/* Sign-in Method Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("PHONE");
                setError("");
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "PHONE"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Mobile Phone</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("EMAIL");
                setError("");
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "EMAIL"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="leading-snug">{successNotice}</span>
            </div>
          )}

          {/* METHOD 1: PHONE NUMBER & OTP */}
          {authMethod === "PHONE" && (
            <div className="space-y-4 text-xs">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300">
                      Mobile Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="98765 43210"
                        className="w-full pl-14 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-xs font-bold tracking-wider"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="w-full h-11 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] disabled:opacity-50 cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <>
                        <span>Get Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Mobile: </span>
                      <strong className="text-white">+91 {phone}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-amber-400 font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-300">
                        6-Digit Verification Code
                      </label>
                      {devOtp && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          Code: {devOtp}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="• • • • • •"
                      className="w-full text-center text-xl tracking-widest font-black py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Didn't get the code?</span>
                    {otpCountdown > 0 ? (
                      <span>Resend in {otpCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="font-bold text-amber-400 hover:underline"
                      >
                        Resend
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full h-11 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] disabled:opacity-50 cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* METHOD 2: EMAIL AND PASSWORD */}
          {authMethod === "EMAIL" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
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
                    onClick={() => alert("Please contact Grab Rentals Operations at +91 98400 99887 for password assistance.")}
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
          )}

          {/* Registration Link */}
          <div className="pt-2 text-center">
            <span className="text-slate-400 text-[11.5px]">
              Don&apos;t have a partner account?{" "}
              <Link
                href="/register"
                className="text-amber-400 hover:text-amber-300 font-bold hover:underline"
              >
                Register your fleet
              </Link>
            </span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-center text-[11px] text-slate-500 relative z-10">
        <span>© {new Date().getFullYear()} Grab Rentals • Partner Fleet Network</span>
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
