"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { operationsApi } from "@/lib/operationsApi";
import { formatINR, getStatusStyle } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import {
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  MapPin,
  Phone,
  Printer,
  Shield,
  User,
  Users,
} from "lucide-react";

export default function BookingDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
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

  async function handleStatusChange(newStatus) {
    try {
      const res = await operationsApi.updateTripStatus(id, newStatus);
      setBooking(res.data);
      setToast({ type: "success", message: `Booking status updated to ${newStatus}` });
    } catch {
      setToast({ type: "error", message: "Failed to update booking status" });
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading booking dossier...</div>;
  }

  if (!booking) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-base font-bold text-slate-800">Booking Not Found</h2>
        <Link href="/operations/bookings">
          <Button variant="secondary" size="sm" className="mt-4">
            Back to Bookings
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
        title={`Booking #${booking.id}`}
        subtitle={`Created on ${booking.createdAt} • ${booking.serviceType}`}
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Bookings", href: "/operations/bookings" },
          { label: booking.id },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Duty Slip
            </Button>
            {booking.status === "PENDING_ALLOCATION" && (
              <Link href={`/operations/assignments/vehicle?bookingId=${booking.id}`}>
                <Button variant="amber" size="sm" icon={Car}>
                  Assign Vehicle & Driver
                </Button>
              </Link>
            )}
            {booking.status === "ASSIGNED" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusChange("EN_ROUTE")}
              >
                Mark Dispatched (En Route)
              </Button>
            )}
            {booking.status === "EN_ROUTE" && (
              <Button
                variant="emerald"
                size="sm"
                onClick={() => handleStatusChange("COMPLETED")}
              >
                Mark Trip Completed
              </Button>
            )}
          </div>
        }
      />

      {/* Top Status Banner */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.bg}`}>
            {statusStyle.label}
          </span>
          <span className="text-xs text-slate-500">
            Partner Vendor: <strong>{booking.vendorName || "In-House Fleet"}</strong>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            Total Fare: <strong className="text-slate-900 text-sm">{formatINR(booking.fare)}</strong>
          </div>
          <div>
            Advance Paid: <strong className="text-emerald-700">{formatINR(booking.advancePaid)}</strong>
          </div>
          <div>
            Balance: <strong className="text-amber-700">{formatINR(booking.balanceAmount)}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Route & Assignment Dossier */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route & Schedule */}
          <Card title="Trip Itinerary & Timing">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Pickup Location</p>
                  <p className="text-sm font-semibold text-slate-900">{booking.pickupLocation}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Scheduled: {booking.startDate}</p>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-slate-300 ml-4 pl-7 py-2 text-xs text-slate-500">
                Estimated Distance: <strong>{booking.distanceKm} KM</strong> • Duration:{" "}
                <strong>{booking.durationDays} Days</strong>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Drop Destination</p>
                  <p className="text-sm font-semibold text-slate-900">{booking.dropLocation}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Return: {booking.endDate}</p>
                </div>
              </div>
            </div>

            {booking.specialInstructions && (
              <div className="mt-5 p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                <strong>Passenger Instructions:</strong> {booking.specialInstructions}
              </div>
            )}
          </Card>

          {/* Assigned Fleet & Chauffeur */}
          <Card title="Fleet & Chauffeur Allocation">
            {booking.assignedVehicleNumber ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Assigned Vehicle</span>
                    <Badge variant="success" size="sm">Confirmed</Badge>
                  </div>
                  <NumberPlate registrationNumber={booking.assignedVehicleNumber} />
                  <p className="text-xs font-semibold text-slate-800">{booking.preferredVehicle}</p>
                  <p className="text-[11px] text-slate-500">Category: {booking.vehicleCategory}</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Assigned Chauffeur</span>
                    <Badge variant="success" size="sm">On Call</Badge>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{booking.assignedDriverName}</p>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>+91 98401 23456</span>
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">Duty status confirmed</p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-amber-300 rounded-xl bg-amber-50/40">
                <Car className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No Vehicle or Driver Assigned Yet</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  This booking requires a {booking.vehicleCategory} ({booking.preferredVehicle}).
                </p>
                <Link href={`/operations/assignments/vehicle?bookingId=${booking.id}`}>
                  <Button variant="amber" size="sm">
                    Open Fast Dispatch Allocator
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Customer & Payment Details */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card title="Customer Information">
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Passenger Name</p>
                <p className="text-sm font-bold text-slate-900">{booking.customerName}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Contact Phone</p>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{booking.customerPhone}</span>
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Email Address</p>
                <p className="text-slate-700">{booking.customerEmail}</p>
              </div>
            </div>
          </Card>

          {/* Payment Breakdown */}
          <Card title="Payment Summary">
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Base Rental Tariff</span>
                <span className="font-medium text-slate-900">{formatINR(booking.fare)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Advance Paid</span>
                <span className="font-semibold text-emerald-600">
                  - {formatINR(booking.advancePaid)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 text-sm font-bold">
                <span className="text-slate-900">Balance Due at Trip End</span>
                <span className="text-amber-700">{formatINR(booking.balanceAmount)}</span>
              </div>
              <div className="pt-2 text-[11px] text-slate-500">
                Payment Mode: <strong>{booking.paymentMethod}</strong>
              </div>
            </div>
          </Card>

          {/* Quick Dispatch Notes */}
          <Card title="Operations Log">
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">Booking Created</span>
                  <p className="text-[11px] text-slate-500">{booking.createdAt}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">Payment Authorization</span>
                  <p className="text-[11px] text-slate-500">Advance ₹5,000 received via UPI</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
