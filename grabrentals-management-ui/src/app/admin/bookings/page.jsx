"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SortableHeader,
  Pagination,
  SearchInput,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { formatINR, getStatusStyle } from "@/lib/utils";
import { Eye, CalendarCheck, Filter } from "lucide-react";

export default function AdminMasterBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });

  useEffect(() => {
    async function load() {
      try {
        const res = await operationsApi.getBookings();
        setBookings(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const filteredAndSortedBookings = useMemo(() => {
    let result = [...bookings];

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.id?.toLowerCase().includes(q) ||
          b.customerName?.toLowerCase().includes(q) ||
          b.customerPhone?.toLowerCase().includes(q) ||
          b.pickupLocation?.toLowerCase().includes(q) ||
          b.dropLocation?.toLowerCase().includes(q) ||
          b.vendorName?.toLowerCase().includes(q) ||
          b.assignedVehicleNumber?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === "fare" || sortConfig.key === "totalFare") {
        valA = Number(a.fare || a.totalFare || 0);
        valB = Number(b.fare || b.totalFare || 0);
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [bookings, search, statusFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedBookings.slice(start, start + pageSize);
  }, [filteredAndSortedBookings, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Booking Ledger"
        subtitle="Platform-wide booking records across all customer accounts and vendor partners"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Bookings" }]}
      />

      <Card noPadding>
        {/* DataTable Controls Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search ID, customer, route, vendor..."
              className="w-full sm:w-80"
            />

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="ALL">All Statuses ({bookings.length})</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="ALLOCATED">Allocated</option>
                <option value="ON_TRIP">On Trip</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredAndSortedBookings.length}</strong> bookings
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 font-medium focus:outline-none"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader
                columnKey="id"
                label="Booking ID"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="customerName"
                label="Customer"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Route / Service</TableHead>
              <SortableHeader
                columnKey="vendorName"
                label="Partner Vendor"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Vehicle & Driver</TableHead>
              <SortableHeader
                columnKey="fare"
                label="Total Fare"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="status"
                label="Status"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12">
                  <LoadingAnimation inline title="Loading master booking ledger..." />
                </TableCell>
              </TableRow>
            ) : paginatedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No Bookings Found</div>
                    <p className="text-xs text-slate-500 mt-1">
                      {search || statusFilter !== "ALL"
                        ? "No bookings match your current filter criteria."
                        : "No bookings registered in the system."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedBookings.map((b) => {
                const statusStyle = getStatusStyle(b.status);
                return (
                  <TableRow key={b.id}>
                    <TableCell>
                      <span className="font-mono font-bold text-xs text-slate-900">{b.id}</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900">{b.customerName}</div>
                      <div className="text-[11px] text-slate-500">
                        {b.customerPhone || b.customerEmail || ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-slate-800">
                        {b.pickupLocation} ➔ {b.dropLocation}
                      </div>
                      <div className="text-[11px] text-slate-500">{b.startDate}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-800">
                        {b.vendorName || "In-House Fleet"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {b.assignedVehicleNumber ? (
                        <div className="space-y-1">
                          <NumberPlate registrationNumber={b.assignedVehicleNumber} />
                          <div className="text-[10px] text-slate-500">{b.assignedDriverName}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium italic">
                          Unallocated
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-xs text-slate-900">
                        {formatINR(b.fare || b.totalFare || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusStyle.bg}`}
                      >
                        {statusStyle.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/bookings/${b.id}`}>
                        <Button size="xs" variant="secondary" icon={Eye}>
                          Audit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {!loading && filteredAndSortedBookings.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAndSortedBookings.length}
            pageSize={pageSize}
          />
        )}
      </Card>
    </div>
  );
}
