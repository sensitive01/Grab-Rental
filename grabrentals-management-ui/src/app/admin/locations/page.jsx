"use client";

import { useState, useEffect, useMemo } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
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
import { MapPin } from "lucide-react";

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "city", direction: "asc" });

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getLocations();
        setLocations(res.data || []);
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

  const filteredAndSortedLocations = useMemo(() => {
    let result = [...locations];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (loc) =>
          loc.city?.toLowerCase().includes(q) ||
          loc.state?.toLowerCase().includes(q) ||
          loc.id?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === "hubs" || sortConfig.key === "activeVehicles") {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [locations, search, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedLocations.length / pageSize) || 1;
  const paginatedLocations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedLocations.slice(start, start + pageSize);
  }, [filteredAndSortedLocations, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cities & Operational Hubs"
        subtitle="Manage active city territories, airport depots, and regional fleet deployment"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Locations" }]}
      />

      <Card noPadding>
        {/* DataTable Controls Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search by city, state, location ID..."
              className="w-full sm:w-80"
            />
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredAndSortedLocations.length}</strong> hubs
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
                label="Location ID"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="city"
                label="City Hub"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="state"
                label="State / Territory"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="hubs"
                label="Operational Hubs"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="activeVehicles"
                label="Active Fleet Deployed"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  Loading locations...
                </TableCell>
              </TableRow>
            ) : paginatedLocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No Locations Found</div>
                    <p className="text-xs text-slate-500 mt-1">
                      No operational hubs match your search query.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedLocations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-slate-900">{loc.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>{loc.city}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700">{loc.state}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-800">{loc.hubs} Depots</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-900">{loc.activeVehicles} Vehicles</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">{loc.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && filteredAndSortedLocations.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAndSortedLocations.length}
            pageSize={pageSize}
          />
        )}
      </Card>
    </div>
  );
}
