"use client";

import { useState, useEffect, useMemo } from "react";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
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
import { Star, Filter, Download, UserCheck } from "lucide-react";
import { getStatusStyle } from "@/lib/utils";

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  useEffect(() => {
    async function load() {
      try {
        const res = await operationsApi.getDrivers();
        setDrivers(res.data || []);
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

  const filteredAndSortedDrivers = useMemo(() => {
    let result = [...drivers];

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((d) => d.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.phone?.toLowerCase().includes(q) ||
          d.badgeNumber?.toLowerCase().includes(q) ||
          d.licenseNumber?.toLowerCase().includes(q) ||
          d.vendorName?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [drivers, search, statusFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedDrivers.length / pageSize) || 1;
  const paginatedDrivers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedDrivers.slice(start, start + pageSize);
  }, [filteredAndSortedDrivers, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Chauffeur Registry"
        subtitle="Platform-wide driver commercial badges, DL numbers, and performance ratings"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Drivers" }]}
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
              placeholder="Search by name, phone, badge, DL, vendor..."
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
                <option value="ALL">All Statuses ({drivers.length})</option>
                <option value="AVAILABLE">Available</option>
                <option value="ON_TRIP">On Trip</option>
                <option value="OFF_DUTY">Off Duty</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredAndSortedDrivers.length}</strong> chauffeurs
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
                columnKey="name"
                label="Chauffeur"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="badgeNumber"
                label="Commercial Badge"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Driving License</TableHead>
              <SortableHeader
                columnKey="vendorName"
                label="Vendor Affiliation"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Badge Validity</TableHead>
              <SortableHeader
                columnKey="tripsCompleted"
                label="Trips"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="rating"
                label="Rating"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="status"
                label="Status"
                currentSort={sortConfig}
                onSort={handleSort}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12">
                  <LoadingAnimation inline title="Loading chauffeur registry..." />
                </TableCell>
              </TableRow>
            ) : paginatedDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No Chauffeurs Found</div>
                    <p className="text-xs text-slate-500 mt-1">
                      {search || statusFilter !== "ALL"
                        ? "No drivers match your current filter criteria."
                        : "No drivers registered in the fleet."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedDrivers.map((d) => {
                const statusStyle = getStatusStyle(d.status);
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900">{d.name}</div>
                      <div className="text-[11px] text-slate-500">{d.phone}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-slate-800">{d.badgeNumber}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[11px] text-slate-600">{d.licenseNumber}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-800">{d.vendorName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-emerald-700 font-medium">{d.badgeValidTill}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-slate-900">{d.tripsCompleted}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{d.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusStyle.bg}`}>
                        {statusStyle.label}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {!loading && filteredAndSortedDrivers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAndSortedDrivers.length}
            pageSize={pageSize}
          />
        )}
      </Card>
    </div>
  );
}
