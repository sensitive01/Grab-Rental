"use client";

import { use, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  MapPin, 
  Car, 
  Users, 
  CreditCard, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ChevronRight,
  FileText
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockBookings } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function BookingDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams?.id || "BK-2026-000124";

  const booking = mockBookings.find(b => b.id === bookingId) || mockBookings[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs
            items={[
              { label: "Bookings", href: "/vendor/bookings" },
              { label: `#${booking.id}` }
            ]}
          />
          <div className="flex items-center gap-3 pt-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              #{booking.id}
            </h1>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {booking.tripType} · Booked on {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("en-IN") : "Recent"}
          </p>
        </div>

        <Link
          href="/vendor/bookings"
          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Ledger
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Route & Assignment */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Trip Itinerary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-sm font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Journey Route & Timing</span>
              <span className="text-xs font-bold text-slate-500">{booking.distanceKm} KM Estimated</span>
            </h2>

            <div className="space-y-6 relative pl-6 border-l-2 border-slate-200 ml-3">
              
              {/* Pickup */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200"></span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  Pickup Location · {booking.pickupDate}
                </span>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {booking.pickup}
                </p>
                <p className="text-xs text-slate-500">Scheduled Chauffeur Reporting Time</p>
              </div>

              {/* Drop */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white ring-2 ring-rose-200"></span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 block">
                  Drop Destination
                </span>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {booking.drop}
                </p>
                <p className="text-xs text-slate-500">Destination Arrival Hub</p>
              </div>

            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Vehicle Class</span>
                <p className="font-bold text-slate-800 mt-0.5">{booking.vehicleType}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Passengers</span>
                <p className="font-bold text-slate-800 mt-0.5">{booking.passengers} Guests</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Trip Distance</span>
                <p className="font-bold text-slate-800 mt-0.5">{booking.distanceKm} Kilometers</p>
              </div>
            </div>
          </div>

          {/* Assigned Resources Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100">
              Allocated Chauffeur & Vehicle
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Driver Box */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Chauffeur
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                    {booking.driverName ? booking.driverName.charAt(0) : "D"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{booking.driverName || "Driver not mapped"}</p>
                    <p className="text-slate-500 font-medium">{booking.driverPhone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Box */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Vehicle
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-slate-900">{booking.vehicleNumber || "Vehicle not mapped"}</p>
                    <p className="text-slate-500 font-medium">{booking.vehicleType}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Col: Customer & Commercial Breakdown */}
        <div className="space-y-6">
          
          {/* Customer Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
              Passenger Information
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Customer Name</span>
                <p className="text-sm font-black text-slate-900">{booking.customer.name}</p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Contact Phone</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {booking.customer.phone}
                </p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Email Address</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {booking.customer.email}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
              Commercial & Payout Details
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Customer Fare</span>
                <span className="font-bold text-slate-900">{formatINR(booking.estimatedAmount)}</span>
              </div>

              <div className="flex items-center justify-between text-rose-600">
                <span>Platform Commission (15%)</span>
                <span>-{formatINR(booking.platformFee)}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="font-black text-slate-900">Net Vendor Payout</span>
                <span className="font-black text-emerald-600">{formatINR(booking.vendorNet)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Payment Status
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {booking.paymentStatus}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
