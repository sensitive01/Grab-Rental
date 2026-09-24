"use client";

import Link from "next/link";
import { 
  Navigation, 
  MapPin, 
  Car, 
  Phone, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles 
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockBookings } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function ActiveTripsPage() {
  const activeTrips = mockBookings.filter(b => b.status.toLowerCase() === "active");

  return (
    <div className="space-y-6">
      
      {/* Header & Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: "Trips", href: "/vendor/trips/active" }, { label: "Active Live Trips" }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Live Ongoing Trips
              <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {activeTrips.length} On Road Now
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Real-time GPS telemetry and highway progression for dispatched vehicles.
            </p>
          </div>
          <Link
            href="/vendor/trips/completed"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 self-start sm:self-auto"
          >
            View Completed Trips History →
          </Link>
        </div>
      </div>

      {/* Active Trips Cards */}
      <div className="space-y-6">
        {activeTrips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3">
              
              {/* Left 2 Columns: Trip Details */}
              <div className="p-6 sm:p-8 space-y-6 lg:col-span-2 border-b lg:border-b-0 lg:border-r border-slate-100">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black font-mono px-2.5 py-1 rounded-md bg-slate-900 text-amber-400">
                      #{trip.id}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{trip.tripType}</span>
                  </div>
                  <StatusBadge status="On Trip" />
                </div>

                {/* Route */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Location</span>
                      <p className="font-bold text-slate-900">{trip.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Drop Destination</span>
                      <p className="font-bold text-slate-900">{trip.drop}</p>
                    </div>
                  </div>
                </div>

                {/* Chauffeur and Vehicle Pair */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Chauffeur</span>
                    <p className="font-black text-slate-900">{trip.driverName}</p>
                    <p className="text-slate-500">{trip.driverPhone}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Vehicle</span>
                    <p className="font-black font-mono text-slate-900">{trip.vehicleNumber}</p>
                    <p className="text-slate-500">{trip.vehicleType}</p>
                  </div>
                </div>

                {/* Action Link */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-black text-slate-900">
                    Net Vendor Share: {formatINR(trip.vendorNet)}
                  </span>
                  <Link
                    href={`/vendor/bookings/${trip.id}`}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    View Full Booking File <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>

              {/* Right Column: Simulated Live GPS Radar */}
              <div className="p-6 bg-slate-950 text-white flex flex-col justify-between space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Live GPS Tracking
                    </span>
                    <span className="text-[10px] text-slate-400">Updated 10s ago</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Vehicle is cruising at <strong>68 km/h</strong> on Salem-Bangalore Expressway.
                  </p>
                </div>

                {/* Simulated Radar Map Graphic */}
                <div className="w-full h-40 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden flex items-center justify-center p-4">
                  {/* Grid lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  
                  {/* Route trajectory */}
                  <svg className="w-full h-full" viewBox="0 0 200 100">
                    <path
                      d="M 20 80 Q 90 20 180 30"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeDasharray="4 4"
                    />
                    <circle cx="20" cy="80" r="4" fill="#10b981" />
                    <circle cx="105" cy="42" r="6" fill="#f59e0b" />
                    <circle cx="105" cy="42" r="10" fill="#f59e0b" opacity="0.3" className="animate-ping" />
                    <circle cx="180" cy="30" r="4" fill="#f43f5e" />
                  </svg>

                  <div className="absolute bottom-2 left-3 text-[10px] text-slate-400">
                    Current: Near Dharmapuri Toll Plaza
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Distance Completed</span>
                    <span className="font-bold text-white">48 / 92 KM (52%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[52%]"></div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
