"use client";

import { useState, useEffect, useRef } from "react";
import { X, User, Phone, ShieldCheck, ArrowRight, CheckCircle2, RotateCw, Sparkles } from "lucide-react";
import axiosClient from "@/lib/axiosClient";
import { setAuthSession } from "@/lib/auth";

export default function SearchVerificationModal({ isOpen, onClose, onVerified, onSkip }) {
  const [step, setStep] = useState(1); // 1 = Name & Phone, 2 = OTP
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState(null);
  const [isExistingUser, setIsExistingUser] = useState(false);

  const otpInputs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError("");
      setOtp(["", "", "", "", "", ""]);
      setDevOtp(null);
      setIsExistingUser(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    if (error) setError("");
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
      // Do not send purpose: "REGISTRATION" so existing users can seamlessly log in via OTP without an alert
      const res = await axiosClient.post("/api/auth/otp/send", {
        phone: formattedPhone,
      });

      if (res.data?.success) {
        setIsExistingUser(!!res.data?.data?.userExists);
        setStep(2);
        setCountdown(30);
        if (res.data?.data?.devOtp) {
          setDevOtp(res.data.data.devOtp);
        }
        setTimeout(() => {
          if (otpInputs.current[0]) otpInputs.current[0].focus();
        }, 150);
      } else {
        setError(res.data?.message || "Failed to send verification code");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      // If already registered or other message
      const msg = err.response?.data?.message || "Unable to send verification code. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      const nextOtp = [...otp];
      nextOtp[index] = "";
      setOtp(nextOtp);
      return;
    }

    // If user pasted a full OTP
    if (clean.length > 1) {
      const digits = clean.slice(0, 6).split("");
      const nextOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) nextOtp[index + i] = d;
      });
      setOtp(nextOtp);
      const nextFocus = Math.min(index + digits.length, 5);
      if (otpInputs.current[nextFocus]) otpInputs.current[nextFocus].focus();
      if (nextOtp.every((d) => d !== "")) {
        handleVerifyOtp(nextOtp.join(""));
      }
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = clean[0];
    setOtp(nextOtp);

    // Auto focus next input
    if (index < 5 && clean[0]) {
      if (otpInputs.current[index + 1]) otpInputs.current[index + 1].focus();
    }

    // Auto submit if all 6 digits entered
    if (index === 5 || nextOtp.every((d) => d !== "")) {
      const fullOtp = nextOtp.join("");
      if (fullOtp.length === 6) {
        handleVerifyOtp(fullOtp);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      if (otpInputs.current[index - 1]) otpInputs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async (otpValue) => {
    const code = otpValue || otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
      const res = await axiosClient.post("/api/auth/otp/verify", {
        phone: formattedPhone,
        otp: code,
        name: name.trim(),
        role: "CUSTOMER",
      });

      if (res.data?.success && res.data?.data) {
        const { accessToken, user } = res.data.data;
        if (accessToken && user) {
          setAuthSession(accessToken, user);
        }
        if (onVerified) {
          onVerified(user || { name: name.trim(), phone: formattedPhone });
        }
      } else {
        setError(res.data?.message || "Invalid verification code");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      const msg = err.response?.data?.message || "Invalid verification code. Please check and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDevOtp = () => {
    if (!devOtp) return;
    const digits = devOtp.split("").slice(0, 6);
    setOtp(digits);
    handleVerifyOtp(devOtp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Accent Banner */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Verified Rates
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {step === 1
              ? "Quick Verification"
              : isExistingUser
                ? "Welcome Back!"
                : "Enter Verification Code"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6">
            {step === 1
              ? "Verify your mobile to see verified fares, chauffeur availability, and save your trip."
              : isExistingUser
                ? `Enter the 6-digit OTP sent to +91 ${phone} to sign in and view cabs.`
                : `Enter the 6-digit OTP sent to +91 ${phone} to verify.`}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: Name and Phone Input */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name (e.g. Rahul Sharma)"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError("");
                    }}
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-700 font-bold text-sm">
                    +91
                  </span>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={handlePhoneChange}
                      maxLength={10}
                      className="w-full pl-9 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-r-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !name.trim() || phone.length < 10}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {onSkip && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={onSkip}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium underline underline-offset-4 cursor-pointer"
                  >
                    Skip & search as guest
                  </button>
                </div>
              )}
            </form>
          )}

          {/* STEP 2: 6-Digit OTP */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Dev OTP Helper */}
              {devOtp && (
                <div 
                  onClick={handleFillDevOtp}
                  className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-emerald-100 transition-colors"
                >
                  <span className="text-xs text-emerald-800 font-medium">
                    Test Mode: Code is <strong className="font-bold tracking-wider">{devOtp}</strong>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 underline">Auto-fill</span>
                </div>
              )}

              {/* 6 Digit Input Boxes */}
              <div className="flex justify-between gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Change mobile number
                </button>

                {countdown > 0 ? (
                  <span>Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    Resend code
                  </button>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isExistingUser ? "Sign In & View Cabs" : "Verify & View Cabs"}</span>
                    </>
                  )}
                </button>
              </div>

              {onSkip && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={onSkip}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium underline underline-offset-4 cursor-pointer"
                  >
                    Skip & search as guest
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Trust Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% spam-free • OTP verification for verified booking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
