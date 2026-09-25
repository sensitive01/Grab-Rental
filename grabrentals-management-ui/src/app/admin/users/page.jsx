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
  Tabs,
  SearchInput,
} from "@/components/ui/Table";
import { Toast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { formatDate, cn } from "@/lib/utils";
import {
  Users,
  Shield,
  RefreshCw,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Building,
  UserPlus,
  AlertCircle,
  Truck,
  Headphones,
  User as UserIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Check,
  Copy,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Search,
  Edit3,
  Trash2,
} from "lucide-react";

function SortableHeader({ columnKey, label, currentSort, onSort, align = "left", className = "" }) {
  const isActive = currentSort.key === columnKey;
  const isAsc = currentSort.direction === "asc";

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={cn(
          "group inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] hover:text-blue-600 transition-colors cursor-pointer select-none",
          isActive ? "text-blue-600 font-extrabold" : "text-slate-700",
          align === "right" && "justify-end w-full"
        )}
      >
        <span>{label}</span>
        <span
          className={cn(
            "p-0.5 rounded transition-colors",
            isActive ? "bg-blue-50 text-blue-600" : "text-slate-400 group-hover:text-blue-600 group-hover:bg-slate-100"
          )}
        >
          {isActive ? (
            isAsc ? (
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
            )
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5 stroke-[1.8] opacity-50 group-hover:opacity-100" />
          )}
        </span>
      </button>
    </TableHead>
  );
}

export default function AdminUsersDirectoryPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // DataTable State
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [copiedId, setCopiedId] = useState(null);

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [submittingUser, setSubmittingUser] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [newUser, setNewUser] = useState({
    role: "FLEET",
    name: "",
    email: "",
    phone: "",
    password: "",
    businessName: "",
    hubLocation: "Chennai Central Hub",
  });

  const handleOpenAddUser = () => {
    setModalError(null);
    setNewUser({
      role: activeTab !== "ALL" && activeTab !== "ADMIN" ? activeTab : "FLEET",
      name: "",
      email: "",
      phone: "",
      password: "",
      businessName: "",
      hubLocation: "Chennai Central Hub",
    });
    setIsAddUserModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!newUser.name.trim()) {
      setModalError("Please enter the user's full name");
      return;
    }
    if (!newUser.email.trim()) {
      setModalError("Please enter a valid email address");
      return;
    }
    if (!newUser.password || newUser.password.length < 8) {
      setModalError("Password must be at least 8 characters long");
      return;
    }
    if (newUser.role === "FLEET" && !newUser.businessName?.trim()) {
      setModalError("Please enter the agency / business name for the vendor");
      return;
    }

    setSubmittingUser(true);
    try {
      const res = await adminApi.createUser({
        role: newUser.role,
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        phone: newUser.phone.trim() || "+91 98000 00000",
        password: newUser.password,
        businessName: newUser.businessName?.trim(),
        hubLocation: newUser.hubLocation?.trim(),
      });

      if (res.success && res.data) {
        setUsers((prev) => [res.data, ...prev]);
        setIsAddUserModalOpen(false);
        setToast({
          type: "success",
          message: `User created successfully! (${newUser.email}). You can now immediately login with this account.`,
        });
      }
    } catch (err) {
      setModalError(err.message || "Failed to create user. Please check credentials.");
    } finally {
      setSubmittingUser(false);
    }
  };

  // Edit User Modal State
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editModalError, setEditModalError] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    businessName: "",
    role: "FLEET",
    status: "ACTIVE",
    password: "",
  });

  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setEditModalError(null);
    setEditFormData({
      name: user.name || "",
      phone: user.phone || "",
      businessName: user.businessName || "",
      role: user.role === "VENDOR" ? "FLEET" : (user.role || "FLEET"),
      status: user.status || "ACTIVE",
      password: "",
    });
    setIsEditUserModalOpen(true);
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditModalError(null);

    if (!editFormData.name.trim()) {
      setEditModalError("Full Name is required");
      return;
    }

    setSubmittingEdit(true);
    try {
      const res = await adminApi.updateUser(editingUser.id, {
        name: editFormData.name.trim(),
        phone: editFormData.phone.trim(),
        businessName: editFormData.businessName?.trim() || null,
        role: editFormData.role,
        status: editFormData.status,
        password: editFormData.password ? editFormData.password.trim() : undefined,
      });

      if (res.success && res.data) {
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...res.data } : u)));
        setIsEditUserModalOpen(false);
        setToast({
          type: "success",
          message: `User ${editFormData.name} details updated successfully!`,
        });
      }
    } catch (err) {
      setEditModalError(err.message || "Failed to update user profile.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Delete User State & Handler
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState("");

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);
    setDeleteModalError("");
    try {
      const res = await adminApi.deleteUser(userToDelete.id);
      if (!res.success) {
        setDeleteModalError(res.error || "Failed to delete user account.");
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        setUserToDelete(null);
        setToast({
          type: "success",
          message: `User ${userToDelete.name || userToDelete.email} permanently deleted.`,
        });
      }
    } catch (err) {
      setDeleteModalError(err.message || "Failed to delete user.");
    } finally {
      setDeletingUser(false);
    }
  };

  async function loadUsers(isManualSync = false, silent = false) {
    if (isManualSync) setSyncing(true);
    else if (!silent) setLoading(true);
    else setSyncing(true);

    try {
      const res = await adminApi.getAllUsers();
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);

        if (isManualSync) {
          setToast({
            type: "success",
            message: `Retrieved ${res.data.length} records from database!`,
          });
        }
      } else {
        if (!silent) setUsers([]);
        setToast({
          type: "error",
          message: res.error || "Could not connect to database.",
        });
      }
    } catch (err) {
      console.error(err);
      if (!silent) setUsers([]);
      setToast({ type: "error", message: "Failed to load database users: " + err.message });
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }

  useEffect(() => {
    const cached = adminApi.getCachedUsers();
    const hasCachedData = Array.isArray(cached) && cached.length > 0;
    if (hasCachedData) {
      setUsers(cached);
      setLoading(false);
    }
    loadUsers(false, hasCachedData);
  }, []);

  async function handleToggleStatus(userId, currentStatus) {
    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    try {
      await adminApi.updateUserStatus(userId, newStatus);
      setToast({
        type: "success",
        message: `User status successfully updated to ${newStatus} in database`,
      });
      // Update local state immediately
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to update user status in database" });
    }
  }

  // DataTable Handlers
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1);
  };

  const handleCopyId = (id) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Dynamic Tab Counts
  const tabCounts = useMemo(() => {
    return {
      ALL: users.length,
      ADMIN: users.filter((u) => u.role === "ADMIN").length,
      OPERATIONS: users.filter((u) => u.role === "OPERATIONS").length,
      FLEET: users.filter((u) => u.role === "FLEET" || u.role === "VENDOR").length,
      CUSTOMER: users.filter((u) => u.role === "CUSTOMER").length,
    };
  }, [users]);

  const tabsWithCounts = useMemo(() => [
    { id: "ALL", label: "All Users", count: tabCounts.ALL },
    { id: "ADMIN", label: "System Admins", count: tabCounts.ADMIN },
    { id: "OPERATIONS", label: "Operations Staff", count: tabCounts.OPERATIONS },
    { id: "FLEET", label: "Vendors", count: tabCounts.FLEET },
    { id: "CUSTOMER", label: "Customers", count: tabCounts.CUSTOMER },
  ], [tabCounts]);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const isVendor = u.role === "FLEET" || u.role === "VENDOR";
      const matchTab =
        activeTab === "ALL" ||
        (activeTab === "FLEET" ? isVendor : u.role === activeTab);
      const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.businessName && u.businessName.toLowerCase().includes(q)) ||
        (u.id && String(u.id).toLowerCase().includes(q));
      return matchTab && matchStatus && matchSearch;
    });
  }, [users, activeTab, statusFilter, search]);

  // Sorting Logic
  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return filteredUsers;
    return [...filteredUsers].sort((a, b) => {
      let aVal = a[sortConfig.key] ?? "";
      let bVal = b[sortConfig.key] ?? "";

      if (sortConfig.key === "role") {
        if (aVal === "FLEET") aVal = "VENDOR";
        if (bVal === "FLEET") bVal = "VENDOR";
      }

      if (typeof aVal === "string") {
        const cmp = aVal.localeCompare(String(bVal), undefined, { numeric: true, sensitivity: "base" });
        return sortConfig.direction === "asc" ? cmp : -cmp;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortConfig]);

  // Pagination Logic
  const totalItems = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!sortedUsers.length) return;
    const headers = ["User ID", "Full Name", "Email", "Phone", "Role", "Business / Organization", "Status", "Registered Date"];
    const rows = sortedUsers.map((u) => [
      `"${u.id || ""}"`,
      `"${(u.name || "").replace(/"/g, '""')}"`,
      `"${u.email || ""}"`,
      `"${u.phone || ""}"`,
      `"${u.role === "FLEET" || u.role === "VENDOR" ? "VENDOR" : u.role}"`,
      `"${(u.businessName || "").replace(/"/g, '""')}"`,
      `"${u.status || ""}"`,
      `"${u.createdAt || ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `grabrentals_users_${activeTab.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ type: "success", message: `Exported ${sortedUsers.length} users to CSV successfully` });
  };

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
        title="Platform Users Directory"
        subtitle="Live directory directly connected to PostgreSQL database via Spring Boot REST API"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Users" }]}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              isLoading={syncing}
              onClick={() => loadUsers(true)}
            >
              Refresh Database Users
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={handleOpenAddUser}
            >
              Add User
            </Button>
          </div>
        }
      />

      {/* Main DataTable Card */}
      <Card noPadding className="overflow-hidden">
        {/* DataTable Header: Tabs */}
        <div className="px-4 pt-3 border-b border-slate-100">
          <Tabs
            tabs={tabsWithCounts}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* DataTable Controls Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Left Controls: Page Size & Status Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-medium text-slate-500">Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="font-medium text-slate-500">entries</span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            {/* Status Quick Filter */}
            <div className="flex items-center gap-1.5 text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Users</option>
                <option value="PENDING">Pending Approval</option>
                <option value="BLOCKED">Blocked Accounts</option>
              </select>
            </div>

            {(search || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setCurrentPage(1);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>

          {/* Right Controls: Search & CSV Export */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name, email, phone, org..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Button
              variant="secondary"
              size="xs"
              icon={Download}
              onClick={handleExportCSV}
              disabled={sortedUsers.length === 0}
              title="Export current table data to CSV"
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader
                columnKey="name"
                label="User Details"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="email"
                label="Contact Information"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="role"
                label="System Role"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="businessName"
                label="Business / Organization"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="createdAt"
                label="Registered Date"
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
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="font-medium text-xs">Connecting to backend user directory...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No users match your criteria</div>
                    <p className="text-xs text-slate-500 mt-1 mb-3">
                      Try adjusting your search query, changing status filter, or switching role tabs.
                    </p>
                    {(search || statusFilter !== "ALL") && (
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("ALL");
                          setCurrentPage(1);
                        }}
                      >
                        Reset All Filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((u) => {
                const isBlocked = u.status === "BLOCKED";
                const isPending = u.status === "PENDING";
                const isActive = u.status === "ACTIVE";
                const isCopied = copiedId === u.id;

                return (
                  <TableRow key={u.id}>
                    {/* User Details */}
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900">{u.name}</div>
                      <button
                        type="button"
                        onClick={() => handleCopyId(u.id)}
                        className="group flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600 font-mono transition-colors mt-0.5 cursor-pointer"
                        title="Click to copy full UUID"
                      >
                        <span>{String(u.id).slice(0, 16)}...</span>
                        {isCopied ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                      <div className="text-xs text-slate-800 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          u.role === "ADMIN"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : u.role === "OPERATIONS"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : u.role === "FLEET" || u.role === "VENDOR"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {u.role === "FLEET" || u.role === "VENDOR" ? "VENDOR" : u.role}
                      </span>
                    </TableCell>

                    {/* Business Name */}
                    <TableCell>
                      {u.businessName ? (
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{u.businessName}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Individual</span>
                      )}
                    </TableCell>

                    {/* Registered Date */}
                    <TableCell>
                      <span className="text-xs text-slate-600 font-mono">
                        {formatDate(u.createdAt)}
                      </span>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <Badge
                        variant={
                          isActive
                            ? "success"
                            : isBlocked
                            ? "danger"
                            : isPending
                            ? "warning"
                            : "neutral"
                        }
                        size="sm"
                        dot
                      >
                        {u.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="xs"
                          variant="secondary"
                          icon={Edit3}
                          onClick={() => handleOpenEditUser(u)}
                        >
                          Edit
                        </Button>
                        {u.role !== "ADMIN" && (
                          <>
                            <Button
                              size="xs"
                              variant={isActive ? "danger" : "emerald"}
                              icon={isActive ? UserX : UserCheck}
                              onClick={() => handleToggleStatus(u.id, u.status)}
                            >
                              {isActive ? "Block" : "Activate"}
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              icon={Trash2}
                              onClick={() => {
                                setDeleteModalError("");
                                setUserToDelete(u);
                              }}
                              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              title="Delete User"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* DataTable Footer: Pagination & Stats */}
        <div className="px-4 py-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold text-slate-900">{totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-semibold text-slate-900">{Math.min(currentPage * pageSize, totalItems)}</span> of{" "}
            <span className="font-semibold text-slate-900">{totalItems}</span> entries
            {totalItems !== users.length && (
              <span className="text-slate-400 ml-1">
                (filtered from {users.length} total entries)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 select-none">
            {/* First Page */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* Prev Page */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Numbered Page Buttons */}
            <div className="flex items-center gap-1 mx-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  return (
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
                  );
                })
                .map((page, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const hasGap = prevPage && page - prevPage > 1;

                  return (
                    <div key={page} className="flex items-center">
                      {hasGap && <span className="px-1 text-slate-400">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "min-w-[28px] h-7 px-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer",
                          currentPage === page
                            ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Next Page */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Add New User Account"
        subtitle="Create real database credentials for Vendors, Operations Staff, or Customers"
        size="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="font-medium">{modalError}</div>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Select User Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: "FLEET",
                  label: "Vendor",
                  desc: "Partner vendor portal access",
                  icon: Truck,
                  color: "border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-700",
                  activeColor: "border-purple-600 bg-purple-50 ring-2 ring-purple-600/20 text-purple-900",
                },
                {
                  id: "OPERATIONS",
                  label: "Operations Staff",
                  desc: "Dispatch & booking operations",
                  icon: Headphones,
                  color: "border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-700",
                  activeColor: "border-amber-600 bg-amber-50 ring-2 ring-amber-600/20 text-amber-900",
                },
                {
                  id: "CUSTOMER",
                  label: "Customer",
                  desc: "End-user booking customer",
                  icon: UserIcon,
                  color: "border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-700",
                  activeColor: "border-blue-600 bg-blue-50 ring-2 ring-blue-600/20 text-blue-900",
                },
              ].map((r) => {
                const Icon = r.icon;
                const isSelected = newUser.role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setNewUser({ ...newUser, role: r.id })}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected ? r.activeColor : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? "text-current" : "text-slate-500"}`} />
                      <span className="font-bold text-xs">{r.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Anand Kumar"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. anand@travels.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <Input
              label="Phone Number"
              placeholder="+91 98400 12345"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            />
            <Input
              label="Password (min. 8 characters)"
              type="password"
              required
              placeholder="••••••••"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              helperText="Credentials can be used to log in immediately"
            />
          </div>

          {/* Role-specific Fields */}
          {newUser.role === "FLEET" && (
            <Input
              label="Agency / Vendor Business Name"
              required
              placeholder="e.g. Royal Travels & Vendor Services"
              value={newUser.businessName}
              onChange={(e) => setNewUser({ ...newUser, businessName: e.target.value })}
              helperText="This business name will appear across platform listings and invoices"
            />
          )}

          {newUser.role === "OPERATIONS" && (
            <Select
              label="Assigned Operations Hub"
              value={newUser.hubLocation}
              onChange={(e) => setNewUser({ ...newUser, hubLocation: e.target.value })}
              options={[
                { value: "Chennai Central Hub", label: "Chennai Central Hub" },
                { value: "Bangalore Fleet Depot", label: "Bangalore Fleet Depot" },
                { value: "Coimbatore Operations Base", label: "Coimbatore Operations Base" },
                { value: "Kochi Dispatch Terminal", label: "Kochi Dispatch Terminal" },
                { value: "Hyderabad Operations Hub", label: "Hyderabad Operations Hub" },
              ]}
              helperText="Staff member will be authorized to monitor dispatch at this hub"
            />
          )}

          {newUser.role === "CUSTOMER" && (
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-700">
              Customer accounts are immediately activated with privileges to book rides, view live fleet GPS, and download invoices.
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddUserModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submittingUser}
            >
              Create User & Enable Login
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        title={`Edit User: ${editingUser?.name || "Account"}`}
        subtitle={`Update profile information, status, or credentials for ${editingUser?.email}`}
        size="lg"
      >
        <form onSubmit={handleSaveEditUser} className="space-y-4">
          {editModalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="font-medium">{editModalError}</div>
            </div>
          )}

          {/* Read-only Identity / Email banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="font-mono font-bold text-slate-800">{editingUser?.email}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
              Primary Login ID (Fixed)
            </span>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Anand Kumar"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            />
            <Input
              label="Phone Number"
              placeholder="+91 98400 12345"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="System Role"
              value={editFormData.role}
              onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
              options={[
                { value: "FLEET", label: "Vendor (Fleet Partner)" },
                { value: "OPERATIONS", label: "Operations Staff" },
                { value: "CUSTOMER", label: "Customer" },
                { value: "ADMIN", label: "System Administrator" },
              ]}
              helperText="Controls access privileges and portal routing"
            />

            <Select
              label="Account Status"
              value={editFormData.status}
              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              options={[
                { value: "ACTIVE", label: "ACTIVE (Normal Access)" },
                { value: "BLOCKED", label: "BLOCKED (Access Denied)" },
                { value: "PENDING_APPROVAL", label: "PENDING_APPROVAL (Under Review)" },
              ]}
              helperText="Operational state in PostgreSQL database"
            />
          </div>

          {(editFormData.role === "FLEET" || editFormData.role === "VENDOR") && (
            <Input
              label="Agency / Vendor Business Name"
              placeholder="e.g. Royal Travels & Vendor Services"
              value={editFormData.businessName}
              onChange={(e) => setEditFormData({ ...editFormData, businessName: e.target.value })}
              helperText="Company name displayed on fleet listings and duty slips"
            />
          )}

          <Input
            label="Reset Password (optional)"
            type="password"
            placeholder="Leave blank to keep current password"
            value={editFormData.password}
            onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
            helperText="Enter a new password (min. 8 chars) only if resetting user login"
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditUserModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submittingEdit}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => !deletingUser && setUserToDelete(null)}
        title="Delete User Account"
        description="Permanently remove this user and their associated data from PostgreSQL."
        size="md"
      >
        <div className="space-y-4">
          {deleteModalError && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center justify-between">
              <span>{deleteModalError}</span>
              <button
                type="button"
                onClick={() => setDeleteModalError("")}
                className="text-rose-500 hover:text-rose-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-100 flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-xs text-rose-900 leading-relaxed">
              <p className="font-semibold text-rose-950 mb-1">
                Are you sure you want to permanently delete this user?
              </p>
              <p>
                This action is <span className="font-bold underline">irreversible</span>. It will completely delete{" "}
                <span className="font-semibold text-rose-950">{userToDelete?.name}</span> (
                <span className="font-mono text-rose-950">{userToDelete?.email}</span>) and cascade-remove any associated records (fleet profiles, assigned vehicles, and drivers).
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">User ID:</span>
              <span className="font-mono font-medium text-slate-800">{userToDelete?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Role:</span>
              <span className="font-semibold text-slate-800">{userToDelete?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Status:</span>
              <span className="font-medium text-slate-800">{userToDelete?.status}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={deletingUser}
              onClick={() => setUserToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={Trash2}
              isLoading={deletingUser}
              onClick={handleDeleteUser}
            >
              Delete User Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
