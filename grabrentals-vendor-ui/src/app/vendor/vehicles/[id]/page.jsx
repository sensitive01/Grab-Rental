"use client";

import { use, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Car, 
  Edit3, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Users, 
  Fuel, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { mockVehicles, mockBookings } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function VehicleDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const vehicleId = unwrappedParams?.id || "VH-101";

  const vehicle = mockVehicles.find((v) => v.id === vehicleId) || mockVehicles[0];

  const vehicleTrips = mockBookings.filter(
    (b) => b.vehicleId === vehicle.id || b.vehicleNumber === vehicle.vehicleNumber
  );

  return (
    <div className="space-y-6">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs
            items={[
              { label: "Vehicles", href: "/vendor/vehicles" },
              { label: vehicle.vehicleNumber }
            ]}
          />
          <div className="flex items-center gap-3 pt-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {vehicle.model}
            </h1>
            <StatusBadge status={vehicle.status} />
          </div>
          <div className="flex items-center gap-2.5 pt-1">
            <NumberPlate number={vehicle.vehicleNumber} />
            <span className="text-xs text-slate-400 font-medium">Asset ID: {vehicle.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/vendor/vehicles/${vehicle.id}/edit`}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-slate-500" /> Edit Vehicle
          </Link>
          <Link
            href="/vendor/vehicles/availability"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" /> Manage Calendar
          </Link>
        </div>
      </div>

      {/* Grid Layout: Vehicle Card & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Card & Driver */}
        <div className="space-y-6">
          
          {/* Main Visual Profile */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
              <img
                src={vehicle.image}
                alt={vehicle.model}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                {vehicle.type}
              </span>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-500">Plate Number</span>
                <NumberPlate number={vehicle.vehicleNumber} />
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-500">Current Location</span>
                <span className="font-semibold text-slate-800 text-right flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {vehicle.currentLocation}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-500">Odometer Reading</span>
                <span className="font-bold text-slate-900">{vehicle.odometer}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Default Daily Rate</span>
                <span className="font-black text-slate-900">{formatINR(vehicle.dailyRate)} / Day</span>
              </div>
            </div>
          </div>

          {/* Assigned Driver Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Assigned Chauffeur
              </span>
              <Link
                href="/vendor/drivers"
                className="text-[11px] font-bold text-amber-600 hover:underline"
              >
                Reassign
              </Link>
            </div>

            {vehicle.driverName && vehicle.driverName !== "Unassigned" ? (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                  {vehicle.driverName.charAt(0)}
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-black text-slate-900">{vehicle.driverName}</p>
                  <p className="text-slate-500 font-medium">{vehicle.driverPhone}</p>
                  <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    Verified Chauffeur
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No permanent driver assigned.</p>
            )}
          </div>

        </div>

        {/* Right 2 Columns: Specifications, Compliance & Trip History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Key Specs Grid */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 tracking-tight pb-2 border-b border-slate-100">
              Technical Specifications
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Seating</span>
                <p className="text-sm font-black text-slate-900">{vehicle.seatingCapacity} Passengers</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Fuel Type</span>
                <p className="text-sm font-black text-slate-900">{vehicle.fuelType}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Air Conditioning</span>
                <p className="text-sm font-black text-slate-900">{vehicle.acType}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Transmission</span>
                <p className="text-sm font-black text-slate-900">{vehicle.transmission}</p>
              </div>
            </div>
          </div>

          {/* Statutory Document Expiry Dates */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                Statutory Compliance & Expiry Tracker
              </h2>
              <Link
                href="/vendor/documents"
                className="text-xs font-bold text-amber-600 hover:underline"
              >
                Upload Renewals ↗
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Commercial Insurance</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs font-black text-slate-900">{vehicle.insuranceExpiry}</p>
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  Policy Active
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Tourist Permit (AITP)</span>
                  <FileText className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-xs font-black text-slate-900">{vehicle.permitExpiry}</p>
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  Valid Interstate
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Fitness Certificate</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs font-black text-slate-900">{vehicle.fitnessExpiry}</p>
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  RTO Certified
                </span>
              </div>
            </div>
          </div>

          {/* Booking History Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 tracking-tight pb-2 border-b border-slate-100">
              Assigned Trips History
            </h2>

            {vehicleTrips.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No recent trips registered for this vehicle.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5">Trip ID</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Route</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Net Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicleTrips.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-3 font-black text-slate-900">#{t.id}</td>
                        <td className="py-3 font-semibold text-slate-800">{t.customer.name}</td>
                        <td className="py-3 text-slate-600">{t.pickup} ➔ {t.drop}</td>
                        <td className="py-3"><StatusBadge status={t.status} /></td>
                        <td className="py-3 text-right font-black text-slate-900">{formatINR(t.vendorNet)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
