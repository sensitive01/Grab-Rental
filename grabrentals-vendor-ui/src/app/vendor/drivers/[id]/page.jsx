"use client";

import { use, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Users, 
  Edit3, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Car, 
  Award, 
  Calendar,
  CheckCircle2,
  FileText
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockDrivers, mockBookings } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function DriverDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const driverId = unwrappedParams?.id || "DRV-101";

  const driver = mockDrivers.find(d => d.id === driverId) || mockDrivers[0];

  const driverTrips = mockBookings.filter(
    b => b.driverId === driver.id || b.driverName === driver.name
  );

  return (
    <div className="space-y-6">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs
            items={[
              { label: "Chauffeurs", href: "/vendor/drivers" },
              { label: driver.name }
            ]}
          />
          <div className="flex items-center gap-3 pt-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {driver.name}
            </h1>
            <StatusBadge status={driver.status} />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-mono">
            License: {driver.licenseNumber} · Driver ID: {driver.id}
          </p>
        </div>

        <Link
          href={`/vendor/drivers/${driver.id}/edit`}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Edit3 className="w-4 h-4" /> Edit Chauffeur
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Profile & Badges */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 font-black text-xl flex items-center justify-center shrink-0">
                {driver.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-slate-900">{driver.name}</h3>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="text-sm font-black text-slate-900">{driver.rating}</span>
                  <span className="text-slate-400 font-normal">({driver.totalTrips} Trips)</span>
                </div>
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified Commercial Driver
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Mobile</span>
                <span className="font-bold text-slate-900">{driver.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Email</span>
                <span className="font-semibold text-slate-700">{driver.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Experience</span>
                <span className="font-bold text-slate-900">{driver.experienceYears} Years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Blood Group</span>
                <span className="font-bold text-slate-900">{driver.bloodGroup}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Emergency Contact</span>
                <span className="font-semibold text-slate-800 text-right">{driver.emergencyContact}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Safety Badges & Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {driver.badges?.map(b => (
                  <span key={b} className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Assigned Vehicle Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 block pb-2 border-b border-slate-100">
              Assigned Vehicle
            </span>
            {driver.assignedVehicle ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                  <Car className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-black text-slate-900">{driver.assignedVehicle}</p>
                  <Link
                    href={`/vendor/vehicles/${driver.assignedVehicleId}`}
                    className="text-[11px] font-bold text-amber-600 hover:underline"
                  >
                    View Vehicle Record ↗
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No permanent vehicle mapped.</p>
            )}
          </div>
        </div>

        {/* Right 2 Columns: License & Completed Trips */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* License & Verification Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 tracking-tight pb-2 border-b border-slate-100">
              Commercial License Particulars
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">License Number</span>
                <p className="text-sm font-mono font-black text-slate-900">{driver.licenseNumber}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Validity Expiry</span>
                <p className="text-sm font-black text-slate-900">{driver.licenseExpiry}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Police Clearance</span>
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" /> Passed Verification
                </p>
              </div>
            </div>
          </div>

          {/* Trip History */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 tracking-tight pb-2 border-b border-slate-100">
              Chauffeur Trip History
            </h2>

            {driverTrips.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No trips logged under this driver yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5">Booking ID</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Route</th>
                      <th className="py-2.5">Vehicle</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {driverTrips.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-3 font-black text-slate-900">#{t.id}</td>
                        <td className="py-3 font-semibold text-slate-800">{t.customer.name}</td>
                        <td className="py-3 text-slate-600">{t.pickup} ➔ {t.drop}</td>
                        <td className="py-3 font-mono font-bold text-slate-700">{t.vehicleNumber}</td>
                        <td className="py-3"><StatusBadge status={t.status} /></td>
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
