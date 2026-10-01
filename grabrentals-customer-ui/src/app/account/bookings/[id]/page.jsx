"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
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
  XCircle
} from "lucide-react";
import { customerApi } from "@/lib/customerApi";

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

export default function TripDetailsTrackingPage({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams?.id || "";
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function fetchBooking() {
      if (!bookingId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await customerApi.getBookingById(bookingId);
        if (!isCancelled && res?.data) {
          setBooking(res.data);
        }
      } catch (err) {
        console.warn("Error fetching booking by ID:", err);
        // Try fallback to session cache if same reference
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

  const handleCancelBooking = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    try {
      const res = await customerApi.cancelBooking(bookingId);
      if (res?.data) {
        setBooking(res.data);
      }
      alert("Booking has been cancelled.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
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
  const totalFare = Number(booking.totalFare || 0);
  const advancePaid = Number(booking.advancePaid || 0);
  const dueAmount = totalFare > advancePaid ? totalFare - advancePaid : 0;
  const isCancelledState = booking.status === "CANCELLED";

  // Determine stepper state from booking.status
  const statusStepMap = {
    PENDING_ALLOCATION: 1,
    REASSIGN_REQUIRED: 1,
    ASSIGNED_TO_VENDOR: 2,
    CONFIRMED: 3,
    IN_TRANSIT: 4,
    COMPLETED: 5,
    CANCELLED: 0
  };
  const currentStep = statusStepMap[booking.status] || 1;

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
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                isCancelledState 
                  ? "bg-rose-50 border border-rose-200 text-rose-700" 
                  : "bg-emerald-50 border border-emerald-200 text-emerald-700 animate-pulse"
              }`}>
                ● {booking.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
              {booking.pickupCity} ➔ {booking.dropCity}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {booking.tripType === "ROUND_TRIP" ? "Round Trip" : "One-Way"} • Scheduled for {dateStr} at {timeStr}
            </p>
          </div>

          {/* Ride OTP Box if confirmed */}
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

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
              {[
                { stepNum: 1, label: "Booking Placed", desc: "Order recorded" },
                { stepNum: 2, label: "Vendor Dispatched", desc: "Assigned to vendor" },
                { stepNum: 3, label: "Ride Confirmed", desc: "Driver & OTP issued" },
                { stepNum: 4, label: "In Transit", desc: "On-road telemetry" },
                { stepNum: 5, label: "Completed", desc: "Drop-off & invoice" },
              ].map((s) => {
                const isDone = currentStep > s.stepNum || (currentStep === s.stepNum && currentStep === 5);
                const isCurrent = currentStep === s.stepNum && currentStep !== 5;

                return (
                  <div key={s.stepNum} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCurrent
                        ? "bg-amber-500 text-slate-950 ring-4 ring-amber-100"
                        : isDone
                        ? "bg-emerald-600 text-white" 
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}>
                      {isDone ? "✓" : s.stepNum}
                    </div>
                    <div>
                      <h4 className={`text-xs font-extrabold ${isCurrent ? "text-amber-700" : "text-slate-900"}`}>
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

        {/* 2-Column Grid: Details & Fare */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Chauffeur & Vehicle */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Assigned Asset & Chauffeur
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle</span>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    {booking.assignedVehicle ? `${booking.assignedVehicle.model} (${booking.assignedVehicle.vehicleNumber})` : booking.vehicleCategory}
                  </h4>
                  <p className="text-[11px] text-slate-500">Commercial Outstation Cab</p>
                </div>

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

              {/* Route specifics */}
              <div className="pt-2 space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-400 text-[10px] uppercase">Pickup Point</span>
                    <p className="font-bold text-slate-800">{booking.pickupAddress}</p>
                  </div>
                </div>

                {booking.stops && (
                  booking.stops.split(/[|,]/).map((s) => s.trim()).filter(Boolean).map((stop, sIdx, arr) => (
                    <div key={sIdx} className="flex items-start gap-2.5 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-700 text-[10px] uppercase">
                          Intermediate Halt {arr.length > 1 ? `#${sIdx + 1}` : ""}
                        </span>
                        <p className="font-bold text-slate-900">{stop}</p>
                      </div>
                    </div>
                  ))
                )}

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-400 text-[10px] uppercase">Drop Destination</span>
                    <p className="font-bold text-slate-800">{booking.dropAddress}</p>
                  </div>
                </div>
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
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel Trip"}
                </button>
              </div>
            )}

          </div>

          {/* Right: Payment Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Financial Summary
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Total Booking Amount</span>
                  <span className="font-bold text-slate-900">₹{totalFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-700 font-bold">
                  <span>Advance Received</span>
                  <span>✓ ₹{advancePaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Payment Status</span>
                  <span className="font-mono uppercase text-[11px] font-bold">{booking.paymentStatus}</span>
                </div>
                {dueAmount > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
                    <span>Payable to Driver</span>
                    <span className="text-amber-700">₹{dueAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1 font-bold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Official Tax Invoice
                </div>
                <p>Includes GST, state passenger permits, and driver trip allowance.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
