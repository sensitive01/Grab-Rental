"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Car, 
  Settings, 
  Calendar, 
  MapPin, 
  Clock, 
  Phone, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight, 
  KeyRound, 
  UserCheck, 
  RotateCcw, 
  Headphones, 
  Star,
  Loader2
} from "lucide-react";
import { customerApi } from "@/lib/customerApi";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadCustomerBookings() {
      try {
        const currentUser = getCurrentUser();
        setUser(currentUser);

        let liveBookings = [];

        // 1. Fetch real bookings from backend if authenticated
        if (isAuthenticated()) {
          try {
            const res = await customerApi.getBookings();
            if (res && res.data && Array.isArray(res.data)) {
              liveBookings = res.data;
            }
          } catch (err) {
            console.warn("[Dashboard] Could not fetch backend customer bookings:", err);
          }
        }

        // 2. Check recently confirmed booking from sessionStorage if available
        if (typeof window !== "undefined") {
          try {
            const stored = sessionStorage.getItem("grab_confirmed_booking");
            if (stored) {
              const parsed = JSON.parse(stored);
              const exists = liveBookings.some(
                b => (b.bookingReference && b.bookingReference === parsed.bookingReference) || (b.id && b.id === parsed.id)
              );
              if (!exists) {
                liveBookings.unshift(parsed);
              }
            }
          } catch (err) {
            console.warn("[Dashboard] Error reading sessionStorage booking:", err);
          }
        }

        // 3. Map into presentation format
        const formatted = liveBookings.map(b => formatBookingItem(b));

        if (!isCancelled) {
          setBookings(formatted);
        }
      } catch (err) {
        console.error("[Dashboard] Error loading bookings:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadCustomerBookings();

    return () => {
      isCancelled = true;
    };
  }, []);

  function formatBookingItem(b) {
    const rawStatus = (b.status || "PENDING").toUpperCase();
    
    let tabCategory = "upcoming";
    let statusLabel = "Booking Received • Assigning Chauffeur";
    let statusColor = "bg-blue-50 text-blue-700 border-blue-200";

    if (rawStatus === "COMPLETED") {
      tabCategory = "completed";
      statusLabel = "Trip Completed";
      statusColor = "bg-slate-100 text-slate-700 border-slate-200";
    } else if (rawStatus === "CANCELLED") {
      tabCategory = "cancelled";
      statusLabel = "Trip Cancelled";
      statusColor = "bg-rose-50 text-rose-700 border-rose-200";
    } else if (rawStatus === "ON_THE_WAY" || rawStatus === "IN_TRANSIT") {
      tabCategory = "ongoing";
      statusLabel = rawStatus === "IN_TRANSIT" ? "Trip In Progress" : "Chauffeur En Route";
      statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse";
    } else if (rawStatus === "CONFIRMED" || b.driverName) {
      tabCategory = "upcoming";
      statusLabel = "Confirmed • Driver Assigned";
      statusColor = "bg-blue-50 text-blue-700 border-blue-200";
    }

    // Format Date & Time
    let dateStr = "Upcoming Trip";
    let timeStr = "Scheduled";
    if (b.pickupDateTime) {
      try {
        const dt = new Date(b.pickupDateTime);
        if (!isNaN(dt.getTime())) {
          dateStr = dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
          timeStr = dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
        }
      } catch {
        // keep fallback
      }
    }

    const total = Number(b.totalFare || 0);
    const advance = Number(b.advancePaid || 0);
    const due = Number(b.dueAmount != null ? b.dueAmount : Math.max(0, total - advance));

    return {
      id: b.bookingReference || b.id || "GR-REF",
      rawId: b.id,
      tripType: (b.tripType || "ONE_WAY").replace(/_/g, " "),
      from: b.pickupAddress || b.pickupCity || "Pickup Location",
      to: b.dropAddress || b.dropCity || "Destination",
      distance: b.distance ? `${b.distance} km` : "Direct Outstation",
      date: dateStr,
      time: timeStr,
      car: b.vehicleModel || `${b.vehicleCategory || "Sedan"} Cab`,
      carType: b.vehicleType || `${b.vehicleCategory || "Outstation"} • AC`,
      status: tabCategory,
      rawStatus,
      statusLabel,
      statusColor,
      driver: b.driverName ? {
        name: b.driverName,
        phone: b.driverPhone || "+91 Chauffeur On-Duty",
        rating: "4.9",
        plate: b.vehicleNumber || "Verified Commercial Cab"
      } : null,
      otp: b.rideOtp || null,
      totalFare: `₹${total.toLocaleString()}`,
      paidAmount: `₹${advance.toLocaleString()}`,
      dueAmount: `₹${due.toLocaleString()}`,
      paymentStatus: b.paymentStatus === "FULL_PAID" ? "Fully Paid" : b.paymentStatus === "ADVANCE_PAID" ? "Advance Paid (20%)" : "Payment Pending"
    };
  }

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Trips & Bookings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track live chauffeur status, view upcoming itineraries, and download GST tax invoices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/support"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            >
              <Headphones className="w-3.5 h-3.5 text-amber-600" /> 24/7 Support
            </Link>
            <Link
              href="/account/settings"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5" /> Profile Settings
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
            >
              <Car className="w-4 h-4" /> Book New Ride
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {[
            { id: "all", label: "All Trips", count: bookings.length },
            { id: "ongoing", label: "Ongoing", count: bookings.filter(b => b.status === "ongoing").length },
            { id: "upcoming", label: "Upcoming", count: bookings.filter(b => b.status === "upcoming").length },
            { id: "completed", label: "Completed", count: bookings.filter(b => b.status === "completed").length },
            { id: "cancelled", label: "Cancelled", count: bookings.filter(b => b.status === "cancelled").length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                activeTab === tab.id ? "bg-slate-700 text-amber-300" : "bg-slate-100 text-slate-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">Loading your real-time bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">No bookings found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === "all" 
                  ? "You have not made any bookings yet. Ready to travel? Book your first outstation cab now!"
                  : `There are currently no ${activeTab} trips in your account.`}
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-600/20"
            >
              <Car className="w-4 h-4" /> Book a Ride Now
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Header Bar */}
                <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-black text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                      {booking.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{booking.tripType}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${booking.statusColor}`}>
                      {booking.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  
                  {/* Route & Schedule (Col 1-6) */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup</span>
                        <p className="text-sm font-extrabold text-slate-900 leading-snug">{booking.from}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination</span>
                        <p className="text-sm font-extrabold text-slate-900 leading-snug">{booking.to}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-4 h-4 text-amber-500" /> {booking.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <Clock className="w-4 h-4 text-amber-500" /> {booking.time}
                      </span>
                      <span className="text-slate-400">• {booking.distance}</span>
                    </div>
                  </div>

                  {/* Vehicle & Chauffeur (Col 7-9) */}
                  <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle</span>
                      <h4 className="text-xs font-extrabold text-slate-900">{booking.car}</h4>
                      <p className="text-[11px] text-slate-500">{booking.carType}</p>
                    </div>

                    {booking.driver ? (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> {booking.driver.name}
                          </span>
                          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            ★ {booking.driver.rating}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-500">{booking.driver.plate}</p>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-50/60 border border-dashed border-slate-200 text-[11px] font-medium text-slate-500">
                        Chauffeur details will be shared 2 hours before departure.
                      </div>
                    )}

                    {booking.otp && (
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[11px] font-bold text-slate-600">Ride OTP:</span>
                        <span className="text-xs font-mono font-black text-amber-700">{booking.otp}</span>
                      </div>
                    )}
                  </div>

                  {/* Fare & Actions (Col 10-12) */}
                  <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Fare</span>
                      <div className="text-xl font-black text-slate-900">{booking.totalFare}</div>
                      <span className="text-[11px] font-bold text-emerald-600">{booking.paymentStatus}</span>
                      {booking.dueAmount !== "₹0" && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{booking.dueAmount} due to driver</p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2">
                      <Link
                        href={`/account/bookings/${booking.id}`}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs"
                      >
                        <span>Trip Details & Tracking</span>
                        <ChevronRight className="w-4 h-4 text-amber-400" />
                      </Link>

                      {booking.status === "completed" ? (
                        <div className="space-y-1.5">
                          <Link
                            href={`/account/bookings/${booking.id}/rate`}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all shadow-2xs"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Rate & Review Trip
                          </Link>
                          <Link
                            href={`/account/bookings/${booking.id}/invoice`}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-400" /> Download Invoice
                          </Link>
                        </div>
                      ) : (
                        <Link
                          href="/support"
                          className="w-full flex items-center justify-center gap-1 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold"
                        >
                          Need Assistance?
                        </Link>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
