"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Car, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import Toast from "@/components/ui/Toast";
import { mockVehicles } from "@/lib/mockData";

export default function VehicleAvailabilityPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState(mockVehicles[0].id);
  const [toastMessage, setToastMessage] = useState(null);

  const selectedVehicle = mockVehicles.find(v => v.id === selectedVehicleId) || mockVehicles[0];

  // Calendar dates mock state for September 2026
  const [dateStatuses, setDateStatuses] = useState({
    15: "Completed",
    16: "Completed",
    17: "Completed",
    18: "Completed",
    19: "Available",
    20: "Completed",
    21: "On Trip",
    22: "Booked",
    23: "Available",
    24: "Available",
    25: "Booked",
    26: "Booked",
    27: "Available",
    28: "Maintenance",
    29: "Available",
    30: "Available"
  });

  const toggleBlockDate = (day) => {
    const current = dateStatuses[day] || "Available";
    if (current === "Booked" || current === "On Trip") {
      setToastMessage(`Day ${day} Sep is currently assigned to a customer booking and cannot be blocked.`);
      return;
    }

    if (current === "Maintenance") {
      setDateStatuses(prev => ({ ...prev, [day]: "Available" }));
      setToastMessage(`Day ${day} Sep unblocked and marked Available for ${selectedVehicle.vehicleNumber}!`);
    } else {
      setDateStatuses(prev => ({ ...prev, [day]: "Maintenance" }));
      setToastMessage(`Day ${day} Sep blocked for maintenance / private use.`);
    }
  };

  const getDayColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-emerald-50 border-emerald-200 text-emerald-800 hover:border-emerald-400";
      case "Booked":
        return "bg-amber-50 border-amber-200 text-amber-900 cursor-not-allowed";
      case "On Trip":
        return "bg-blue-50 border-blue-200 text-blue-900 cursor-not-allowed";
      case "Maintenance":
        return "bg-rose-50 border-rose-200 text-rose-900 hover:border-rose-400";
      default:
        return "bg-slate-50 border-slate-200 text-slate-600";
    }
  };

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs
            items={[
              { label: "Vehicles", href: "/vendor/vehicles" },
              { label: "Availability Calendar" }
            ]}
          />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Fleet Availability Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Block vehicle dates for internal service, periodic maintenance, or view booked windows.
          </p>
        </div>

        {/* Vehicle Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">
            Selected Vehicle:
          </label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 shadow-2xs"
          >
            {mockVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.model} ({v.vehicleNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Month & Legend Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Top Month Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                September 2026
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Showing schedule for <strong className="text-slate-900">{selectedVehicle.model}</strong> ({selectedVehicle.vehicleNumber})
              </p>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300"></span>
              <span className="font-semibold text-slate-600">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300"></span>
              <span className="font-semibold text-slate-600">Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-300"></span>
              <span className="font-semibold text-slate-600">On Trip</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300"></span>
              <span className="font-semibold text-slate-600">Blocked / Maint.</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-black uppercase tracking-wider text-slate-400 py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Tiles */}
          <div className="grid grid-cols-7 gap-2">
            
            {/* Empty offset days for Tue 1st Sep 2026 */}
            <div className="h-20 sm:h-24 rounded-2xl bg-slate-50/50 border border-transparent"></div>
            <div className="h-20 sm:h-24 rounded-2xl bg-slate-50/50 border border-transparent"></div>

            {days.map((day) => {
              const status = dateStatuses[day] || "Available";
              const isToday = day === 21;
              const colorClass = getDayColor(status);

              return (
                <div
                  key={day}
                  onClick={() => toggleBlockDate(day)}
                  className={`h-20 sm:h-24 rounded-2xl border p-2 flex flex-col justify-between transition-all cursor-pointer select-none group ${colorClass} ${
                    isToday ? "ring-2 ring-slate-900" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${isToday ? "bg-slate-900 text-white px-1.5 rounded-md" : ""}`}>
                      {day}
                    </span>
                    {status === "Maintenance" ? (
                      <Lock className="w-3.5 h-3.5 text-rose-500" />
                    ) : status === "Available" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100" />
                    ) : null}
                  </div>

                  <div>
                    <span className="block text-[10px] font-extrabold uppercase tracking-tight truncate">
                      {status}
                    </span>
                    <span className="hidden sm:block text-[9px] text-slate-400">
                      {status === "Maintenance" ? "Click to unblock" : status === "Available" ? "Click to block" : "Reserved"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Helpful Tip */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Click on any <strong>Available</strong> date to block it for servicing or driver rest. Dates booked by customers cannot be modified.</span>
          </div>
          <Link
            href="/vendor/bookings"
            className="text-amber-600 font-bold hover:underline whitespace-nowrap ml-4"
          >
            View Active Bookings ↗
          </Link>
        </div>

      </div>

    </div>
  );
}
