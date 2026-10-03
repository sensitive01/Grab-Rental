"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Eye, Loader2 } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTable from "@/components/ui/DataTable";
import { vendorApi } from "@/lib/vendorApi";

export default function CancelledBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorApi.getBookings()
      .then(res => setBookings(res || []))
      .catch(err => console.error("Failed to fetch cancelled bookings:", err))
      .finally(() => setLoading(false));
  }, []);

  const cancelledTrips = useMemo(() => {
    return bookings.filter(b => (b.status || "").toLowerCase() === "cancelled");
  }, [bookings]);

  const columns = useMemo(() => [
    {
      key: "id",
      label: "Booking ID",
      sortable: true,
      render: (b) => (
        <Link 
          href={`/vendor/bookings/${b.id}`}
          className="text-amber-600 hover:text-amber-700 font-mono font-bold"
        >
          #{b.bookingReference || b.id}
        </Link>
      )
    },
    {
      key: "customer.name",
      label: "Customer",
      sortable: true,
      className: "font-bold text-slate-900"
    },
    {
      key: "route",
      label: "Route",
      sortable: true,
      sortValue: (b) => `${b.pickup} ${b.drop}`,
      render: (b) => (
        <span className="text-slate-600 truncate max-w-[200px] block">
          {b.pickup} ➔ {b.drop}
        </span>
      )
    },
    {
      key: "cancellationReason",
      label: "Cancellation Reason",
      sortable: true,
      render: (b) => (
        <span className="text-xs font-medium italic text-slate-600 block max-w-xs">
          "{b.vendorDeclineReason || b.cancellationReason || "Customer schedule change or vendor conflict"}"
        </span>
      )
    },
    {
      key: "cancelledBy",
      label: "Status / Source",
      sortable: true,
      render: (b) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
          {b.rawStatus === "REASSIGN_REQUIRED" ? "Vendor Reassigned" : "Customer / System"}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (b) => <StatusBadge status={b.status} />
    },
    {
      key: "actions",
      label: "Action",
      align: "center",
      render: (b) => (
        <Link
          href={`/vendor/bookings/${b.id}`}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors inline-block"
        >
          <Eye className="w-4 h-4" />
        </Link>
      )
    }
  ], []);

  const renderMobileCard = (b) => (
    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono font-bold text-amber-600">#{b.bookingReference || b.id}</span>
        <StatusBadge status={b.status} />
      </div>
      <div className="text-xs space-y-1">
        <p className="font-bold text-slate-900">{b.customer?.name}</p>
        <p className="text-slate-600">{b.pickup} ➔ {b.drop}</p>
        <p className="text-slate-500 italic">"{b.vendorDeclineReason || "Cancelled before pickup"}"</p>
      </div>
      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <Link
          href={`/vendor/bookings/${b.id}`}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
        >
          View Details <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Header & Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Bookings", href: "/vendor/bookings" },
            { label: "Cancelled Bookings" }
          ]}
        />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Cancelled Bookings
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            {cancelledTrips.length} Record{cancelledTrips.length !== 1 ? "s" : ""}
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          History of bookings cancelled by customer or returned to operations re-assignment.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={cancelledTrips}
        loading={loading}
        keyField="id"
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 20]}
        searchPlaceholder="Search cancelled bookings..."
        searchKeys={["id", "bookingReference", "customer.name", "pickup", "drop"]}
        exportFileName="GrabRentals_Cancelled_Trips"
        emptyTitle="No Cancelled Bookings"
        emptyDescription="Great! You have zero cancelled bookings on record."
        renderMobileCard={renderMobileCard}
      />

    </div>
  );
}
