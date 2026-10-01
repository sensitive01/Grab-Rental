"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Eye, Loader2 } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import DataTable from "@/components/ui/DataTable";
import { vendorApi } from "@/lib/vendorApi";

export default function AssignedBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorApi.getBookings()
      .then(res => setBookings(res || []))
      .catch(err => console.error("Failed to fetch assigned bookings:", err))
      .finally(() => setLoading(false));
  }, []);

  const assignedTrips = useMemo(() => {
    return bookings.filter(
      b => (b.status || "").toLowerCase() === "assigned" || (b.status || "").toLowerCase() === "confirmed"
    );
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
      className: "font-semibold text-slate-900"
    },
    {
      key: "vehicleNumber",
      label: "Allocated Vehicle",
      sortable: true,
      render: (b) => <NumberPlate number={b.vehicleNumber} />
    },
    {
      key: "driverName",
      label: "Assigned Chauffeur",
      sortable: true,
      render: (b) => (
        <div>
          <p className="font-bold text-slate-800">{b.driverName}</p>
          <p className="text-[11px] text-slate-400">{b.driverPhone}</p>
        </div>
      )
    },
    {
      key: "pickupDate",
      label: "Pickup Date",
      sortable: true,
      className: "font-semibold text-slate-800"
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
        <p className="text-slate-500">{b.pickupDate}</p>
        <div className="pt-2 flex items-center justify-between">
          <NumberPlate number={b.vehicleNumber} />
          <span className="text-slate-600 font-medium">{b.driverName}</span>
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <Link
          href={`/vendor/bookings/${b.id}`}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
        >
          View Full Details <ChevronRight className="w-3.5 h-3.5" />
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
            { label: "Assigned Trips" }
          ]}
        />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Assigned & Confirmed Trips
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            {assignedTrips.length} Ready
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Bookings that have been accepted with vehicle and chauffeur locked for customer pickup.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={assignedTrips}
        keyField="id"
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 20]}
        searchPlaceholder="Search assigned trips..."
        searchKeys={["id", "bookingReference", "customer.name", "vehicleNumber", "driverName"]}
        exportFileName="GrabRentals_Assigned_Trips"
        emptyTitle="No Assigned Trips"
        emptyDescription="There are currently no bookings in assigned or confirmed status."
        renderMobileCard={renderMobileCard}
      />

    </div>
  );
}
