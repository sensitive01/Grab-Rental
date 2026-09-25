"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Eye } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import DataTable from "@/components/ui/DataTable";
import { mockBookings } from "@/lib/mockData";

export default function AssignedBookingsPage() {
  const assignedTrips = useMemo(() => {
    return mockBookings.filter(
      b => b.status.toLowerCase() === "assigned" || b.status.toLowerCase() === "confirmed"
    );
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
      key: "status",
      label: "Status",
      sortable: true,
      render: (b) => <StatusBadge status={b.status} />
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

      <DataTable
        columns={columns}
        data={assignedTrips}
        keyField="id"
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        searchPlaceholder="Search assigned bookings..."
        searchKeys={["id", "customer.name", "vehicleNumber", "driverName", "pickup", "drop"]}
        exportFileName="GrabRentals_Assigned_Bookings"
        emptyTitle="No Assigned Bookings"
        emptyDescription="There are currently no bookings scheduled with allocated fleet assets."
      />
    </div>
  );
}
