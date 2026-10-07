"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  SearchInput,
} from "@/components/ui/Table";
import {
  Building2,
  CheckCircle2,
  Eye,
  Star,
  Plus,
  Clock,
  Mail,
  Phone,
  Copy,
  Check,
  ShieldCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

function SortableHeader({ columnKey, label, currentSort, onSort, align = "left", className = "" }) {
  const isActive = currentSort.key === columnKey;
  const isAsc = currentSort.direction === "asc";

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={cn(
          "group inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] hover:text-amber-600 transition-colors cursor-pointer select-none",
          isActive ? "text-amber-600 font-extrabold" : "text-slate-700",
          align === "right" && "justify-end w-full"
        )}
      >
        <span>{label}</span>
        <span
          className={cn(
            "p-0.5 rounded transition-colors",
            isActive ? "bg-amber-50 text-amber-600" : "text-slate-400 group-hover:text-amber-600 group-hover:bg-slate-100"
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

function AdminVendorsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get("tab") === "approvals" ? "approvals" : "active";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Approval Modal State
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [commissionRate, setCommissionRate] = useState(12);

  // Add Vendor Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addModalError, setAddModalError] = useState(null);
  const [newVendor, setNewVendor] = useState({
    businessName: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "Chennai Hub",
  });

  // DataTable State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  async function loadVendors() {
    try {
      const res = await adminApi.getVendors();
      setVendors(res.data || []);
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to load vendors: " + err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVendors();
  }, []);

  // Sync tab with URL
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setCityFilter("ALL");
    setCurrentPage(1);
    router.replace(`/admin/vendors?tab=${tab}`);
  };

  const handleCopyId = (id) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(String(id));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

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

  async function handleApprove() {
    if (!selectedVendor) return;
    try {
      await adminApi.approveVendor(selectedVendor.id, Number(commissionRate));
      setToast({
        type: "success",
        message: `Vendor "${selectedVendor.name}" approved successfully with ${commissionRate}% commission!`,
      });
      setSelectedVendor(null);
      await loadVendors();
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to approve vendor" });
    }
  }

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    setAddModalError(null);

    if (!newVendor.businessName.trim()) {
      setAddModalError("Company / Fleet name is required");
      return;
    }
    if (!newVendor.name.trim()) {
      setAddModalError("Contact person name is required");
      return;
    }
    if (!newVendor.email.trim() || !newVendor.email.includes("@")) {
      setAddModalError("A valid business email address is required");
      return;
    }
    if (!newVendor.phone.trim()) {
      setAddModalError("Phone number is required");
      return;
    }
    if (!newVendor.password || newVendor.password.length < 8) {
      setAddModalError("Password must be at least 8 characters long");
      return;
    }

    setSubmittingAdd(true);
    try {
      const res = await adminApi.createUser({
        role: "FLEET",
        name: newVendor.name.trim(),
        email: newVendor.email.trim().toLowerCase(),
        phone: newVendor.phone.trim(),
        password: newVendor.password,
        businessName: newVendor.businessName.trim(),
        hubLocation: newVendor.city,
      });

      if (res.success && res.data) {
        setToast({
          type: "success",
          message: `Vendor partner "${newVendor.businessName}" successfully provisioned!`,
        });
        setIsAddModalOpen(false);
        setNewVendor({
          businessName: "",
          name: "",
          email: "",
          phone: "",
          password: "",
          city: "Chennai Hub",
        });
        await loadVendors();
      }
    } catch (err) {
      setAddModalError(err.message || "Failed to create vendor partner");
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Split vendors into Active and Pending
  const activeVendors = useMemo(() => {
    return vendors.filter((v) => v.status === "APPROVED" || v.status === "ACTIVE");
  }, [vendors]);

  const pendingVendors = useMemo(() => {
    return vendors.filter((v) => v.status === "PENDING_APPROVAL" || v.status === "PENDING");
  }, [vendors]);

  // Current tab dataset
  const currentList = activeTab === "active" ? activeVendors : pendingVendors;

  // Unique cities in current list
  const cities = useMemo(() => {
    const set = new Set();
    currentList.forEach((v) => {
      if (v.city) set.add(v.city);
    });
    return Array.from(set);
  }, [currentList]);

  // Filtered dataset
  const filteredVendors = useMemo(() => {
    let result = currentList;

    if (cityFilter !== "ALL") {
      result = result.filter((v) => v.city === cityFilter);
    }

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter((v) => {
        return (
          (v.name && v.name.toLowerCase().includes(q)) ||
          (v.contactPerson && v.contactPerson.toLowerCase().includes(q)) ||
          (v.email && v.email.toLowerCase().includes(q)) ||
          (v.phone && v.phone.toLowerCase().includes(q)) ||
          (v.city && v.city.toLowerCase().includes(q)) ||
          (v.id && String(v.id).toLowerCase().includes(q))
        );
      });
    }

    return result;
  }, [currentList, search, cityFilter]);

  // Sorted dataset
  const sortedVendors = useMemo(() => {
    if (!sortConfig.key) return filteredVendors;
    return [...filteredVendors].sort((a, b) => {
      let aVal = a[sortConfig.key] ?? "";
      let bVal = b[sortConfig.key] ?? "";

      if (sortConfig.key === "createdAt" || sortConfig.key === "joinedDate") {
        const aTime = aVal ? new Date(aVal).getTime() : 0;
        const bTime = bVal ? new Date(bVal).getTime() : 0;
        return sortConfig.direction === "asc" ? aTime - bTime : bTime - aTime;
      }

      if (["fleetCount", "driverCount", "commissionRate", "rating"].includes(sortConfig.key)) {
        aVal = Number(aVal || 0);
        bVal = Number(bVal || 0);
      } else if (typeof aVal === "string") {
        const cmp = aVal.localeCompare(String(bVal), undefined, { numeric: true, sensitivity: "base" });
        return sortConfig.direction === "asc" ? cmp : -cmp;
      }
      return sortConfig.direction === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [filteredVendors, sortConfig]);

  const totalPages = Math.ceil(sortedVendors.length / pageSize) || 1;
  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedVendors.slice(start, start + pageSize);
  }, [sortedVendors, currentPage, pageSize]);

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
        title="Fleet Vendor Partners"
        subtitle="Manage fleet operators, commercial contract commissions, and approve onboarding applications"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Vendors" }]}
        action={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setAddModalError(null);
              setIsAddModalOpen(true);
            }}
          >
            Add Vendor Partner
          </Button>
        }
      />

      <Card noPadding>
        {/* Top Navigation Tabs */}
        <div className="px-4 pt-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTabSwitch("active")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer -mb-px",
                activeTab === "active"
                  ? "border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 rounded-t-lg"
              )}
            >
              <Building2 className="w-4 h-4" />
              <span>Active Partners</span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] bg-slate-100 text-slate-700 font-extrabold">
                {activeVendors.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch("approvals")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer -mb-px",
                activeTab === "approvals"
                  ? "border-amber-600 text-amber-700 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 rounded-t-lg"
              )}
            >
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              <span>Pending Approvals</span>
              {pendingVendors.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10.5px] bg-amber-500 text-slate-950 font-black animate-pulse">
                  {pendingVendors.length}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10.5px] bg-slate-100 text-slate-500 font-extrabold">
                  0
                </span>
              )}
            </button>
          </div>

          <div className="pb-3 sm:pb-0 text-xs text-slate-500 font-medium">
            Total In Network: <strong className="text-slate-900">{vendors.length}</strong>
          </div>
        </div>

        {/* DataTable Controls Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder={
                activeTab === "active"
                  ? "Search active vendor by name, city, contact..."
                  : "Search pending application by name, email, phone..."
              }
              className="w-full sm:w-80"
            />

            {cities.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={cityFilter}
                  onChange={(e) => {
                    setCityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-500"
                >
                  <option value="ALL">All Hubs & Cities ({currentList.length})</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs text-slate-500">
              Showing <strong>{sortedVendors.length}</strong> {activeTab === "active" ? "active partners" : "applications"}
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

        {loading ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-600">Loading vendor records...</p>
          </div>
        ) : paginatedVendors.length === 0 ? (
          <div className="text-center py-16 px-4">
            {activeTab === "approvals" ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">All Applications Processed</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  There are no pending vendor onboarding reviews. All registered fleets have been approved.
                </p>
              </>
            ) : (
              <>
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No active vendors found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {search ? `No active vendors match "${search}".` : "There are currently no active vendors."}
                </p>
              </>
            )}
          </div>
        ) : activeTab === "approvals" ? (
          /* ========================================================================= */
          /* ===================== TAB 2: PENDING APPROVALS ========================== */
          /* ========================================================================= */
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader
                    columnKey="name"
                    label="Vendor Agency & ID"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    columnKey="contactPerson"
                    label="Authorized Contact"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    columnKey="city"
                    label="Hub / City"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    columnKey="joinedDate"
                    label="Applied Date"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  />
                  <TableHead>GSTIN / Tax Compliance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVendors.map((v) => {
                  const isCopied = copiedId === v.id;
                  return (
                    <TableRow key={v.id}>
                      {/* Vendor Agency & ID */}
                      <TableCell>
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <Link
                              href={`/admin/vendors/${v.id}`}
                              className="font-bold text-xs text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 group/link"
                              title="Click to view full vendor details, documents & vehicles"
                            >
                              <span>{v.name}</span>
                              <ExternalLink className="w-3 h-3 text-blue-500 opacity-70 group-hover/link:opacity-100 transition-opacity shrink-0" />
                            </Link>
                            <div>
                              <button
                                type="button"
                                onClick={() => handleCopyId(v.id)}
                                className="group inline-flex items-center gap-1 text-[10.5px] text-slate-400 hover:text-amber-600 font-mono transition-colors mt-0.5 cursor-pointer"
                                title="Click to copy ID"
                              >
                                <span>{String(v.id).slice(0, 16)}...</span>
                                {isCopied ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <div className="font-semibold text-xs text-slate-800">{v.contactPerson}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{v.email}</span>
                        </div>
                        {v.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{v.phone}</span>
                          </div>
                        )}
                      </TableCell>

                      {/* Hub / City */}
                      <TableCell>
                        <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {v.city}
                        </span>
                      </TableCell>

                      {/* Applied Date */}
                      <TableCell>
                        <span className="text-xs font-mono text-slate-600">
                          {v.joinedDate}
                        </span>
                      </TableCell>

                      {/* GSTIN */}
                      <TableCell>
                        <div className="font-mono text-xs font-bold text-slate-800">
                          {v.gstNumber || "Pending Submission"}
                        </div>
                        <span className={`text-[10.5px] font-semibold ${
                          v.gstStatus === "Verified Active" ? "text-emerald-700" : "text-amber-600"
                        }`}>
                          {v.gstStatus || "Pending Verification"}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge variant="warning" size="sm" dot>
                          Pending Review
                        </Badge>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/vendors/${v.id}`}>
                            <Button
                              size="xs"
                              variant="secondary"
                              icon={Eye}
                            >
                              View Details
                            </Button>
                          </Link>
                          <Button
                            size="xs"
                            variant="primary"
                            icon={CheckCircle2}
                            onClick={() => {
                              setSelectedVendor(v);
                              setCommissionRate(v.commissionRate || 12);
                            }}
                          >
                            Authorize & Set Commission
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {!loading && sortedVendors.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={sortedVendors.length}
                pageSize={pageSize}
              />
            )}
          </>
        ) : (
          /* ========================================================================= */
          /* ===================== TAB 1: ACTIVE PARTNERS ============================ */
          /* ========================================================================= */
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader
                    columnKey="name"
                    label="Vendor Agency & ID"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    columnKey="city"
                    label="Hub / City"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    columnKey="contactPerson"
                    label="Contact Person"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    columnKey="fleetCount"
                    label="Fleet Size"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    columnKey="driverCount"
                    label="Drivers"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    columnKey="commissionRate"
                    label="Commission Rate"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    columnKey="rating"
                    label="Rating"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    columnKey="createdAt"
                    label="Created Date"
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
                {paginatedVendors.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900">{v.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{String(v.id).slice(0, 16)}...</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-800">{v.city}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-slate-800">{v.contactPerson}</div>
                      <div className="text-[11px] text-slate-500">{v.phone}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-slate-900">{v.fleetCount ?? 0} Vehicles</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-700">{v.driverCount ?? 0} Chauffeurs</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {v.commissionRate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {v.rating > 0 ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{v.rating}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unrated</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-slate-700 whitespace-nowrap">
                        {v.createdAt
                          ? new Date(v.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : (v.joinedDate || "—")}
                      </div>
                      {v.createdAt && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(v.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" size="sm" dot>
                        APPROVED
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/vendors/${v.id}`}>
                        <Button size="xs" variant="secondary" icon={Eye}>
                          View Profile
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {!loading && sortedVendors.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={sortedVendors.length}
                pageSize={pageSize}
              />
            )}
          </>
        )}
      </Card>

      {/* Commission Setup & Approval Modal */}
      <Modal
        isOpen={!!selectedVendor}
        onClose={() => setSelectedVendor(null)}
        title={`Approve ${selectedVendor?.name}`}
        subtitle="Establish commercial contract rate and activate platform booking dispatch"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="font-bold">Applicant Details:</div>
            <div><strong>Company:</strong> {selectedVendor?.name}</div>
            <div><strong>Representative:</strong> {selectedVendor?.contactPerson} ({selectedVendor?.email})</div>
            <div><strong>Contact Phone:</strong> {selectedVendor?.phone}</div>
          </div>

          <Input
            label="Platform Commission Fee (%)"
            type="number"
            min="5"
            max="30"
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            helperText="Standard platform commission is typically 10% - 15% on each completed booking."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedVendor(null)}>
              Cancel
            </Button>
            <Button variant="emerald" size="sm" onClick={handleApprove}>
              Authorize Active Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Vendor Partner Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalError(null);
        }}
        title="Add New Vendor Partner"
        subtitle="Provision a commercial fleet operator account with instant portal access"
      >
        <form onSubmit={handleCreateVendor} className="space-y-4">
          {addModalError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {addModalError}
            </div>
          )}

          <Input
            label="Company / Fleet Name *"
            required
            placeholder="e.g. Royal South Transports Pvt Ltd"
            value={newVendor.businessName}
            onChange={(e) => setNewVendor({ ...newVendor, businessName: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Authorized Contact Person *"
              required
              placeholder="e.g. Anandha Kumar"
              value={newVendor.name}
              onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
            />

            <Input
              label="Primary Hub / City"
              placeholder="e.g. Chennai Central Hub"
              value={newVendor.city}
              onChange={(e) => setNewVendor({ ...newVendor, city: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Business Email Address *"
              type="email"
              required
              placeholder="operations@royalsouth.com"
              value={newVendor.email}
              onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
            />

            <Input
              label="Contact Phone *"
              type="tel"
              required
              placeholder="+91 98401 23456"
              value={newVendor.phone}
              onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
            />
          </div>

          <Input
            label="Initial Password *"
            type="password"
            required
            placeholder="Min. 8 characters"
            helperText="The vendor will use this password to sign into the Vendor Portal."
            value={newVendor.password}
            onChange={(e) => setNewVendor({ ...newVendor, password: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
              disabled={submittingAdd}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Plus}
              disabled={submittingAdd}
            >
              {submittingAdd ? "Provisioning..." : "Create Vendor Partner"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function AdminVendorsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading vendors...</div>}>
      <AdminVendorsContent />
    </Suspense>
  );
}
