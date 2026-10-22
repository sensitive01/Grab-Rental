"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Phone, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Car,
  KeyRound,
  RotateCcw,
  Edit3,
  Truck,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { setAuthSession, isAuthenticated } from "@/lib/auth";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSelector from "@/components/ui/LanguageSelector";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // Auth Mode: 'otp' | 'pin'
  const [authMode, setAuthMode] = useState("otp");

  // Step 1: 'phone' | Step 2: 'otp'
  const [step, setStep] = useState("phone");

  // Form State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState(""); // Received OTP for easy on-screen testing
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  // UI / Timer State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendCountdown, setResendCountdown] = useState(30);
  const canResend = resendCountdown === 0;

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Redirect if already logged in
  useEffect(() => {
    let timer;
    if (isAuthenticated()) {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirectUrl = params?.get("redirect") || "/dashboard";
      timer = setTimeout(() => {
        router.replace(redirectUrl);
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [router]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (step === "otp" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Clean phone number (strip non-digits)
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send verification code");
      }

      // Capture test OTP if provided in development response
      if (result.data?.devOtp) {
        setDevOtp(result.data.devOtp);
      }

      setStep("otp");
      setResendCountdown(30);
      setSuccessMessage(`OTP sent successfully to +91 ${cleaned.slice(-10)}`);
    } catch (err) {
      setErrorMessage(err.message || "Unable to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!otp || otp.trim().length !== 6) {
      setErrorMessage("Please enter the complete 6-digit OTP");
      setIsLoading(false);
      return;
    }

    try {
      const cleaned = phone.replace(/[^0-9]/g, "");
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, otp: otp.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const rawMsg = result.message || "";
        const formattedMsg = (rawMsg.toLowerCase().includes("credential") || rawMsg.toLowerCase().includes("incorrect"))
          ? "Invalid OTP"
          : (rawMsg || "Invalid OTP");
        throw new Error(formattedMsg);
      }

      // Save token and user details using auth utility
      const sessionUser = {
        ...(result.data?.user || {}),
        phone: result.data?.user?.phone || cleaned,
      };
      setAuthSession(result.data.accessToken, sessionUser);

      setSuccessMessage("Verification successful! Redirecting...");

      // Check for redirect query parameter, or route to appropriate default
      setTimeout(() => {
        const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const redirectParam = params?.get("redirect");

        const user = result.data.user;
        const isNewUser = Boolean(result.data.isNewUser || !user.name || user.name === "Customer" || !user.passwordSet);

        if (user.role === "ADMIN") {
          router.push("/admin");
        } else if (isNewUser) {
          // Direct new customer to set their 6-digit PIN before proceeding to profile
          const targetUrl = redirectParam 
            ? `/account/set-pin?redirect=${encodeURIComponent(redirectParam)}&welcome=true`
            : "/account/set-pin?welcome=true";
          router.push(targetUrl);
        } else if (redirectParam && redirectParam.startsWith("/")) {
          router.push(redirectParam);
        } else {
          router.push("/dashboard");
        }
      }, 700);

    } catch (err) {
      const rawMsg = err.message || "";
      const formattedMsg = (rawMsg.toLowerCase().includes("credential") || rawMsg.toLowerCase().includes("incorrect"))
        ? "Invalid OTP"
        : (rawMsg || "Invalid OTP");
      setErrorMessage(formattedMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Sign In with 6-Digit PIN
  const handlePinLogin = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number");
      setIsLoading(false);
      return;
    }

    if (!pin || pin.length !== 6) {
      setErrorMessage("Please enter your 6-digit login PIN");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleaned.slice(-10), password: pin }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Invalid mobile number or 6-digit PIN. Please try again or use OTP.");
      }

      const sessionUser = {
        ...(result.data?.user || {}),
        phone: result.data?.user?.phone || cleaned,
      };
      setAuthSession(result.data.accessToken, sessionUser);

      setSuccessMessage("Sign in successful! Redirecting...");

      setTimeout(() => {
        const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const redirectParam = params?.get("redirect");

        if (redirectParam && redirectParam.startsWith("/")) {
          router.push(redirectParam);
          return;
        }

        const user = result.data.user;
        if (user.role === "ADMIN") {
          router.push("/admin");
        } else if (!user.name || user.name === "Customer") {
          router.push("/account/settings?welcome=true");
        } else {
          router.push("/dashboard");
        }
      }, 700);

    } catch (err) {
      setErrorMessage(err.message || "Invalid mobile number or 6-digit PIN.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-[#0082fe] selection:text-white font-sans">
      
      {/* Top Brand Bar */}
      <header className="w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 lg:px-12 py-3 sm:py-3.5 flex items-center justify-between shadow-2xs">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/images/brand-logo.png"
            alt="Grab Rentals"
            className="h-9 sm:h-10 w-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform shrink-0"
          />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 whitespace-nowrap">GRAB RENTALS</span>
            <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0082fe]">
              Customer Sign In
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <LanguageSelector />
          <Link href="/" className="hover:text-[#0082fe] transition-colors flex items-center gap-1.5 whitespace-nowrap">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-grow flex flex-col lg:flex-row w-full max-w-[1920px] mx-auto min-h-[calc(100vh-120px)]">
        
        {/* LEFT PANEL: Showcase & Brand Trust (Hidden on mobile so login form is immediately visible without scrolling) */}
        <section className="hidden lg:flex lg:w-[50%] xl:w-[54%] relative flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200 bg-gradient-to-br from-blue-50/60 via-slate-50 to-white">
          
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image 
              src="/images/customer-login-bg.jpg" 
              alt="Luxury Chauffeur Vehicle & Airport Mobility" 
              fill 
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center opacity-25 scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/85 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-slate-50/80 to-white/40"></div>
            
            {/* Ambient Brand Blue Glow */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>

          {/* Left Top: Trust Badges */}
          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-full flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs text-xs font-semibold text-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="tracking-wide uppercase text-[11px] text-slate-700">2,410+ Active Vehicles Live</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-full flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs text-[11px] font-semibold tracking-wide uppercase text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0082fe]" />
              <span>Police-Cleared Chauffeurs</span>
            </div>
          </div>

          {/* Left Center: Core Value Proposition */}
          <div className="relative z-10 my-10 lg:my-auto max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 mb-6 text-[#0082fe] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reliable & Transparent Travel</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-5">
              Guaranteed Cabs. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0082fe] to-blue-700">
                Zero Cancellation.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-lg mb-8 leading-relaxed">
              Experience seamless outstation cabs, luxury group vans, and executive airport transfers with transparent all-inclusive fares and verified background-checked chauffeurs.
            </p>

            {/* Bento Trust Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-md">
              <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-[#0082fe] fill-[#0082fe]" />
                  <span className="font-extrabold text-lg text-slate-900">5,00,000+</span>
                </div>
                <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Verified Highway Trips</div>
                <div className="text-xs text-[#0082fe] mt-1 font-semibold">99.8% On-Time Chauffeur Arrival</div>
              </div>

              <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-extrabold text-lg text-slate-900">All-Inclusive</span>
                </div>
                <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Fixed Upfront Fares</div>
                <div className="text-xs text-emerald-600 mt-1 font-semibold">Tolls, Taxes & Driver Allowance</div>
              </div>
            </div>
          </div>

          {/* Left Bottom: Subtle Trust Guarantee */}
          <div className="relative z-10 text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0082fe]"></span>
            <span>Backed by Grab Rentals 100% Ride Assurance & On-Time Guarantee.</span>
          </div>
        </section>

        {/* RIGHT PANEL: Mobile & OTP Authentication Form */}
        <section className="w-full lg:w-[50%] xl:w-[46%] flex flex-col justify-center items-center p-5 sm:p-10 lg:p-16 bg-white relative flex-grow min-h-[calc(100vh-140px)]">
          
          <div className="w-full max-w-md mx-auto relative z-10">

            {/* Header / Titles */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0082fe] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  {authMode === "pin" ? "PIN Sign In" : (step === "phone" ? "Quick Sign In" : "Verify OTP")}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Instant Verification
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {authMode === "pin" 
                  ? "Sign In with PIN" 
                  : (step === "phone" ? (t("customer_login") || "Customer Login") : t("enter_otp"))}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                {authMode === "pin"
                  ? "Enter your 10-digit mobile number and 6-digit PIN"
                  : (step === "phone" 
                    ? (t("login_subtitle") || "Enter 10-digit mobile number")
                    : (
                      <span className="flex items-center gap-2 flex-wrap">
                        <span>Code sent to <strong className="text-slate-800 font-semibold">+91 {phone.replace(/[^0-9]/g, "").slice(-10)}</strong></span>
                        <button 
                          type="button" 
                          onClick={() => {
                            setStep("phone");
                            setOtp("");
                            setErrorMessage("");
                            setSuccessMessage("");
                          }}
                          className="text-[#0082fe] hover:text-blue-700 font-bold inline-flex items-center gap-1 ml-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Change
                        </button>
                      </span>
                    ))}
              </p>
            </div>

            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-fade-in shadow-2xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5 animate-fade-in shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* MODE 1: 6-DIGIT PIN LOGIN FORM */}
            {authMode === "pin" ? (
              <form onSubmit={handlePinLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {t("mobile_number")}
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-[#0082fe] pr-3 border-r border-slate-200 select-none">
                      <Phone className="w-3.5 h-3.5" />
                      <span>+91</span>
                    </div>

                    <input
                      type="tel"
                      required
                      autoFocus
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                        setPhone(digits);
                      }}
                      placeholder="98765 43210"
                      className="w-full pl-24 pr-4 py-3.5 bg-slate-50/80 border border-slate-300 rounded-xl text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all tracking-wide shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      6-Digit Security PIN
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("otp");
                        setStep("phone");
                        setErrorMessage("");
                      }}
                      className="text-xs font-bold text-[#0082fe] hover:underline cursor-pointer"
                    >
                      Forgot PIN? Use OTP
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center text-slate-400">
                      <Lock className="w-4 h-4 text-[#0082fe]" />
                    </div>
                    <input
                      type={showPin ? "text" : "password"}
                      required
                      maxLength={6}
                      value={pin}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                        setPin(digits);
                      }}
                      placeholder="• • • • • •"
                      className="w-full pl-11 pr-11 py-3.5 bg-slate-50/80 border border-slate-300 rounded-xl text-center text-xl font-mono font-bold tracking-[0.5em] text-[#0082fe] placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#0082fe]" />}
                    </button>
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || phone.length < 10 || pin.length !== 6}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#0082fe] hover:bg-[#0072de] active:scale-[0.99] text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Signing in...</span>
                    ) : (
                      <>
                        <span>Sign In with PIN</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Switch to OTP */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("otp");
                      setStep("phone");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className="text-xs font-bold text-[#0082fe] hover:underline cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Sign in with Mobile OTP instead</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    <span className="bg-white px-3">
                      {t("or_divider") || "Or"}
                    </span>
                  </div>
                </div>

                {/* Login as Fleet Owner Button */}
                <a
                  href={process.env.NEXT_PUBLIC_VENDOR_PORTAL_URL || "https://vendor.grabrentals.in/login"}
                  className="w-full py-3 px-5 rounded-xl border border-slate-200 hover:border-[#0082fe]/40 bg-slate-50/80 hover:bg-slate-100 text-slate-700 hover:text-[#0082fe] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-2xs group cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-[#0082fe] group-hover:scale-110 transition-transform" />
                  <span>{t("login_as_fleet_owner") || "Login as Fleet Owner"}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0082fe] group-hover:translate-x-1 transition-all" />
                </a>
              </form>
            ) : step === "phone" ? (
              /* MODE 2: STEP 1 - PHONE FOR OTP */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {t("mobile_number")}
                  </label>
                  <div className="relative flex items-center">
                    {/* Country Prefix Badge */}
                    <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-[#0082fe] pr-3 border-r border-slate-200 select-none">
                      <Phone className="w-3.5 h-3.5" />
                      <span>+91</span>
                    </div>

                    <input
                      type="tel"
                      required
                      autoFocus
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                        setPhone(digits);
                      }}
                      placeholder="98765 43210"
                      className="w-full pl-24 pr-4 py-3.5 bg-slate-50/80 border border-slate-300 rounded-xl text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all tracking-wide shadow-2xs"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t("enter_mobile")}
                  </p>
                </div>

                {/* Submit CTA */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#0082fe] hover:bg-[#0072de] active:scale-[0.99] text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Sending OTP...</span>
                    ) : (
                      <>
                        <span>{t("send_otp")}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Switch to PIN */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("pin");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className="text-xs font-bold text-[#0082fe] hover:underline cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sign in with 6-Digit PIN instead</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    <span className="bg-white px-3">
                      {t("or_divider") || "Or"}
                    </span>
                  </div>
                </div>

                {/* Login as Fleet Owner Button */}
                <a
                  href={process.env.NEXT_PUBLIC_VENDOR_PORTAL_URL || "https://vendor.grabrentals.in/login"}
                  className="w-full py-3 px-5 rounded-xl border border-slate-200 hover:border-[#0082fe]/40 bg-slate-50/80 hover:bg-slate-100 text-slate-700 hover:text-[#0082fe] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-2xs group cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-[#0082fe] group-hover:scale-110 transition-transform" />
                  <span>{t("login_as_fleet_owner") || "Login as Fleet Owner"}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0082fe] group-hover:translate-x-1 transition-all" />
                </a>
              </form>
            ) : (
              /* STEP 2: OTP Verification Form */
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {t("enter_otp")}
                    </label>
                    <span className="text-xs text-slate-500">Valid for 5 mins</span>
                  </div>

                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      autoFocus
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="• • • • • •"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/80 border border-slate-300 rounded-xl text-center text-xl font-mono font-bold tracking-[0.5em] text-[#0082fe] placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all shadow-2xs"
                    />
                  </div>

                  {/* USER REQUIREMENT: Show OTP Directly Under Text Box with One-Click Autofill */}
                  {devOtp && (
                    <div 
                      onClick={() => setOtp(devOtp)} 
                      role="button"
                      tabIndex={0}
                      className="mt-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between cursor-pointer hover:bg-blue-100/70 transition-all group select-none shadow-2xs"
                    >
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0082fe] font-mono font-bold text-[11px] uppercase tracking-wider">
                          Test OTP
                        </span>
                        <span>Code: <strong className="text-slate-900 font-mono text-sm tracking-widest">{devOtp}</strong></span>
                      </div>
                      <span className="text-xs font-bold text-[#0082fe] group-hover:underline">
                        Click to Autofill
                      </span>
                    </div>
                  )}

                  {/* Resend OTP Timer & Actions */}
                  <div className="flex items-center justify-between pt-2 text-xs">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[#0082fe] hover:text-blue-700 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> {t("resend_otp")}
                      </button>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                        Resend available in <strong className="text-slate-700">{resendCountdown}s</strong>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setOtp("");
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Change Number
                    </button>
                  </div>
                </div>

                {/* Verify CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#0082fe] hover:bg-[#0072de] active:scale-[0.99] text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Verifying Code...</span>
                    ) : (
                      <>
                        <span>{t("verify_otp")}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Mobile Trust Line */}
            <div className="lg:hidden mt-6 pt-4 border-t border-slate-200 flex items-center justify-around text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Guaranteed Cab</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#0082fe] fill-[#0082fe]" /> 4.9★ Drivers</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-[#0082fe]" /> Zero Cancel</span>
            </div>

            {/* Bottom Help Notice */}
            <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-500 leading-relaxed">
              By continuing, you agree to Grab Rentals&apos; <Link href="/terms" className="text-slate-600 hover:text-[#0082fe] underline">Terms of Service</Link> and <Link href="/privacy-policy" className="text-slate-600 hover:text-[#0082fe] underline">Privacy Policy</Link>. Personal details can be updated anytime in Account Settings.
            </div>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <div>© 2026 Grab Rentals Global Mobility. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <Link href="/privacy-policy" className="hover:text-[#0082fe] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#0082fe] transition-colors">Terms of Service</Link>
          <Link href="/support" className="hover:text-[#0082fe] transition-colors">Customer Support</Link>
        </div>
      </footer>

    </div>
  );
}
