"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import {
  Navigation,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Send,
  Printer,
  Compass,
} from "lucide-react";
import { formatINR, getStatusStyle } from "@/lib/utils";

export default function TripTrackingDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await operationsApi.getBookingById(id);
        setBooking(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleAddNote() {
    if (!newNote) return;
    try {
      await operationsApi.updateTripStatus(id, booking.status, newNote);
      setBooking({ ...booking, tripMilestone: newNote });
      setToast({ type: "success", message: "Live milestone recorded" });
      setNewNote("");
    } catch {
      setToast({ type: "error", message: "Failed to record milestone" });
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading trip telemetry...</div>;
  }

  if (!booking) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-base font-bold text-slate-800">Trip Not Found</h2>
        <Link href="/operations/trips/active">
          <Button variant="secondary" size="sm" className="mt-4">
            Back to Active Trips
          </Button>
        </Link>
      </div>
    );
  }

  const statusStyle = getStatusStyle(booking.status);

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
        title={`Trip Telemetry #${booking.id}`}
        subtitle={`Tracking ${booking.vehicleCategory} on ${booking.serviceType}`}
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Trips", href: "/operations/trips/active" },
          { label: booking.id },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print Waybill
            </Button>
            <Link href={`/operations/bookings/${booking.id}`}>
              <Button variant="dark" size="sm">
                Full Booking Dossier
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Milestone & Route Tracking */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Live Journey Milestones">
            <div className="space-y-6 pl-2">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div className="w-0.5 h-16 bg-emerald-400"></div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Trip Dispatched</h4>
                  <p className="text-xs text-slate-500">Vehicle departed base depot / hub.</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    {booking.startDate}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div className="w-0.5 h-16 bg-blue-300"></div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Passenger Pickup & En Route</h4>
                  <p className="text-xs text-slate-600">
                    Boarded at {booking.pickupLocation}. Heading towards destination.
                  </p>
                  <div className="mt-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900">
                    <span className="font-bold">Latest Waypoint: </span>
                    {booking.tripMilestone || "Chauffeur on scheduled route."}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    booking.status === "COMPLETED" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    3
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Destination Arrival & Duty Close</h4>
                  <p className="text-xs text-slate-500">Scheduled arrival at {booking.dropLocation}.</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    Est. Return: {booking.endDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Post New Waypoint Note */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Record Waypoint Milestone or Dispatcher Note
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Crossed Walajah toll, passenger lunch stop..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button size="sm" variant="primary" icon={Send} onClick={handleAddNote}>
                  Record Milestone
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Driver & Passenger Contact Card */}
        <div className="space-y-6">
          <Card title="Chauffeur & Fleet Details">
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Assigned Driver</p>
                <p className="text-sm font-bold text-slate-900">{booking.assignedDriverName || "Assigned"}</p>
                <p className="text-slate-600 flex items-center gap-1.5 mt-1 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>+91 98401 23456</span>
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-slate-400 font-medium mb-1">Vehicle Registration</p>
                <NumberPlate registrationNumber={booking.assignedVehicleNumber} />
                <p className="text-xs font-semibold text-slate-800 mt-1">{booking.preferredVehicle}</p>
              </div>
            </div>
          </Card>

          <Card title="Customer Contact">
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Passenger Name</p>
                <p className="text-sm font-bold text-slate-900">{booking.customerName}</p>
                <p className="text-slate-600 flex items-center gap-1.5 mt-1 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{booking.customerPhone}</span>
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-slate-400 font-medium">Billing Fare</p>
                <p className="text-base font-bold text-slate-900">{formatINR(booking.fare)}</p>
                <p className="text-[11px] text-amber-700">Balance: {formatINR(booking.balanceAmount)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
