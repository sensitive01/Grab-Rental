"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { operationsApi } from "@/lib/operationsApi";
import { formatINR, getStatusStyle } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  Tabs,
  SearchInput,
} from "@/components/ui/Table";
import { CalendarCheck, Eye, PlusCircle, UserCheck } from "lucide-react";

const TABS = [
  { id: "ALL", label: "All Bookings" },
  { id: "PENDING_ALLOCATION", label: "Needs Allocation" },
  { id: "ASSIGNED", label: "Assigned" },
  { id: "EN_ROUTE", label: "En Route" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

export default function OperationsBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    async function load() {
      try {
        const res = await operationsApi.getBookings();
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchTab = activeTab === "ALL" || b.status === activeTab;
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        b.id.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.pickupLocation.toLowerCase().includes(q) ||
        b.dropLocation.toLowerCase().includes(q) ||
        (b.assignedVehicleNumber && b.assignedVehicleNumber.toLowerCase().includes(q)) ||
        (b.assignedDriverName && b.assignedDriverName.toLowerCase().includes(q));
      return matchTab && matchSearch;
    });
  }, [bookings, activeTab, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Booking Queue"
        subtitle="Manage end-to-end booking dispatch, fleet assignments, and status lifecycles"
        breadcrumbs={[{ label: "Operations", href: "/operations/dashboard" }, { label: "Bookings" }]}
        action={
          <Link href="/operations/assignments/vehicle">
            <Button variant="amber" size="sm" icon={UserCheck}>
              Fast Dispatch Allocator
            </Button>
          </Link>
        }
      />

      <Card noPadding>
        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs tabs={TABS} activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setPage(1); }} />
          <SearchInput
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="Search by ID, customer, route..."
          />
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer Details</TableHead>
              <TableHead>Route / Service</TableHead>
              <TableHead>Pickup Schedule</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Assigned Vehicle & Driver</TableHead>
              <TableHead>Total Fare</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                  Loading bookings...
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                  No bookings found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((b) => {
                const statusStyle = getStatusStyle(b.status);
                return (
                  <TableRow key={b.id}>
                    <TableCell>
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {b.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900 text-xs">
                        {b.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500">{b.customerPhone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-slate-800 truncate max-w-[180px]">
                        {b.pickupLocation} ➔ {b.dropLocation}
                      </div>
                      <div className="text-[11px] text-slate-500">{b.serviceType}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-800 font-medium">{b.startDate}</div>
                      <div className="text-[11px] text-slate-500">{b.durationDays} Day(s)</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {b.vehicleCategory}
                      </span>
                    </TableCell>
                    <TableCell>
                      {b.assignedVehicleNumber ? (
                        <div className="space-y-1">
                          <NumberPlate registrationNumber={b.assignedVehicleNumber} />
                          <div className="text-[11px] text-slate-600 font-medium">
                            {b.assignedDriverName}
                          </div>
                        </div>
                      ) : (
                        <Link href={`/operations/assignments/vehicle?bookingId=${b.id}`}>
                          <span className="text-[11px] font-bold text-amber-600 hover:underline">
                            + Assign Now
                          </span>
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-900 text-xs">{formatINR(b.fare)}</div>
                      <div className="text-[10px] text-slate-500">{b.paymentStatus}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusStyle.bg}`}>
                        {statusStyle.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/operations/bookings/${b.id}`}>
                        <Button variant="secondary" size="xs" icon={Eye}>
                          Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filtered.length}
          pageSize={pageSize}
        />
      </Card>
    </div>
  );
}
