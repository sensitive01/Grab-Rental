"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { resolveCarModelAndImage, fetchAndCacheAdminVehicleModels } from "@/lib/vehicleUtils";
import { 
  ArrowLeft, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Phone, 
  Share2, 
  FileText, 
  KeyRound, 
  UserCheck, 
  Check, 
  Copy,
  AlertCircle,
  Loader2,
  AlertTriangle,
  X,
  CheckCircle2,
  Sparkles,
  Luggage,
  Languages,
  Fuel,
  Navigation,
  CreditCard,
  Receipt,
  User,
  Info
} from "lucide-react";
import { customerApi } from "@/lib/customerApi";
import { findCityCoordinates } from "@/lib/cities";
import MapView from "@/components/booking/MapView";

function formatDateTime(isoString) {
  if (!isoString) return { dateStr: "Scheduled", timeStr: "" };
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { dateStr: isoString, timeStr: "" };
    return {
      dateStr: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
      timeStr: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    };
  } catch {
    return { dateStr: isoString, timeStr: "" };
  }
}

function parseTripDetails(booking) {
  if (!booking) return {};

  let cached = {};
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("grab_confirmed_booking");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.bookingReference === booking.bookingReference || parsed.id === booking.id || parsed.id === booking.bookingReference) {
          cached = parsed;
        }
      }
    } catch {}
  }

  const spec = booking.specialInstructions || "";

  // Vehicle info
  const vehicleTitle = cached.carTitle || 
    (spec.match(/Vehicle:\s*([^|]+)/i)?.[1]?.trim()) || 
    booking.vehicleModel || 
    booking.assignedVehicle?.model || 
    "WagonR, Swift or Similar";

  const vehicleFuel = cached.carFuel || 
    (spec.match(/Fuel:\s*([^|]+)/i)?.[1]?.trim()) || 
    "CNG";

  const vehicleImage = cached.carImage || 
    (spec.match(/Image:\s*([^|]+)/i)?.[1]?.trim()) || 
    booking.vehicleImage || 
    booking.assignedVehicle?.image || 
    "/images/cars/wagon_r.jpg";

  const vehicleSeating = cached.carSeating || 4;

  const distanceKm = cached.distanceKm || 
    Number(spec.match(/Distance:\s*(\d+)/i)?.[1]) || 
    0;

  const duration = cached.duration || 
    (spec.match(/Est\.\s*Duration:\s*([^|]+)/i)?.[1]?.trim()) || 
    null;

  const perKmRate = cached.perKmRate || 
    Number(spec.match(/Rate:\s*₹?([0-9.]+)/i)?.[1]) || 
    null;

  const packageLabel = cached.packageLabel || 
    (spec.match(/Package:\s*([^|]+)/i)?.[1]?.trim()) || 
    null;

  const intermediateStops = cached.stops || booking.stops || 
    (spec.match(/Intermediate Stops:\s*([^|]+)/i)?.[1]?.trim()) || 
    null;

  const pickupCoords = cached.pickupCoords || 
    (booking.pickupLat && booking.pickupLng ? { lat: Number(booking.pickupLat), lng: Number(booking.pickupLng) } : null) ||
    findCityCoordinates(booking.pickupCity || booking.pickupAddress);

  const dropCoords = cached.dropCoords ||
    findCityCoordinates(booking.dropCity || booking.dropAddress);

  const stopsCoords = cached.stopsCoords || null;

  // Add-ons
  const hasLessThan3Years = cached.selectedAddons?.lessThan3Years ?? /Less than 3 years/i.test(spec);
  const lessThan3YearsFee = cached.lessThan3YearsFee || Number(spec.match(/Less than 3 years[^)]*₹(\d+)/i)?.[1]) || 299;

  const hasLuggageCarrier = cached.selectedAddons?.luggageCarrier ?? /Luggage Carrier/i.test(spec);
  const luggageCarrierFee = cached.luggageCarrierFee || Number(spec.match(/Luggage Carrier[^)]*₹(\d+)/i)?.[1]) || 249;

  const hasLanguageChauffeur = cached.selectedAddons?.languageChauffeur ?? /Language Chauffeur/i.test(spec);
  const chauffeurLanguage = cached.chauffeurLanguage || 
    (spec.match(/Language Chauffeur\s*\(([^)]+)\)/i)?.[1]?.trim()) || 
    "English";
  const languageChauffeurFee = cached.languageChauffeurFee || Number(spec.match(/Language Chauffeur[^)]*₹(\d+)/i)?.[1]) || 199;

  const hasExpressway = cached.selectedAddons?.expressway ?? /Expressway Fastag/i.test(spec);
  const expresswayFee = cached.expresswayFee || Number(spec.match(/Expressway Fastag[^)]*₹(\d+)/i)?.[1]) || 415;

  // Pet Friendly Ride & Add-on
  const isPetFriendly = Boolean(
    booking.isPetFriendly ??
    cached.isPetFriendly ??
    (/🐾\s*Pet Friendly Cab/i.test(spec) || /Pet Fee:/i.test(spec))
  );

  const petType =
    booking.petType ||
    cached.petType ||
    (spec.match(/Pet Friendly Cab\s*\(([^×,)]+)/i)?.[1]?.trim()) ||
    "Pet";

  const petCount =
    booking.petCount ||
    cached.petCount ||
    Number(spec.match(/([0-9]+)\s*,\s*Pet Fee/i)?.[1]) ||
    1;

  let petCharge =
    booking.petCharge != null && Number(booking.petCharge) > 0 ? Number(booking.petCharge) :
    (cached.petCharge != null && Number(cached.petCharge) > 0 ? Number(cached.petCharge) :
    (Number(spec.match(/Pet Fee:\s*₹?([0-9.]+)/i)?.[1]) || 0));

  const vendorPetPayout =
    booking.vendorPetPayout != null && Number(booking.vendorPetPayout) > 0 ? Number(booking.vendorPetPayout) :
    (cached.vendorPetPayout != null && Number(cached.vendorPetPayout) > 0 ? Number(cached.vendorPetPayout) :
    (Number(spec.match(/Vendor Pet Fee:\s*₹?([0-9.]+)/i)?.[1]) || 0));

  const hasAnyAddons = hasLessThan3Years || hasLuggageCarrier || hasLanguageChauffeur || hasExpressway || isPetFriendly;
  const standardAddonsTotal = (hasLessThan3Years ? lessThan3YearsFee : 0) +
                              (hasLuggageCarrier ? luggageCarrierFee : 0) +
                              (hasLanguageChauffeur ? languageChauffeurFee : 0) +
                              (hasExpressway ? expresswayFee : 0);
  const addonsTotal = standardAddonsTotal + (isPetFriendly ? petCharge : 0);

  // Coupon
  const couponCode = cached.couponCode || spec.match(/Coupon Applied:\s*([A-Za-z0-9_-]+)/i)?.[1] || null;
  const couponDiscount = cached.couponDiscount || Number(spec.match(/Saved ₹(\d+)/i)?.[1]) || 0;

  // Special instructions entered by passenger
  let userNote = cached.userSpecialInstructions || "";
  if (!userNote && spec) {
    const firstTagIdx = spec.search(/\b(Vehicle:|Package:|Intermediate Stops:|Distance:|Image:|Fuel:|Rate:|BaseFare:)/i);
    if (firstTagIdx > 0) {
      userNote = spec.substring(0, firstTagIdx).replace(/\|\s*$/, "").trim();
    } else if (firstTagIdx === -1 && !spec.includes("Vehicle:")) {
      userNote = spec.trim();
    }
  }
  if (userNote) {
    userNote = userNote
      .replace(/🐾\s*Pet Friendly Cab\s*\([^)]*\)\s*\|\s*/gi, "")
      .replace(/🐾\s*Pet Friendly Cab\s*\([^)]*\)/gi, "")
      .trim();
  }

  // Financial values
  const totalFare = Number(booking.totalFare || cached.totalAmount || 0);
  const advancePaid = Number(booking.advancePaid ?? cached.advanceAmount ?? totalFare);
  const dueAmount = totalFare > advancePaid ? totalFare - advancePaid : 0;

  let baseFare = cached.baseFare || Number(spec.match(/BaseFare:\s*₹?(\d+)/i)?.[1]);
  let driverAllowance = cached.driverAllowance || Number(spec.match(/DriverAllowance:\s*₹?(\d+)/i)?.[1]);
  let driverAllowanceLabel = cached.driverAllowanceLabel || spec.match(/DriverAllowance:\s*₹?\d+\s*\(([^)]+)\)/i)?.[1] || "Driver Allowance";
  let taxes = cached.taxes || Number(spec.match(/Taxes:\s*₹?(\d+)/i)?.[1]);
  let gstLabel = cached.gstLabel || spec.match(/Taxes:\s*₹?\d+\s*\(([^)]+)\)/i)?.[1] || "GST";

  // Reconcile petCharge if isPetFriendly but petCharge is 0 while total exceeds known items
  if (isPetFriendly && petCharge === 0) {
    const knownNet = (baseFare || 0) + (driverAllowance || 0) + (taxes || 0) + standardAddonsTotal - couponDiscount;
    if (totalFare > knownNet) {
      petCharge = totalFare - knownNet;
    }
  }

  if (!baseFare || baseFare <= 0) {
    const net = Math.max(0, totalFare + couponDiscount - standardAddonsTotal - (isPetFriendly ? petCharge : 0));
    baseFare = Math.round(net / 1.166);
    driverAllowance = Math.round(baseFare * 0.10);
    taxes = Math.max(0, totalFare + couponDiscount - baseFare - driverAllowance - standardAddonsTotal - (isPetFriendly ? petCharge : 0));
  }

  return {
    vehicleTitle,
    vehicleFuel,
    vehicleImage,
    vehicleSeating,
    distanceKm,
    duration,
    perKmRate,
    packageLabel,
    intermediateStops,
    hasLessThan3Years,
    lessThan3YearsFee,
    hasLuggageCarrier,
    luggageCarrierFee,
    hasLanguageChauffeur,
    chauffeurLanguage,
    languageChauffeurFee,
    hasExpressway,
    expresswayFee,
    hasAnyAddons,
    addonsTotal,
    couponCode,
    couponDiscount,
    userNote,
    totalFare,
    advancePaid,
    dueAmount,
    baseFare,
    driverAllowance,
    driverAllowanceLabel,
    taxes,
    gstLabel,
    pickupCoords,
    dropCoords,
    stopsCoords,
    isPetFriendly,
    petType,
    petCount,
    petCharge,
    vendorPetPayout,
    dropDate: cached.dropDate || cached.returnDateTime || null,
    createdAt: cached.createdAt || booking.createdAt || null
  };
}

export default function TripDetailsTrackingPage({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams?.id || "";
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  useEffect(() => {
    let isCancelled = false;

    async function fetchBooking() {
      if (!bookingId) return;
      setLoading(true);
      setError(null);
      try {
        const [res] = await Promise.all([
          customerApi.getBookingById(bookingId),
          fetchAndCacheAdminVehicleModels().catch(() => [])
        ]);
        if (!isCancelled && res?.data) {
          let merged = res.data;
          if (typeof window !== "undefined") {
            try {
              const cached = sessionStorage.getItem("grab_confirmed_booking");
              if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.bookingReference === bookingId || parsed.id === bookingId) {
                  merged = { ...parsed, ...res.data };
                }
              }
            } catch {}
          }
          setBooking(merged);
        }
      } catch (err) {
        console.warn("Error fetching booking by ID:", err);
        if (typeof window !== "undefined") {
          try {
            const cached = sessionStorage.getItem("grab_confirmed_booking");
            if (cached) {
              const parsed = JSON.parse(cached);
              if (parsed.bookingReference === bookingId || parsed.id === bookingId) {
                setBooking(parsed);
                setLoading(false);
                return;
              }
            }
          } catch {}
        }
        if (!isCancelled) {
          setError(err.response?.data?.message || "Booking details could not be retrieved.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchBooking();

    return () => {
      isCancelled = true;
    };
  }, [bookingId]);

  const handleCopyOtp = (otp) => {
    if (!otp) return;
    navigator.clipboard.writeText(otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      const res = await customerApi.cancelBooking(bookingId);
      if (res?.data) {
        setBooking(res.data);
      }
      setShowCancelModal(false);
      showNotification("success", "Your booking has been cancelled successfully.");
    } catch (err) {
      setShowCancelModal(false);
      showNotification("error", err.response?.data?.message || "Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-bold text-sm">Loading trip tracking details...</p>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-black text-slate-900">Booking Not Found</h2>
          <p className="text-xs text-slate-500">{error || `Reference ${bookingId} not found in your account.`}</p>
          <Link
            href="/dashboard"
            className="inline-block py-2.5 px-6 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider"
          >
            Back to My Bookings
          </Link>
        </div>
      </main>
    );
  }

  const { dateStr, timeStr } = formatDateTime(booking.pickupDateTime);
  const parsed = parseTripDetails(booking);
  const bookedOnObj = booking.createdAt ? formatDateTime(booking.createdAt) : (parsed.createdAt ? formatDateTime(parsed.createdAt) : null);
  const returnDateTimeObj = booking.returnDateTime ? formatDateTime(booking.returnDateTime) : (parsed.dropDate ? formatDateTime(parsed.dropDate) : null);
  const isCancelledState = booking.status === "CANCELLED";
  const { modelName, carImage, categoryLabel } = resolveCarModelAndImage(booking);

  const isRoundTripBooking = booking?.tripType === "ROUND_TRIP" || (booking?.tripType || "").toLowerCase().includes("round");
  let tripDurationDays = 1;
  if (isRoundTripBooking && booking.pickupDateTime && (booking.returnDateTime || parsed.dropDate)) {
    try {
      const d1 = new Date(booking.pickupDateTime);
      const d2 = new Date(booking.returnDateTime || parsed.dropDate);
      if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
        const diff = Math.round((new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime() - new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime()) / (1000 * 3600 * 24));
        tripDurationDays = Math.max(1, diff + 1);
      }
    } catch {}
  }

  const statusStepMap = {
    PENDING_PAYMENT_VERIFICATION: 1,
    PENDING_ALLOCATION: 1,
    REASSIGN_REQUIRED: 1,
    ASSIGNED_TO_VENDOR: 2,
    CONFIRMED: 2,
    ON_THE_WAY: 3,
    IN_TRANSIT: 3,
    COMPLETED: 4,
    CANCELLED: 0
  };
  const currentStep = statusStepMap[booking.status] || 1;

  const stopsList = parsed.intermediateStops
    ? parsed.intermediateStops.split("|").map((s) => s.trim()).filter(Boolean)
    : [];

  const pickupMapPoint = parsed.pickupCoords ? {
    lat: parsed.pickupCoords.lat,
    lng: parsed.pickupCoords.lng,
    label: booking.pickupCity || "Pickup"
  } : null;

  const dropMapPoint = parsed.dropCoords ? {
    lat: parsed.dropCoords.lat,
    lng: parsed.dropCoords.lng,
    label: booking.dropCity || "Drop"
  } : null;

  const stopsMapPoints = (stopsList || []).map((stop, idx) => {
    const coords = (parsed.stopsCoords && parsed.stopsCoords[idx]) || findCityCoordinates(stop);
    if (!coords) return null;
    return {
      lat: coords.lat,
      lng: coords.lng,
      label: `Halt #${idx + 1}: ${stop}`
    };
  }).filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Back & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Trips
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/account/bookings/${booking.bookingReference || booking.id}/invoice`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" /> View Invoice
            </Link>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Trip tracking link copied to clipboard!");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" /> Share Trip
            </button>
          </div>
        </div>

        {/* Status Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${isCancelledState ? "bg-rose-500" : "bg-gradient-to-r from-amber-500 to-emerald-500"}`}></div>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {booking.bookingReference || booking.id}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isCancelledState 
                  ? "bg-rose-50 border border-rose-200 text-rose-700" 
                  : booking.status === "PENDING_PAYMENT_VERIFICATION"
                  ? "bg-amber-50 border border-amber-300 text-amber-800 animate-pulse"
                  : "bg-emerald-50 border border-emerald-200 text-emerald-700 animate-pulse"
              }`}>
                ● {booking.status === "PENDING_PAYMENT_VERIFICATION" ? "Verifying Payment" : booking.status}
              </span>
              {parsed.packageLabel && (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  {parsed.packageLabel}
                </span>
              )}
              {parsed.isPetFriendly && (
                <span className="text-[11px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  🐾 Pet Friendly Cab ({parsed.petType})
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
              {booking.pickupCity} ➔ {booking.dropCity}
            </h1>
            <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
              <span className="font-semibold text-slate-600">{booking.tripType === "ROUND_TRIP" ? "Round Trip" : "One-Way Outstation"}</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-900 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-amber-600" /> Pickup Date & Time: {dateStr} • {timeStr}
              </span>
              {bookedOnObj?.dateStr && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Booked on: <strong className="text-slate-800 font-bold">{bookedOnObj.dateStr}{bookedOnObj.timeStr ? ` at ${bookedOnObj.timeStr}` : ""}</strong>
                  </span>
                </>
              )}
              {booking.tripType === "ROUND_TRIP" && returnDateTimeObj?.dateStr && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-200 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" /> Return: {returnDateTimeObj.dateStr}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Ride OTP Box */}
          {booking.rideOtp && !isCancelledState && (
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-300/80 rounded-2xl p-4 flex items-center gap-4 shrink-0">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Boarding Ride OTP</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black font-mono text-slate-900 tracking-widest">{booking.rideOtp}</span>
                  <button 
                    onClick={() => handleCopyOtp(booking.rideOtp)}
                    className="p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Copy OTP"
                  >
                    {copiedOtp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500">Share with chauffeur at boarding</span>
              </div>
            </div>
          )}
        </div>

        {/* Stepper Timeline */}
        {!isCancelledState && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-6">
              Live Trip Progression
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
              {[
                { stepNum: 1, label: "Booking Placed", desc: "Order recorded" },
                { stepNum: 2, label: "Vehicle Confirmed", desc: "Cab & driver assigned" },
                { stepNum: 3, label: "Ride Started", desc: "In transit with OTP" },
                { stepNum: 4, label: "Journey Completed", desc: "Drop-off & invoice" },
              ].map((s) => {
                const totalSteps = 4;
                const isDone = currentStep > s.stepNum || (currentStep === totalSteps && s.stepNum === totalSteps);
                const isCurrent = currentStep === s.stepNum && currentStep !== totalSteps;

                return (
                  <div key={s.stepNum} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                      isCurrent
                        ? "bg-[#0082fe] text-white ring-4 ring-blue-100 shadow-sm animate-pulse"
                        : isDone
                        ? "bg-emerald-600 text-white" 
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}>
                      {isDone ? "✓" : s.stepNum}
                    </div>
                    <div>
                      <h4 className={`text-xs sm:text-sm font-extrabold ${isCurrent ? "text-[#0082fe]" : "text-slate-900"}`}>
                        {s.label}
                      </h4>
                      <p className="text-[10px] text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2-Column Grid: Left Details & Right Financial Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: All chosen details from location to add-ons */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Complete Route & Locations Chosen */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-amber-600" /> Route & Location Itinerary
                </h3>
              </div>

              {/* Interactive Route Map */}
              {(pickupMapPoint || dropMapPoint) && (
                <div className="rounded-2xl overflow-hidden border border-slate-200">
                  <MapView
                    pickup={pickupMapPoint}
                    drop={dropMapPoint}
                    stops={stopsMapPoints}
                    overrideDistance={parsed.distanceKm}
                    overrideDuration={parsed.duration}
                    className="h-60 sm:h-72 w-full"
                  />
                </div>
              )}

              {/* Step-by-step route itinerary */}
              <div className="space-y-4 text-xs">
                {/* Pickup */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-emerald-800 text-[10px] uppercase tracking-wider">
                      Pickup Point • {booking.pickupCity}
                    </span>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Pickup Date & Time: {dateStr} at {timeStr}
                      {returnDateTimeObj?.dateStr ? ` • Scheduled Return: ${returnDateTimeObj.dateStr}` : ""}
                    </p>
                  </div>
                </div>

                {/* Intermediate Halts (if any added) */}
                {stopsList.length > 0 && (
                  <div className="pl-3 border-l-2 border-dashed border-amber-300 ml-3 space-y-3 py-1">
                    {stopsList.map((stop, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-800 text-[10px] uppercase tracking-wider">
                            Intermediate Halt #{idx + 1}
                          </span>
                          <p className="font-bold text-slate-900">{stop}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop Destination */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-50 border border-rose-300 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-rose-800 text-[10px] uppercase tracking-wider">
                      Drop Destination • {booking.dropCity}
                    </span>
                    <p className="font-bold text-slate-900 text-sm leading-snug">{booking.dropAddress}</p>
                    <p className="text-[11px] text-slate-500 font-medium">Direct destination delivery</p>
                  </div>
                </div>
              </div>

              {/* Route specifications strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Distance</span>
                  <span className="text-xs font-black text-slate-900">{parsed.distanceKm || "Calculated"} km</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Trip Mode</span>
                  <span className="text-xs font-black text-slate-900">{booking.tripType === "ROUND_TRIP" ? "Round Trip" : "One-Way"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Est. Duration</span>
                  <span className="text-xs font-black text-slate-900">{parsed.duration || "Direct Route"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Base Tariff</span>
                  <span className="text-xs font-black text-slate-900">{parsed.perKmRate ? `₹${parsed.perKmRate}/km` : "Standard"}</span>
                </div>
              </div>
            </div>

            {/* 2. Assigned Vehicle & Chauffeur Specification */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-600" /> Selected Vehicle & Chauffeur
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vehicle Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
                  <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-2xs">
                    <Image
                      src={parsed.vehicleImage || carImage}
                      alt={parsed.vehicleTitle || modelName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vehicle</span>
                    <h4 className="text-xs font-extrabold text-slate-900 truncate">
                      {booking.assignedVehicle ? `${booking.assignedVehicle.model} (${booking.assignedVehicle.vehicleNumber})` : (parsed.vehicleTitle || modelName)}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {categoryLabel} • {parsed.vehicleFuel}
                    </p>
                  </div>
                </div>

                {/* Chauffeur Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chauffeur</span>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    {booking.assignedDriver ? booking.assignedDriver.name : "Allocating via Operations"}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {booking.assignedDriver?.phone || "Phone shared before pickup"}
                  </p>
                </div>
              </div>

              {/* Vehicle specifications badges */}
              <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold pt-1">
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-slate-500" /> {booking.vehicleCategory || "HATCHBACK"}
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-slate-500" /> {parsed.vehicleFuel}
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" /> {parsed.vehicleSeating} Seater • AC
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 flex items-center gap-1.5">
                  <Luggage className="w-3.5 h-3.5 text-slate-500" /> {parsed.vehicleSeating >= 6 ? "4 Bags Allowance" : "3 Bags Allowance"}
                </span>
              </div>
            </div>

            {/* 3. Primary Passenger & Custom Pickup Instructions */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600" /> Primary Passenger Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Passenger Name</span>
                  <p className="font-extrabold text-slate-900">{booking.passengerName || booking.customerName || "Customer on File"}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</span>
                  <p className="font-extrabold text-slate-900">{booking.passengerPhone || booking.customerPhone || "+91 Contact on File"}</p>
                </div>
              </div>

              {parsed.userNote && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
                    <Info className="w-3 h-3 text-amber-600" /> Special Instructions / Notes
                  </span>
                  <p className="font-medium text-amber-900">{parsed.userNote}</p>
                </div>
              )}
            </div>

            {/* 4. Selected Add-on Services ("Personalize Your Journey") */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" /> Selected Add-ons &quot;Personalize Your Journey&quot;
                </h3>
                {parsed.hasAnyAddons && (
                  <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                    +₹{parsed.addonsTotal} Total Add-ons
                  </span>
                )}
              </div>

              {parsed.hasAnyAddons ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {parsed.hasLessThan3Years && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-amber-700" /> Vehicle &lt; 3 Years Old
                        </span>
                        <span className="font-black text-amber-900 font-mono">+₹{parsed.lessThan3YearsFee}</span>
                      </div>
                      <p className="text-[11px] text-amber-800">Assured brand new vehicle condition (&lt; 3 years old).</p>
                    </div>
                  )}

                  {parsed.hasLuggageCarrier && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                          <Luggage className="w-3.5 h-3.5 text-amber-700" /> Rooftop Luggage Carrier
                        </span>
                        <span className="font-black text-amber-900 font-mono">+₹{parsed.luggageCarrierFee}</span>
                      </div>
                      <p className="text-[11px] text-amber-800">Cab equipped with top carrier for extra baggage.</p>
                    </div>
                  )}

                  {parsed.hasLanguageChauffeur && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                          <Languages className="w-3.5 h-3.5 text-amber-700" /> Preferred Language Chauffeur
                        </span>
                        <span className="font-black text-amber-900 font-mono">+₹{parsed.languageChauffeurFee}</span>
                      </div>
                      <p className="text-[11px] text-amber-800">Assigned chauffeur speaks {parsed.chauffeurLanguage}.</p>
                    </div>
                  )}

                  {parsed.hasExpressway && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-amber-700" /> Expressway FASTag Pass
                        </span>
                        <span className="font-black text-amber-900 font-mono">+₹{parsed.expresswayFee}</span>
                      </div>
                      <p className="text-[11px] text-amber-800">Expressway toll charges included.</p>
                    </div>
                  )}

                  {parsed.isPetFriendly && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                          🐾 Pet Friendly Cab ({parsed.petType} × {parsed.petCount})
                        </span>
                        <span className="font-black text-amber-900 font-mono">
                          {parsed.petCharge > 0 ? `+₹${parsed.petCharge.toLocaleString()}` : "FREE"}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800">Sanitized pet-ready cab with pet travel accommodation.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p>Standard ride package chosen. Includes verified commercial fleet, AC, sanitization, and baggage space.</p>
                </div>
              )}
            </div>

            {/* 5. Inclusions & Policies Checklist */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Trip Inclusions & Coverage
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2 text-emerald-700">✓ <span className="text-slate-700">Base Fare & Fuel Charges Included</span></div>
                <div className="flex items-center gap-2 text-emerald-700">✓ <span className="text-slate-700">Driver Allowance & Day Duty Covered</span></div>
                <div className="flex items-center gap-2 text-emerald-700">✓ <span className="text-slate-700">GST on Commercial Passenger Transport</span></div>
                <div className="flex items-center gap-2 text-emerald-700">✓ <span className="text-slate-700">State Road Permits & Intercity Tax</span></div>
                <div className="flex items-center gap-2 text-emerald-700">✓ <span className="text-slate-700">Full AC throughout the journey</span></div>
                <div className="flex items-center gap-2 text-emerald-700">✓ <span className="text-slate-700">Doorstep Pickup & Destination Drop</span></div>
              </div>
            </div>

            {/* Cancel booking option if still pending or assigned */}
            {!isCancelledState && booking.status !== "COMPLETED" && booking.status !== "IN_TRANSIT" && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Need to cancel your ride?</h4>
                  <p className="text-[11px] text-slate-500">Free cancellation available prior to chauffeur departure.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors"
                >
                  Cancel Trip
                </button>
              </div>
            )}

          </div>

          {/* Right Column: Complete Financial & Fare Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-600" /> Complete Fare Breakdown
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                {/* Base fare */}
                <div className="flex justify-between items-center">
                  <span>Base Outstation Fare{isRoundTripBooking ? ` (${tripDurationDays} ${tripDurationDays === 1 ? "Day" : "Days"})` : ""}</span>
                  <span className="font-bold text-slate-900">₹{parsed.baseFare.toLocaleString()}</span>
                </div>

                {/* Driver Allowance */}
                <div className="flex justify-between items-center">
                  <span>{parsed.driverAllowanceLabel}</span>
                  <span className="font-bold text-slate-900">₹{parsed.driverAllowance.toLocaleString()}</span>
                </div>

                {/* GST */}
                <div className="flex justify-between items-center">
                  <span>{parsed.gstLabel}</span>
                  <span className="font-bold text-slate-900">₹{parsed.taxes.toLocaleString()}</span>
                </div>

                {/* Itemized Add-ons */}
                {parsed.hasLessThan3Years && (
                  <div className="flex justify-between items-center text-amber-800">
                    <span>Vehicle &lt; 3 Years Old</span>
                    <span className="font-bold">+ ₹{parsed.lessThan3YearsFee}</span>
                  </div>
                )}

                {parsed.hasLuggageCarrier && (
                  <div className="flex justify-between items-center text-amber-800">
                    <span>Cab with Luggage Carrier</span>
                    <span className="font-bold">+ ₹{parsed.luggageCarrierFee}</span>
                  </div>
                )}

                {parsed.hasLanguageChauffeur && (
                  <div className="flex justify-between items-center text-amber-800">
                    <span>Language Chauffeur ({parsed.chauffeurLanguage})</span>
                    <span className="font-bold">+ ₹{parsed.languageChauffeurFee}</span>
                  </div>
                )}

                {parsed.hasExpressway && (
                  <div className="flex justify-between items-center text-amber-800">
                    <span>Expressway Toll FASTag</span>
                    <span className="font-bold">+ ₹{parsed.expresswayFee}</span>
                  </div>
                )}

                {/* Pet Travel Charges */}
                {parsed.isPetFriendly && (
                  <div className="flex justify-between items-center text-amber-900 font-bold bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
                    <span className="flex items-center gap-1.5">
                      🐾 <span>Pet Travel Charges ({parsed.petType} × {parsed.petCount})</span>
                    </span>
                    <span className="font-mono">{parsed.petCharge > 0 ? `+ ₹${parsed.petCharge.toLocaleString()}` : "FREE (₹0)"}</span>
                  </div>
                )}

                {/* FASTag Toll */}
                <div className="flex justify-between items-center">
                  <span>FASTag Highway Toll</span>
                  <span className="text-emerald-700 font-bold">Included (₹0)</span>
                </div>

                {/* Coupon discount if any */}
                {parsed.couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-bold">
                    <span>Coupon Applied ({parsed.couponCode || "Discount"})</span>
                    <span>- ₹{parsed.couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                {/* Total Booking Fare */}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>Total Booking Amount</span>
                  <span className="text-base text-slate-950 font-black">₹{parsed.totalFare.toLocaleString()}</span>
                </div>

                {/* Advance Received */}
                <div className="flex justify-between items-center text-emerald-700 font-extrabold bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60">
                  <span>Advance Received</span>
                  <span>✓ ₹{parsed.advancePaid.toLocaleString()}</span>
                </div>

                {/* Payment Status */}
                <div className="flex justify-between items-center text-slate-500 pt-1">
                  <span>Payment Status</span>
                  <span className="font-mono uppercase text-[11px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {booking.paymentStatus || "FULL_PAID"}
                  </span>
                </div>

                {/* Remaining Due to driver if any */}
                {parsed.dueAmount > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm font-black text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
                    <span>Payable to Chauffeur</span>
                    <span className="text-amber-800">₹{parsed.dueAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Tax Invoice Badge */}
              <div className="p-3.5 rounded-2xl bg-slate-50 text-[11px] text-slate-500 space-y-1 border border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Official Tax Invoice (SAC: 9966)
                </div>
                <p>Includes GST, commercial passenger permits, and driver trip allowance.</p>
                <div className="pt-1.5">
                  <Link
                    href={`/account/bookings/${booking.bookingReference || booking.id}/invoice`}
                    className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-extrabold text-xs underline"
                  >
                    Download / Print Tax Invoice ➔
                  </Link>
                </div>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-600" /> 24/7 Grab Rentals Trip Support
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Need to change pickup time, update address, or require special assistance? Contact our dispatch desk anytime.
              </p>
              <div className="pt-1">
                <a
                  href="tel:+919071100200"
                  className="inline-flex items-center gap-1.5 font-bold text-xs text-amber-700 hover:text-amber-800"
                >
                  📞 Call Operations Helpline (+91 90711 00200)
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* CUSTOM CONFIRMATION MODAL POPUP */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="w-13 h-13 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">Cancel This Booking?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to cancel booking <span className="font-bold text-slate-900">{booking.bookingReference || bookingId}</span>?
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Free Cancellation Policy
              </div>
              <p className="text-amber-800 leading-relaxed">
                Cancellations requested before chauffeur departure incur no penalty. Advance refunds are processed back within 3-5 business days.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="px-5 py-2.5 rounded-xl font-black text-xs bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel Booking</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SLEEK FLOATING TOAST POPUP */}
      {toast && (
        <div className="fixed top-6 right-6 z-[10000] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl border bg-white animate-in slide-in-from-top-3 duration-200 border-slate-200/90 max-w-sm">
          {toast.type === "success" ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          <p className="text-xs font-bold text-slate-800 leading-snug flex-1">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </main>
  );
}
