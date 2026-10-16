"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { resolveCarModelAndImage, fetchAndCacheAdminVehicleModels } from "@/lib/vehicleUtils";
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
  Loader2,
  Navigation
} from "lucide-react";
import { customerApi } from "@/lib/customerApi";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { useLanguage } from "@/context/LanguageContext";
import { findCityCoordinates } from "@/lib/cities";
import MapView from "@/components/booking/MapView";

export default function CustomerDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [expandedMaps, setExpandedMaps] = useState({});

  const toggleMap = (id) => {
    setExpandedMaps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

        // 3. Dynamically fetch admin-configured vehicle models (from Admin > Vehicle Models)
        let adminModels = [];
        try {
          adminModels = await fetchAndCacheAdminVehicleModels();
        } catch {}

        // 4. Map into presentation format
        const formatted = liveBookings.map(b => formatBookingItem(b, adminModels));

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

  function formatBookingItem(b, adminModels = []) {
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

    // Format Pickup Date & Time
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

    // Format Booking Creation Date & Time
    let bookedDateStr = null;
    let bookedTimeStr = null;
    let bookedOnStr = null;
    const rawCreated = b.createdAt || b.created_at;
    if (rawCreated) {
      try {
        const cdt = new Date(rawCreated);
        if (!isNaN(cdt.getTime())) {
          bookedDateStr = cdt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
          bookedTimeStr = cdt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
          bookedOnStr = `${bookedDateStr} • ${bookedTimeStr}`;
        }
      } catch {}
    }

    // Coordinates for the directions route map
    const pickupCoords = b.pickupCoords ||
      (b.pickupLat && b.pickupLng ? { lat: Number(b.pickupLat), lng: Number(b.pickupLng) } : null) ||
      findCityCoordinates(b.pickupAddress || b.pickupCity);

    const dropCoords = b.dropCoords ||
      findCityCoordinates(b.dropAddress || b.dropCity);

    let stopsCoords = b.stopsCoords || null;
    if (!stopsCoords && b.stops) {
      const stopsArr = typeof b.stops === "string" ? b.stops.split("|").map((s) => s.trim()).filter(Boolean) : (Array.isArray(b.stops) ? b.stops : []);
      stopsCoords = stopsArr.map((s, idx) => {
        const c = findCityCoordinates(s);
        return c ? { lat: c.lat, lng: c.lng, label: `Halt #${idx + 1}: ${s}` } : null;
      }).filter(Boolean);
    }

    const total = Number(b.totalFare || 0);
    const advance = Number(b.advancePaid || 0);
    const due = Number(b.dueAmount != null ? b.dueAmount : Math.max(0, total - advance));

    const { modelName, carImage, categoryLabel } = resolveCarModelAndImage(b, adminModels);

    return {
      id: b.bookingReference || b.id || "GR-REF",
      rawId: b.id,
      tripType: (b.tripType || "ONE_WAY").replace(/_/g, " "),
      from: b.pickupAddress || b.pickupCity || "Pickup Location",
      to: b.dropAddress || b.dropCity || "Destination",
      distance: b.distance ? `${b.distance} km` : (b.distanceKm ? `${b.distanceKm} km` : "Direct Outstation"),
      date: dateStr,
      time: timeStr,
      bookedDate: bookedDateStr,
      bookedTime: bookedTimeStr,
      bookedOn: bookedOnStr,
      pickupCoords,
      dropCoords,
      stopsCoords,
      car: modelName,
      carImage: carImage,
      carType: categoryLabel,
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
              {t("my_trips_title")}
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
              <Headphones className="w-3.5 h-3.5 text-amber-600" /> {t("support_24_7")}
            </Link>
            <Link
              href="/account/settings"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5" /> {t("profile_settings")}
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
            >
              <Car className="w-4 h-4" /> {t("book_new_ride")}
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {[
            { id: "all", label: t("all_trips"), count: bookings.length },
            { id: "ongoing", label: t("ongoing_trips"), count: bookings.filter(b => b.status === "ongoing").length },
            { id: "upcoming", label: t("upcoming_trips"), count: bookings.filter(b => b.status === "upcoming").length },
            { id: "completed", label: t("completed_trips"), count: bookings.filter(b => b.status === "completed").length },
            { id: "cancelled", label: t("cancelled_trips"), count: bookings.filter(b => b.status === "cancelled").length }
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
            <p className="text-sm font-bold text-slate-700">{t("loading_bookings")}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">{t("no_bookings_title")}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === "all" 
                  ? t("no_bookings_desc")
                  : t("no_trips_found")}
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-600/20"
            >
              <Car className="w-4 h-4" /> {t("book_new_ride")}
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
                <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-mono font-black text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      {booking.id}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{booking.tripType}</span>
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
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Location</span>
                        <p className="text-sm font-extrabold text-slate-900 leading-snug">{booking.from}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination</span>
                        <p className="text-sm font-extrabold text-slate-900 leading-snug">{booking.to}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
                        {/* 1. Pickup Date & Time */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                            Pickup Date & Time
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <span className="flex items-center gap-1.5 bg-amber-50/90 text-slate-900 px-2.5 py-1 rounded-lg border border-amber-200/70 font-bold whitespace-nowrap">
                              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" /> {booking.date}
                            </span>
                            <span className="flex items-center gap-1.5 bg-amber-50/90 text-slate-900 px-2.5 py-1 rounded-lg border border-amber-200/70 font-bold whitespace-nowrap">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" /> {booking.time}
                            </span>
                          </div>
                          {/* <span className="text-slate-400 font-medium text-[11px] block mt-0.5">• {booking.distance}</span> */}
                        </div>

                        {/* 2. Booked Date & Time */}
                        {booking.bookedDate && booking.bookedTime && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                              Booked Date & Time
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <span className="flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-bold whitespace-nowrap">
                                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {booking.bookedDate}
                              </span>
                              <span className="flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-bold whitespace-nowrap">
                                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {booking.bookedTime}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Map Toggle Button */}
                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={() => toggleMap(booking.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:border-amber-300"
                        >
                          <Navigation className="w-3.5 h-3.5 text-amber-600" />
                          <span>{expandedMaps[booking.id] ? "Hide Directions Map" : "View Directions Map"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle & Chauffeur (Col 7-9) */}
                  <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Vehicle</span>
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-14 sm:w-22 sm:h-15 rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 shrink-0 shadow-2xs">
                          <Image
                            src={booking.carImage}
                            alt={booking.car}
                            fill
                            sizes="(max-width: 640px) 80px, 96px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight" title={booking.car}>
                            {booking.car}
                          </h4>
                          <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{booking.carType}</p>
                          <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            Guaranteed AC
                          </span>
                        </div>
                      </div>
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

                {/* Expandable Directions Map ("Here") */}
                {expandedMaps[booking.id] && (
                  <div className="border-t border-slate-100 p-4 sm:p-6 bg-slate-50/70 animate-in fade-in duration-200">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                          <Navigation className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">Driving Highway Route & Directions</h5>
                          <p className="text-[11px] text-slate-500">{booking.from} ➔ {booking.to}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {booking.distance}
                      </span>
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                      <MapView
                        pickup={booking.pickupCoords}
                        drop={booking.dropCoords}
                        stops={booking.stopsCoords || []}
                        overrideDistance={booking.distance}
                        className="h-64 sm:h-72 w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
