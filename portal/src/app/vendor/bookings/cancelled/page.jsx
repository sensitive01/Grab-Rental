"use client";

import Link from "next/link";
import { XCircle, ChevronRight, AlertTriangle } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockBookings } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function CancelledBookingsPage() {
  const cancelledTrips = mockBookings.filter(b => b.status.toLowerCase() === "cancelled");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Bookings", href: "/vendor/bookings" },
            { label: "Cancelled Trips" }
          ]}
        />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Cancelled Bookings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Audit of trips cancelled by customers or operations with stated reasons and refund status.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Route</th>
                <th className="py-3.5 px-4">Cancellation Reason</th>
                <th className="py-3.5 px-4">Cancelled By</th>
                <th className="py-3.5 px-4">Refund Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cancelledTrips.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-black font-mono text-slate-900">
                    #{b.id}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {b.customer.name}
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    {b.pickup} ➔ {b.drop}
                  </td>
                  <td className="py-4 px-4 text-slate-700 max-w-xs">
                    <span className="text-xs font-medium italic text-slate-600">
                      "{b.cancellationReason || "Customer schedule change"}"
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800">
                    {b.cancelledBy || "Customer"}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {b.refundStatus || "Processed"}
                    </span>
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
