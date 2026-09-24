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
import { formatDate } from "@/lib/utils";
import {
  Users,
  Shield,
  RefreshCw,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Building,
} from "lucide-react";

const ROLE_TABS = [
  { id: "ALL", label: "All Users" },
  { id: "ADMIN", label: "System Admins" },
  { id: "OPERATIONS", label: "Operations Staff" },
  { id: "FLEET", label: "Fleet Vendors" },
  { id: "CUSTOMER", label: "Customers" },
];

export default function AdminUsersDirectoryPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

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

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchTab = activeTab === "ALL" || u.role === activeTab;
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.businessName && u.businessName.toLowerCase().includes(q)) ||
        (u.id && String(u.id).toLowerCase().includes(q));
      return matchTab && matchSearch;
    });
  }, [users, activeTab, search]);

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
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            isLoading={syncing}
            onClick={() => loadUsers(true)}
          >
            Refresh Database Users
          </Button>
        }
      />



      <Card noPadding>
        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs tabs={ROLE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, phone..."
          />
        </div>

        {/* Users Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Details</TableHead>
              <TableHead>Contact Information</TableHead>
              <TableHead>System Role</TableHead>
              <TableHead>Business / Organization</TableHead>
              <TableHead>Registered Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Connecting to backend user directory...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No users found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => {
                const isBlocked = u.status === "BLOCKED";
                const isPending = u.status === "PENDING";
                const isActive = u.status === "ACTIVE";

                return (
                  <TableRow key={u.id}>
                    {/* User Details */}
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900">{u.name}</div>
                      <div
                        className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]"
                        title={u.id}
                      >
                        {String(u.id).slice(0, 18)}...
                      </div>
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
                            : u.role === "FLEET"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {u.role === "FLEET" ? "FLEET VENDOR" : u.role}
                      </span>
                    </TableCell>

                    {/* Business Name */}
                    <TableCell>
                      {u.businessName ? (
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
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
                      {u.role !== "ADMIN" && (
                        <Button
                          size="xs"
                          variant={isActive ? "danger" : "emerald"}
                          icon={isActive ? UserX : UserCheck}
                          onClick={() => handleToggleStatus(u.id, u.status)}
                        >
                          {isActive ? "Block" : "Activate"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
