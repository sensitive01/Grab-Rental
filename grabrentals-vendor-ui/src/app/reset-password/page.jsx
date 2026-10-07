"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  KeyRound, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Smartphone,
  Check
} from "lucide-react";
import { axiosClient } from "@/lib/axiosClient";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlEmail = searchParams?.get("email") || "";
  const urlToken = searchParams?.get("token") || "";

  // Step state: 1 = Email/Phone, 2 = OTP Verification, 3 = New Password, 4 = Success
  const [currentStep, setCurrentStep] = useState(1);

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP state
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpPhoneMasked, setOtpPhoneMasked] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState("");

  const hasToken = Boolean(urlToken && urlToken.trim());

  useEffect(() => {
    if (urlEmail) {
      setEmail(urlEmail);
    }
    if (urlToken) {
      setToken(urlToken);
      // If valid token in email link, jump directly to Step 3 (Set New Password)
      setCurrentStep(3);
    }
  }, [urlEmail, urlToken]);

  // Resend Countdown timer
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // STEP 1: Request OTP and proceed to Step 2
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessInfo("");

    if (!email.trim()) {
      setError("Please enter your registered email address or mobile number.");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await axiosClient.post("/api/auth/reset-password/send-otp", {
        email: email.trim(),
      });
      const data = res.data?.data;
      setOtpCountdown(60);
      setOtpPhoneMasked(data?.phoneMasked || "registered phone");
      if (data?.devOtp) {
        setDevOtp(data.devOtp);
        setOtp(data.devOtp);
      }
      setSuccessInfo(`Verification code sent to registered phone (${data?.phoneMasked || ""})`);
      setCurrentStep(2);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "No account found with this identifier. Please verify your email or phone."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // STEP 2: Validate OTP entered and proceed to Step 3
  const handleVerifyOtp = (e) => {
    if (e) e.preventDefault();
    setError("");

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    // Advance to Step 3 (Create New Password)
    setCurrentStep(3);
  };

  // STEP 3: Final Password Reset Submit
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("/api/auth/reset-password", {
        email: email.trim(),
        token: token.trim() || undefined,
        otp: !hasToken ? otp.trim() : undefined,
        newPassword: newPassword.trim(),
      });

      setCurrentStep(4); // Success screen
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to reset password. Please check your verification code or link validity."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between relative z-10">
        <Link href="/login" className="flex items-center gap-3">
          <img
            src="/images/grab-rentals-logo.jpg"
            alt="Grab Rentals"
            className="h-10 w-auto object-contain rounded-lg shadow-md"
          />
          <div>
            <span className="font-black text-base tracking-tight text-white flex items-center gap-2">
              GRAB RENTALS
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                VENDOR
              </span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium block">
              Partner Fleet Network
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-[460px] bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/70 space-y-6">

          {/* SUCCESS SCREEN */}
          {currentStep === 4 ? (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Password Reset Successfully!
                </h1>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Your vendor partner account credentials have been updated securely. You can now sign in using your new password.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left text-xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Account</span>
                <p className="font-mono font-bold text-amber-400 truncate">{email}</p>
              </div>

              <Link
                href="/login"
                className="w-full h-11 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 cursor-pointer"
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Stepper Progress Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {/* Step 1 Pill */}
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      currentStep > 1 
                        ? "bg-emerald-500 text-slate-950" 
                        : currentStep === 1 
                        ? "bg-amber-500 text-slate-950 ring-4 ring-amber-500/20" 
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
                    </div>
                    <span className={`text-[11px] font-bold hidden sm:inline ${
                      currentStep === 1 ? "text-white" : currentStep > 1 ? "text-emerald-400" : "text-slate-500"
                    }`}>
                      Account
                    </span>
                  </div>

                  {/* Connecting Line 1-2 */}
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                    currentStep > 1 ? "bg-emerald-500" : "bg-slate-800"
                  }`} />

                  {/* Step 2 Pill */}
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      currentStep > 2 || (hasToken && currentStep === 3)
                        ? "bg-emerald-500 text-slate-950" 
                        : currentStep === 2 
                        ? "bg-amber-500 text-slate-950 ring-4 ring-amber-500/20" 
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {currentStep > 2 || (hasToken && currentStep === 3) ? <Check className="w-4 h-4" /> : "2"}
                    </div>
                    <span className={`text-[11px] font-bold hidden sm:inline ${
                      currentStep === 2 ? "text-white" : currentStep > 2 ? "text-emerald-400" : "text-slate-500"
                    }`}>
                      Verify
                    </span>
                  </div>

                  {/* Connecting Line 2-3 */}
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                    currentStep === 3 ? "bg-amber-500" : "bg-slate-800"
                  }`} />

                  {/* Step 3 Pill */}
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      currentStep === 3 
                        ? "bg-amber-500 text-slate-950 ring-4 ring-amber-500/20" 
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      3
                    </div>
                    <span className={`text-[11px] font-bold hidden sm:inline ${
                      currentStep === 3 ? "text-white" : "text-slate-500"
                    }`}>
                      Password
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Token Notice (if opened from email link) */}
              {hasToken && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="leading-snug font-medium">
                    Email Security Token Verified. Identity confirmed.
                  </span>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Success Info Alert */}
              {successInfo && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="leading-snug">{successInfo}</span>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 1: IDENTIFY ACCOUNT                                 */}
              {/* ======================================================== */}
              {currentStep === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-5 animate-in fade-in duration-150">
                  <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                      <Mail className="w-5 h-5 text-amber-400" />
                      <span>Step 1: Account Identifier</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Enter the registered email or mobile number linked to your fleet partner account.
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="block font-bold text-slate-300">
                      Email Address or Mobile Number *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. partner@company.com or 98765..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading || !email.trim()}
                    className="w-full h-11 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] disabled:opacity-50 cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25"
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ======================================================== */}
              {/* STEP 2: VERIFY OTP                                       */}
              {/* ======================================================== */}
              {currentStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-150">
                  <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-amber-400" />
                      <span>Step 2: Enter Verification Code</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      A 6-digit code was sent to <strong className="text-white">{otpPhoneMasked || email}</strong>
                    </p>
                  </div>

                  {devOtp && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 bg-emerald-950/60 p-2 px-3 rounded-xl border border-emerald-800/80">
                      <span>Dev Auto-Code:</span>
                      <span className="font-mono font-bold tracking-widest">{devOtp}</span>
                    </div>
                  )}

                  <div className="space-y-2 text-xs">
                    <label className="block font-bold text-slate-300">
                      6-Digit Security Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="• • • • • •"
                      className="w-full text-center text-xl tracking-widest font-black py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Didn't receive code?</span>
                      {otpCountdown > 0 ? (
                        <span>Resend in {otpCountdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          disabled={otpLoading}
                          className="font-bold text-amber-400 hover:text-amber-300 cursor-pointer disabled:opacity-50"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setCurrentStep(1);
                      }}
                      className="h-11 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={otp.length !== 6}
                      className="flex-1 h-11 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] disabled:opacity-50 cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25"
                    >
                      <span>Verify & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* ======================================================== */}
              {/* STEP 3: SET NEW PASSWORD                                 */}
              {/* ======================================================== */}
              {currentStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4 text-xs animate-in fade-in duration-150">
                  <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-amber-400" />
                      <span>Step 3: Create New Password</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Enter a new secure password for account <strong className="text-white">{email}</strong>
                    </p>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300">
                      New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        autoFocus
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${newPassword.length >= 8 ? "text-emerald-400" : "text-slate-600"}`} />
                      <span>Minimum 8 characters length</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${newPassword && newPassword === confirmPassword ? "text-emerald-400" : "text-slate-600"}`} />
                      <span>Both passwords match</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2.5 pt-2">
                    {!hasToken && (
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setCurrentStep(2);
                        }}
                        className="h-11 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                      className="flex-1 h-11 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] disabled:opacity-50 cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      ) : (
                        <>
                          <span>Save & Reset Password</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Bottom Sign-in Link */}
              <div className="text-center pt-2 border-t border-slate-800">
                <Link
                  href="/login"
                  className="text-slate-400 hover:text-amber-400 text-xs font-semibold hover:underline"
                >
                  Remembered your password? Sign In
                </Link>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-center text-[11px] text-slate-500 relative z-10">
        <span>© {new Date().getFullYear()} Grab Rentals • Partner Security & Identity</span>
      </footer>

    </div>
  );
}

export default function PublicResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
