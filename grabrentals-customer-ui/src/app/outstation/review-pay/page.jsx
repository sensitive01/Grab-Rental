"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Wallet, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Smartphone, 
  Loader2, 
  User, 
  Phone, 
  FileText,
  Calendar,
  AlertCircle,
  Tag,
  X,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import SearchSummaryBar from "@/components/booking/SearchSummaryBar";
import { customerApi } from "@/lib/customerApi";
import { isAuthenticated, getCurrentUser, setAuthSession, logout } from "@/lib/auth";
import { useLanguage } from "@/context/LanguageContext";
import LocationPickerModal from "@/components/booking/LocationPickerModal";

function resolveCarImage(title, category, rawImage) {
  if (rawImage && typeof rawImage === "string" && !rawImage.includes("blob:")) {
    return rawImage;
  }

  const t = (title || "").toLowerCase();
  const c = (category || "").toLowerCase();
  
  if (t.includes("innova") || t.includes("crysta") || t.includes("hycross") || t.includes("fortuner")) {
    return "/images/cars/innova.jpg";
  }
  if (t.includes("s-presso") || t.includes("spresso")) {
    return "/images/cars/spresso.jpg";
  }
  if (t.includes("wagon") || t.includes("celerio") || t.includes("tiago") || t.includes("alto")) {
    return "/images/cars/wagon_r.jpg";
  }
  if (t.includes("ertiga") || t.includes("carens") || t.includes("triber") || t.includes("rumion")) {
    return "/images/cars/ertiga.jpg";
  }
  if (t.includes("dzire") || t.includes("etios") || t.includes("amaze") || t.includes("verna") || t.includes("aura") || t.includes("city")) {
    return "/images/cars/dzire.jpg";
  }

  if (c.includes("hatchback")) return "/images/cars/wagon_r.jpg";
  if (c.includes("suv_6")) return "/images/cars/ertiga.jpg";
  if (c.includes("suv_7")) return "/images/cars/innova.jpg";
  return "/images/cars/dzire.jpg";
}

export default function ReviewPayPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const [paymentPlan, setPaymentPlan] = useState("advance");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [bookingConfig, setBookingConfig] = useState(null);
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState("pickup");

  // Inline OTP Auth Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState("phone"); // 'phone' | 'otp'
  const [authPhone, setAuthPhone] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authDevOtp, setAuthDevOtp] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authCountdown, setAuthCountdown] = useState(30);

  // OTP resend countdown timer
  useEffect(() => {
    let timer;
    if (showAuthModal && authStep === "otp" && authCountdown > 0) {
      timer = setInterval(() => {
        setAuthCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showAuthModal, authStep, authCountdown]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("grab_selected_booking");
        if (stored) {
          const parsed = JSON.parse(stored);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setBookingConfig(parsed);

          // Prefill pickup & drop addresses if empty
          const isLocalTrip = parsed.trip?.serviceType === "LOCAL" || (parsed.trip?.to && parsed.trip.to.toLowerCase().includes("hr"));
          const isAirportTrip = parsed.trip?.serviceType === "AIRPORT" || (parsed.trip?.tripType && parsed.trip.tripType.toLowerCase().includes("airport"));
          if (parsed.trip?.from) {
            setPickupAddress(isAirportTrip && parsed.trip.from.toLowerCase().includes("airport") 
              ? `${parsed.trip.from} (Arrivals Terminal)`
              : `${parsed.trip.from} (Pickup Point)`);
          }
          if (parsed.trip?.to) {
            if (isLocalTrip) {
              setDropAddress(`Within ${parsed.trip.from.split(",")[0].trim()} (Local City Limits / As Directed)`);
            } else if (isAirportTrip && parsed.trip.to.toLowerCase().includes("airport")) {
              setDropAddress(`${parsed.trip.to} (Departures Terminal)`);
            } else {
              setDropAddress(`${parsed.trip.to} (City Center / Main Landmark)`);
            }
          }
        }

        // Restore draft if user previously filled it out
        const savedDraft = sessionStorage.getItem("grab_review_pay_draft");
        if (savedDraft) {
          try {
            const draft = JSON.parse(savedDraft);
            if (draft.passengerName) setPassengerName(draft.passengerName);
            if (draft.passengerPhone) setPassengerPhone(draft.passengerPhone);
            if (draft.pickupAddress) setPickupAddress(draft.pickupAddress);
            if (draft.dropAddress) setDropAddress(draft.dropAddress);
            if (draft.specialInstructions) setSpecialInstructions(draft.specialInstructions);
            if (draft.paymentPlan) setPaymentPlan(draft.paymentPlan);
          } catch {}
        } else {
          const user = getCurrentUser();
          if (user) {
            if (user.name) setPassengerName(user.name);
            if (user.phone) setPassengerPhone(user.phone);
          }
        }
      } catch (err) {
        console.warn("Could not load stored booking config:", err);
      }
    }
  }, []);

  const isLocal = bookingConfig?.trip?.serviceType === "LOCAL" || (bookingConfig?.trip?.to && bookingConfig.trip.to.toLowerCase().includes("hr"));
  const isAirport = bookingConfig?.trip?.serviceType === "AIRPORT" || (bookingConfig?.trip?.tripType && bookingConfig.trip.tripType.toLowerCase().includes("airport"));

  const formatPackageLabel = (pkgStr) => {
    if (!pkgStr) return "8 Hours / 80 Kms";
    const lower = pkgStr.toLowerCase();
    if (lower.includes("4hr") || lower.includes("40")) return "4 Hours / 40 Kms";
    if (lower.includes("12hr") || lower.includes("120")) return "12 Hours / 120 Kms";
    if (lower.includes("8hr") || lower.includes("80")) return "8 Hours / 80 Kms";
    return pkgStr;
  };
  const packageLabel = formatPackageLabel(bookingConfig?.trip?.to);

  // Dynamic pricing from backend tariff engine (stored in sessionStorage by select-vehicle page)
  const baseFare = bookingConfig?.car?.fare || 0;
  const taxes = bookingConfig?.car?.taxes || 0;
  const luggageCarrierFee = bookingConfig?.car?.withLuggageCarrier ? 149 : 0;
  const tollPrice = isLocal ? 0 : (bookingConfig?.tollPrice || 0);
  const duration = isLocal ? null : (bookingConfig?.duration || null);
  const totalAmount = baseFare + taxes + luggageCarrierFee + tollPrice;
  const advanceAmount = Math.round(totalAmount * 0.20);
  const driverLaterAmount = totalAmount - advanceAmount;
  const distanceKm = bookingConfig?.distanceKm || 0;
  const perKmRate = bookingConfig?.car?.perKmRate || 0;

  const saveDraft = (overrides = {}) => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "grab_review_pay_draft",
          JSON.stringify({
            passengerName,
            passengerPhone,
            pickupAddress,
            dropAddress,
            specialInstructions,
            paymentPlan,
            ...overrides,
          })
        );
      } catch (e) {
        console.warn("Could not save draft:", e);
      }
    }
  };

  const sendOtpForAuth = async (targetPhone) => {
    const cleaned = (targetPhone || authPhone || passengerPhone).replace(/[^0-9]/g, "");
    if (cleaned.length < 10) {
      setAuthError("Please enter a valid 10-digit mobile number");
      return;
    }

    setAuthLoading(true);
    setAuthError("");
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
      if (result.data?.devOtp) {
        setAuthDevOtp(result.data.devOtp);
      }
      setAuthStep("otp");
      setAuthCountdown(30);
    } catch (err) {
      setAuthError(err.message || "Failed to send OTP. Please check mobile number.");
    } finally {
      setAuthLoading(false);
    }
  };

  const triggerOtpVerification = (customMsg = "") => {
    saveDraft();
    const cleaned = passengerPhone.replace(/[^0-9]/g, "");
    setAuthPhone(cleaned);
    setAuthOtp("");
    setAuthError(customMsg);
    setShowAuthModal(true);

    if (cleaned.length >= 10) {
      sendOtpForAuth(cleaned);
    } else {
      setAuthStep("phone");
    }
  };

  const verifyOtpAndBook = async () => {
    if (!authOtp || authOtp.trim().length !== 6) {
      setAuthError("Please enter the complete 6-digit OTP");
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    try {
      const cleaned = authPhone.replace(/[^0-9]/g, "");
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, otp: authOtp.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Invalid OTP entered");
      }

      setAuthSession(result.data.accessToken, result.data.user);
      setShowAuthModal(false);

      // Now create the booking with valid session
      await executeBooking();
    } catch (err) {
      setAuthError(err.message || "Invalid OTP code");
    } finally {
      setAuthLoading(false);
    }
  };

  const executeBooking = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const advancePaid = paymentPlan === "advance" ? advanceAmount : totalAmount;

      // Construct ISO timestamp from trip date and time
      // eslint-disable-next-line react-hooks/purity
      let pickupIso = new Date(Date.now() + 86400000).toISOString();
      if (bookingConfig?.trip?.date) {
        try {
          const dateParts = bookingConfig.trip.date.split("-");
          let yyyy, mm, dd;
          if (dateParts[0].length === 4) {
            [yyyy, mm, dd] = dateParts;
          } else {
            [dd, mm, yyyy] = dateParts;
          }
          const timeParts = (bookingConfig.trip.time || "07:00").split(":");
          const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(timeParts[0] || 7), Number(timeParts[1] || 0));
          if (!isNaN(dt.getTime())) {
            pickupIso = dt.toISOString();
          }
        } catch {
          // Keep fallback ISO
        }
      }

      const rawStops = bookingConfig?.trip?.stops || bookingConfig?.stops || null;
      let stopsVal = null;
      if (rawStops) {
        if (Array.isArray(rawStops)) {
          const filtered = rawStops.filter(Boolean);
          if (filtered.length > 0) stopsVal = filtered.join("|");
        } else if (typeof rawStops === "string" && rawStops.trim()) {
          stopsVal = rawStops.trim();
        }
      }

      const bookingPayload = {
        tripType: isLocal ? "HOURLY_PACKAGE" : isAirport ? (bookingConfig?.trip?.tripType || "AIRPORT_TRANSFER") : ((bookingConfig?.trip?.tripType || "One way").toLowerCase().includes("round") ? "ROUND_TRIP" : "ONE_WAY"),
        serviceType: isLocal ? "LOCAL" : isAirport ? "AIRPORT" : (bookingConfig?.trip?.serviceType || "OUTSTATION"),
        pickupCity: bookingConfig?.trip?.from || "Bangalore",
        dropCity: isLocal ? (bookingConfig?.trip?.from?.split(",")[0]?.trim() || "Bangalore") : (bookingConfig?.trip?.to || "Coimbatore"),
        stops: (isLocal || isAirport) ? "" : stopsVal,
        pickupAddress: pickupAddress.trim(),
        dropAddress: dropAddress.trim() || (isLocal ? "Within City Limits / Local Disposal" : `${bookingConfig?.trip?.to || "Destination"} Center`),
        pickupDateTime: pickupIso,
        returnDateTime: null,
        vehicleCategory: bookingConfig?.car?.category || "SEDAN",
        passengerCount: 2,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        totalFare: totalAmount,
        advancePaid,
        paymentStatus: paymentPlan === "advance" ? "ADVANCE_PAID" : "FULL_PAID",
        specialInstructions: `${specialInstructions ? specialInstructions.trim() + " | " : ""}${isLocal ? "Package: " + packageLabel + " | " : ""}${stopsVal ? "Intermediate Stops: " + stopsVal.replace(/\|/g, ", ") + " | " : ""}Vehicle: ${bookingConfig?.car?.title || "Fleet"} | Fuel: ${bookingConfig?.car?.fuel || "CNG"} | Distance: ${distanceKm} km${tollPrice > 0 ? " | FASTag Toll: ₹" + tollPrice : ""}${duration ? " | Est. Duration: " + duration : ""} | Rate: ₹${perKmRate}/km${bookingConfig?.car?.withLuggageCarrier ? " | Rooftop Carrier Included" : ""}`,
      };

      const res = await customerApi.createBooking(bookingPayload);
      if (res && res.data) {
        sessionStorage.removeItem("grab_review_pay_draft");
        sessionStorage.setItem("grab_confirmed_booking", JSON.stringify({ ...res.data, stops: res.data.stops || stopsVal }));
        const bookingRef = res.data.bookingReference || res.data.id;
        router.push(`/booking/confirmation?id=${encodeURIComponent(bookingRef)}`);
      } else {
        throw new Error("Unable to confirm booking. Please try again.");
      }
    } catch (err) {
      console.error("[ReviewPay] Booking creation error:", err);
      if (err.response?.status === 401) {
        logout();
        triggerOtpVerification("Your session expired. Please verify with OTP to complete your booking.");
      } else {
        setErrorMsg(err.response?.data?.message || err.message || "Failed to confirm booking. Please verify your connection.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayAndBook = async (e) => {
    e.preventDefault();

    if (!pickupAddress.trim()) {
      setErrorMsg("Please enter your exact pickup address or landmark.");
      return;
    }

    if (!passengerName.trim() || !passengerPhone.trim()) {
      setErrorMsg("Please provide passenger name and mobile number.");
      return;
    }

    saveDraft();

    if (!isAuthenticated()) {
      triggerOtpVerification();
      return;
    }

    await executeBooking();
  };

  if (!bookingConfig) {
    return (
      <main className="bg-slate-50 min-h-screen py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Loading Selected Vehicle...</h2>
          <p className="text-xs text-slate-500">
            If you came directly, please choose your car first.
          </p>
          <Link
            href="/outstation/select-vehicle"
            className="inline-block py-2.5 px-6 rounded-xl bg-amber-600 text-white font-bold text-xs uppercase tracking-wider"
          >
            Select Vehicle
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen pb-24">
      <SearchSummaryBar activeStep={2} />
      
      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-8">
        
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">{t("review_and_pay")}</h1>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePayAndBook} className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Passenger & Pickup Details + Payment Options */}
          <div className="flex-1 space-y-6">
            
            {/* 1. Passenger Information */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-slate-900 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">1</div>
                <h2 className="text-lg font-black text-slate-900">{t("passenger_details")}</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      {t("full_name")} *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="E.g. Rajesh Kumar"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      {t("mobile_number")} *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={passengerPhone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                          setPassengerPhone(digits);
                        }}
                        placeholder="98765 43210"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      {t("pickup_address")} *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMapTarget("pickup");
                        setIsMapModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer group"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                      <span>{t("choose_from_location") || "Choose on Map"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                    <textarea
                      rows={2}
                      required
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Enter street, apartment/building name, landmark..."
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                    ></textarea>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      {t("drop_address")}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMapTarget("drop");
                        setIsMapModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer group"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                      <span>{t("choose_to_location") || "Choose on Map"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-amber-600 absolute left-3.5 top-3" />
                    <textarea
                      rows={2}
                      value={dropAddress}
                      onChange={(e) => setDropAddress(e.target.value)}
                      placeholder="Enter destination address or drop landmark..."
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                    ></textarea>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    {t("special_requests") || "Special Chauffeur Requests (Optional)"}
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder={t("special_requests_placeholder") || "E.g., Carrying excess baggage, baby in car, early departure..."}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Plan Selection */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-slate-900 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">2</div>
                <h2 className="text-lg font-black text-slate-900">{t("select_payment_plan") || "Select Payment Plan"}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label 
                  onClick={() => setPaymentPlan("advance")}
                  className={`relative border-2 ${paymentPlan === 'advance' ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-600/10' : 'border-slate-200 bg-white'} p-5 rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all`}
                >
                  <input type="radio" name="payment" checked={paymentPlan === "advance"} onChange={() => setPaymentPlan("advance")} className="absolute top-4 right-4 w-4 h-4 accent-amber-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 mb-1">{t("pay_advance")}</span>
                  <span className="text-2xl font-black text-amber-700 mb-1">₹{advanceAmount.toLocaleString()}</span>
                  <span className="text-[11px] font-bold text-slate-500">Pay ₹{driverLaterAmount.toLocaleString()} to chauffeur at trip end</span>
                </label>
                
                <label 
                  onClick={() => setPaymentPlan("full")}
                  className={`relative border-2 ${paymentPlan === 'full' ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-600/10' : 'border-slate-200 bg-white'} p-5 rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all`}
                >
                  <input type="radio" name="payment" checked={paymentPlan === "full"} onChange={() => setPaymentPlan("full")} className="absolute top-4 right-4 w-4 h-4 accent-amber-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 mb-1">{t("pay_full")}</span>
                  <span className="text-2xl font-black text-slate-900 mb-1">₹{totalAmount.toLocaleString()}</span>
                  <span className="text-[11px] font-bold text-emerald-600">Zero cash hassle during the ride</span>
                </label>
              </div>
            </div>

            {/* 3. Payment Gateway Options */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-slate-900 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">3</div>
                <h2 className="text-lg font-black text-slate-900">Supported Payment Methods</h2>
              </div>

              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-700 shadow-2xs">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Instant UPI & QR</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Google Pay, PhonePe, Paytm, BHIM</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Zero Fee</span>
                </div>
                
                <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-700 shadow-2xs">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Debit & Credit Cards</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Visa, MasterCard, RuPay, Amex</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">All Banks</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Fare Breakdown & Confirmation Action */}
          <div className="w-full lg:w-[420px]">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm sticky top-36 overflow-hidden">
              
              <div className="bg-slate-900 text-white p-5">
                <h3 className="text-base font-black tracking-tight">Final Booking Summary</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {isLocal ? (
                    `${bookingConfig.trip?.from} • Local Package: ${packageLabel}`
                  ) : (
                    `${bookingConfig.trip?.from} ${bookingConfig.trip?.stops ? `→ Via ${String(bookingConfig.trip.stops).replace(/\|/g, ", ")} ` : ""}→ ${bookingConfig.trip?.to} • ${bookingConfig.trip?.tripType}`
                  )}
                </p>
                {isLocal ? (
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] font-bold">
                    <span className="text-amber-400">⏱️ {packageLabel}</span>
                    <span className="text-slate-300">📍 Local City Disposal</span>
                  </div>
                ) : (distanceKm > 0 || duration) ? (
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] font-bold">
                    {distanceKm > 0 && <span className="text-amber-400">📏 {distanceKm} km</span>}
                    {duration && <span className="text-slate-300">⏱️ ~{duration}</span>}
                  </div>
                ) : null}
              </div>

              {/* Selected Vehicle Overview */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-14 relative bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0">
                    <Image 
                      src={resolveCarImage(bookingConfig.car?.title, bookingConfig.car?.category, bookingConfig.car?.image)} 
                      alt={bookingConfig.car?.title || "Car"} 
                      fill 
                      unoptimized={true}
                      className="object-contain p-1" 
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{bookingConfig.car?.title}</h4>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      {bookingConfig.car?.seating} Seats • {bookingConfig.car?.fuel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Fare Breakdown — all values from backend tariff engine */}
              <div className="p-5 border-b border-slate-100 space-y-3">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{t("fare_summary")}</h4>
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>Base Outstation Fare ({distanceKm} km × ₹{Number(perKmRate).toFixed(1)}/km)</span>
                    <span className="text-slate-900 font-bold">₹{baseFare.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Driver Allowance & Night Charges</span>
                    <span className="text-emerald-700 font-extrabold">Included (₹0)</span>
                  </div>
                  {bookingConfig.car?.withLuggageCarrier && (
                    <div className="flex justify-between items-center text-amber-800">
                      <span>Rooftop Luggage Carrier</span>
                      <span className="font-bold">+ ₹{luggageCarrierFee}</span>
                    </div>
                  )}
                  {tollPrice > 0 && (
                    <div className="flex justify-between items-center">
                      <span>FASTag Highway Toll</span>
                      <span className="text-slate-900 font-bold">+ ₹{tollPrice.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>GST & State Passenger Tax</span>
                    <span className={taxes > 0 ? "text-slate-900 font-bold" : "text-emerald-700 font-extrabold"}>
                      {taxes > 0 ? `+ ₹${taxes.toLocaleString()}` : "Included (₹0)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total & Action */}
              <div className="p-5 bg-amber-50/40 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Total Ride Value</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">₹{totalAmount.toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-amber-200/80 flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-900">Paying Now:</span>
                  <span className="font-black text-amber-700 text-sm">
                    ₹{paymentPlan === "advance" ? advanceAmount.toLocaleString() : totalAmount.toLocaleString()}
                  </span>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Forwarding to Dispatch Engine...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> 
                      {t("confirm_and_book")} • ₹{paymentPlan === "advance" ? advanceAmount.toLocaleString() : totalAmount.toLocaleString()}
                    </>
                  )}
                </button>
                
                <p className="text-[10px] text-slate-500 font-bold text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Encrypted & Verified Booking
                </p>
              </div>

            </div>
          </div>

        </form>
      </div>

      {/* Instant OTP Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {authStep === "otp" ? "Verify OTP to Confirm Ride" : "Verify Mobile Number"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {authStep === "otp"
                    ? `Enter the 6-digit verification code sent to +91 ${authPhone.slice(-10)}`
                    : "Enter your 10-digit mobile number to verify your booking instantly"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authStep === "phone" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                      placeholder="98765 43210"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={authLoading || authPhone.length < 10}
                  onClick={() => sendOtpForAuth(authPhone)}
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      Enter 6-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthStep("phone")}
                      className="text-[11px] font-bold text-amber-600 hover:underline"
                    >
                      Change Number
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={authOtp}
                    autoFocus
                    onChange={(e) => setAuthOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.4em] py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
                  />
                </div>

                {authDevOtp && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-900">
                      Test OTP: <strong>{authDevOtp}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAuthOtp(authDevOtp)}
                      className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px] hover:bg-amber-700"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Didn&apos;t receive code?</span>
                  {authCountdown > 0 ? (
                    <span className="font-semibold text-slate-400">Resend in {authCountdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => sendOtpForAuth(authPhone)}
                      className="font-bold text-amber-600 hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={authLoading || authOtp.length !== 6}
                  onClick={verifyOtpAndBook}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {authLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Confirm Ride</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Map Location Picker Modal */}
      <LocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        activeTarget={mapTarget}
        pickupValue={pickupAddress || bookingConfig?.trip?.from || "Bangalore, Karnataka"}
        dropValue={dropAddress || bookingConfig?.trip?.to || "Coimbatore, Tamil Nadu"}
        onSelect={(selectedLocation, coords, target, allValues) => {
          if (allValues) {
            if (allValues.pickup) setPickupAddress(allValues.pickup);
            if (allValues.drop) setDropAddress(allValues.drop);
          } else if (target === "drop") {
            setDropAddress(selectedLocation);
          } else {
            setPickupAddress(selectedLocation);
          }
        }}
        onSelectPickup={(selectedLocation) => {
          setPickupAddress(selectedLocation);
        }}
        onSelectDrop={(selectedLocation) => {
          setDropAddress(selectedLocation);
        }}
      />
    </main>
  );
}
