"use client";

import { useState, useEffect, useMemo } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
import { Toast } from "@/components/ui/Toast";
import { AlertTriangle, CheckCircle, Filter } from "lucide-react";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // DataTable state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });

  async function loadData() {
    try {
      const res = await adminApi.getComplaints();
      setComplaints(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleResolve(id) {
    try {
      await adminApi.updateComplaint(id, "RESOLVED");
      setToast({ type: "success", message: `Complaint #${id} marked as resolved` });
      loadData();
    } catch {
      setToast({ type: "error", message: "Failed to resolve complaint" });
    }
  }

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const categories = useMemo(() => {
    const set = new Set();
    complaints.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [complaints]);

  const filteredAndSortedComplaints = useMemo(() => {
    let result = [...complaints];

    if (statusFilter !== "ALL") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (categoryFilter !== "ALL") {
      result = result.filter((c) => c.category === categoryFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.id?.toLowerCase().includes(q) ||
          c.customerName?.toLowerCase().includes(q) ||
          c.bookingId?.toLowerCase().includes(q) ||
          c.summary?.toLowerCase().includes(q) ||
          c.assignedTo?.toLowerCase().includes(q)
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
  }, [complaints, search, statusFilter, categoryFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedComplaints.length / pageSize) || 1;
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedComplaints.slice(start, start + pageSize);
  }, [filteredAndSortedComplaints, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Grievances & Customer Complaints"
        subtitle="Manage escalated service tickets, driver conduct reports, and AC/cleanliness disputes"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Complaints" }]}
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
              placeholder="Search ticket ID, customer, trip #, summary..."
              className="w-full sm:w-80"
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
                <option value="ALL">All Statuses ({complaints.length})</option>
                <option value="OPEN">Open</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="RESOLVED">Resolved</option>
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
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredAndSortedComplaints.length}</strong> complaints
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
                label="Ticket ID"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="customerName"
                label="Customer & Trip #"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="category"
                label="Category & Severity"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Complaint Summary</TableHead>
              <SortableHeader
                columnKey="assignedTo"
                label="Assigned Officer"
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
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  Loading grievance records...
                </TableCell>
              </TableRow>
            ) : paginatedComplaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No Complaints Found</div>
                    <p className="text-xs text-slate-500 mt-1">
                      No grievance tickets match your current filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedComplaints.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-slate-900">{c.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-900">{c.customerName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">Trip #{c.bookingId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={c.severity === "MEDIUM" ? "warning" : "neutral"} size="sm">
                        {c.category}
                      </Badge>
                      {c.severity && (
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">
                          ({c.severity})
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-slate-700 max-w-md line-clamp-2">{c.summary}</p>
                    <span className="text-[10px] text-slate-400">Logged: {c.createdAt}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-slate-700">{c.assignedTo}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.status === "RESOLVED" ? "success" : "danger"} size="sm">
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {c.status !== "RESOLVED" ? (
                      <Button
                        size="xs"
                        variant="emerald"
                        icon={CheckCircle}
                        onClick={() => handleResolve(c.id)}
                      >
                        Mark Resolved
                      </Button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-semibold">Resolved</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && filteredAndSortedComplaints.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAndSortedComplaints.length}
            pageSize={pageSize}
          />
        )}
      </Card>
    </div>
  );
}
