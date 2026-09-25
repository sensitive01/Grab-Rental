"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Eye } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTable from "@/components/ui/DataTable";
import { mockBookings } from "@/lib/mockData";

export default function CancelledBookingsPage() {
  const cancelledTrips = useMemo(() => {
    return mockBookings.filter(b => b.status.toLowerCase() === "cancelled");
  }, []);

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
          #{b.id}
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
          "{b.cancellationReason || "Customer schedule change"}"
        </span>
      )
    },
    {
      key: "cancelledBy",
      label: "Cancelled By",
      sortable: true,
      render: (b) => (
        <span className="font-semibold text-slate-800">
          {b.cancelledBy || "Customer"}
        </span>
      )
    },
    {
      key: "refundStatus",
      label: "Refund Status",
      sortable: true,
      render: (b) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {b.refundStatus || "Processed"}
        </span>
      )
    },
    {
      key: "actions",
      label: "Action",
      align: "center",
      sortable: false,
      render: (b) => (
        <Link
          href={`/vendor/bookings/${b.id}`}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1 font-bold text-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </Link>
      )
    }
  ], []);

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

      <DataTable
        columns={columns}
        data={cancelledTrips}
        keyField="id"
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        searchPlaceholder="Search cancelled bookings..."
        searchKeys={["id", "customer.name", "cancellationReason", "cancelledBy", "pickup", "drop"]}
        exportFileName="GrabRentals_Cancelled_Bookings"
        emptyTitle="No Cancelled Bookings"
        emptyDescription="Great! You currently have zero cancelled bookings on record."
      />
    </div>
  );
}
