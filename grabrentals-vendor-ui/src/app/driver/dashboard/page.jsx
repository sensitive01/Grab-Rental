"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Navigation, 
  MapPin, 
  Car, 
  Phone, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  Loader2,
  CheckCircle2,
  Receipt,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  LogOut,
  User,
  Compass,
  AlertCircle
} from "lucide-react";
import StartRideModal from "@/components/trips/StartRideModal";
import TripClosingModal from "@/components/trips/TripClosingModal";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import DataTable from "@/components/ui/DataTable";
import { driverApi } from "@/lib/vendorApi";
import { getCurrentUser, isAuthenticated, logout } from "@/lib/auth";
import { formatINR } from "@/lib/utils";

export default function DriverDashboardPage() {
  const router = useRouter();

  const [driverProfile, setDriverProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, ACTIVE, UPCOMING, COMPLETED

  // Modals
  const [startingTrip, setStartingTrip] = useState(null);
  const [closingTrip, setClosingTrip] = useState(null);

  // Authentication check
  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.replace("/driver/login");
      return;
    }
    setCurrentUser(getCurrentUser());
  }, [router]);

  const loadData = async (isSilent = false) => {
    try {
      if (isSilent) setRefreshing(true);
      else setLoading(true);

      const [profileRes, tripsRes] = await Promise.all([
        driverApi.getProfile().catch(() => null),
        driverApi.getTrips().catch(() => [])
      ]);

      if (profileRes) setDriverProfile(profileRes);
      const tripList = Array.isArray(tripsRes) ? tripsRes : [];
      setTrips(tripList);

      const hasActive = tripList.some(t => {
        const st = String(t.rawStatus || t.status || "").toUpperCase();
        return st === "ON_THE_WAY" || st === "IN_TRANSIT" || st === "ACTIVE";
      });
      const hasUpcoming = tripList.some(t => {
        const st = String(t.rawStatus || t.status || "").toUpperCase();
        return st === "ASSIGNED_TO_VENDOR" || st === "CONFIRMED" || st === "ASSIGNED";
      });
      const hasCompleted = tripList.some(t => {
        const st = String(t.rawStatus || t.status || "").toUpperCase();
        return st === "COMPLETED";
      });

      // Automatically switch to the best tab if ACTIVE was empty
      setActiveTab((prev) => {
        if (prev === "ACTIVE" && !hasActive) {
          if (hasCompleted) return "COMPLETED";
          if (hasUpcoming) return "UPCOMING";
          return "ALL";
        }
        return prev;
      });
    } catch (err) {
      console.error("Failed to load driver dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/driver/login");
  };

  // Counts for tabs
  const counts = useMemo(() => {
    let active = 0;
    let upcoming = 0;
    let completed = 0;

    trips.forEach((t) => {
      const st = String(t.rawStatus || t.status || "").toUpperCase();
      if (st === "ON_THE_WAY" || st === "IN_TRANSIT" || st === "ACTIVE") active++;
      else if (st === "ASSIGNED_TO_VENDOR" || st === "CONFIRMED" || st === "ASSIGNED") upcoming++;
      else if (st === "COMPLETED") completed++;
    });

    return { all: trips.length, active, upcoming, completed };
  }, [trips]);

  // Tab-filtered trips
  const displayedTrips = useMemo(() => {
    return trips.filter((t) => {
      const st = String(t.rawStatus || t.status || "").toUpperCase();
      if (activeTab === "ACTIVE") {
        return st === "ON_THE_WAY" || st === "IN_TRANSIT" || st === "ACTIVE";
      }
      if (activeTab === "UPCOMING") {
        return st === "ASSIGNED_TO_VENDOR" || st === "CONFIRMED" || st === "ASSIGNED";
      }
      if (activeTab === "COMPLETED") {
        return st === "COMPLETED";
      }
      return true;
    });
  }, [trips, activeTab]);

  // DataTable column definitions
  const columns = useMemo(() => [
    {
      key: "bookingReference",
      label: "Trip Ref & Type",
      sortable: true,
      render: (t) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded text-xs border border-amber-500/20">
              #{t.bookingReference || t.id?.slice(0, 8)}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
              {t.tripType || "Outstation"}
            </span>
          </div>
          {t.invoiceNumber && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
              <Receipt className="w-2.5 h-2.5 text-emerald-600" />
              {t.invoiceNumber}
            </span>
          )}
        </div>
      )
    },
    {
      key: "pickupCity",
      label: "Route & Pickup Point",
      sortable: true,
      render: (t) => (
        <div className="max-w-xs space-y-0.5">
          <p className="font-bold text-slate-900 text-xs">
            {t.pickupCity} ➔ {t.dropCity || "Local Route"}
          </p>
          <p className="text-[11px] text-slate-500 flex items-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="truncate" title={t.pickupAddress || t.pickup || t.pickupCity}>
              {t.pickupAddress || t.pickup || t.pickupCity}
            </span>
          </p>
        </div>
      )
    },
    {
      key: "pickupDate",
      label: "Reporting Time",
      sortable: true,
      render: (t) => (
        <div className="whitespace-nowrap">
          <p className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{t.pickupDateStr || t.pickupDate || "Scheduled"}</span>
          </p>
        </div>
      )
    },
    {
      key: "passengerName",
      label: "Passenger",
      sortable: true,
      render: (t) => {
        const phone = t.passengerPhone || t.customerPhone || t.customer?.phone || "";
        const telUrl = phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : null;
        return (
          <div className="space-y-1">
            <p className="font-bold text-slate-900 text-xs">
              {t.passengerName || t.customer?.name || "Customer"}
            </p>
            {phone && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500">{phone}</span>
                {telUrl && (
                  <a
                    href={telUrl}
                    className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                    title="Call Passenger"
                  >
                    <Phone className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: "vehicleNumber",
      label: "Assigned Cab",
      sortable: true,
      render: (t) => (
        <div className="whitespace-nowrap space-y-0.5">
          <NumberPlate number={t.vehicleNumber || driverProfile?.vehicleNumber} />
          <p className="text-[11px] text-slate-500">{t.vehicleModel || "Fleet Vehicle"}</p>
        </div>
      )
    },
    {
      key: "totalFare",
      label: "Trip Fare & Collection",
      align: "right",
      sortable: true,
      sortValue: (t) => Number(t.finalTotalFare || t.totalFare) || 0,
      render: (t) => {
        const fare = Number(t.finalTotalFare || t.totalFare || 0);
        const due = t.dueAmount != null ? Number(t.dueAmount) : Math.max(0, fare - Number(t.advancePaid || 0));
        return (
          <div className="text-right space-y-0.5">
            <span className="font-black text-slate-900 text-xs block">
              {formatINR(fare)}
            </span>
            {due > 0 ? (
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                Collect: {formatINR(due)}
              </span>
            ) : (
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Settled / ₹0 Due
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      sortable: true,
      render: (t) => <StatusBadge status={t.status} />
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      sortable: false,
      render: (t) => {
        const rawSt = String(t.rawStatus || t.status || "").toUpperCase();
        const isReadyToStart = rawSt === "ASSIGNED_TO_VENDOR" || rawSt === "CONFIRMED" || rawSt === "ASSIGNED";
        const isActive = rawSt === "ON_THE_WAY" || rawSt === "IN_TRANSIT" || rawSt === "ACTIVE";
        const isCompleted = rawSt === "COMPLETED";

        const navDestination = encodeURIComponent(t.pickupAddress || `${t.pickupCity}, India`);
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${navDestination}`;

        return (
          <div className="flex items-center justify-center gap-1.5">
            {isReadyToStart && (
              <button
                type="button"
                onClick={() => setStartingTrip(t)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 fill-white" />
                <span>Start Ride</span>
              </button>
            )}

            {isActive && (
              <button
                type="button"
                onClick={() => setClosingTrip(t)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>End Trip</span>
              </button>
            )}

            {isCompleted && (
              <Link
                href={`/driver/trips/${t.bookingReference || t.id}/invoice`}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                <span>Tax Invoice</span>
              </Link>
            )}

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-blue-600 hover:border-blue-300 transition"
              title="Open Google Maps Navigation"
            >
              <Compass className="w-4 h-4" />
            </a>
          </div>
        );
      }
    }
  ], [driverProfile]);

  // Responsive mobile card view for smartphones
  const renderMobileCard = (trip) => {
    const rawSt = String(trip.rawStatus || trip.status || "").toUpperCase();
    const isReadyToStart = rawSt === "ASSIGNED_TO_VENDOR" || rawSt === "CONFIRMED" || rawSt === "ASSIGNED";
    const isActive = rawSt === "ON_THE_WAY" || rawSt === "IN_TRANSIT" || rawSt === "ACTIVE";
    const isCompleted = rawSt === "COMPLETED";

    const navDestination = encodeURIComponent(trip.pickupAddress || `${trip.pickupCity}, India`);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${navDestination}`;

    const customerPhone = trip.passengerPhone || trip.customerPhone || "";
    const telUrl = customerPhone ? `tel:${customerPhone.replace(/[^0-9+]/g, "")}` : null;

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 text-white">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400">
              #{trip.bookingReference || trip.id?.slice(0, 8)}
            </span>
            <h4 className="font-black text-white text-sm">
              {trip.pickupCity} ➔ {trip.dropCity || "Local Route"}
            </h4>
          </div>
          <StatusBadge status={trip.status} />
        </div>

        {/* Date & Vehicle */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{trip.pickupDateStr || trip.pickupDate || "Scheduled"}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-slate-300">
            <Car className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{trip.vehicleNumber || trip.vehicleModel || "Cab"}</span>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-0.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" /> Pickup Location
          </span>
          <p className="text-xs text-slate-200 font-semibold truncate">
            {trip.pickupAddress || trip.pickupCity}
          </p>
        </div>

        {/* Passenger & Maps */}
        <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl">
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Passenger
            </span>
            <p className="text-xs font-black text-white truncate">
              {trip.passengerName || "Customer"}
            </p>
            {customerPhone && (
              <p className="text-[10px] text-slate-400 font-mono">{customerPhone}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {telUrl && (
              <a
                href={telUrl}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20"
              >
                <Phone className="w-3 h-3" /> Call
              </a>
            )}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-blue-600/20"
            >
              <Compass className="w-3 h-3" /> Maps
            </a>
          </div>
        </div>

        {/* Fare & Due */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Trip Fare
            </span>
            <span className="font-black text-white">
              {formatINR(trip.finalTotalFare || trip.totalFare)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
              Balance Due
            </span>
            <span className="font-black text-amber-400">
              {formatINR(trip.dueAmount || 0)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div>
          {isReadyToStart && (
            <button
              type="button"
              onClick={() => setStartingTrip(trip)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <Navigation className="w-4 h-4 fill-white" />
              Start Ride (Enter Start ODO &amp; OTP)
            </button>
          )}

          {isActive && (
            <button
              type="button"
              onClick={() => setClosingTrip(trip)}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-slate-950" />
              End Trip &amp; Finalize Fare
            </button>
          )}

          {isCompleted && (
            <Link
              href={`/driver/trips/${trip.bookingReference || trip.id}/invoice`}
              className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 text-center"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-400" /> View GST Tax Invoice
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 suppressHydrationWarning className="font-black text-sm sm:text-base tracking-tight text-white leading-tight">
                  {mounted ? (driverProfile?.name || currentUser?.name || "Chauffeur") : "Chauffeur"}
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  On Duty
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {driverProfile?.vehicleNumber ? (
                  <strong className="text-amber-400 font-mono font-bold mr-1">
                    {driverProfile.vehicleNumber}
                  </strong>
                ) : null}
                {driverProfile?.fleetBusinessName ? `• ${driverProfile.fleetBusinessName}` : "• Grab Rentals Chauffeur Portal"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Refresh Trips"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Fleet Owner Session Notice */}
        {mounted && currentUser?.role && currentUser.role !== "DRIVER" && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">
                  Logged in as Fleet Owner ({currentUser.name})
                </p>
                <p className="text-[11px] text-slate-400">
                  You are viewing this chauffeur portal with your operator account. To view trips for an individual chauffeur, log in with that chauffeur&apos;s registered phone number.
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition cursor-pointer text-center"
            >
              Sign In as Chauffeur ➔
            </button>
          </div>
        )}
        
        {/* Navigation Tabs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === "ALL"
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20 font-black"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 font-semibold"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">
              All Assigned
            </span>
            <span className="text-xl sm:text-2xl font-black mt-0.5 block">
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ACTIVE")}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === "ACTIVE"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20 font-black"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 font-semibold"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block flex items-center gap-1.5 opacity-90">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Active Rides
            </span>
            <span className="text-xl sm:text-2xl font-black mt-0.5 block">
              {counts.active}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("UPCOMING")}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === "UPCOMING"
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20 font-black"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 font-semibold"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">
              Upcoming / Scheduled
            </span>
            <span className="text-xl sm:text-2xl font-black mt-0.5 block">
              {counts.upcoming}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("COMPLETED")}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === "COMPLETED"
                ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20 font-black"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 font-semibold"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">
              Finished &amp; Invoiced
            </span>
            <span className="text-xl sm:text-2xl font-black mt-0.5 block">
              {counts.completed}
            </span>
          </button>
        </div>

        {/* Enterprise DataTable Component */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-800/20">
          <DataTable
            columns={columns}
            data={displayedTrips}
            keyField="id"
            loading={loading}
            searchPlaceholder="Search trip ref #, customer, route, vehicle, invoice..."
            searchKeys={[
              "bookingReference", 
              "id", 
              "pickupCity", 
              "dropCity", 
              "pickupAddress", 
              "passengerName", 
              "customerPhone", 
              "vehicleNumber", 
              "invoiceNumber"
            ]}
            defaultPageSize={10}
            pageSizeOptions={[5, 10, 25, 50]}
            exportFileName="Chauffeur_Trips_Telematics"
            emptyTitle={activeTab === "ACTIVE" ? "No Active Rides In Progress" : "No Trips Found"}
            emptyDescription={
              activeTab === "ACTIVE"
                ? "You have no active rides right now. Switch to 'Upcoming' for scheduled assignments or 'Finished' for your completed trips."
                : "No trip records match the current filter criteria."
            }
            renderMobileCard={renderMobileCard}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-600 border-t border-slate-900">
        Grab Rentals Chauffeur Network • Safe Driving Protocol Enabled
      </footer>

      {/* Start Ride Modal */}
      {startingTrip && (
        <StartRideModal
          isOpen={Boolean(startingTrip)}
          trip={startingTrip}
          onClose={() => {
            setStartingTrip(null);
            loadData(true);
          }}
          onRideStarted={(updated) => {
            setStartingTrip(null);
            loadData(true);
          }}
        />
      )}

      {/* Trip Closing Modal */}
      {closingTrip && (
        <TripClosingModal
          isOpen={Boolean(closingTrip)}
          trip={closingTrip}
          onClose={() => {
            setClosingTrip(null);
            loadData(true);
          }}
          onTripCompleted={(updated) => {
            setClosingTrip(null);
            loadData(true);
            setActiveTab("COMPLETED");
          }}
          onSuccess={(updated) => {
            setClosingTrip(null);
            loadData(true);
            setActiveTab("COMPLETED");
          }}
        />
      )}

    </div>
  );
}
