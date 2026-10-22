"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  KeyRound, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Lock
} from "lucide-react";
import { getAuthToken, getCurrentUser, setAuthSession } from "@/lib/auth";

function SetPinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "true";

  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const pinRefs = useRef([]);
  const confirmPinRefs = useRef([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Redirect if not authenticated
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  // Handle PIN input change with auto-focus next
  const handlePinChange = (index, value, isConfirm = false) => {
    const cleanDigit = value.replace(/[^0-9]/g, "").slice(-1);
    const targetState = isConfirm ? [...confirmPin] : [...pin];
    const targetRefs = isConfirm ? confirmPinRefs : pinRefs;

    targetState[index] = cleanDigit;

    if (isConfirm) {
      setConfirmPin(targetState);
    } else {
      setPin(targetState);
    }

    // Auto-focus next input if a digit was entered
    if (cleanDigit && index < 5) {
      targetRefs.current[index + 1]?.focus();
    } else if (cleanDigit && index === 5 && !isConfirm) {
      // Focus first box of confirmation PIN
      confirmPinRefs.current[0]?.focus();
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index, e, isConfirm = false) => {
    const targetState = isConfirm ? confirmPin : pin;
    const targetRefs = isConfirm ? confirmPinRefs : pinRefs;

    if (e.key === "Backspace") {
      if (!targetState[index] && index > 0) {
        targetRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle Paste
  const handlePaste = (e, isConfirm = false) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasteData) return;

    const digits = pasteData.split("");
    const targetState = isConfirm ? [...confirmPin] : [...pin];
    const targetRefs = isConfirm ? confirmPinRefs : pinRefs;

    digits.forEach((d, i) => {
      if (i < 6) targetState[i] = d;
    });

    if (isConfirm) {
      setConfirmPin(targetState);
    } else {
      setPin(targetState);
    }

    const focusIdx = Math.min(digits.length, 5);
    targetRefs.current[focusIdx]?.focus();
  };

  // Submit PIN Setup
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const pinStr = pin.join("");
    const confirmPinStr = confirmPin.join("");

    if (pinStr.length !== 6) {
      setErrorMessage("Please enter a complete 6-digit PIN.");
      return;
    }

    if (confirmPinStr.length !== 6) {
      setErrorMessage("Please confirm your 6-digit PIN.");
      return;
    }

    if (pinStr !== confirmPinStr) {
      setErrorMessage("PINs do not match. Please verify and re-enter.");
      return;
    }

    setIsLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const res = await fetch(`${API_BASE_URL}/api/customer/pin/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ pin: pinStr })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to set PIN. Please try again.");
      }

      // Update local storage session flag
      const currentUser = getCurrentUser();
      if (currentUser) {
        currentUser.passwordSet = true;
        setAuthSession(token, currentUser);
      }

      setSuccessMessage("6-Digit PIN created successfully! Redirecting to your profile...");

      // Proceed to customer profile page or redirect target
      setTimeout(() => {
        const redirectParam = searchParams.get("redirect");
        if (redirectParam && redirectParam.startsWith("/")) {
          router.push(redirectParam);
        } else {
          router.push("/account/settings?welcome=true");
        }
      }, 900);

    } catch (err) {
      setErrorMessage(err.message || "An unexpected error occurred while saving your PIN.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-[#0082fe] selection:text-white font-sans">
      
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 lg:px-12 py-3.5 flex items-center justify-between shadow-2xs">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/images/brand-logo.png"
            alt="Grab Rentals"
            className="h-9 sm:h-10 w-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform shrink-0"
          />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 whitespace-nowrap">
              GRAB RENTALS
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0082fe]">
              Customer Security
            </span>
          </div>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-xl shadow-slate-200/50 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 text-[#0082fe] mx-auto flex items-center justify-center shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Set Your 6-Digit Login PIN
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Create a secure 6-digit PIN for instant access to your bookings without waiting for SMS OTP on future logins.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-bold">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* PIN Row 1: Enter PIN */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#0082fe]" />
                  <span>Choose 6-Digit PIN</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#0082fe]" />}
                  <span>{showPin ? "Hide" : "Show"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2" onPaste={(e) => handlePaste(e, false)}>
                {pin.map((digit, index) => (
                  <input
                    key={`pin-${index}`}
                    ref={(el) => (pinRefs.current[index] = el)}
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    autoFocus={index === 0}
                    onChange={(e) => handlePinChange(index, e.target.value, false)}
                    onKeyDown={(e) => handleKeyDown(index, e, false)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0082fe] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900"
                  />
                ))}
              </div>
            </div>

            {/* PIN Row 2: Confirm PIN */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Confirm 6-Digit PIN</span>
              </label>

              <div className="flex items-center justify-between gap-2" onPaste={(e) => handlePaste(e, true)}>
                {confirmPin.map((digit, index) => (
                  <input
                    key={`confirm-pin-${index}`}
                    ref={(el) => (confirmPinRefs.current[index] = el)}
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value, true)}
                    onKeyDown={(e) => handleKeyDown(index, e, true)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-slate-900"
                  />
                ))}
              </div>
            </div>

            {/* Security note */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>You can use this 6-digit PIN on every future login.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || pin.join("").length !== 6 || confirmPin.join("").length !== 6}
              className="w-full h-12 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] disabled:opacity-50 cursor-pointer bg-gradient-to-r from-blue-600 to-[#0082fe] hover:from-blue-500 hover:to-blue-600 shadow-blue-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving PIN...</span>
                </>
              ) : (
                <>
                  <span>Save PIN & Complete Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Skip for now */}
            <div className="text-center pt-1">
              <Link
                href="/account/settings?welcome=true"
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors hover:underline"
              >
                Skip for now & continue to profile →
              </Link>
            </div>

          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Grab Rentals • Safe & Secure Car Rentals
      </footer>

    </div>
  );
}

export default function SetPinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading PIN security...</div>}>
      <SetPinContent />
    </Suspense>
  );
}
