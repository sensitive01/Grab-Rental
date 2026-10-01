"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Eye, Loader2 } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import DataTable from "@/components/ui/DataTable";
import { vendorApi } from "@/lib/vendorApi";
import { formatINR } from "@/lib/utils";

export default function CompletedTripsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorApi.getBookings()
      .then(res => setBookings(res || []))
      .catch(err => console.error("Failed to fetch completed trips:", err))
      .finally(() => setLoading(false));
  }, []);

  const completedTrips = useMemo(() => {
    return bookings.filter(b => (b.status || "").toLowerCase() === "completed");
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
      label: "Trip Date",
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
      key: "vendorNet",
      label: "Payout Settled",
      align: "right",
      sortable: true,
      sortValue: (b) => Number(b.vendorNet) || 0,
      render: (b) => (
        <span className="font-black text-emerald-600">
          {formatINR(b.vendorNet || b.totalFare)}
        </span>
      )
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
        <span className="font-black text-emerald-600">{formatINR(b.vendorNet || b.totalFare)}</span>
      </div>
      <div className="text-xs space-y-1">
        <p className="font-bold text-slate-900">{b.customer?.name}</p>
        <p className="text-slate-600">{b.pickup} ➔ {b.drop}</p>
      </div>
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <NumberPlate number={b.vehicleNumber} />
        <Link
          href={`/vendor/bookings/${b.id}`}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
        >
          Details <ChevronRight className="w-3.5 h-3.5" />
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
            { label: "Trips", href: "/vendor/trips/active" },
            { label: "Completed Trips" }
          ]}
        />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Completed Trips History
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            {completedTrips.length} Fulfilled
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Archive of completed customer journeys and settled partner earnings.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={completedTrips}
        keyField="id"
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 20]}
        searchPlaceholder="Search completed trips..."
        searchKeys={["id", "bookingReference", "customer.name", "pickup", "drop", "vehicleNumber", "driverName"]}
        exportFileName="GrabRentals_Completed_Trips"
        emptyTitle="No Completed Trips"
        emptyDescription="Trips fulfilled by your fleet will appear here once passenger dropoff is completed."
        renderMobileCard={renderMobileCard}
      />

    </div>
  );
}
