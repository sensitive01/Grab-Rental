"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight, Calendar } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockBookings } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function CompletedTripsPage() {
  const completedTrips = mockBookings.filter(b => b.status.toLowerCase() === "completed");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Trips", href: "/vendor/trips/active" },
            { label: "Completed Trips" }
          ]}
        />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Completed Trips Archive
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Historical record of successfully executed chauffeur rentals and settled earnings.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Vehicle & Driver</th>
                <th className="py-3.5 px-4">Date Completed</th>
                <th className="py-3.5 px-4">Route</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Net Settled</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedTrips.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-black font-mono text-slate-900">
                    #{b.id}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {b.customer.name}
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-mono font-bold text-slate-800">{b.vehicleNumber}</p>
                    <p className="text-[11px] text-slate-500">{b.driverName}</p>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700">
                    {b.pickupDate}
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    {b.pickup} ➔ {b.drop}
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="py-4 px-4 text-right font-black text-emerald-600">
                    {formatINR(b.vendorNet)}
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
