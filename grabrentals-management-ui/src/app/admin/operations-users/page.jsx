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
import {
  ShieldCheck,
  Plus,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Edit3,
  UserCheck,
  UserX,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const SHIFT_OPTIONS = [
  { value: "Standard Shift (08:00 - 17:00)", label: "Standard Shift (08:00 - 17:00)" },
  { value: "Morning Shift (06:00 - 14:30)", label: "Morning Shift (06:00 - 14:30)" },
  { value: "Evening Shift (14:00 - 22:30)", label: "Evening Shift (14:00 - 22:30)" },
  { value: "Night Shift (22:00 - 06:30)", label: "Night Shift (22:00 - 06:30)" },
];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (diffMs < 0) return "Just now";
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return "";
  } catch {
    return "";
  }
}

export default function AdminOperationsUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);

  // Create Staff Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    shiftsAssigned: "Standard Shift (08:00 - 17:00)",
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit Staff Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    password: "",
    shiftsAssigned: "Standard Shift (08:00 - 17:00)",
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete Staff Modal State
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // DataTable State
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  async function loadUsers(showFeedback = false) {
    try {
      if (showFeedback) setLoading(true);
      const res = await adminApi.getOperationsUsers();
      setUsers(res.data || []);
      if (showFeedback) {
        setToast({ type: "success", message: "Operations staff directory refreshed" });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to load operations users" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    adminApi.getOperationsUsers()
      .then((res) => {
        if (!ignore) {
          setUsers(res.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error(err);
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleCopyId = (id) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(String(id));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

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
    if (!formData.password || formData.password.length < 8) {
      setToast({ type: "error", message: "Password must be at least 8 characters" });
      return;
    }
    setSubmittingCreate(true);
    try {
      await adminApi.createOperationsUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });
      setToast({ type: "success", message: `Operations staff account created for ${formData.name}` });
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        shiftsAssigned: "Standard Shift (08:00 - 17:00)",
      });
      loadUsers();
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to create user" });
    } finally {
      setSubmittingCreate(false);
    }
  }

  function handleOpenEdit(user) {
    setEditingUser(user);
    setEditFormData({
      name: user.name || "",
      phone: user.phone === "—" ? "" : user.phone || "",
      password: "",
      shiftsAssigned: user.shiftsAssigned || "Standard Shift (08:00 - 17:00)",
    });
    setIsEditModalOpen(true);
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingUser) return;
    if (!editFormData.name.trim()) return;
    if (editFormData.password && editFormData.password.length < 8) {
      setToast({ type: "error", message: "New password must be at least 8 characters" });
      return;
    }

    setSubmittingEdit(true);
    try {
      await adminApi.updateUser(editingUser.id, {
        name: editFormData.name.trim(),
        phone: editFormData.phone.trim(),
        businessName: editFormData.shiftsAssigned,
        password: editFormData.password ? editFormData.password.trim() : undefined,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: editFormData.name.trim(),
                phone: editFormData.phone.trim() || "—",
                shiftsAssigned: editFormData.shiftsAssigned,
              }
            : u
        )
      );

      setIsEditModalOpen(false);
      setToast({ type: "success", message: `Updated details for ${editFormData.name}` });
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to update user" });
    } finally {
      setSubmittingEdit(false);
    }
  }

  async function handleToggleStatus(userId, currentStatus) {
    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    try {
      await adminApi.updateUserStatus(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
      setToast({
        type: "success",
        message: `Operations user status changed to ${newStatus}`,
      });
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to update status" });
    }
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;
    setDeletingUser(true);
    try {
      await adminApi.deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setToast({
        type: "success",
        message: `Deleted operations account for ${userToDelete.name}`,
      });
      setUserToDelete(null);
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to delete user" });
    } finally {
      setDeletingUser(false);
    }
  }

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          String(u.id).toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortConfig.key === "lastLoginAt") {
        const timeA = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
        const timeB = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
        return sortConfig.direction === "asc" ? timeA - timeB : timeB - timeA;
      }

      if (sortConfig.key === "createdAt") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortConfig.direction === "asc" ? timeA - timeB : timeB - timeA;
      }

      let valA = a[sortConfig.key] || "";
      let valB = b[sortConfig.key] || "";

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, search, sortConfig]);

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
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              isLoading={loading}
              onClick={() => loadUsers(true)}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              Add Operations User
            </Button>
          </div>
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
              placeholder="Search staff by name, email, phone, ID..."
              className="w-full sm:w-80"
            />
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
                columnKey="email"
                label="Contact Information"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Assigned Duty Shift</TableHead>
              <SortableHeader
                columnKey="createdAt"
                label="Registered Date"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="lastLoginAt"
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="font-medium text-xs">Loading operations users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
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
              paginatedUsers.map((u) => {
                const isActive = u.status === "ACTIVE";
                const isBlocked = u.status === "BLOCKED";
                const isCopied = copiedId === u.id;

                return (
                  <TableRow key={u.id}>
                    {/* Staff Member Details */}
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

                    {/* Contact Information */}
                    <TableCell>
                      <div className="text-xs text-slate-800 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && u.phone !== "—" && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Assigned Duty Shift */}
                    <TableCell>
                      <span className="inline-flex items-center text-xs text-slate-700 font-medium px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {u.shiftsAssigned}
                      </span>
                    </TableCell>

                    {/* Registered Date */}
                    <TableCell>
                      <span className="text-xs text-slate-600 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        {formatDate(u.createdAt)}
                      </span>
                    </TableCell>

                    {/* Dynamic Last Sign-In */}
                    <TableCell>
                      {u.lastLoginAt ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-800 font-medium flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-emerald-500 shrink-0" />
                            {formatDateTime(u.lastLoginAt)}
                          </span>
                          <span className="text-[10px] text-slate-400 pl-4">
                            {formatRelativeTime(u.lastLoginAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Never signed in</span>
                      )}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <Badge
                        variant={isActive ? "success" : isBlocked ? "danger" : "neutral"}
                        size="sm"
                        dot
                      >
                        {u.status}
                      </Badge>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="xs"
                          variant="secondary"
                          icon={Edit3}
                          onClick={() => handleOpenEdit(u)}
                        >
                          Edit
                        </Button>
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
                          onClick={() => setUserToDelete(u)}
                          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          title="Delete Staff Account"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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

      {/* Create Operations User Modal */}
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
          <Input
            label="Password"
            type="password"
            required
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helperText="Credentials can be used to log in immediately"
          />
          <Select
            label="Duty Shift"
            value={formData.shiftsAssigned}
            onChange={(e) => setFormData({ ...formData, shiftsAssigned: e.target.value })}
            options={SHIFT_OPTIONS}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={submittingCreate}
            >
              Provision Staff Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Operations User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Operations Staff Member"
        subtitle="Update dispatcher contact info and duty shift schedule"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={editFormData.name}
            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
            <div className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              {editingUser?.email}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Corporate email address cannot be changed.</p>
          </div>
          <Input
            label="Mobile Phone"
            value={editFormData.phone}
            placeholder="+91 98400 12345"
            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
          />
          <Input
            label="Reset Password (Optional)"
            type="password"
            placeholder="Leave blank to keep existing password"
            value={editFormData.password}
            onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
            helperText="Enter a new password (min. 8 characters) to reset"
          />
          <Select
            label="Duty Shift"
            value={editFormData.shiftsAssigned}
            onChange={(e) => setEditFormData({ ...editFormData, shiftsAssigned: e.target.value })}
            options={SHIFT_OPTIONS}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={submittingEdit}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Delete Operations User"
        subtitle="This action permanently removes the user's portal dispatch access."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="text-xs">
              Are you sure you want to delete <strong>{userToDelete?.name}</strong> (
              <span className="font-mono">{userToDelete?.email}</span>)?
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setUserToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deletingUser}
              onClick={handleDeleteUser}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
