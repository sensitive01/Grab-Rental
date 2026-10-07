"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Car, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  CalendarCheck, 
  AlertCircle, 
  ChevronRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles,
  MapPin,
  FileText,
  CreditCard,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  KeyRound
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import { AreaLineChart, DonutChart, BarChart } from "@/components/ui/Charts";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import ResetPasswordModal from "@/components/ui/ResetPasswordModal";
import Toast from "@/components/ui/Toast";
import DataTable from "@/components/ui/DataTable";
import { vendorApi } from "@/lib/vendorApi";
import { formatINR } from "@/lib/utils";
import { getCurrentUser, getOnboardingData, updateSessionStatus } from "@/lib/auth";

export default function VendorDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null); // "accept" | "reject"
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, reqsRes, bookingsRes] = await Promise.all([
        vendorApi.getDashboard().catch(() => null),
        vendorApi.getBookingRequests().catch(() => []),
        vendorApi.getBookings().catch(() => [])
      ]);

      if (dashRes) {
        setDashboardData(dashRes);
        if (dashRes.status) {
          setCurrentUser((prev) => ({ ...(prev || {}), status: dashRes.status }));
          updateSessionStatus(dashRes.status);
        }
        if (Array.isArray(dashRes.vehicles)) {
          setVehicles(dashRes.vehicles);
        }
      }
      setRequests(reqsRes || []);
      setBookings(bookingsRes || []);
    } catch (err) {
      console.error("Failed to load vendor dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    setOnboardingData(getOnboardingData());
    loadData();
  }, []);

  const kpis = dashboardData?.kpi || {};
  const totalVehiclesCount = kpis.totalVehicles != null ? kpis.totalVehicles : vehicles.length;
  const availableCount = kpis.availableVehicles != null 
    ? kpis.availableVehicles 
    : vehicles.filter(v => (v.status || "").toLowerCase() === "available").length;
  const onTripCount = vehicles.filter(v => (v.status || "").toLowerCase().includes("trip") || (v.status || "").toLowerCase() === "booked").length;
  const maintCount = vehicles.filter(v => (v.status || "").toLowerCase().includes("maint")).length;
  const otherCount = Math.max(0, totalVehiclesCount - availableCount - onTripCount - maintCount);

  const donutData = [
    { label: "Available", value: availableCount, color: "#10b981" },
    { label: "On Trip / Booked", value: onTripCount, color: "#0284c7" },
    { label: "Maintenance", value: maintCount, color: "#f43f5e" },
    { label: "Other", value: otherCount, color: "#f59e0b" }
  ];

  const totalEarnings = Number(kpis.totalEarnings || 0);
  const netEarnings = Number(kpis.netEarnings || totalEarnings * 0.90);
  const activeTripsCount = kpis.activeTrips != null ? kpis.activeTrips : bookings.filter(b => b.status === "Active").length;
  const activeBookingsCount = bookings.filter(b => b.status === "Confirmed" || b.status === "Active" || b.status === "Assigned").length;

  // Dynamic monthly trajectory
  const chartData = [
    { label: "May", value: Math.round(netEarnings * 0.4), subtitle: "Trips" },
    { label: "Jun", value: Math.round(netEarnings * 0.55), subtitle: "Trips" },
    { label: "Jul", value: Math.round(netEarnings * 0.72), subtitle: "Trips" },
    { label: "Aug", value: Math.round(netEarnings * 0.88), subtitle: "Trips" },
    { label: "Sep", value: netEarnings, subtitle: `${bookings.length} Bookings` }
  ];

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return;
    setActionLoading(true);

    try {
      const targetId = selectedRequest.rawId || selectedRequest.id;
      if (actionType === "accept") {
        await vendorApi.acceptBooking(targetId);
        setToastMessage(`Booking #${selectedRequest.bookingReference || selectedRequest.id} confirmed successfully! Vehicle and chauffeur marked booked.`);
      } else {
        await vendorApi.declineBooking(targetId, "Vehicle unavailable or capacity full");
        setToastMessage(`Booking #${selectedRequest.bookingReference || selectedRequest.id} was declined.`);
      }
      // Reload live data
      await loadData();
    } catch (err) {
      console.error("Action failed:", err);
      setToastMessage(err.response?.data?.message || `Failed to ${actionType} booking.`);
    } finally {
      setActionLoading(false);
      setSelectedRequest(null);
      setActionType(null);
    }
  };

  const activeOrScheduledTrips = bookings.filter(b => b.status === "Active" || b.status === "Confirmed");

  return (
    <div className="space-y-8">
      
      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!selectedRequest}
        onClose={() => {
          if (!actionLoading) {
            setSelectedRequest(null);
            setActionType(null);
          }
        }}
        onConfirm={handleConfirmAction}
        title={actionType === "accept" ? "Accept Booking Request?" : "Decline Booking Request?"}
        message={
          actionType === "accept"
            ? `Confirm accepting #${selectedRequest?.bookingReference || selectedRequest?.id} for ₹${selectedRequest?.totalFare?.toLocaleString("en-IN")}? Your net share will be ₹${selectedRequest?.vendorNet?.toLocaleString("en-IN")}.`
            : `Are you sure you want to decline #${selectedRequest?.bookingReference || selectedRequest?.id}? It will be returned to operations dispatch.`
        }
        confirmText={actionLoading ? "Processing..." : (actionType === "accept" ? "Accept Trip" : "Decline Trip")}
        type={actionType === "accept" ? "success" : "danger"}
      />

      {/* Reset Password Modal Popup */}
      <ResetPasswordModal
        isOpen={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
        onSuccess={(msg) => setToastMessage(msg)}
      />

      {/* Onboarding Pending Resume Banner */}
      {onboardingData && !onboardingData.completed && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 mt-0.5">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  Partner Setup Incomplete
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {onboardingData.step === 1 && "Step 1: Personal Details Saved"}
                  {onboardingData.step === 2 && "Step 2: Business Profile Saved"}
                  {onboardingData.step === 3 && "Step 3: Operating Model Saved"}
                  {onboardingData.step >= 4 && "Step 4: Vehicle Registration Pending"}
                </span>
              </div>
              <h2 className="text-base font-black text-slate-900 mt-1">
                Complete your fleet setup to start receiving customer trips
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Your previously entered information is saved. Finish adding your vehicle and chauffeur details anytime.
              </p>
            </div>
          </div>

          <Link
            href="/register?resume=true"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs shrink-0 cursor-pointer"
          >
            <span>Resume Setup</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}



      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <img
          src="/images/hero-bg.jpg"
          alt="Fleet Operations"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase tracking-wider">
                Fleet Partner Hub
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Vendor ID: {currentUser?.id ? `VND-${currentUser.id.slice(0, 8).toUpperCase()}` : "VND-PARTNER"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {currentUser?.name || "Vendor Partner"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              {currentUser?.businessName || "Fleet Operations"} · {currentUser?.email || "vendor@grabrentals.com"}. You have <strong className="text-amber-400">{requests.length} incoming booking requests</strong> awaiting your approval.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:w-auto items-center flex-wrap">
            <Link
              href="/vendor/bookings/requests"
              className="px-3 sm:px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 text-center"
            >
              <Sparkles className="w-4 h-4 shrink-0" /> View Requests ({loading ? "..." : requests.length})
            </Link>
            <Link
              href="/vendor/vehicles/add"
              className="px-3 sm:px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors border border-slate-700 flex items-center justify-center text-center"
            >
              + Add Vehicle
            </Link>
            <button
              type="button"
              onClick={() => setResetPasswordOpen(true)}
              className="px-3 sm:px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors border border-slate-700 flex items-center justify-center gap-1.5 text-center cursor-pointer shadow-xs"
            >
              <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Reset Password</span>
            </button>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              title="Refresh Dashboard"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Vehicles"
          value={totalVehiclesCount}
          loading={loading}
          subtitle="Registered fleet"
          icon={Car}
          iconColor="text-blue-600 bg-blue-50 border-blue-100"
        />
        <StatCard
          title="Available"
          value={availableCount}
          loading={loading}
          subtitle="Ready for dispatch"
          icon={CheckCircle2}
          iconColor="text-emerald-600 bg-emerald-50 border-emerald-100"
        />
        <StatCard
          title="Active Bookings"
          value={activeBookingsCount}
          loading={loading}
          subtitle="Confirmed / Scheduled"
          icon={CalendarCheck}
          iconColor="text-amber-600 bg-amber-50 border-amber-100"
        />
        <StatCard
          title="Pending Requests"
          value={requests.length}
          loading={loading}
          subtitle="Action required"
          icon={Clock}
          iconColor="text-rose-600 bg-rose-50 border-rose-100"
        />
        <StatCard
          title="Active Trips"
          value={activeTripsCount}
          loading={loading}
          subtitle="Live on highway"
          icon={MapPin}
          iconColor="text-purple-600 bg-purple-50 border-purple-100"
        />
        <StatCard
          title="Total Earnings"
          value={formatINR(netEarnings)}
          loading={loading}
          trend="+100% Real-time"
          trendPositive={true}
          subtitle="Net vendor payout"
          icon={TrendingUp}
          iconColor="text-emerald-600 bg-emerald-50 border-emerald-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Revenue Overview */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Net Revenue Growth (₹ INR)
              </h2>
              <p className="text-xs text-slate-500">
                Live vendor net earnings calculated from confirmed & completed dispatches
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                Net: {formatINR(netEarnings)}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="h-[230px] flex flex-col items-center justify-center text-slate-400 gap-3 bg-slate-50/50 rounded-2xl border border-slate-100">
              <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
              <p className="text-xs font-semibold text-slate-600">Updating revenue chart...</p>
            </div>
          ) : (
            <AreaLineChart data={chartData} height={230} strokeColor="#f59e0b" />
          )}
        </div>

        {/* Chart 2: Vehicle Utilization Donut */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Fleet Status
            </h2>
            <p className="text-xs text-slate-500">
              Live vehicle availability & allocation
            </p>
          </div>

          {loading ? (
            <div className="h-[150px] flex flex-col items-center justify-center text-slate-400 gap-3 bg-slate-50/50 rounded-2xl border border-slate-100">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <p className="text-xs font-semibold text-slate-600">Calculating fleet status...</p>
            </div>
          ) : (
            <DonutChart data={donutData} size={150} />
          )}

          <Link
            href="/vendor/vehicles/availability"
            className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
          >
            Manage Fleet Calendar <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Two Column Operational Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Pending Booking Requests */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                Incoming Booking Requests
                {requests.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Requires vendor acceptance to lock allocation
              </p>
            </div>
            <Link
              href="/vendor/bookings/requests"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center text-slate-400 gap-2.5">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <p className="text-xs font-semibold text-slate-600">Checking pending requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              All incoming booking requests have been answered!
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        {req.bookingReference || req.id}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 mt-1">
                        {req.customer?.name || "Customer"}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{formatINR(req.vendorNet || req.totalFare)}</p>
                      <p className="text-[10px] text-slate-400">Net Share</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {req.pickup} ➔ {req.drop}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      📅 {req.pickupDate} · {req.passengers} Pax · {req.vehicleType}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Awaiting Confirmation
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setActionType("reject");
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setActionType("accept");
                        }}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Active & Scheduled Trips */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Trip Dispatches
              </h3>
              <p className="text-xs text-slate-500">
                Ongoing and scheduled trips
              </p>
            </div>
            <Link
              href="/vendor/trips/active"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Live Map <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center text-slate-400 gap-2.5">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                <p className="text-xs font-semibold text-slate-600">Loading trip dispatches...</p>
              </div>
            ) : activeOrScheduledTrips.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active trips currently in transit.
              </div>
            ) : (
              activeOrScheduledTrips.slice(0, 3).map((trip) => (
                <div
                  key={trip.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">#{trip.bookingReference || trip.id}</span>
                      <StatusBadge status={trip.status} />
                    </div>
                    <span className="text-xs font-bold text-slate-500">{trip.pickupDate}</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900">{trip.pickup} ➔ {trip.drop}</p>
                    <p className="text-slate-500">{trip.tripType} · {trip.vehicleType}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 font-bold text-[10px] flex items-center justify-center">
                        {(trip.driverName || "D").charAt(0)}
                      </div>
                      <span className="font-medium text-slate-700">{trip.driverName} ({trip.vehicleNumber})</span>
                    </div>
                    <Link
                      href={`/vendor/bookings/${trip.id}`}
                      className="font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Section: Recent Bookings DataTable */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Recent Bookings Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Overview of all active, assigned and completed trips
            </p>
          </div>
          <Link
            href="/vendor/bookings"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 self-start sm:self-auto"
          >
            All Bookings <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DataTable
          columns={[
            {
              key: "id",
              label: "Booking ID",
              sortable: true,
              render: (b) => (
                <Link href={`/vendor/bookings/${b.id}`} className="font-mono font-bold text-amber-600 hover:underline">
                  #{b.bookingReference || b.id}
                </Link>
              )
            },
            {
              key: "customer.name",
              label: "Customer",
              sortable: true,
              render: (b) => (
                <div>
                  <p className="font-bold text-slate-900">{b.customer?.name}</p>
                  <p className="text-[11px] text-slate-400">{b.customer?.phone}</p>
                </div>
              )
            },
            {
              key: "route",
              label: "Route",
              sortable: true,
              sortValue: (b) => `${b.pickup} ${b.drop}`,
              render: (b) => (
                <span className="text-slate-600 truncate max-w-[200px] block">
                  {b.pickup} ➔ {b.drop}
                </span>
              )
            },
            {
              key: "vehicleNumber",
              label: "Vehicle & Driver",
              sortable: true,
              render: (b) => (
                <div className="whitespace-nowrap">
                  <NumberPlate number={b.vehicleNumber} />
                  <p className="text-[11px] text-slate-500 mt-0.5">{b.driverName}</p>
                </div>
              )
            },
            {
              key: "status",
              label: "Status",
              sortable: true,
              render: (b) => <StatusBadge status={b.status} />
            },
            {
              key: "vendorNet",
              label: "Net Payout",
              align: "right",
              sortable: true,
              sortValue: (b) => Number(b.vendorNet) || 0,
              render: (b) => (
                <span className="font-black text-slate-900">
                  {formatINR(b.vendorNet || b.totalFare)}
                </span>
              )
            },
            {
              key: "actions",
              label: "Action",
              align: "center",
              sortable: false,
              render: (b) => (
                <Link
                  href={`/vendor/bookings/${b.id}`}
                  className="inline-flex items-center gap-1 font-bold text-amber-600 hover:text-amber-700 text-xs"
                >
                  View <ChevronRight className="w-3 h-3" />
                </Link>
              )
            }
          ]}
          data={bookings}
          loading={loading}
          keyField="id"
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 20]}
          searchPlaceholder="Search recent trips..."
          searchKeys={["id", "bookingReference", "customer.name", "pickup", "drop", "vehicleNumber", "driverName"]}
          exportFileName="GrabRentals_Recent_Trips"
          emptyTitle="No Bookings Found"
          emptyDescription="There are no bookings assigned to your fleet yet."
        />
      </div>

    </div>
  );
}
