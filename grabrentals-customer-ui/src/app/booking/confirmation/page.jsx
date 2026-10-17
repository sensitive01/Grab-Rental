"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resolveCarModelAndImage } from "@/lib/vehicleUtils";
import { 
  CheckCircle2, 
  MapPin, 
  Car, 
  Calendar, 
  Clock, 
  Download, 
  ArrowRight, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Info,
  Loader2,
  KeyRound
} from "lucide-react";
import { customerApi } from "@/lib/customerApi";
import { useLanguage } from "@/context/LanguageContext";

function formatDateTime(isoString) {
  if (!isoString) return { dateStr: "Scheduled Departure", timeStr: "07:00 AM" };
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { dateStr: isoString, timeStr: "" };
    const dateStr = d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    const timeStr = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
    return { dateStr, timeStr };
  } catch {
    return { dateStr: isoString, timeStr: "" };
  }
}

function BookingConfirmationContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadBookingData() {
      // 1. Instant cache check from session
      if (typeof window !== "undefined") {
        try {
          const cached = sessionStorage.getItem("grab_confirmed_booking");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (!rawId || parsed.bookingReference === rawId || parsed.id === rawId) {
              setBooking(parsed);
              setLoading(false);
            }
          }
        } catch (e) {
          console.warn("Could not parse cached booking:", e);
        }
      }

      // 2. Fetch live data from backend if id is provided
      if (rawId) {
        try {
          const res = await customerApi.getPublicBooking(rawId);
          if (!isCancelled && res && res.data) {
            setBooking(res.data);
          }
        } catch (err) {
          console.warn("Public booking fetch error, fallback to session state:", err);
          // Try authenticated getBookingById
          try {
            const authRes = await customerApi.getBookingById(rawId);
            if (!isCancelled && authRes && authRes.data) {
              setBooking(authRes.data);
            }
          } catch (authErr) {
            console.warn("Auth booking fetch also failed:", authErr);
          }
        } finally {
          if (!isCancelled) {
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    }

    loadBookingData();

    return () => {
      isCancelled = true;
    };
  }, [rawId]);

  const bookingRef = booking?.bookingReference || rawId || "GR-CONFIRMED";

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { dateStr, timeStr } = formatDateTime(booking?.pickupDateTime);

  if (loading && !booking) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-bold text-sm">Verifying confirmed booking...</p>
        </div>
      </main>
    );
  }

  const pickupCity = booking?.pickupCity || "Pickup Location";
  const dropCity = booking?.dropCity || "Destination";
  const pickupAddress = booking?.pickupAddress || `${pickupCity} City Center`;
  const dropAddress = booking?.dropAddress || `${dropCity} Area`;
  const totalFare = Number(booking?.totalFare || 0);
  const advancePaid = Number(booking?.advancePaid || 0);
  const dueAmount = totalFare > advancePaid ? totalFare - advancePaid : 0;
  const vehicleCategory = booking?.vehicleCategory || "SEDAN";

  const { modelName, carImage, categoryLabel } = resolveCarModelAndImage(booking);

  const stopsList = [];
  if (booking?.stops) {
    if (Array.isArray(booking.stops)) {
      booking.stops.forEach((s) => { if (s && s.trim()) stopsList.push(s.trim()); });
    } else if (typeof booking.stops === "string" && booking.stops.trim()) {
      booking.stops.split("|").forEach((s) => { if (s && s.trim()) stopsList.push(s.trim()); });
    }
  }

  // Session fallback if active booking object in legacy cache was saved prior to schema update
  if (stopsList.length === 0 && typeof window !== "undefined") {
    try {
      const confirmed = sessionStorage.getItem("grab_confirmed_booking");
      if (confirmed) {
        const parsed = JSON.parse(confirmed);
        const s = parsed.stops || parsed.trip?.stops;
        if (s) {
          const list = Array.isArray(s) ? s : String(s).split("|");
          list.forEach(item => { if (item && item.trim()) stopsList.push(item.trim()); });
        }
      }
      if (stopsList.length === 0) {
        const selected = sessionStorage.getItem("grab_selected_booking");
        if (selected) {
          const parsed = JSON.parse(selected);
          const s = parsed.trip?.stops;
          if (s) {
            const list = Array.isArray(s) ? s : String(s).split("|");
            list.forEach(item => { if (item && item.trim()) stopsList.push(item.trim()); });
          }
        }
      }
    } catch (e) {
      console.warn("Could not read stops fallback from session:", e);
    }
  }

  const isPaymentUnderReview = 
    booking?.status === "PENDING_PAYMENT_VERIFICATION" || 
    booking?.paymentStatus === "UNDER_REVIEW" ||
    Boolean(booking?.paymentProofUrl && booking?.status !== "CONFIRMED" && booking?.status !== "ALLOCATED" && booking?.status !== "ON_TRIP" && booking?.status !== "COMPLETED");

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Success Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs text-center relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-2 ${isPaymentUnderReview ? "bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" : "bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500"}`}></div>
          
          <div className={`w-16 h-16 rounded-full ${isPaymentUnderReview ? "bg-amber-50 text-amber-600 border-4 border-amber-100" : "bg-emerald-50 text-emerald-600 border-4 border-emerald-100"} flex items-center justify-center mx-auto mb-4 shadow-inner`}>
            {isPaymentUnderReview ? <Clock className="w-8 h-8 animate-pulse" /> : <CheckCircle2 className="w-8 h-8" />}
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${isPaymentUnderReview ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-emerald-50 border border-emerald-200 text-emerald-700"} text-xs font-bold mb-3`}>
            <Sparkles className="w-3.5 h-3.5" /> {isPaymentUnderReview ? "Payment Under Review • Fast-Track Verification" : "100% Guaranteed Ride • Verified Commercial Chauffeur"}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isPaymentUnderReview ? "Booking Placed — Verifying Payment" : t("booking_confirmed")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 max-w-md mx-auto leading-relaxed">
            {isPaymentUnderReview
              ? "We received your UPI payment screenshot! Our central operations desk is verifying your transaction reference. Fleet and chauffeur allocation will be confirmed immediately upon verification."
              : "Your outstation trip request is confirmed in our dispatch system. A verified chauffeur is being assigned."}
          </p>

          {/* Booking ID Pill */}
          <div className="mt-5 inline-flex items-center gap-3 px-5 py-2.5 bg-slate-100/90 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Booking Reference:</span>
            <span className="text-sm font-black text-slate-900 font-mono tracking-wider">{bookingRef}</span>
            <button 
              onClick={handleCopy}
              className="text-slate-500 hover:text-slate-800 transition-colors p-1"
              title="Copy Booking ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dynamic Trip Overview Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900">{t("trip_overview")}</h2>
              <p className="text-xs text-slate-500">
                {booking?.tripType === "ROUND_TRIP" ? "Round Trip" : "One-Way"} Outstation Ride
                {stopsList.length > 0 && <span className="text-amber-700 font-bold ml-1.5">• Via {stopsList.join(", ")}</span>}
              </p>
              {Boolean(booking?.isPetFriendly) && (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                    🐾 Pet Friendly Cab Reserved ({booking?.petType || "Pet"} × {booking?.petCount || 1})
                  </span>
                </div>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${isPaymentUnderReview ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
              {isPaymentUnderReview ? "Pending Payment Verification" : (booking?.status || "CONFIRMED")}
            </span>
          </div>

          {/* Dynamic Route Section */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {/* Pickup */}
            <div className="relative">
              <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-emerald-500 bg-white ring-4 ring-emerald-50"></span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Location ({pickupCity})</span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">{pickupAddress}</p>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {dateStr}</span>
                  {timeStr && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {timeStr}</span>}
                </div>
              </div>
            </div>

            {/* Intermediate Stops */}
            {stopsList.map((stopCity, sIdx) => (
              <div key={sIdx} className="relative animate-fade-in">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-amber-500 bg-amber-500 ring-4 ring-amber-100 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                      Intermediate Stop {stopsList.length > 1 ? `#${sIdx + 1}` : ""}
                    </span>
                    <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Route Halt Included
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{stopCity}</p>
                  <p className="text-xs text-slate-500 font-medium">Scheduled en-route halt with chauffeur</p>
                </div>
              </div>
            ))}

            {/* Drop Destination */}
            <div className="relative">
              <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-amber-500 bg-white ring-4 ring-amber-50"></span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Drop Destination ({dropCity})</span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">{dropAddress}</p>
              </div>
            </div>

            {/* Round Trip Return Leg */}
            {booking?.tripType === "ROUND_TRIP" && (
              <div className="relative animate-fade-in">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-teal-500 bg-white ring-4 ring-teal-50"></span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                      Round Trip Return ({pickupCity})
                    </span>
                    <span className="text-[9px] font-extrabold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Return Leg Included
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{pickupAddress}</p>
                  {(booking?.returnDateTime || booking?.dropDate) && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        Return: {formatDateTime(booking?.returnDateTime || booking?.dropDate).dateStr}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Vehicle & Chauffeur Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-2xs">
                <Image
                  src={carImage}
                  alt={modelName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Reserved Vehicle</span>
                <h4 className="text-xs font-extrabold text-slate-900 truncate">{modelName}</h4>
                <p className="text-[11px] text-slate-500 font-medium">{categoryLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chauffeur Dispatch</span>
                <h4 className="text-xs font-extrabold text-slate-900">
                  {booking?.driverName || booking?.assignedDriver?.name || "Allocating via Operations"}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">SMS & WhatsApp Alerts 2h Prior</p>
              </div>
            </div>
          </div>

          {/* Ride OTP if available */}
          {booking?.rideOtp && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">Start Ride OTP</span>
                  <p className="text-xs text-amber-900 font-medium">Share with chauffeur at vehicle boarding</p>
                </div>
              </div>
              <span className="text-2xl font-black font-mono tracking-widest text-slate-900">{booking.rideOtp}</span>
            </div>
          )}

          {/* UPI Verification Info Card if under review */}
          {isPaymentUnderReview && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-amber-950">Payment Verification In Progress</h4>
                    <p className="text-[11px] text-amber-800">Reviewed by Operations within 15 minutes</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  UNDER REVIEW
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60">
                {booking?.paymentUtrNumber && (
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted UTR Reference</span>
                    <span className="font-mono font-black text-slate-800 text-xs">{booking.paymentUtrNumber}</span>
                  </div>
                )}
                {booking?.paymentProofUrl && (
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Proof Receipt</span>
                      <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                      </span>
                    </div>
                    <a
                      href={booking.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-300 transition-colors"
                    >
                      View Receipt
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Payment Summary Box */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2 text-xs">
            <div className="flex justify-between items-center font-semibold text-slate-600">
              <span>Total Ride Value (GST & Taxes Included)</span>
              <span className="font-extrabold text-slate-900 text-sm">₹{totalFare.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-emerald-700">
              <span>{t("amount_paid")}</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-mono">
                ✓ ₹{advancePaid.toLocaleString()}
              </span>
            </div>
            {dueAmount > 0 && (
              <div className="flex justify-between items-center font-extrabold text-slate-900 pt-2 border-t border-amber-200/50">
                <span>Balance Payable to Chauffeur</span>
                <span className="text-base text-amber-700 font-black">₹{dueAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Policy Notice */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex gap-3 text-xs text-blue-900">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">What happens next?</p>
            <p className="text-blue-800/90 leading-relaxed">
              Our central operations engine allocates the best-rated vehicle and verified chauffeur. Your chauffeur details and car registration number will arrive via SMS and WhatsApp before your pickup time.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            href={`/account/bookings/${encodeURIComponent(bookingRef)}`}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            <span>Track Trip & Live Status</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-all shadow-xs"
          >
            <span>{t("my_bookings")}</span>
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-slate-500 font-bold text-sm animate-pulse">Loading confirmed booking...</div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}
