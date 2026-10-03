"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
} from "@/components/ui/Table";
import { Toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  Shield,
  Activity,
  Lock,
  Key,
  LogIn,
  LogOut,
  UserPlus,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Search,
  Laptop,
  XCircle,
  AlertTriangle,
  Globe,
  SlidersHorizontal,
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

const LOG_TABS = [
  { id: "SECURITY", label: "Security & Auth Audit Logs", icon: Shield },
  { id: "ACTIVITY", label: "Platform Activity Logs", icon: Activity },
];

export default function AdminAuditLogsPage() {
  const [activeTab, setActiveTab] = useState("SECURITY");

  // Master records for tab counts and filter options
  const [securityLogs, setSecurityLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Current page records & pagination state
  const [logs, setLogs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filters & Controls
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "timestamp", direction: "desc" });

  const [toast, setToast] = useState(null);
  const searchDebounceRef = useRef(null);

  // Fetch full dataset to maintain accurate tab counts and complete filter dropdowns
  const fetchSummaryCounts = useCallback(async () => {
    try {
      const [secRes, actRes] = await Promise.all([
        adminApi.getSecurityAuditLogs(),
        adminApi.getActivityLogs(),
      ]);

      if (secRes.success && Array.isArray(secRes.data)) {
        setSecurityLogs(secRes.data);
      }
      if (actRes.success && Array.isArray(actRes.data)) {
        setActivityLogs(actRes.data);
      }
    } catch (err) {
      console.error("Failed to load audit counts:", err);
    }
  }, []);

  // Fetch paginated page records
  const fetchPage = useCallback(
    async (pageToLoad = currentPage, currentSearch = search) => {
      setLoading(true);
      try {
        let sortKey = sortConfig.key;
        if (sortKey === "timestamp") sortKey = "createdAt";

        const res = await adminApi.getAuditLogsPaginated({
          category: activeTab,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          event: actionFilter !== "ALL" ? actionFilter : undefined,
          search: currentSearch ? currentSearch.trim() : undefined,
          page: pageToLoad,
          size: pageSize,
          sortBy: sortKey,
          sortDir: sortConfig.direction,
        });

        if (res.success) {
          setLogs(res.data);
          if (res.pagination) {
            setTotalItems(res.pagination.totalElements ?? 0);
            setTotalPages(Math.max(1, res.pagination.totalPages ?? 1));
          } else {
            setTotalItems(res.data.length);
            setTotalPages(1);
          }
        } else {
          // Client-side fallback if paginated endpoint fails
          const fallbackSource = activeTab === "SECURITY" ? securityLogs : activityLogs;
          const q = (currentSearch || "").toLowerCase().trim();
          const filtered = fallbackSource.filter((item) => {
            const matchAction =
              actionFilter === "ALL" ||
              item.event === actionFilter ||
              item.actionCode === actionFilter;
            const matchStatus =
              activeTab !== "SECURITY" ||
              statusFilter === "ALL" ||
              item.status === statusFilter;
            const matchSearch =
              !q ||
              (item.event && item.event.toLowerCase().includes(q)) ||
              (item.actionCode && item.actionCode.toLowerCase().includes(q)) ||
              (item.userName && item.userName.toLowerCase().includes(q)) ||
              (item.userId && item.userId.toLowerCase().includes(q)) ||
              (item.ipAddress && item.ipAddress.toLowerCase().includes(q)) ||
              (item.details && item.details.toLowerCase().includes(q));
            return matchAction && matchStatus && matchSearch;
          });
          const start = (pageToLoad - 1) * pageSize;
          setLogs(filtered.slice(start, start + pageSize));
          setTotalItems(filtered.length);
          setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
        }
      } catch (err) {
        console.error(err);
        setToast({ type: "error", message: "Failed to load audit logs: " + err.message });
      } finally {
        setLoading(false);
      }
    },
    [activeTab, currentPage, pageSize, search, actionFilter, statusFilter, sortConfig, securityLogs, activityLogs]
  );

  // Initial load
  useEffect(() => {
    fetchSummaryCounts();
  }, [fetchSummaryCounts]);

  // Debounced load when filters, search, or pagination changes
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      fetchPage(currentPage, search);
    }, 250);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [fetchPage, currentPage, search]);

  // Handle Tab Switch
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearch("");
    setActionFilter("ALL");
    setStatusFilter("ALL");
    setCurrentPage(1);
    setSortConfig({ key: "timestamp", direction: "desc" });
  };

  // Handle Column Sorting
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

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSummaryCounts(), fetchPage(currentPage, search)]);
    setRefreshing(false);
    setToast({
      type: "success",
      message: "Refreshed audit logs successfully",
    });
  };

  // Dynamic Tabs with Total Counts
  const tabsWithCounts = useMemo(() => {
    return [
      {
        id: "SECURITY",
        label: "Security & Auth Audit Logs",
        count: securityLogs.length,
      },
      {
        id: "ACTIVITY",
        label: "Platform Activity Logs",
        count: activityLogs.length,
      },
    ];
  }, [securityLogs.length, activityLogs.length]);

  // Unique action options for current tab
  const actionOptions = useMemo(() => {
    if (activeTab === "SECURITY") {
      const knownEvents = [
        "LOGIN_SUCCESS",
        "LOGIN_FAILED",
        "USER_LOGOUT",
        "CHANGE_PASSWORD",
        "PASSWORD_RESET_REQUESTED",
        "USER_PROVISIONED",
        "USER_STATUS_CHANGE",
      ];
      const fromLogs = securityLogs.map((l) => l.event).filter(Boolean);
      return Array.from(new Set([...knownEvents, ...fromLogs]));
    } else {
      const knownActions = [
        "UPDATE_PRICING",
        "DISPATCH_ASSIGNED",
        "STATUS_UPDATED",
        "NEW_BOOKING",
        "VEHICLE_ADDED",
        "VEHICLE_UPDATED",
        "DRIVER_ASSIGNED",
        "DRIVER_STATUS_CHANGE",
      ];
      const fromLogs = activityLogs.map((l) => l.actionCode || l.event).filter(Boolean);
      return Array.from(new Set([...knownActions, ...fromLogs]));
    }
  }, [activeTab, securityLogs, activityLogs]);

  // CSV Export Handler
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const res =
        activeTab === "SECURITY"
          ? await adminApi.getSecurityAuditLogs()
          : await adminApi.getActivityLogs();

      let logsToExport = [];
      if (res.success && Array.isArray(res.data)) {
        const q = search.toLowerCase().trim();
        logsToExport = res.data.filter((l) => {
          const matchAction =
            actionFilter === "ALL" ||
            l.event === actionFilter ||
            l.actionCode === actionFilter;
          const matchStatus =
            activeTab !== "SECURITY" ||
            statusFilter === "ALL" ||
            l.status === statusFilter;
          const matchSearch =
            !q ||
            (l.event && l.event.toLowerCase().includes(q)) ||
            (l.actionCode && l.actionCode.toLowerCase().includes(q)) ||
            (l.userName && l.userName.toLowerCase().includes(q)) ||
            (l.userId && l.userId.toLowerCase().includes(q)) ||
            (l.ipAddress && l.ipAddress.toLowerCase().includes(q)) ||
            (l.details && l.details.toLowerCase().includes(q));
          return matchAction && matchStatus && matchSearch;
        });
      }

      if (!logsToExport.length) {
        setToast({ type: "warning", message: "No log entries to export" });
        return;
      }

      let headers, rows;
      if (activeTab === "SECURITY") {
        headers = [
          "Log ID",
          "Timestamp",
          "Event Code",
          "User Name",
          "Email",
          "Role",
          "IP Address",
          "Device / Agent",
          "Status",
          "Details",
        ];
        rows = logsToExport.map((l) => [
          `"${l.id || ""}"`,
          `"${l.timestamp || ""}"`,
          `"${l.event || ""}"`,
          `"${(l.userName || "").replace(/"/g, '""')}"`,
          `"${l.userId || ""}"`,
          `"${l.userRole || ""}"`,
          `"${l.ipAddress || ""}"`,
          `"${(l.device || "").replace(/"/g, '""')}"`,
          `"${l.status || ""}"`,
          `"${(l.details || "").replace(/"/g, '""')}"`,
        ]);
      } else {
        headers = [
          "Log ID",
          "Timestamp",
          "Action Code",
          "Module",
          "Operator Name",
          "Operator Email",
          "Role",
          "Target Entity",
          "IP Address",
          "Details",
        ];
        rows = logsToExport.map((l) => [
          `"${l.id || ""}"`,
          `"${l.timestamp || ""}"`,
          `"${l.actionCode || l.event || ""}"`,
          `"${(l.module || "").replace(/"/g, '""')}"`,
          `"${(l.operatorName || l.userName || "").replace(/"/g, '""')}"`,
          `"${l.operatorId || l.userId || ""}"`,
          `"${l.operatorRole || l.userRole || ""}"`,
          `"${(l.targetEntity || "").replace(/"/g, '""')}"`,
          `"${l.ipAddress || ""}"`,
          `"${(l.details || "").replace(/"/g, '""')}"`,
        ]);
      }

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `grabrentals_${activeTab.toLowerCase()}_logs_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToast({
        type: "success",
        message: `Exported ${logsToExport.length} ${activeTab.toLowerCase()} log entries`,
      });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to export CSV: " + err.message });
    } finally {
      setExporting(false);
    }
  };

  const getEventBadge = (event) => {
    switch (event) {
      case "LOGIN_SUCCESS":
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            <LogIn className="w-3 h-3 text-emerald-600" /> {event}
          </span>
        );
      case "USER_LOGOUT":
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
            <LogOut className="w-3 h-3 text-slate-500" /> {event}
          </span>
        );
      case "CHANGE_PASSWORD":
      case "PASSWORD_CHANGED":
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
            <Key className="w-3 h-3 text-blue-600" /> {event}
          </span>
        );
      case "PASSWORD_RESET_REQUESTED":
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
            <Lock className="w-3 h-3 text-indigo-600" /> {event}
          </span>
        );
      case "USER_PROVISIONED":
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
            <UserPlus className="w-3 h-3 text-purple-600" /> {event}
          </span>
        );
      case "USER_STATUS_CHANGE":
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> {event}
          </span>
        );
      case "LOGIN_FAILED":
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
            <XCircle className="w-3 h-3 text-rose-600" /> {event}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
            {event}
          </span>
        );
    }
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

      {/* Top Header */}
      <PageHeader
        title="System Security & Platform Activity Audit Trail"
        subtitle="Complete governance history of authentication, account changes, operations dispatch, and pricing actions"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Audit Logs" }]}
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            isLoading={refreshing}
            onClick={handleRefresh}
          >
            Refresh Logs
          </Button>
        }
      />

      {/* Main DataTable Card */}
      <Card noPadding className="overflow-hidden shadow-xs border border-slate-200/80">
        {/* Navigation Tabs */}
        <div className="px-4 pt-3 border-b border-slate-100">
          <Tabs
            tabs={tabsWithCounts}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* DataTable Controls Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Left Controls: Page size, Event filter, Status filter */}
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
                <option value={100}>100</option>
              </select>
              <span className="font-medium text-slate-500">entries</span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            {/* Event / Action Filter */}
            <div className="flex items-center gap-1.5 text-slate-600">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer max-w-[200px] truncate"
              >
                <option value="ALL">All {activeTab === "SECURITY" ? "Events" : "Actions"}</option>
                {actionOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter (Only for Security tab) */}
            {activeTab === "SECURITY" && (
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
                  <option value="SUCCESS">Success Only</option>
                  <option value="FAILED">Failed Only</option>
                  <option value="WARNING">Warnings Only</option>
                </select>
              </div>
            )}

            {(search || actionFilter !== "ALL" || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActionFilter("ALL");
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
                placeholder={
                  activeTab === "SECURITY"
                    ? "Search user, IP, action, device..."
                    : "Search action, module, operator, entity..."
                }
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
              isLoading={exporting}
              disabled={totalItems === 0 || exporting}
              title="Export records to CSV"
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* DataTable Body */}
        {activeTab === "SECURITY" ? (
          /* ==================== SECURITY & AUTH AUDIT LOGS TABLE ==================== */
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader
                  columnKey="timestamp"
                  label="Timestamp"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  columnKey="event"
                  label="Security Event"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  columnKey="userName"
                  label="User Identity & Role"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  columnKey="ipAddress"
                  label="IP & Client Device"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  columnKey="status"
                  label="Status"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <TableHead>Audit Security Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="font-medium text-xs">Loading Security Audit Trail...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-slate-800 text-sm">No security audit logs found</div>
                      <p className="text-xs text-slate-500 mt-1 mb-3">
                        No events match your current search, action type, or status criteria.
                      </p>
                      {(search || actionFilter !== "ALL" || statusFilter !== "ALL") && (
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            setSearch("");
                            setActionFilter("ALL");
                            setStatusFilter("ALL");
                            setCurrentPage(1);
                          }}
                        >
                          Reset Filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const isSuccess = log.status === "SUCCESS";
                  const isFailed = log.status === "FAILED";
                  const isWarning = log.status === "WARNING";

                  return (
                    <TableRow key={log.id}>
                      {/* Timestamp */}
                      <TableCell>
                        <div className="font-mono text-xs text-slate-800 font-semibold">{log.timestamp}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.id}</div>
                      </TableCell>

                      {/* Event Badge */}
                      <TableCell>{getEventBadge(log.event)}</TableCell>

                      {/* User Identity & Role */}
                      <TableCell>
                        <div className="text-xs font-bold text-slate-900">{log.userName}</div>
                        <div className="text-[11px] text-slate-500">{log.userId}</div>
                        {log.userRole && (
                          <span
                            className={cn(
                              "inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase",
                              log.userRole === "ADMIN"
                                ? "bg-blue-100 text-blue-800"
                                : log.userRole === "OPERATIONS"
                                ? "bg-amber-100 text-amber-800"
                                : log.userRole === "VENDOR" || log.userRole === "FLEET"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {log.userRole}
                          </span>
                        )}
                      </TableCell>

                      {/* IP & Device */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-slate-700">
                          <Globe className="w-3 h-3 text-slate-400" />
                          {log.ipAddress}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <Laptop className="w-3 h-3 text-slate-400" />
                          {log.device}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {isSuccess && (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            SUCCESS
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            FAILED
                          </span>
                        )}
                        {isWarning && (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            WARNING
                          </span>
                        )}
                        {!isSuccess && !isFailed && !isWarning && (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                            {log.status || "LOGGED"}
                          </span>
                        )}
                      </TableCell>

                      {/* Details */}
                      <TableCell>
                        <span className="text-xs text-slate-700 font-medium leading-relaxed max-w-sm block">
                          {log.details}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        ) : (
          /* ==================== PLATFORM ACTIVITY LOGS TABLE ==================== */
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader
                  columnKey="timestamp"
                  label="Timestamp"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  columnKey="actionCode"
                  label="Action Code"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  columnKey="module"
                  label="Module"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  columnKey="operatorName"
                  label="Operator"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  columnKey="targetEntity"
                  label="Target Entity"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  columnKey="ipAddress"
                  label="IP Address"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="font-medium text-xs">Loading Platform Activity Trail...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-slate-800 text-sm">No platform activity logs found</div>
                      <p className="text-xs text-slate-500 mt-1 mb-3">
                        No activity records match your current search or action criteria.
                      </p>
                      {(search || actionFilter !== "ALL") && (
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            setSearch("");
                            setActionFilter("ALL");
                            setCurrentPage(1);
                          }}
                        >
                          Reset Filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    {/* Timestamp */}
                    <TableCell>
                      <div className="font-mono text-xs text-slate-800 font-semibold">{log.timestamp}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.id}</div>
                    </TableCell>

                    {/* Action Code */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        {log.actionCode || log.event}
                      </span>
                    </TableCell>

                    {/* Module */}
                    <TableCell>
                      <Badge variant="neutral" size="sm">
                        {log.module}
                      </Badge>
                    </TableCell>

                    {/* Operator */}
                    <TableCell>
                      <div className="text-xs font-bold text-slate-900">{log.operatorName || log.userName}</div>
                      <div className="text-[11px] text-slate-500">{log.operatorId || log.userId}</div>
                      {(log.operatorRole || log.userRole) && (
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          Role: {log.operatorRole || log.userRole}
                        </span>
                      )}
                    </TableCell>

                    {/* Target Entity */}
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        {log.targetEntity || "—"}
                      </span>
                    </TableCell>

                    {/* IP */}
                    <TableCell>
                      <span className="font-mono text-xs text-slate-500">{log.ipAddress}</span>
                    </TableCell>

                    {/* Details */}
                    <TableCell>
                      <span className="text-xs text-slate-700 font-medium leading-relaxed max-w-sm block">
                        {log.details}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {/* DataTable Footer: Pagination & Stats */}
        <div className="px-4 py-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900">
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            of <span className="font-semibold text-slate-900">{totalItems}</span>{" "}
            {activeTab === "SECURITY" ? "audit" : "activity"} entries
          </div>

          {/* Pagination Navigation Controls */}
          <div className="flex items-center gap-1 select-none">
            {/* First Page */}
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage(1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* Prev Page */}
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Numbered Page Buttons with Smart Ellipsis */}
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
                        disabled={loading}
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
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
