"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Car,
  KeyRound
} from "lucide-react";
import { sendOtp, verifyDriverOtp, isAuthenticated, getCurrentUser } from "@/lib/auth";
import { TopLanguageBar } from "@/components/ui/LanguageSelector";

export default function DriverLoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // If already logged in as driver, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      if (user?.role === "DRIVER") {
        router.replace("/driver/dashboard");
      }
    }
  }, [router]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccess("");

    const clean = phone.replace(/[^0-9]/g, "");
    if (clean.length < 10) {
      setError("Please enter your registered 10-digit mobile number.");
      return;
    }

    setLoading(true);
    const res = await sendOtp(clean, { purpose: "LOGIN" });
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setCountdown(60);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
        setOtp(res.devOtp);
      }
      setSuccess("Verification code sent to +91 " + clean);
    } else {
      setError(res.error || "Unable to find registered chauffeur account.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError("");

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setLoading(true);
    const res = await verifyDriverOtp({
      phone,
      otp: otp.trim(),
      purpose: "LOGIN"
    });
    setLoading(false);

    if (res.success) {
      let redirect = "/driver/dashboard";
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        redirect = searchParams.get("redirect") || "/driver/dashboard";
      }
      router.push(redirect);
    } else {
      setError(res.error || "Invalid verification code.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Language Bar */}
      <TopLanguageBar theme="slate" />

      {/* Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between border-b border-slate-800/60 relative z-10 max-w-xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-tight text-white leading-tight">GRAB RENTALS</h1>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Chauffeur Dispatch Mode</span>
          </div>
        </div>

        <Link
          href="/login"
          className="text-xs text-slate-400 hover:text-white font-semibold transition"
        >
          Fleet Owner Portal ➔
        </Link>
      </header>

      {/* Form Card */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 max-w-md mx-auto w-full">
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Driver Self-Service Login
            </span>
            <h2 className="text-2xl font-black text-white">Chauffeur Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your registered mobile number provided by your fleet owner to view and manage trips.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-start gap-2.5">
              <span className="shrink-0">⚠️</span>
              <p className="leading-snug">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <p className="leading-snug">{success}</p>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Registered Driver Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Enter 10-digit mobile"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-16 pr-4 py-3 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.replace(/[^0-9]/g, "").length < 10}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Send Login OTP <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Enter 6-Digit OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                    className="text-xs text-amber-400 hover:underline font-semibold"
                  >
                    Change Phone
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-center tracking-[0.4em] font-mono text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    autoFocus
                  />
                </div>
                {devOtp && (
                  <p className="mt-1.5 text-[11px] text-amber-400 font-mono text-center">
                    Dev Test Code: <strong>{devOtp}</strong>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Verify &amp; Open Driver Hub <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                {countdown > 0 ? (
                  <span className="text-xs text-slate-500 font-medium">
                    Resend OTP in <strong className="text-slate-300">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs text-amber-400 hover:underline font-bold"
                  >
                    Resend Verification Code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Help Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">
              Not yet registered as a driver? Contact your commercial fleet owner to add you to their roster.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-600 border-t border-slate-900 relative z-10">
        Grab Rentals Driver Operations Network • 24x7 Driver Support: +91 9876543210
      </footer>
    </div>
  );
}
