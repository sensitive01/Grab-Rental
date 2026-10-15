"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { formatINR, getStatusStyle } from "@/lib/utils";
import {
  ArrowLeft,
  Printer,
  Car,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  CreditCard,
  Receipt,
  KeyRound,
  Sparkles,
  Luggage,
  Languages,
  Fuel,
  Copy,
  Check,
  Search,
  Navigation,
  RefreshCw,
  FileText,
  ChevronRight,
  Info,
  DollarSign,
  TrendingUp,
  Tag
} from "lucide-react";

function formatDateTime(val) {
  if (!val) return { date: "—", time: "" };
  try {
    const dt = new Date(val);
    if (isNaN(dt.getTime())) return { date: String(val), time: "" };
    const date = dt.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const time = dt.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { date, time };
  } catch {
    return { date: String(val), time: "" };
  }
}

function parseSpecialInstructions(spec) {
  if (!spec || typeof spec !== "string") return {};
  const res = {};

  const vehicle = spec.match(/Vehicle:\s*([^|]+)/i)?.[1]?.trim();
  if (vehicle) res.vehicleModel = vehicle;

  const image = spec.match(/Image:\s*([^|]+)/i)?.[1]?.trim();
  if (image) res.vehicleImage = image;

  const fuel = spec.match(/Fuel:\s*([^|]+)/i)?.[1]?.trim();
  if (fuel) res.fuelType = fuel;

  const distance = spec.match(/Distance:\s*(\d+)/i)?.[1]?.trim();
  if (distance) res.distanceKm = Number(distance);

  const duration = spec.match(/Est\.\s*Duration:\s*([^|]+)/i)?.[1]?.trim();
  if (duration) res.duration = duration;

  const rate = spec.match(/Rate:\s*₹?([0-9.]+)/i)?.[1]?.trim();
  if (rate) res.perKmRate = Number(rate);

  const baseFare = spec.match(/BaseFare:\s*₹?([0-9.]+)/i)?.[1]?.trim();
  if (baseFare) res.baseFare = Number(baseFare);

  const driverAllowance = spec.match(/DriverAllowance:\s*₹?([0-9.]+)/i)?.[1]?.trim();
  if (driverAllowance) res.driverAllowance = Number(driverAllowance);

  const driverAllowanceLabel = spec.match(/DriverAllowance:\s*₹?[0-9.]+\s*\(([^)]+)\)/i)?.[1]?.trim();
  if (driverAllowanceLabel) res.driverAllowanceLabel = driverAllowanceLabel;

  const taxes = spec.match(/Taxes:\s*₹?([0-9.]+)/i)?.[1]?.trim();
  if (taxes) res.taxes = Number(taxes);

  const taxLabel = spec.match(/Taxes:\s*₹?[0-9.]+\s*\(([^)]+)\)/i)?.[1]?.trim();
  if (taxLabel) res.taxLabel = taxLabel;

  const fastagToll = spec.match(/FASTag\s*Toll:\s*₹?([0-9.]+)/i)?.[1]?.trim();
  if (fastagToll) res.tollPrice = Number(fastagToll);

  const pkg = spec.match(/Package:\s*([^|]+)/i)?.[1]?.trim();
  if (pkg) res.packageLabel = pkg;

  const coupon = spec.match(/Coupon Applied:\s*([^|]+)/i)?.[1]?.trim();
  if (coupon) res.couponInfo = coupon;

  const addons = [];
  if (/Expressway Fastag/i.test(spec)) {
    const fee = spec.match(/Expressway Fastag Included\s*\(₹?([0-9.]+)\)/i)?.[1];
    addons.push({ label: "Expressway FASTag Included", fee: fee ? Number(fee) : 350 });
  }
  if (/Language Chauffeur/i.test(spec)) {
    const lang = spec.match(/Language Chauffeur\s*\(([^)]+)\)\s*\(₹?([0-9.]+)\)/i);
    addons.push({ label: `Language Chauffeur (${lang?.[1] || "Selected"})`, fee: lang?.[2] ? Number(lang[2]) : 199 });
  }
  if (/Luggage Carrier/i.test(spec)) {
    const fee = spec.match(/Luggage Carrier Added\s*\(₹?([0-9.]+)\)/i)?.[1];
    addons.push({ label: "Rooftop Luggage Carrier", fee: fee ? Number(fee) : 249 });
  }
  if (/Less than 3 years/i.test(spec)) {
    const fee = spec.match(/Less than 3 years Old Vehicle\s*\(₹?([0-9.]+)\)/i)?.[1];
    addons.push({ label: "Brand New Vehicle (< 3 Yrs)", fee: fee ? Number(fee) : 299 });
  }
  res.addons = addons;

  // Custom customer notes
  const segments = spec.split("|").map(s => s.trim()).filter(Boolean);
  const customNotes = segments.filter(s =>
    !s.startsWith("Vehicle:") &&
    !s.startsWith("Image:") &&
    !s.startsWith("Fuel:") &&
    !s.startsWith("Distance:") &&
    !s.startsWith("Est. Duration:") &&
    !s.startsWith("Rate:") &&
    !s.startsWith("BaseFare:") &&
    !s.startsWith("DriverAllowance:") &&
    !s.startsWith("Taxes:") &&
    !s.startsWith("FASTag Toll:") &&
    !s.startsWith("Package:") &&
    !s.startsWith("Intermediate Stops:") &&
    !s.startsWith("Coupon Applied:") &&
    !s.includes("Expressway Fastag") &&
    !s.includes("Language Chauffeur") &&
    !s.includes("Luggage Carrier") &&
    !s.includes("Less than 3 years")
  );
  if (customNotes.length > 0) {
    res.customerNotes = customNotes.join(" • ");
  }

  return res;
}

export default function AdminBookingDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Allocation Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [assignChauffeurNow, setAssignChauffeurNow] = useState(false);
  const [vehicleTab, setVehicleTab] = useState("MATCHING");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [loadingFleet, setLoadingFleet] = useState(false);
  const [submittingAllocation, setSubmittingAllocation] = useState(false);

  async function loadBooking() {
    try {
      const res = await operationsApi.getBookingById(id);
      setBooking(res.data);
    } catch (err) {
      console.error("Failed to load booking details:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooking();
  }, [id]);

  const handleCopy = (text) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!booking) return;
    setUpdatingStatus(true);
    try {
      const targetId = booking.rawId || booking.id;
      await operationsApi.updateTripStatus(targetId, newStatus);
      setToast({
        type: "success",
        message: `Booking status updated to ${newStatus}!`,
      });
      await loadBooking();
    } catch (err) {
      console.error("Status update failed:", err);
      setToast({
        type: "error",
        message: "Failed to update booking status.",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Open Allocation Modal
  const openAllocateModal = async () => {
    if (!booking) return;
    setSelectedVehicle(null);
    setSelectedDriver(null);
    setAssignChauffeurNow(false);
    setVehicleSearch("");
    setVehicleTab("MATCHING");
    setIsModalOpen(true);
    setLoadingFleet(true);

    try {
      const [vehRes, drvRes] = await Promise.all([
        operationsApi.getVehicles("AVAILABLE"),
        operationsApi.getDrivers("AVAILABLE"),
      ]);
      const vList = vehRes.data || [];
      setAvailableVehicles(vList);
      setAvailableDrivers(drvRes.data || []);

      const reqCat = (booking.vehicleCategory || "").trim().toUpperCase();
      const match = vList.find((v) => (v.category || v.vehicleType || "").trim().toUpperCase() === reqCat);
      if (match) {
        setSelectedVehicle(match);
      } else if (vList.length > 0) {
        setSelectedVehicle(vList[0]);
        setVehicleTab("ALL");
      }
    } catch (err) {
      console.error("Failed to load available fleet:", err);
      setToast({ type: "error", message: "Failed to load available fleet." });
    } finally {
      setLoadingFleet(false);
    }
  };

  const handleConfirmAllocation = async () => {
    if (!booking || !selectedVehicle) {
      setToast({
        type: "warning",
        message: "Please select an available vehicle to allocate.",
      });
      return;
    }

    setSubmittingAllocation(true);
    try {
      const bId = booking.rawId || booking.id;
      const vId = selectedVehicle.rawId || selectedVehicle.id;

      if (assignChauffeurNow && selectedDriver) {
        const dId = selectedDriver.rawId || selectedDriver.id;
        await operationsApi.assignVehicleAndDriver(bId, vId, dId);
        setToast({
          type: "success",
          message: `Vehicle ${selectedVehicle.model} (${selectedVehicle.registrationNumber}) & chauffeur ${selectedDriver.name} allocated!`,
        });
      } else {
        await operationsApi.assignVehicle(bId, vId);
        setToast({
          type: "success",
          message: `Vehicle ${selectedVehicle.model} (${selectedVehicle.registrationNumber}) allocated! Routed to Fleet Partner to assign chauffeur.`,
        });
      }

      setIsModalOpen(false);
      await loadBooking();
    } catch (err) {
      console.error("Allocation failed:", err);
      setToast({
        type: "error",
        message: "Failed to allocate fleet. Please try again.",
      });
    } finally {
      setSubmittingAllocation(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <LoadingAnimation title="Compiling Audit Dossier..." subtitle="Fetching telemetry, route ledger and settlement records" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-16 text-center text-sm text-slate-500 max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Booking Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          The requested booking reference does not exist or has been archived.
        </p>
        <Link href="/admin/bookings">
          <Button variant="secondary" size="sm" icon={ArrowLeft}>
            Back to Bookings
          </Button>
        </Link>
      </div>
    );
  }

  const specParsed = parseSpecialInstructions(booking.specialInstructions);
  const statusStyle = getStatusStyle(booking.status);
  const fare = Number(booking.fare || booking.totalFare || 0);
  const advance = Number(booking.advancePaid || 0);
  const due = Number(booking.dueAmount != null ? booking.dueAmount : Math.max(0, fare - advance));
  const vendorPayout = Number(booking.vendorPayout != null ? booking.vendorPayout : Math.round(fare * 0.70));
  const platformMargin = Math.max(0, fare - vendorPayout);

  const pickupDt = formatDateTime(booking.pickupDateTime || booking.startDate);
  const returnDt = booking.returnDateTime ? formatDateTime(booking.returnDateTime) : null;

  const rawTripType = (booking.tripType || "ONE_WAY").toUpperCase();
  const isRoundTrip = rawTripType.includes("ROUND");
  const isLocal = rawTripType.includes("HOURLY") || rawTripType.includes("LOCAL");
  const isAirport = rawTripType.includes("AIRPORT");

  const tripTypeLabel = isLocal
    ? "Local Hourly Rental"
    : isAirport
    ? "Airport Transfer"
    : isRoundTrip
    ? "Round Trip"
    : "One Way";

  const rawStops = booking.stops || "";
  const stopsList = Array.isArray(rawStops)
    ? rawStops.filter(Boolean)
    : (typeof rawStops === "string" && rawStops.trim()
        ? rawStops.split("|").map(s => s.trim()).filter(Boolean)
        : []);

  const bookingCategory = (booking.vehicleCategory || "").toUpperCase();
  const matchingVehicles = availableVehicles.filter(
    (v) => (v.category || v.vehicleType || "").toUpperCase() === bookingCategory
  );
  const displayedVehicles = (
    vehicleTab === "MATCHING" ? matchingVehicles : availableVehicles
  ).filter((v) => {
    if (!vehicleSearch.trim()) return true;
    const q = vehicleSearch.toLowerCase().trim();
    return (
      v.model?.toLowerCase().includes(q) ||
      v.registrationNumber?.toLowerCase().includes(q) ||
      v.vendorName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Page Header */}
      <PageHeader
        title={`Audit Dossier: Booking #${booking.bookingReference || booking.id}`}
        subtitle={`Logged on ${pickupDt.date} • Fleet Partner: ${booking.vendorBusinessName || booking.vendorName || "Fleet Partner"}${booking.vendorPhone ? ` (${booking.vendorPhone})` : ""}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Bookings", href: "/admin/bookings" },
          { label: booking.bookingReference || booking.id },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/bookings">
              <Button variant="secondary" size="sm" icon={ArrowLeft}>
                Back to Ledger
              </Button>
            </Link>

            {booking.status === "PENDING_ALLOCATION" || booking.status === "REASSIGN_REQUIRED" ? (
              <Button
                variant="primary"
                size="sm"
                icon={Car}
                onClick={openAllocateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                Allocate Fleet Asset
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={openAllocateModal}
              >
                Reassign Fleet
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Audit Certificate
            </Button>
          </div>
        }
      />

      {/* Key Financial & Route Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Gross Tariff</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatINR(fare)}
          </div>
          <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            {booking.paymentStatus === "FULL_PAID" ? "100% Full Advance Paid" : booking.paymentStatus === "ADVANCE_PAID" ? "Partially Paid" : "Payment Pending"}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Advance Collected</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
            {formatINR(advance)}
          </div>
          <div className="text-[11px] text-slate-500">
            Due Balance: <strong className={due > 0 ? "text-amber-700" : "text-slate-800"}>{formatINR(due)}</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Vendor Payout</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatINR(vendorPayout)}
          </div>
          <div className="text-[11px] text-slate-500">
            Platform Margin: <strong className="text-slate-800">{formatINR(platformMargin)}</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Route Scope</span>
            <Navigation className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 truncate tracking-tight">
            {specParsed.distanceKm ? `${specParsed.distanceKm} km` : "Standard Route"}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold truncate">
            {tripTypeLabel} {specParsed.duration ? `• ${specParsed.duration}` : ""}
          </div>
        </div>
      </div>

      {/* Status Management & Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Workflow Status</span>
            <span className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-bold border ${statusStyle.bg}`}>
              {statusStyle.label}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Booking Reference</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {booking.bookingReference || booking.id}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(booking.bookingReference || booking.id)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                title="Copy reference code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {booking.rideOtp && (
            <>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 block mb-0.5">Ride Security OTP</span>
                <span className="font-mono font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 text-xs tracking-wider">
                  {booking.rideOtp}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Quick Status Updater */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Update Status:</span>
          <select
            value={booking.status || "PENDING_ALLOCATION"}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer disabled:opacity-50"
          >
            <option value="PENDING_ALLOCATION">PENDING ALLOCATION</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="ASSIGNED_TO_VENDOR">ASSIGNED TO VENDOR</option>
            <option value="ON_THE_WAY">ON THE WAY</option>
            <option value="IN_TRANSIT">IN TRANSIT</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Main Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Route & Vehicle & Customer Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Trip Route & Itinerary */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Trip Itinerary & Route Blueprint
                </h3>
              </div>
              <span className="text-xs font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                {tripTypeLabel}
              </span>
            </div>

            {/* Visual Route */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-extrabold text-slate-900">
                <span>{booking.pickupCity || "Origin"}</span>
                {stopsList.length > 0 && (
                  stopsList.map((stop, sIdx) => (
                    <span key={sIdx} className="inline-flex items-center gap-1.5">
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                        Via: {stop.split(",")[0].trim()}
                      </span>
                    </span>
                  ))
                )}
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{booking.dropCity || "Destination"}</span>
              </div>

              {specParsed.distanceKm && (
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200/60">
                  <span>Included / Estimated: <strong>{specParsed.distanceKm} km</strong></span>
                  {specParsed.duration && <span>Duration: <strong>{specParsed.duration}</strong></span>}
                  {specParsed.perKmRate && <span>Per-KM Tariff: <strong>₹{specParsed.perKmRate}/km</strong></span>}
                </div>
              )}
            </div>

            {/* Addresses Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Pickup Location & Landmark</span>
                <p className="font-bold text-slate-900 text-xs leading-relaxed">
                  {booking.pickupAddress || booking.pickupLocation || booking.pickupCity}
                </p>
                <div className="pt-2 flex items-center gap-2 text-slate-500 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{pickupDt.date} at {pickupDt.time || "Scheduled"}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Drop Location & Destination</span>
                <p className="font-bold text-slate-900 text-xs leading-relaxed">
                  {booking.dropAddress || booking.dropLocation || booking.dropCity}
                </p>
                {returnDt ? (
                  <div className="pt-2 flex items-center gap-2 text-amber-700 text-[11px] font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Return: {returnDt.date} at {returnDt.time || "23:59"}</span>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center gap-2 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Point-to-Point Direct Drop</span>
                  </div>
                )}
              </div>
            </div>

            {/* Intermediate Stops Detail if present */}
            {stopsList.length > 0 && (
              <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider block">
                  Designated Intermediate Stops ({stopsList.length})
                </span>
                <div className="space-y-1.5">
                  {stopsList.map((stop, sIdx) => (
                    <div key={sIdx} className="text-xs text-slate-800 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <span className="font-medium">{stop}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Allocated Fleet Asset & Chauffeur */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Allocated Fleet Asset & Chauffeur
                </h3>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusStyle.bg}`}>
                {statusStyle.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vehicle Detail Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Requested Model & Class</span>
                    <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">
                      {booking.vehicleModel || specParsed.vehicleModel || booking.preferredVehicle || booking.vehicleCategory || "Commercial Fleet"}
                    </h4>
                    <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded inline-block mt-1">
                      {booking.vehicleCategory || "HATCHBACK"} • {specParsed.fuelType || "Diesel / Petrol"}
                    </span>
                  </div>

                  {specParsed.vehicleImage && (
                    <img
                      src={specParsed.vehicleImage}
                      alt="Booked Vehicle"
                      className="w-16 h-12 object-cover rounded-lg border border-slate-200 shadow-2xs shrink-0"
                    />
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Commercial Registration Plate</span>
                  <NumberPlate registrationNumber={booking.assignedVehicleNumber || booking.vehicleNumber} />
                </div>
              </div>

              {/* Chauffeur & Vendor Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Assigned Chauffeur</span>
                  <div className="font-extrabold text-sm text-slate-900 mt-0.5 flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>{booking.assignedDriverName || booking.driverName || "Pending Allocation"}</span>
                  </div>
                  {(booking.assignedDriverPhone || booking.driverPhone) ? (
                    <a
                      href={`tel:${booking.assignedDriverPhone || booking.driverPhone}`}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 mt-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{booking.assignedDriverPhone || booking.driverPhone}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Chauffeur will be assigned prior to dispatch</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Fleet Vendor Partner</span>
                  <p className="font-semibold text-slate-800 text-xs mt-0.5">
                    {booking.vendorBusinessName || booking.vendorName || "Grab Rentals In-House Operations"}
                  </p>
                  {booking.vendorPhone && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{booking.vendorPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                icon={Car}
                onClick={openAllocateModal}
              >
                {booking.assignedVehicleNumber ? "Reassign Vehicle / Chauffeur" : "Allocate Vehicle & Chauffeur Now"}
              </Button>
            </div>
          </div>

          {/* 3. Customer & Passenger Dossier */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Customer & Passenger Dossier
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                ID: {booking.customerId ? String(booking.customerId).substring(0, 8) : "Guest"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Lead Booking Account</span>
                <p className="font-black text-slate-900 text-sm">{booking.customerName || "Customer"}</p>
                <div className="space-y-1 text-slate-600">
                  {booking.customerPhone && (
                    <a href={`tel:${booking.customerPhone}`} className="flex items-center gap-2 hover:text-amber-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.customerPhone}</span>
                    </a>
                  )}
                  {booking.customerEmail && (
                    <a href={`mailto:${booking.customerEmail}`} className="flex items-center gap-2 hover:text-amber-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.customerEmail}</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-2 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Designated Passenger Details</span>
                <p className="font-black text-slate-900 text-sm">{booking.passengerName || booking.customerName || "Same as lead customer"}</p>
                <div className="space-y-1 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{booking.passengerPhone || booking.customerPhone || "—"}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Passenger Count: <strong>{booking.passengerCount || 2} Pax</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions / Notes */}
            {specParsed.customerNotes && (
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 space-y-1 text-xs">
                <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider block">
                  Customer Special Instructions & Notes
                </span>
                <p className="text-slate-800 font-medium">{specParsed.customerNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Financial & Settlement Ledger */}
        <div className="space-y-6">

          {/* Financial Settlement Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Tariff & Settlement Ledger
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {booking.paymentStatus || "PAID"}
              </span>
            </div>

            {/* Itemized Table */}
            <div className="space-y-2 text-xs">
              {specParsed.baseFare != null && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Base Fare ({specParsed.distanceKm || "Standard"} km)</span>
                  <span className="font-semibold text-slate-800">{formatINR(specParsed.baseFare)}</span>
                </div>
              )}

              {specParsed.perKmRate != null && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Rate per Additional KM</span>
                  <span className="font-semibold text-slate-800">₹{specParsed.perKmRate}/km</span>
                </div>
              )}

              {specParsed.driverAllowance != null && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Driver Allowance {specParsed.driverAllowanceLabel ? `(${specParsed.driverAllowanceLabel})` : ""}</span>
                  <span className="font-semibold text-slate-800">{formatINR(specParsed.driverAllowance)}</span>
                </div>
              )}

              {specParsed.tollPrice != null && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">FASTag Toll & Taxes</span>
                  <span className="font-semibold text-slate-800">{formatINR(specParsed.tollPrice)}</span>
                </div>
              )}

              {/* Addons */}
              {specParsed.addons?.length > 0 && (
                specParsed.addons.map((add, aIdx) => (
                  <div key={aIdx} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">{add.label}</span>
                    <span className="font-semibold text-slate-800">+{formatINR(add.fee)}</span>
                  </div>
                ))
              )}

              {specParsed.couponInfo && (
                <div className="flex justify-between py-1 border-b border-emerald-100 text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{specParsed.couponInfo}</span>
                  </span>
                  <span>Discount Applied</span>
                </div>
              )}

              {specParsed.taxes != null && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">GST & Regulatory Cess {specParsed.taxLabel ? `(${specParsed.taxLabel})` : ""}</span>
                  <span className="font-semibold text-slate-800">{formatINR(specParsed.taxes)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-b border-slate-200 text-sm font-black">
                <span className="text-slate-900">Gross Tariff</span>
                <span className="text-slate-900">{formatINR(fare)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Advance Collected</span>
                <span className="text-emerald-700 font-bold">{formatINR(advance)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Due on Boarding / Completion</span>
                <span className={`font-bold ${due > 0 ? "text-amber-700" : "text-slate-800"}`}>
                  {formatINR(due)}
                </span>
              </div>

              <div className="pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span>Vendor Net Payout</span>
                    <span>{formatINR(vendorPayout)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Platform Commission</span>
                    <span>{formatINR(platformMargin)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/80">
                    Standard 70/30 platform revenue split applied
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Trail & Governance */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                System Governance & Audit
              </h3>
            </div>

            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Created At</span>
                <span className="font-medium text-slate-800">
                  {booking.createdAt ? new Date(booking.createdAt).toLocaleString("en-IN") : "—"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Last Modified</span>
                <span className="font-medium text-slate-800">
                  {booking.updatedAt ? new Date(booking.updatedAt).toLocaleString("en-IN") : "—"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Internal Audit ID</span>
                <span className="font-mono text-[11px] text-slate-700">{booking.id || "N/A"}</span>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Commercial Badged Fleet & Chauffeur Network</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Fleet Allocation Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Allocate Commercial Fleet — Booking #${booking.bookingReference || booking.id}`}
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-slate-500">
                {selectedVehicle ? (
                  <span className="text-slate-700">
                    Selected: <strong className="text-slate-900">{selectedVehicle.model}</strong> ({selectedVehicle.registrationNumber})
                  </span>
                ) : (
                  "Select a vehicle to proceed with dispatch"
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submittingAllocation}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmAllocation}
                  disabled={!selectedVehicle || submittingAllocation}
                  loading={submittingAllocation}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Confirm Allocation
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 py-1">
            {/* Target Booking Summary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Trip Route</span>
                <span className="font-extrabold text-slate-900 text-xs">
                  {booking.pickupCity} ➔ {booking.dropCity}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Scheduled Pickup</span>
                <span className="font-semibold text-slate-800 text-[11px]">
                  {pickupDt.date} at {pickupDt.time || "Scheduled"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Requested Class</span>
                <span className="font-black text-amber-600 uppercase text-xs">
                  {booking.vehicleCategory || "Standard"}
                </span>
              </div>
            </div>

            {/* Vehicle Selection Header */}
            <div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVehicleTab("MATCHING")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      vehicleTab === "MATCHING"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Matching Class ({matchingVehicles.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleTab("ALL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      vehicleTab === "ALL"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All Available Fleet ({availableVehicles.length})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    placeholder="Search model, plate, vendor..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>

              {loadingFleet ? (
                <div className="py-12 text-center">
                  <LoadingAnimation inline title="Querying available commercial fleet..." />
                </div>
              ) : displayedVehicles.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Car className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <div className="font-bold text-slate-700 text-xs">No Available Vehicles Found</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {vehicleTab === "MATCHING"
                      ? `No available vehicles in "${bookingCategory}" category. Click "All Available Fleet" to view alternative vehicles.`
                      : "All vehicles are currently dispatched or offline."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {displayedVehicles.map((v) => {
                    const isSelected =
                      selectedVehicle &&
                      (selectedVehicle.rawId || selectedVehicle.id) === (v.rawId || v.id);

                    return (
                      <div
                        key={v.id || v.rawId || v.registrationNumber}
                        onClick={() => setSelectedVehicle(v)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-50/70 border-blue-500 shadow-xs ring-2 ring-blue-500/20"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{v.model}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {v.category || v.vehicleType || "Standard"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <NumberPlate registrationNumber={v.registrationNumber} />
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{v.vendorName || "Grab In-House"}</span>
                            {v.seatingCapacity && (
                              <span className="text-slate-400">• {v.seatingCapacity} Seats</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Available
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chauffeur Assignment Options */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">Chauffeur Assignment</div>
                  <div className="text-[11px] text-slate-500">
                    {assignChauffeurNow
                      ? "Assign an available licensed driver immediately."
                      : "Route booking to the Fleet Owner / Vendor to designate their chauffeur."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAssignChauffeurNow(!assignChauffeurNow)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    assignChauffeurNow
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {assignChauffeurNow ? "Designate Chauffeur" : "Auto-Route to Partner"}
                </button>
              </div>

              {assignChauffeurNow && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 mb-2">
                    Select Available Chauffeur ({availableDrivers.length})
                  </div>
                  {availableDrivers.length === 0 ? (
                    <div className="text-xs text-slate-500 italic py-2">
                      No drivers are marked AVAILABLE in the system. The booking will be routed to the vendor to assign driver.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                      {availableDrivers.map((d) => {
                        const isDSelected =
                          selectedDriver &&
                          (selectedDriver.rawId || selectedDriver.id) === (d.rawId || d.id);
                        return (
                          <div
                            key={d.id || d.rawId || d.phone}
                            onClick={() => setSelectedDriver(d)}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                              isDSelected
                                ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-900 font-bold"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <div>
                              <div className="font-bold">{d.name}</div>
                              <div className="text-[10px] text-slate-500">{d.phone} • {d.vendorName || "Partner"}</div>
                            </div>
                            {isDSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
