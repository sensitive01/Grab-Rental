"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { Car, CheckCircle2, ArrowRight, UserCheck, Calendar, MapPin } from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function VehicleAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBookingId = searchParams.get("bookingId");

  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [bookRes, vehRes, drvRes] = await Promise.all([
          operationsApi.getBookings(),
          operationsApi.getVehicles("AVAILABLE"),
          operationsApi.getDrivers("AVAILABLE"),
        ]);
        setBookings(bookRes.data.filter((b) => b.status === "PENDING_ALLOCATION" || b.id === preselectedBookingId));
        setVehicles(vehRes.data);
        setDrivers(drvRes.data);

        if (preselectedBookingId) {
          const match = bookRes.data.find((b) => b.id === preselectedBookingId);
          if (match) setSelectedBooking(match);
        } else if (bookRes.data.length > 0) {
          setSelectedBooking(bookRes.data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [preselectedBookingId]);

  async function handleConfirmDispatch() {
    if (!selectedBooking || !selectedVehicle || !selectedDriver) {
      setToast({
        type: "warning",
        message: "Please select both an available Vehicle and Driver to confirm dispatch.",
      });
      return;
    }

    try {
      await operationsApi.assignVehicleAndDriver(
        selectedBooking.id,
        selectedVehicle.id,
        selectedDriver.id
      );
      setToast({
        type: "success",
        message: `Dispatched ${selectedVehicle.model} with driver ${selectedDriver.name} to booking ${selectedBooking.id}!`,
      });
      setTimeout(() => {
        router.push(`/operations/bookings/${selectedBooking.id}`);
      }, 1200);
    } catch {
      setToast({ type: "error", message: "Failed to allocate fleet" });
    }
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
        title="Fleet & Chauffeur Fast Allocator"
        subtitle="Split-screen dual dispatch workflow for pending customer bookings"
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Assignments", href: "/operations/assignments/vehicle" },
          { label: "Fast Allocator" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Booking Selection */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            title="1. Select Booking to Dispatch"
            subtitle={`${bookings.length} booking(s) needing allocation`}
          >
            {bookings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No pending bookings requiring vehicle allocation.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                {bookings.map((b) => {
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
                        <span className="font-mono font-bold text-slate-900">{b.id}</span>
                        <Badge variant="warning" size="sm">
                          {b.vehicleCategory}
                        </Badge>
                      </div>
                      <div className="font-semibold text-slate-800 mt-1">{b.customerName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {b.pickupLocation} ➔ {b.dropLocation}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-600 font-medium">{b.startDate}</span>
                        <span className="font-bold text-slate-900">{formatINR(b.fare)}</span>
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
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 text-xs">
              <div className="font-bold text-blue-900 text-sm flex items-center justify-between">
                <span>Allocating for #{selectedBooking.id} ({selectedBooking.customerName})</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(selectedBooking.fare)}</span>
              </div>
              <p className="text-blue-800 mt-1">
                Required: <strong>{selectedBooking.vehicleCategory}</strong> ({selectedBooking.preferredVehicle || "Any"}) • Pickup: <strong>{selectedBooking.startDate}</strong>
              </p>
            </div>
          )}

          {/* 2. Choose Available Vehicle */}
          <Card
            title="2. Choose Available Vehicle"
            subtitle={`${vehicles.length} commercial vehicles ready for duty`}
          >
            {vehicles.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No vehicles currently marked AVAILABLE.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                {vehicles.map((v) => {
                  const isChosen = selectedVehicle?.id === v.id;
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
                        <span className="text-[10px] font-semibold uppercase text-slate-500">{v.category}</span>
                      </div>
                      <div className="font-bold text-slate-900">{v.model}</div>
                      <div className="text-[11px] text-slate-500">{v.seatingCapacity} Seater • {v.fuelType}</div>
                      <div className="text-[10px] text-slate-400 mt-1 truncate">{v.vendorName}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* 3. Choose Available Chauffeur */}
          <Card
            title="3. Choose Available Chauffeur"
            subtitle={`${drivers.length} commercial licensed drivers available`}
          >
            {drivers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No drivers currently marked AVAILABLE.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                {drivers.map((d) => {
                  const isChosen = selectedDriver?.id === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDriver(d)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChosen
                          ? "border-emerald-500 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-400"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{d.name}</span>
                        <span className="text-[11px] font-bold text-amber-600">★ {d.rating}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono mt-0.5">{d.phone}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {d.experienceYears} Yrs Exp • {d.languages?.join(", ")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Confirm Button Bar */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              Vehicle: <strong>{selectedVehicle?.registrationNumber || "Not chosen"}</strong> • Chauffeur:{" "}
              <strong>{selectedDriver?.name || "Not chosen"}</strong>
            </div>
            <Button
              variant="emerald"
              size="md"
              icon={CheckCircle2}
              onClick={handleConfirmDispatch}
              disabled={!selectedBooking || !selectedVehicle || !selectedDriver}
            >
              Confirm & Dispatch Fleet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
