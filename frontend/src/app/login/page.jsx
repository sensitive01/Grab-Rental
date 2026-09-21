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
  Edit3
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  // Step 1: 'phone' | Step 2: 'otp'
  const [step, setStep] = useState("phone");

  // Form State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState(""); // Received OTP for easy on-screen testing

  // UI / Timer State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (step === "otp" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setCanResend(true);
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
      setCanResend(false);
      setSuccessMessage(`OTP sent successfully to +91 ${cleaned.slice(-10)}`);
    } catch (err) {
      setErrorMessage(err.message || "Unable to send OTP. Please ensure the backend is running.");
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

      // Save token and user details to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("rental_access_token", result.data.accessToken);
        localStorage.setItem("rental_user", JSON.stringify(result.data.user));
      }

      setSuccessMessage("Verification successful! Redirecting...");

      // If user profile is still default or incomplete, guide them to account settings
      setTimeout(() => {
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
      const rawMsg = err.message || "";
      const formattedMsg = (rawMsg.toLowerCase().includes("credential") || rawMsg.toLowerCase().includes("incorrect"))
        ? "Invalid OTP"
        : (rawMsg || "Invalid OTP");
      setErrorMessage(formattedMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* Top Brand Bar */}
      <header className="w-full border-b border-slate-800/80 bg-[#0B101B]/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 lg:px-12 py-3 sm:py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-white whitespace-nowrap">GRAB RENTALS</span>
            <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
              Customer Sign In
            </span>
          </div>
        </Link>

        <div className="flex items-center text-xs font-semibold text-slate-400">
          <Link href="/" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 whitespace-nowrap">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-grow flex flex-col lg:flex-row w-full max-w-[1920px] mx-auto min-h-[calc(100vh-120px)]">
        
        {/* LEFT PANEL: Showcase & Brand Trust (Hidden on mobile so login form is immediately visible without scrolling) */}
        <section className="hidden lg:flex lg:w-[50%] xl:w-[54%] relative flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-[#060A12]">
          
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image 
              src="/images/login-hero.jpg" 
              alt="Luxury Chauffeur Vehicle" 
              fill 
              priority
              className="object-cover object-center opacity-35 scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060A12] via-[#060A12]/80 to-[#060A12]/50"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#060A12]/95 via-[#060A12]/70 to-transparent"></div>
            
            {/* Ambient Warm Amber Glow */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          </div>

          {/* Left Top: Trust Badges */}
          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-full flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-amber-500/30 text-xs font-semibold text-slate-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="tracking-wide uppercase text-[11px] text-slate-300">2,410+ Active Vehicles Live</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-full flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-semibold tracking-wide uppercase text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Police-Cleared Chauffeurs</span>
            </div>
          </div>

          {/* Left Center: Core Value Proposition */}
          <div className="relative z-10 my-10 lg:my-auto max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-700/60 mb-6 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reliable & Transparent Travel</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight mb-5">
              Guaranteed Cabs. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400">
                Zero Cancellation.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300/90 max-w-lg mb-8 leading-relaxed">
              Experience seamless outstation cabs, luxury group vans, and executive airport transfers with transparent all-inclusive fares and verified background-checked chauffeurs.
            </p>

            {/* Bento Trust Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-md">
              <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-extrabold text-lg text-white">5,00,000+</span>
                </div>
                <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Verified Highway Trips</div>
                <div className="text-xs text-amber-400/90 mt-1 font-semibold">99.8% On-Time Chauffeur Arrival</div>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-extrabold text-lg text-white">All-Inclusive</span>
                </div>
                <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Fixed Upfront Fares</div>
                <div className="text-xs text-emerald-400 mt-1 font-semibold">Tolls, Taxes & Driver Allowance</div>
              </div>
            </div>
          </div>

          {/* Left Bottom: Subtle Trust Guarantee */}
          <div className="relative z-10 text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Backed by Grab Rentals 100% Ride Assurance & On-Time Guarantee.</span>
          </div>
        </section>

        {/* RIGHT PANEL: Mobile & OTP Authentication Form */}
        <section className="w-full lg:w-[50%] xl:w-[46%] flex flex-col justify-center items-center p-5 sm:p-10 lg:p-16 bg-[#0B0F17] relative flex-grow min-h-[calc(100vh-140px)]">
          
          <div className="w-full max-w-md mx-auto relative z-10">
            
            {/* Header / Titles */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  {step === "phone" ? "Step 1 of 2" : "Step 2 of 2"}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Instant Verification
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {step === "phone" ? "Enter Mobile Number" : "Enter Verification Code"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                {step === "phone" 
                  ? "We'll send a 6-digit verification code to sign in or create your account."
                  : (
                    <span className="flex items-center gap-2 flex-wrap">
                      <span>Code sent to <strong className="text-slate-200">+91 {phone.replace(/[^0-9]/g, "").slice(-10)}</strong></span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setStep("phone");
                          setOtp("");
                          setErrorMessage("");
                          setSuccessMessage("");
                        }}
                        className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1 ml-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Change
                      </button>
                    </span>
                  )}
              </p>
            </div>

            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* STEP 1: Phone Number Form */}
            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    {/* Country Prefix Badge */}
                    <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-amber-400 pr-3 border-r border-slate-700 select-none">
                      <Phone className="w-3.5 h-3.5" />
                      <span>+91</span>
                    </div>

                    <input
                      type="tel"
                      required
                      autoFocus
                      maxLength={12}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full pl-24 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-base font-semibold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all tracking-wide"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Enter your 10-digit Indian phone number without country code.
                  </p>
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] text-slate-950 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Sending OTP...</span>
                    ) : (
                      <>
                        <span>Get Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: OTP Verification Form */
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      6-Digit Verification Code
                    </label>
                    <span className="text-xs text-slate-500">Valid for 5 mins</span>
                  </div>

                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
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
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-center text-xl font-mono font-bold tracking-[0.5em] text-amber-400 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                    />
                  </div>

                  {/* USER REQUIREMENT: Show OTP Directly Under Text Box with One-Click Autofill */}
                  {devOtp && (
                    <div 
                      onClick={() => setOtp(devOtp)} 
                      role="button"
                      tabIndex={0}
                      className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:bg-amber-500/20 transition-all group select-none"
                    >
                      <div className="flex items-center gap-2 text-xs text-amber-300">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-[11px] uppercase tracking-wider">
                          Test OTP
                        </span>
                        <span>Code: <strong className="text-white font-mono text-sm tracking-widest">{devOtp}</strong></span>
                      </div>
                      <span className="text-xs font-bold text-amber-400 group-hover:underline">
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
                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Resend OTP
                      </button>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 animate-spin text-slate-600" />
                        Resend available in <strong className="text-slate-300">{resendCountdown}s</strong>
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
                      className="text-slate-400 hover:text-slate-200"
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
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] text-slate-950 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Verifying Code...</span>
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Mobile Trust Line */}
            <div className="lg:hidden mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-around text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Guaranteed Cab</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 4.9★ Drivers</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> Zero Cancel</span>
            </div>

            {/* Bottom Help Notice */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 leading-relaxed">
              By continuing, you agree to Grab Rentals&apos; <Link href="/terms" className="text-slate-400 hover:text-amber-400 underline">Terms of Service</Link> and <Link href="/privacy-policy" className="text-slate-400 hover:text-amber-400 underline">Privacy Policy</Link>. Personal details can be updated anytime in Account Settings.
            </div>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070A0F] py-4 px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <div>© 2026 Grab Rentals Global Mobility. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <Link href="/privacy-policy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
          <Link href="/support" className="hover:text-amber-400 transition-colors">Customer Support</Link>
        </div>
      </footer>

    </div>
  );
}
