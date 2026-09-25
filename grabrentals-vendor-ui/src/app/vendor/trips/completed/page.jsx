"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Eye } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import DataTable from "@/components/ui/DataTable";
import { mockBookings } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function CompletedTripsPage() {
  const completedTrips = useMemo(() => {
    return mockBookings.filter(b => b.status.toLowerCase() === "completed");
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
      key: "vehicleNumber",
      label: "Vehicle & Driver",
      sortable: true,
      render: (b) => (
        <div>
          <NumberPlate number={b.vehicleNumber} />
          <p className="text-[11px] text-slate-500 mt-0.5">{b.driverName}</p>
        </div>
      )
    },
    {
      key: "pickupDate",
      label: "Date Completed",
      sortable: true,
      className: "font-semibold text-slate-700"
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
      key: "vendorNet",
      label: "Net Settled",
      align: "right",
      sortable: true,
      sortValue: (b) => Number(b.vendorNet) || 0,
      render: (b) => (
        <span className="font-black text-emerald-600 text-sm">
          {formatINR(b.vendorNet)}
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

      <DataTable
        columns={columns}
        data={completedTrips}
        keyField="id"
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        searchPlaceholder="Search completed trips..."
        searchKeys={["id", "customer.name", "vehicleNumber", "driverName", "pickup", "drop"]}
        exportFileName="GrabRentals_Completed_Trips"
        emptyTitle="No Completed Trips"
        emptyDescription="There are currently no completed trips in your archive."
      />
    </div>
  );
}
