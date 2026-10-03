"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
import { formatINR } from "@/lib/utils";
import { Eye, UserX, UserCheck, Phone, Mail, Users, Filter } from "lucide-react";
import { Toast } from "@/components/ui/Toast";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [toast, setToast] = useState(null);

  async function loadCustomers() {
    try {
      const res = await adminApi.getCustomers();
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleToggleStatus(id) {
    try {
      const res = await adminApi.toggleCustomerStatus(id);
      setToast({ type: "success", message: `Customer status updated to ${res.data.status}` });
      loadCustomers();
    } catch {
      setToast({ type: "error", message: "Failed to update customer status" });
    }
  }

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...customers];

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.id?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === "totalBookings" || sortConfig.key === "totalSpend") {
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
  }, [customers, search, statusFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedCustomers.slice(start, start + pageSize);
  }, [filteredAndSortedCustomers, currentPage, pageSize]);

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
        title="Customer Directory"
        subtitle="Manage registered passengers, lifetime booking volume, and account access"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Customers" }]}
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
              placeholder="Search by name, email, phone, city..."
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
                <option value="ALL">All Statuses ({customers.length})</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredAndSortedCustomers.length}</strong> customers
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
                label="Customer ID & Name"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Contact Info</TableHead>
              <SortableHeader
                columnKey="city"
                label="City Hub"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="totalBookings"
                label="Bookings"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="totalSpend"
                label="Lifetime Spend"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="status"
                label="Status"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : paginatedCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No Customers Found</div>
                    <p className="text-xs text-slate-500 mt-1">
                      {search || statusFilter !== "ALL"
                        ? "No customers match your search criteria."
                        : "No customers registered."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{c.id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-800 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>{c.phone}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-800">{c.city}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-900">{c.totalBookings} Trips</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-emerald-700">{formatINR(c.totalSpend)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.status === "ACTIVE" ? "success" : "danger"} size="sm">
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/admin/customers/${c.id}`}>
                        <Button size="xs" variant="secondary" icon={Eye}>
                          Profile
                        </Button>
                      </Link>
                      <Button
                        size="xs"
                        variant={c.status === "ACTIVE" ? "danger" : "secondary"}
                        icon={c.status === "ACTIVE" ? UserX : UserCheck}
                        onClick={() => handleToggleStatus(c.id)}
                      >
                        {c.status === "ACTIVE" ? "Block" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && filteredAndSortedCustomers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAndSortedCustomers.length}
            pageSize={pageSize}
          />
        )}
      </Card>
    </div>
  );
}
