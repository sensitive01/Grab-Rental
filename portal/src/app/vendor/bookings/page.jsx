"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CalendarCheck, 
  Search, 
  Eye, 
  MapPin, 
  Car, 
  Users, 
  CreditCard, 
  ChevronRight,
  Sparkles,
  Clock
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockBookings } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function VendorBookingsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "all", label: "All Bookings" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "assigned", label: "Assigned" },
    { id: "active", label: "Active Trips" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" }
  ];

  const filteredBookings = mockBookings.filter((b) => {
    const matchesTab = activeTab === "all" || b.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.drop.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

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
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" /> Incoming Requests (2)
        </Link>
      </div>

      {/* Tabs & Search Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Scrollable Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
            {tabs.map((tab) => {
              const count = tab.id === "all" 
                ? mockBookings.length 
                : mockBookings.filter(b => b.status.toLowerCase() === tab.id.toLowerCase()).length;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
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

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search #BK, customer, route..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
            />
          </div>

        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-black text-slate-800">No Bookings Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No bookings matched this status tab or filter query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Pickup Date & Route</th>
                  <th className="py-3.5 px-4">Vehicle & Chauffeur</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Gross Fare</th>
                  <th className="py-3.5 px-4 text-right">Vendor Share</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-black text-slate-900">
                      <Link 
                        href={`/vendor/bookings/${b.id}`}
                        className="text-amber-600 hover:text-amber-700 font-mono"
                      >
                        #{b.id}
                      </Link>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{b.customer.name}</p>
                      <p className="text-[11px] text-slate-400">{b.customer.phone}</p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900">{b.pickupDate}</p>
                      <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{b.pickup} ➔ {b.drop}</span>
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 font-mono">{b.vehicleNumber || "Unassigned"}</p>
                      <p className="text-[11px] text-slate-500">{b.driverName || "Driver not mapped"}</p>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={b.status} />
                    </td>

                    <td className="py-4 px-4 text-right font-medium text-slate-600">
                      {formatINR(b.estimatedAmount)}
                    </td>

                    <td className="py-4 px-4 text-right font-black text-slate-900">
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
        )}
      </div>

    </div>
  );
}
