"use client";

import { useState, useEffect, useMemo } from "react";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
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
import { getStatusStyle } from "@/lib/utils";
import { Car, Filter } from "lucide-react";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "registrationNumber", direction: "asc" });

  useEffect(() => {
    async function load() {
      try {
        const res = await operationsApi.getVehicles("ALL");
        setVehicles(res.data || []);
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

  const categories = useMemo(() => {
    const set = new Set();
    vehicles.forEach((v) => {
      const cat = v.category || v.vehicleType;
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [vehicles]);

  const filteredAndSortedVehicles = useMemo(() => {
    let result = [...vehicles];

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((v) => v.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "ALL") {
      result = result.filter((v) => (v.category || v.vehicleType) === categoryFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (v) =>
          (v.registrationNumber || v.vehicleNumber)?.toLowerCase().includes(q) ||
          v.model?.toLowerCase().includes(q) ||
          v.vendorName?.toLowerCase().includes(q) ||
          (v.category || v.vehicleType)?.toLowerCase().includes(q) ||
          v.permitType?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortConfig.key] || (sortConfig.key === "registrationNumber" ? a.vehicleNumber : "");
      let valB = b[sortConfig.key] || (sortConfig.key === "registrationNumber" ? b.vehicleNumber : "");

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [vehicles, search, statusFilter, categoryFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedVehicles.length / pageSize) || 1;
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedVehicles.slice(start, start + pageSize);
  }, [filteredAndSortedVehicles, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Vehicle Registry"
        subtitle="Platform-wide compliance tracking, fitness certificates, and insurance audits"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Vehicles" }]}
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
              placeholder="Search plate, model, category, vendor..."
              className="w-full sm:w-72"
            />

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="ALL">All Statuses ({vehicles.length})</option>
                <option value="AVAILABLE">Available</option>
                <option value="ON_TRIP">On Trip</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="SUSPENDED">Suspended</option>
              </select>

              {categories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredAndSortedVehicles.length}</strong> vehicles
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
                columnKey="registrationNumber"
                label="Registration"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="model"
                label="Model / Type"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="category"
                label="Fleet Category"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="vendorName"
                label="Vendor Provider"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Insurance Expiry</TableHead>
              <TableHead>Fitness Expiry</TableHead>
              <TableHead>Permit Type</TableHead>
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
                  <LoadingAnimation inline title="Loading vehicle registry..." />
                </TableCell>
              </TableRow>
            ) : paginatedVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <Car className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No Vehicles Found</div>
                    <p className="text-xs text-slate-500 mt-1">
                      {search || statusFilter !== "ALL" || categoryFilter !== "ALL"
                        ? "No vehicles match your active search filters."
                        : "No vehicles registered in the platform registry."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedVehicles.map((v) => {
                const statusStyle = getStatusStyle(v.status);
                return (
                  <TableRow key={v.id}>
                    <TableCell>
                      <NumberPlate registrationNumber={v.registrationNumber || v.vehicleNumber} />
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900">{v.model}</div>
                      <div className="text-[11px] text-slate-500">
                        {v.seatingCapacity || "4"} Seater • {v.fuelType || "Petrol"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">
                        {v.category || v.vehicleType || "Standard"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-800">
                        {v.vendorName || "Platform Fleet"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-700 font-mono">
                        {v.insuranceExpiry || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-700 font-mono">
                        {v.fitnessExpiry || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] text-slate-600">
                        {v.permitType || "Tourist Permit"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusStyle.bg}`}
                      >
                        {statusStyle.label}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {!loading && filteredAndSortedVehicles.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAndSortedVehicles.length}
            pageSize={pageSize}
          />
        )}
      </Card>
    </div>
  );
}
