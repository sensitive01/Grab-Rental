"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import {
  Car,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Calendar,
  MapPin,
  Phone,
  ArrowLeft,
  Filter,
  Sparkles,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function VehicleAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBookingId = searchParams.get("bookingId");

  const [allBookings, setAllBookings] = useState([]);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [bookRes, vehRes] = await Promise.all([
          operationsApi.getBookings(),
          operationsApi.getVehicles("AVAILABLE"),
        ]);
        const list = (bookRes.data || []).filter(
          (b) =>
            (b.status === "PENDING_ALLOCATION" ||
              b.id === preselectedBookingId ||
              b.rawId === preselectedBookingId) &&
            b.status !== "PENDING_PAYMENT_VERIFICATION" &&
            b.paymentStatus !== "UNDER_REVIEW"
        );
        setAllBookings(list);
        setVehicles(vehRes.data || []);

        let target = null;
        if (preselectedBookingId) {
          target = list.find(
            (b) =>
              b.id === preselectedBookingId ||
              b.rawId === preselectedBookingId ||
              String(b.id).toUpperCase() === String(preselectedBookingId).toUpperCase()
          );
          // When a bookingId is provided, show only that specific booking
          setShowAllBookings(false);
        } else {
          setShowAllBookings(true);
        }

        if (!target && list.length > 0) {
          target = list[0];
        }
        setSelectedBooking(target);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [preselectedBookingId]);

  const isTargetMode = Boolean(preselectedBookingId && !showAllBookings);
  const displayedBookings =
    isTargetMode && selectedBooking ? [selectedBooking] : allBookings;

  const requiredCategory = (selectedBooking?.vehicleCategory || "").trim().toUpperCase();
  const matchingVehicles = useMemo(() => {
    if (!requiredCategory) return [];
    return vehicles.filter(
      (v) => (v.category || "").trim().toUpperCase() === requiredCategory
    );
  }, [vehicles, requiredCategory]);

  const displayedVehicles = useMemo(() => {
    if (vehicleCategoryFilter === "MATCHING" && matchingVehicles.length > 0) {
      return matchingVehicles;
    }
    return vehicles;
  }, [vehicleCategoryFilter, matchingVehicles, vehicles]);

  async function handleConfirmDispatch() {
    if (!selectedBooking || !selectedVehicle) {
      setToast({
        type: "warning",
        message: "Please select an available vehicle to confirm dispatch.",
      });
      return;
    }

    if (selectedBooking.status === "PENDING_PAYMENT_VERIFICATION" || selectedBooking.paymentStatus === "UNDER_REVIEW") {
      setToast({
        type: "warning",
        message: "Payment verification is required before allocating fleet. Please verify payment first.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const bId = selectedBooking.rawId || selectedBooking.id;
      const vId = selectedVehicle.rawId || selectedVehicle.id;

      await operationsApi.assignVehicle(bId, vId);
      setToast({
        type: "success",
        message: `Vehicle ${selectedVehicle.model} (${selectedVehicle.registrationNumber}) assigned to booking ${selectedBooking.id}! Routed to Fleet Owner (${selectedVehicle.vendorName || "Vendor"}) to assign chauffeur and confirm.`,
      });
      setTimeout(() => {
        router.push(`/operations/bookings/${selectedBooking.id}`);
      }, 1200);
    } catch {
      setToast({ type: "error", message: "Failed to allocate vehicle" });
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Fleet Vehicle Fast Allocator"
          subtitle="Assign commercial vehicles to customer bookings. Chauffeurs are assigned by the fleet owner."
          breadcrumbs={[
            { label: "Operations", href: "/operations/dashboard" },
            { label: "Assignments", href: "/operations/assignments/vehicle" },
            { label: "Fast Allocator" },
          ]}
        />

        <div className="bg-white rounded-2xl border border-slate-200/80 p-14 shadow-xs min-h-[440px] flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center">
            {/* Ambient pulse halo */}
            <div className="absolute w-24 h-24 rounded-full bg-amber-500/10 animate-ping" />
            <div className="absolute w-16 h-16 rounded-full bg-amber-500/20 animate-pulse" />
            {/* Spinning dual rings */}
            <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-amber-500 border-r-amber-500 animate-spin" />
            <div className="absolute">
              <Car className="w-6 h-6 text-amber-600 animate-pulse" />
            </div>
          </div>

          <h3 className="mt-6 text-base font-bold text-slate-900 tracking-tight">
            Loading Fast Allocator
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 max-w-sm">
            Fetching unassigned bookings and available commercial fleet...
          </p>

          {/* Skeleton progress pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Checking bookings
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              Scanning fleet
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Fleet Vehicle Fast Allocator"
        subtitle="Assign commercial vehicles to customer bookings. Chauffeurs are assigned by the fleet owner upon dispatch acceptance."
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Pending Allocations", href: "/operations/bookings/new" },
          {
            label: selectedBooking?.id
              ? `Allocate ${selectedBooking.id}`
              : "Fast Allocator",
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Booking Selection */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title={
              isTargetMode
                ? "1. Booking to Dispatch"
                : "1. Select Booking to Dispatch"
            }
            subtitle={
              isTargetMode
                ? `Target booking: #${selectedBooking?.id || preselectedBookingId}`
                : `${displayedBookings.length} booking(s) needing allocation`
            }
          >
            {/* Header controls for switching between isolated target view and all pending */}
            {preselectedBookingId && allBookings.length > 1 && (
              <div className="mb-3 pb-2.5 border-b border-slate-100 flex items-center justify-between text-[11px]">
                {isTargetMode ? (
                  <button
                    type="button"
                    onClick={() => setShowAllBookings(true)}
                    className="font-semibold text-amber-700 hover:text-amber-800 underline flex items-center gap-1"
                  >
                    View all pending bookings ({allBookings.length})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAllBookings(false)}
                    className="font-semibold text-amber-700 hover:text-amber-800 underline flex items-center gap-1"
                  >
                    Focus on #{preselectedBookingId}
                  </button>
                )}
                <Link
                  href="/operations/bookings/new"
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Queue
                </Link>
              </div>
            )}

            {displayedBookings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No pending bookings requiring vehicle allocation.
              </div>
            ) : isTargetMode && selectedBooking ? (
              /* Isolated Full Target Booking Card */
              <div className="p-4 rounded-xl border border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-400 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {selectedBooking.id}
                    </span>
                    <Badge variant="warning" size="sm">
                      {selectedBooking.vehicleCategory}
                    </Badge>
                    {Boolean(selectedBooking.isPetFriendly) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        🐾 {selectedBooking.petType || "Pet"} ({selectedBooking.petCount || 1})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300">
                    Target Booking
                  </span>
                </div>

                <div>
                  <div className="font-bold text-sm text-slate-900">
                    {selectedBooking.customerName}
                  </div>
                  {selectedBooking.customerPhone && (
                    <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 font-medium">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {selectedBooking.customerPhone}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-white/90 border border-amber-200/80 text-[11px] space-y-1.5 shadow-xs">
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">Pickup: </span>
                      {selectedBooking.pickupLocation}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700 pt-1.5 border-t border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">Drop: </span>
                      {selectedBooking.dropLocation}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200/60">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      Pickup Time
                    </span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {selectedBooking.startDate}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {selectedBooking.serviceType}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/80 border border-amber-200/60">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      Total Fare
                    </span>
                    <span className="font-bold text-base text-slate-900 mt-0.5 block">
                      {formatINR(selectedBooking.fare)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Multi-Booking List */
              <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                {displayedBookings.map((b) => {
                  const isSelected = selectedBooking?.id === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-400"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">
                          {b.id}
                        </span>
                        <Badge variant="warning" size="sm">
                          {b.vehicleCategory}
                        </Badge>
                      </div>
                      <div className="font-semibold text-slate-800 mt-1 flex items-center justify-between">
                        <span>{b.customerName}</span>
                        {Boolean(b.isPetFriendly) && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                            🐾 {b.petType || "Pet"}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {b.pickupLocation} ➔ {b.dropLocation}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-600 font-medium">
                          {b.startDate}
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatINR(b.fare)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (7 cols): Available Vehicles & Available Drivers */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Booking Summary Banner */}
          {selectedBooking && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 text-xs shadow-xs">
              <div className="font-bold text-blue-900 text-sm flex items-center justify-between">
                <span>
                  Allocating for #{selectedBooking.id} ({selectedBooking.customerName})
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {formatINR(selectedBooking.fare)}
                </span>
              </div>
              <p className="text-blue-800 mt-1">
                Required: <strong>{selectedBooking.vehicleCategory}</strong> (
                {selectedBooking.preferredVehicle || "Any"}) • Pickup:{" "}
                <strong>{selectedBooking.startDate}</strong>
              </p>
            </div>
          )}

          {/* 2. Choose Available Vehicle */}
          <Card
            title="2. Choose Available Vehicle"
            subtitle={`${displayedVehicles.length} vehicle(s) displayed • ${vehicles.length} commercial vehicles ready for duty`}
          >
            {/* Category Filter Pills */}
            {selectedBooking?.vehicleCategory && (
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 text-[11px] font-medium">
                    Filter:
                  </span>
                  <button
                    type="button"
                    onClick={() => setVehicleCategoryFilter("ALL")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      vehicleCategoryFilter === "ALL"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All Fleet ({vehicles.length})
                  </button>
                  {matchingVehicles.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setVehicleCategoryFilter("MATCHING")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        vehicleCategoryFilter === "MATCHING"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      }`}
                    >
                      Matching {selectedBooking.vehicleCategory} ({matchingVehicles.length})
                    </button>
                  ) : (
                    <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      No direct {selectedBooking.vehicleCategory} in fleet (showing all)
                    </span>
                  )}
                </div>
              </div>
            )}

            {displayedVehicles.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No vehicle available
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                {displayedVehicles.map((v) => {
                  const isChosen = selectedVehicle?.id === v.id;
                  const isCatMatch =
                    (v.category || "").trim().toUpperCase() === requiredCategory;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicle(v)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChosen
                          ? "border-emerald-500 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-400"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <NumberPlate registrationNumber={v.registrationNumber} />
                        <div className="flex items-center gap-1">
                          {isCatMatch && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                              MATCH
                            </span>
                          )}
                          <span className="text-[10px] font-semibold uppercase text-slate-500">
                            {v.category}
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900">{v.model}</div>
                      <div className="text-[11px] text-slate-500">
                        {v.seatingCapacity} Seater • {v.fuelType}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 truncate">
                        {v.vendorName}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* 3. Fleet Owner Chauffeur Delegation Workflow */}
          <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/50 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Chauffeur Assignment Delegated to Fleet Owner</span>
                  <Badge variant="info" size="sm" className="text-[10px]">Standard Workflow</Badge>
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Chauffeur selection by operations is not required. Operations assigns the commercial vehicle, and the Fleet Owner (
                  <strong className="text-slate-900">{selectedVehicle?.vendorName || "Assigned Fleet Vendor"}</strong>
                  ) will allocate their verified commercial driver upon accepting the booking.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Step 1: Operations Assigns Vehicle
                  </span>
                  <span>➔</span>
                  <span className="flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Step 2: Fleet Owner Assigns Chauffeur & Confirms
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Button Bar */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600 space-y-0.5">
              <div>
                Vehicle: <strong>{selectedVehicle?.registrationNumber ? `${selectedVehicle.registrationNumber} (${selectedVehicle.model})` : "Not chosen"}</strong>
              </div>
              <div className="text-[11px] text-slate-500">
                Fleet Owner: <strong className="text-slate-800">{selectedVehicle?.vendorName || "Pending vehicle selection"}</strong> • Chauffeur: <span className="text-blue-600 font-medium italic">Assigned by Fleet Owner</span>
              </div>
            </div>
            <Button
              variant="emerald"
              size="md"
              icon={CheckCircle2}
              onClick={handleConfirmDispatch}
              isLoading={submitting}
              disabled={submitting || !selectedBooking || !selectedVehicle}
            >
              {submitting ? "Dispatching to Fleet Owner..." : "Confirm & Dispatch Vehicle"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
