"use client";

import Link from "next/link";
import { CalendarCheck, MapPin, ChevronRight, Car, User } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockBookings } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function AssignedBookingsPage() {
  const assignedTrips = mockBookings.filter(
    b => b.status.toLowerCase() === "assigned" || b.status.toLowerCase() === "confirmed"
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Bookings", href: "/vendor/bookings" },
            { label: "Assigned Trips" }
          ]}
        />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Assigned Bookings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Bookings that have vehicles and chauffeurs successfully allocated and scheduled for dispatch.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Allocated Vehicle</th>
                <th className="py-3.5 px-4">Assigned Chauffeur</th>
                <th className="py-3.5 px-4">Pickup Date</th>
                <th className="py-3.5 px-4">Route</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignedTrips.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-black font-mono text-slate-900">
                    #{b.id}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    {b.customer.name}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono font-bold text-slate-800">{b.vehicleNumber}</span>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-700">
                    {b.driverName} ({b.driverPhone})
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    {b.pickupDate}
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    {b.pickup} ➔ {b.drop}
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Link
                      href={`/vendor/bookings/${b.id}`}
                      className="inline-flex items-center gap-1 font-bold text-amber-600 hover:text-amber-700"
                    >
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
