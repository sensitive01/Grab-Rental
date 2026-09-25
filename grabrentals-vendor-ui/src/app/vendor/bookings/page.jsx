"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Sparkles,
  MapPin, 
  ChevronRight,
  Eye
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import DataTable from "@/components/ui/DataTable";
import { mockBookings } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function VendorBookingsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All Bookings" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "assigned", label: "Assigned" },
    { id: "active", label: "Active Trips" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" }
  ];

  const tabFilteredBookings = useMemo(() => {
    return mockBookings.filter((b) => {
      return activeTab === "all" || b.status.toLowerCase() === activeTab.toLowerCase();
    });
  }, [activeTab]);

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
      label: "Customer Details",
      sortable: true,
      render: (b) => (
        <div>
          <p className="font-bold text-slate-900">{b.customer?.name}</p>
          <p className="text-[11px] text-slate-400">{b.customer?.phone}</p>
        </div>
      )
    },
    {
      key: "pickupDate",
      label: "Pickup Date & Route",
      sortable: true,
      render: (b) => (
        <div>
          <p className="font-semibold text-slate-900">{b.pickupDate}</p>
          <p className="text-slate-600 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[200px]">{b.pickup} ➔ {b.drop}</span>
          </p>
        </div>
      )
    },
    {
      key: "vehicleNumber",
      label: "Vehicle & Chauffeur",
      sortable: true,
      render: (b) => (
        <div className="whitespace-nowrap">
          <NumberPlate number={b.vehicleNumber} />
          <p className="text-[11px] text-slate-500 mt-0.5">{b.driverName || "Driver not mapped"}</p>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (b) => <StatusBadge status={b.status} />
    },
    {
      key: "estimatedAmount",
      label: "Gross Fare",
      align: "right",
      sortable: true,
      sortValue: (b) => Number(b.estimatedAmount) || 0,
      render: (b) => (
        <span className="font-semibold text-slate-800">
          {formatINR(b.estimatedAmount)}
        </span>
      )
    },
    {
      key: "vendorNet",
      label: "Vendor Share",
      align: "right",
      sortable: true,
      sortValue: (b) => Number(b.vendorNet) || 0,
      render: (b) => (
        <span className="font-black text-slate-900">
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
          <span className="hidden xl:inline">Details</span>
        </Link>
      )
    }
  ], []);

  const renderMobileCard = (b) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Link 
              href={`/vendor/bookings/${b.id}`}
              className="font-mono font-black text-slate-900 hover:text-amber-600 text-sm"
            >
              #{b.id}
            </Link>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
              {b.serviceType}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-800 mt-1">{b.customer?.name}</p>
        </div>
        <StatusBadge status={b.status} />
      </div>

      <div className="bg-slate-50 p-2.5 rounded-xl space-y-1.5 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Date:</span>
          <span className="font-semibold text-slate-800">{b.pickupDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Route:</span>
          <span className="font-medium text-slate-800 truncate max-w-[200px]">{b.pickup} ➔ {b.drop}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Asset:</span>
          <span className="font-mono font-bold text-slate-800">{b.vehicleNumber}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5 font-bold">
          <span className="text-slate-700">Vendor Net:</span>
          <span className="text-slate-950 font-black">{formatINR(b.vendorNet)}</span>
        </div>
      </div>

      <Link
        href={`/vendor/bookings/${b.id}`}
        className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors text-center"
      >
        View Booking Details <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs items={[{ label: "Bookings" }]} />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Bookings Ledger
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {mockBookings.length} Total
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track confirmed, assigned, in-progress, and past completed customer trips.
          </p>
        </div>

        <Link
          href="/vendor/bookings/requests"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 text-center shrink-0"
        >
          <Sparkles className="w-4 h-4 shrink-0" /> Incoming Requests (2)
        </Link>
      </div>

      {/* Tabs Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const count = tab.id === "all" 
            ? mockBookings.length 
            : mockBookings.filter(b => b.status.toLowerCase() === tab.id.toLowerCase()).length;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all shrink-0 text-xs font-bold cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Bookings DataTable */}
      <DataTable
        columns={columns}
        data={tabFilteredBookings}
        keyField="id"
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        searchPlaceholder="Search booking ID, customer, route, vehicle, driver..."
        searchKeys={["id", "customer.name", "customer.phone", "pickup", "drop", "vehicleNumber", "driverName"]}
        exportFileName="GrabRentals_Bookings_Ledger"
        emptyTitle="No Bookings Found"
        emptyDescription="No bookings match your selected criteria or search query."
        renderMobileCard={renderMobileCard}
      />

    </div>
  );
}
