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
import { Sparkles } from "lucide-react";

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getServices();
        setServices(res.data || []);
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

  const filteredAndSortedServices = useMemo(() => {
    let result = [...services];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.code?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = (a[sortConfig.key] || "").toLowerCase();
      let valB = (b[sortConfig.key] || "").toLowerCase();

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [services, search, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedServices.length / pageSize) || 1;
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedServices.slice(start, start + pageSize);
  }, [filteredAndSortedServices, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rental Service Offerings"
        subtitle="Manage available booking trip types, business travel packages, and circuit offerings"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Services" }]}
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
              placeholder="Search service name, code, description..."
              className="w-full sm:w-80"
            />
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredAndSortedServices.length}</strong> service offerings
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
                label="Service Name"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="code"
                label="System Code"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Service Description</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                  Loading services...
                </TableCell>
              </TableRow>
            ) : paginatedServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No Services Found</div>
                    <p className="text-xs text-slate-500 mt-1">
                      No service types match your search query.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedServices.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{s.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-blue-600 font-semibold">{s.code}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600">{s.description}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">Active</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && filteredAndSortedServices.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAndSortedServices.length}
            pageSize={pageSize}
          />
        )}
      </Card>
    </div>
  );
}
