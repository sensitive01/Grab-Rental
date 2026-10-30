"use client";

import { useState, useEffect, useMemo } from "react";
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
  Printer,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import TripClosingModal from "@/components/trips/TripClosingModal";
import StartRideModal from "@/components/trips/StartRideModal";
import { vendorApi } from "@/lib/vendorApi";
import { formatINR } from "@/lib/utils";

export default function VendorTripsPage() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, ACTIVE, ASSIGNED, COMPLETED
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("ALL");

  // Modal State
  const [closingTrip, setClosingTrip] = useState(null);
  const [startingTrip, setStartingTrip] = useState(null);

  const fetchTripsData = async (isSilent = false) => {
    try {
      if (isSilent) setRefreshing(true);
      else setLoading(true);

      const [bookingsRes, vehiclesRes] = await Promise.all([
        vendorApi.getBookings().catch(() => []),
        vendorApi.getVehicles().catch(() => [])
      ]);

      setTrips(Array.isArray(bookingsRes) ? bookingsRes : []);
      setVehicles(Array.isArray(vehiclesRes) ? vehiclesRes : []);
    } catch (err) {
      console.error("Failed to load trips hub data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTripsData();
  }, []);

  // Determine if vendor operates a single fleet vehicle or multi-vehicle fleet
  const isSingleFleet = vehicles.length <= 1;

  // Counts
  const counts = useMemo(() => {
    let active = 0;
    let assigned = 0;
    let completed = 0;

    trips.forEach((t) => {
      const st = String(t.rawStatus || t.status || "").toUpperCase();
      if (st === "ON_THE_WAY" || st === "IN_TRANSIT" || st === "ACTIVE") active++;
      else if (st === "ASSIGNED_TO_VENDOR" || st === "CONFIRMED" || st === "ASSIGNED") assigned++;
      else if (st === "COMPLETED") completed++;
    });

    return { all: trips.length, active, assigned, completed };
  }, [trips]);

  // Filtered List
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const st = String(t.rawStatus || t.status || "").toUpperCase();

      // Tab filter
      if (activeTab === "ACTIVE") {
        if (st !== "ON_THE_WAY" && st !== "IN_TRANSIT" && st !== "ACTIVE") return false;
      } else if (activeTab === "ASSIGNED") {
        if (st !== "ASSIGNED_TO_VENDOR" && st !== "CONFIRMED" && st !== "ASSIGNED") return false;
      } else if (activeTab === "COMPLETED") {
        if (st !== "COMPLETED") return false;
      }

      // Vehicle Filter (for multi-fleet)
      if (vehicleFilter !== "ALL") {
        if (t.vehicleId !== vehicleFilter && t.vehicleNumber !== vehicleFilter) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const ref = String(t.bookingReference || t.id || "").toLowerCase();
        const passenger = String(t.customer?.name || "").toLowerCase();
        const phone = String(t.customer?.phone || "").toLowerCase();
        const driver = String(t.driverName || "").toLowerCase();
        const car = String(t.vehicleNumber || "").toLowerCase();
        const pickup = String(t.pickup || "").toLowerCase();
        const drop = String(t.drop || "").toLowerCase();

        return (
          ref.includes(q) ||
          passenger.includes(q) ||
          phone.includes(q) ||
          driver.includes(q) ||
          car.includes(q) ||
          pickup.includes(q) ||
          drop.includes(q)
        );
      }

      return true;
    });
  }, [trips, activeTab, vehicleFilter, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Header & Fleet Mode Bar */}
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: "Operations" }, { label: "Trips & Billing Hub" }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                Fleet Trips &amp; Billing
              </h1>
              {isSingleFleet ? (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5" /> Single Vehicle Fleet
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-black flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Multi-Fleet Operations ({vehicles.length} Cabs)
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage live on-road dispatches, update odometer &amp; toll expenses, and generate GST tax invoices.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => fetchTripsData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh Trips"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-amber-500" : ""}`} />
            </button>
            <Link
              href="/vendor/trips/active"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Radar Live Map ↗
            </Link>
          </div>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === "ALL"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider block ${activeTab === "ALL" ? "text-slate-400" : "text-slate-500"}`}>
            All Trips
          </span>
          <span className="text-xl sm:text-2xl font-black mt-1 block">
            {counts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ACTIVE")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === "ACTIVE"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider block flex items-center gap-1.5 ${activeTab === "ACTIVE" ? "text-emerald-100" : "text-emerald-600"}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            In Transit / On Road
          </span>
          <span className="text-xl sm:text-2xl font-black mt-1 block">
            {counts.active}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ASSIGNED")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === "ASSIGNED"
              ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider block ${activeTab === "ASSIGNED" ? "text-slate-900" : "text-amber-700"}`}>
            Assigned / Ready
          </span>
          <span className="text-xl sm:text-2xl font-black mt-1 block">
            {counts.assigned}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("COMPLETED")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === "COMPLETED"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider block ${activeTab === "COMPLETED" ? "text-blue-100" : "text-blue-600"}`}>
            Completed &amp; Invoiced
          </span>
          <span className="text-xl sm:text-2xl font-black mt-1 block">
            {counts.completed}
          </span>
        </button>
      </div>

      {/* Search & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking #, customer, route, car..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Multi-fleet vehicle filter */}
        {!isSingleFleet && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Fleet Cabs</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicleNumber} ({v.model || v.category})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main List Display */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
          <p className="text-xs text-slate-500 font-medium">Loading fleet trips telemetry...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-900">No Trips Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? `No matching journeys for query "${searchQuery}". Clear search to view all.`
              : "No trip records match the current status tab filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map((trip) => {
            const rawSt = String(trip.rawStatus || trip.status).toUpperCase();
            const isCompleted = rawSt === "COMPLETED";
            const isActive = rawSt === "ON_THE_WAY" || rawSt === "IN_TRANSIT" || rawSt === "ACTIVE";

            const hasVehicle = Boolean(
              trip.vehicleNumber && 
              trip.vehicleNumber !== "Assigned by Fleet" && 
              trip.vehicleNumber !== "Unassigned" && 
              trip.vehicleNumber !== "Assigned" &&
              trip.vehicleNumber.trim().length > 0
            );

            // Only allow starting the ride IF the trip is assigned AND vendor has actually assigned a vehicle
            const isReadyToStart = (rawSt === "ASSIGNED_TO_VENDOR" || rawSt === "CONFIRMED" || rawSt === "ASSIGNED") && hasVehicle;
            const isPendingVehicle = (rawSt === "ASSIGNED_TO_VENDOR" || rawSt === "CONFIRMED" || rawSt === "ASSIGNED" || rawSt === "PENDING_ALLOCATION") && !hasVehicle;

            return (
              <div
                key={trip.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden p-5 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  
                  {/* Left: Journey Particulars */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400">
                        #{trip.bookingReference || trip.id}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {trip.tripType}
                      </span>
                      <StatusBadge status={trip.status} />
                      {trip.customerRouteKm > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <Navigation className="w-2.5 h-2.5" />
                          {trip.customerRouteKm} KM Route
                        </span>
                      )}
                      {trip.invoiceNumber && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          {trip.invoiceNumber}
                        </span>
                      )}
                      {trip.addons && trip.addons.length > 0 && (
                        trip.addons.map((a) => (
                          <span
                            key={a.id}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200"
                            title={`${a.name}: ${formatINR(a.price)}`}
                          >
                            {a.emoji || "✨"} {a.name}
                          </span>
                        ))
                      )}
                    </div>

                    {/* Route */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400">Pickup</span>
                          <p className="font-bold text-slate-900">{trip.pickup}</p>
                          <span className="text-[11px] text-slate-500 font-medium">{trip.pickupDate}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400">Drop Destination</span>
                          <p className="font-bold text-slate-900">{trip.drop}</p>
                        </div>
                      </div>
                    </div>

                    {/* Chauffeur and Vehicle Pair */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      {hasVehicle ? (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                          <NumberPlate number={trip.vehicleNumber} />
                          <span className="text-slate-600 font-semibold text-[11px]">{trip.vehicleType}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                          <Car className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Vehicle Pending Assignment</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Driver:</span>
                        <strong className="text-slate-900">{trip.driverName || "Pending Assignment"}</strong>
                        {trip.driverPhone && (
                          <span className="text-slate-500 text-[11px]">({trip.driverPhone})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Passenger:</span>
                        <strong className="text-slate-900">{trip.customer?.name || "Passenger"}</strong>
                        {trip.customer?.phone && (
                          <span className="text-slate-500 text-[11px]">({trip.customer.phone})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Commercials & Action Buttons */}
                  <div className="lg:border-l lg:border-slate-100 lg:pl-6 space-y-4 shrink-0 flex flex-col justify-between">
                    
                    {/* Amount Block */}
                    <div className="space-y-1 text-left lg:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        {isCompleted ? "Final Billed Fare" : "Contracted Fare"}
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-slate-950">
                        {formatINR(trip.finalTotalFare || trip.totalFare || trip.estimatedAmount)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Advance: <strong className="text-slate-700">{formatINR(trip.advancePaid)}</strong> • Balance: <strong className="text-emerald-600">{formatINR(trip.dueAmount || 0)}</strong>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                      {/* Assigned & Vehicle Allocated -> Show Start Ride */}
                      {isReadyToStart && (
                        <button
                          type="button"
                          onClick={() => setStartingTrip(trip)}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                          <Navigation className="w-4 h-4 fill-white" />
                          Start Ride
                        </button>
                      )}

                      {/* Assigned BUT Vehicle NOT Allocated -> Assign Vehicle First */}
                      {isPendingVehicle && (
                        <div className="space-y-1">
                          <Link
                            href={`/vendor/bookings/${trip.id}`}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all text-center"
                          >
                            <Car className="w-4 h-4" />
                            Assign Vehicle First
                          </Link>
                          <span className="text-[10px] text-amber-700 font-semibold block text-center lg:text-right">
                            Vehicle required to start ride
                          </span>
                        </div>
                      )}

                      {/* In Transit / Active -> Show End Trip & Finalize Fare */}
                      {isActive && (
                        <button
                          type="button"
                          onClick={() => setClosingTrip(trip)}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                        >
                          <Receipt className="w-4 h-4 text-slate-950" />
                          End Trip &amp; Finalize Fare
                        </button>
                      )}

                      {isCompleted && (
                        <Link
                          href={`/vendor/trips/${trip.bookingReference || trip.id}/invoice`}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0082fe] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/15 transition-all"
                        >
                          <Printer className="w-4 h-4 text-white" />
                          View / Print Tax Invoice
                        </Link>
                      )}

                      <Link
                        href={`/vendor/bookings/${trip.id}`}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      >
                        Trip File &amp; Details <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Start Ride Modal (Step 1) */}
      {startingTrip && (
        <StartRideModal
          isOpen={Boolean(startingTrip)}
          onClose={() => setStartingTrip(null)}
          trip={startingTrip}
          onRideStarted={(updated) => {
            fetchTripsData(true);
          }}
        />
      )}

      {/* Trip Closing Modal (Step 2) */}
      {closingTrip && (
        <TripClosingModal
          isOpen={Boolean(closingTrip)}
          onClose={() => setClosingTrip(null)}
          trip={closingTrip}
          onTripCompleted={(updated) => {
            fetchTripsData(true);
          }}
        />
      )}

    </div>
  );
}
