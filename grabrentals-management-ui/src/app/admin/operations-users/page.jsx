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
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { ShieldCheck, Plus, User, Phone, Mail, Filter } from "lucide-react";

export default function AdminOperationsUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "Chennai Hub",
    shiftsAssigned: "Morning Shift (06:00 - 14:30)",
  });
  const [toast, setToast] = useState(null);

  // DataTable State
  const [search, setSearch] = useState("");
  const [hubFilter, setHubFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  async function loadUsers() {
    try {
      const res = await adminApi.getOperationsUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  async function handleCreateUser(e) {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    try {
      await adminApi.createOperationsUser(formData);
      setToast({ type: "success", message: `Operations staff account created for ${formData.name}` });
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "Chennai Hub",
        shiftsAssigned: "Morning Shift (06:00 - 14:30)",
      });
      loadUsers();
    } catch {
      setToast({ type: "error", message: "Failed to create user" });
    }
  }

  const hubs = useMemo(() => {
    const set = new Set();
    users.forEach((u) => {
      if (u.city) set.add(u.city);
    });
    return Array.from(set);
  }, [users]);

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    if (hubFilter !== "ALL") {
      result = result.filter((u) => u.city === hubFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.city?.toLowerCase().includes(q)
      );
    }

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
  }, [users, search, hubFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedUsers.slice(start, start + pageSize);
  }, [filteredAndSortedUsers, currentPage, pageSize]);

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
        title="Operations Staff Directory"
        subtitle="Manage dispatch officers, trip allocation specialists, and shift permissions"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Operations Staff" }]}
        action={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Add Operations User
          </Button>
        }
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
              placeholder="Search staff by name, email, phone, hub..."
              className="w-full sm:w-80"
            />

            {hubs.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={hubFilter}
                  onChange={(e) => {
                    setHubFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="ALL">All Hubs ({users.length})</option>
                  {hubs.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredAndSortedUsers.length}</strong> staff
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
                label="Staff Member"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="city"
                label="Hub / Location"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Assigned Duty Shift</TableHead>
              <SortableHeader
                columnKey="lastLogin"
                label="Last Sign-In"
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
                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                  Loading operations users...
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No Operations Staff Found</div>
                    <p className="text-xs text-slate-500 mt-1">
                      No staff members match your search criteria.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700 font-medium">{u.city}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600 font-medium">{u.shiftsAssigned}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500 font-mono">{u.lastLogin}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">{u.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && filteredAndSortedUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAndSortedUsers.length}
            pageSize={pageSize}
          />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Operations Dispatch User"
        subtitle="Provision portal access credentials for operations dispatcher"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Ramesh V."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Corporate Work Email"
            type="email"
            required
            placeholder="e.g. ramesh.ops@grabrentals.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Mobile Phone"
            placeholder="+91 98400 12345"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Select
            label="Primary Hub"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            options={[
              { value: "Chennai Hub", label: "Chennai Hub" },
              { value: "Bangalore Hub", label: "Bangalore Hub" },
              { value: "Coimbatore Hub", label: "Coimbatore Hub" },
              { value: "Kochi Hub", label: "Kochi Hub" },
            ]}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Provision Staff Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
