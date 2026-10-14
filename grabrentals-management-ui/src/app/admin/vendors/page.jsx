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
  Calendar,
  ExternalLink,
  Briefcase,
  CreditCard,
  Truck,
  FileText,
  User,
  Car,
  Users,
  UploadCloud,
  Camera,
  Sparkles,
  Home,
  MapPin,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Loader2,
} from "lucide-react";
import CitySelectorModal from "@/components/ui/CitySelectorModal";
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

const INITIAL_VENDOR_REPLICA = {
  // Step 1: Personal & Contact Details
  name: "",
  phone: "",
  alternatePhone: "",
  email: "",
  password: "",
  city: "Chennai",
  address: "",
  idProofDocument: "",
  idProofDocumentName: "",
  addressProofDocument: "",
  addressProofDocumentName: "",

  // Step 2: Business Profile & Registration (Default: Individual Partner)
  ownsBusiness: false, // Default: Individual Partner (false = Individual, true = Registered Business)
  businessName: "",
  gstin: "",
  pan: "",
  businessType: "Individual",
  businessCity: "Chennai",
  businessAddress: "",
  businessProofDocument: "",
  businessProofDocumentName: "",
  gstDocument: "",
  gstDocumentName: "",

  // Step 3: Fleet Operating Structure
  fleetModel: 1, // 1 = Owner-Driver, 2 = Multiple Fleet & Vehicles

  // Step 4: Vehicle & Chauffeur Setup
  // Chauffeur (Option 1)
  driverName: "",
  driverPhone: "",
  driverEmail: "",
  driverDob: "1990-05-15",
  driverGender: "Male",
  driverLicenseClass: "LMV-TR (Transport)",
  driverLicenseNumber: "",
  driverLicenseExpiry: "",

  // Vehicle (Option 1)
  vehicleNumber: "",
  vehicleCategory: "Sedan",
  vehicleModel: "Swift Dzire",
  seatingCapacity: 4,
  fuelType: "Diesel",
  rcExpiry: "",
  insuranceExpiry: "",
  fitnessExpiry: "",

  // Option 2 Multi-fleet
  estimatedFleetSize: 5,
  commissionRate: 12,
  status: "ACTIVE",
};

function AdminVendorsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get("tab") === "approvals" ? "approvals" : "active";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Approval Modal State
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [commissionRate, setCommissionRate] = useState(12);

  // Add Vendor Modal State (Vendor Registration Replica)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addModalError, setAddModalError] = useState(null);
  const [newVendor, setNewVendor] = useState(INITIAL_VENDOR_REPLICA);

  // DataTable State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [togglingId, setTogglingId] = useState(null);

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
    let isMounted = true;
    async function fetchVendors() {
      try {
        const res = await adminApi.getVendors();
        if (isMounted) {
          setVendors(res.data || []);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setToast({ type: "error", message: "Failed to load vendors: " + err.message });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchVendors();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync tab with URL
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setStatusFilter("ALL");
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
      return { key, direction: "desc" };
    });
    setCurrentPage(1);
  };

  const handleToggleStatus = async (vendor) => {
    const isCurrentlyActive = vendor.status === "ACTIVE" || vendor.status === "APPROVED";
    const newStatus = isCurrentlyActive ? "INACTIVE" : "ACTIVE";
    const vendorId = vendor.id;

    setTogglingId(vendorId);

    // Optimistic UI update
    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId ? { ...v, status: newStatus, rawStatus: newStatus } : v
      )
    );

    try {
      await adminApi.updateUserStatus(vendorId, newStatus);
      setToast({
        type: newStatus === "ACTIVE" ? "success" : "warning",
        message:
          newStatus === "ACTIVE"
            ? `Vendor "${vendor.name}" activated! Login access has been restored.`
            : `Vendor "${vendor.name}" set to INACTIVE. Login access has been disabled.`,
      });
    } catch (err) {
      // Revert on failure
      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendorId ? { ...v, status: vendor.status, rawStatus: vendor.rawStatus } : v
        )
      );
      setToast({
        type: "error",
        message: "Failed to update vendor status: " + (err.message || "Unknown error"),
      });
    } finally {
      setTogglingId(null);
    }
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

  const handleDocumentUpload = (docKey, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewVendor((prev) => ({
        ...prev,
        [docKey]: e.target.result,
        [`${docKey}Name`]: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateVendor = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAddModalError(null);

    // Validation
    if (!newVendor.name.trim()) {
      setCurrentStep(1);
      setAddModalError("Partner Full Name is required");
      return;
    }
    if (!newVendor.phone.trim()) {
      setCurrentStep(1);
      setAddModalError("Primary Mobile Phone Number is required");
      return;
    }
    if (!newVendor.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(newVendor.email.trim())) {
      setCurrentStep(1);
      setAddModalError("A valid business email address is required (e.g. name@example.com)");
      return;
    }
    if (!newVendor.password || newVendor.password.length < 8) {
      setCurrentStep(1);
      setAddModalError("Initial login password must be at least 8 characters long");
      return;
    }
    if (!newVendor.city.trim()) {
      setCurrentStep(1);
      setAddModalError("Operating City is required");
      return;
    }

    if (newVendor.ownsBusiness && !newVendor.businessName.trim()) {
      setAddModalError("Legal Business / Company Name is required for registered businesses");
      return;
    }

    setSubmittingAdd(true);
    try {
      const resolvedBusinessName = newVendor.ownsBusiness && newVendor.businessName.trim()
        ? newVendor.businessName.trim()
        : `${newVendor.name.trim()} Fleet`;

      const res = await adminApi.createUser({
        role: "FLEET",
        name: newVendor.name.trim(),
        email: newVendor.email.trim().toLowerCase(),
        phone: newVendor.phone.trim(),
        alternatePhone: newVendor.alternatePhone?.trim() || null,
        password: newVendor.password,
        businessName: resolvedBusinessName,
        city: newVendor.city?.trim() || "Chennai",
        address: newVendor.address?.trim() || newVendor.businessAddress?.trim() || null,
        ownsBusiness: newVendor.ownsBusiness,
        businessType: newVendor.ownsBusiness ? newVendor.businessType : "Individual",
        tradeName: resolvedBusinessName,
        gstin: newVendor.gstin?.trim() || null,
        pan: newVendor.pan?.trim() || null,
        idProofDocumentUrl: newVendor.idProofDocument || null,
        addressProofDocumentUrl: newVendor.addressProofDocument || null,
        businessProofDocumentUrl: newVendor.businessProofDocument || null,
        gstDocumentUrl: newVendor.gstDocument || null,
        fleetModel: newVendor.fleetModel === 1 ? "Owner-Driver" : "Fleet Operator",
        fleetSize: newVendor.fleetModel === 1 ? 1 : Number(newVendor.estimatedFleetSize || 5),
        commissionRate: Number(newVendor.commissionRate || 12),
        vehicleNumber: newVendor.fleetModel === 1 ? newVendor.vehicleNumber?.trim() || null : null,
        vehicleCategory: newVendor.vehicleCategory,
        vehicleModel: newVendor.vehicleModel?.trim() || null,
        seatingCapacity: newVendor.seatingCapacity,
        fuelType: newVendor.fuelType,
        driverLicenseNumber: newVendor.fleetModel === 1 ? newVendor.driverLicenseNumber?.trim() || null : null,
        status: newVendor.status || "ACTIVE",
      });

      if (res.success && res.data) {
        setToast({
          type: "success",
          message: `Vendor partner "${resolvedBusinessName}" successfully registered & provisioned!`,
        });
        setIsAddModalOpen(false);
        setNewVendor(INITIAL_VENDOR_REPLICA);
        setCurrentStep(1);
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
    return vendors.filter((v) => v.status !== "PENDING_APPROVAL" && v.status !== "PENDING");
  }, [vendors]);

  const activeCount = useMemo(() => {
    return activeVendors.filter((v) => v.status === "ACTIVE" || v.status === "APPROVED").length;
  }, [activeVendors]);

  const inactiveCount = useMemo(() => {
    return activeVendors.filter((v) => v.status === "INACTIVE").length;
  }, [activeVendors]);

  const pendingVendors = useMemo(() => {
    return vendors.filter((v) => v.status === "PENDING_APPROVAL" || v.status === "PENDING");
  }, [vendors]);

  // Current tab dataset
  const currentList = activeTab === "active" ? activeVendors : pendingVendors;

  // Filtered dataset
  const filteredVendors = useMemo(() => {
    let result = currentList;

    if (activeTab === "active" && statusFilter !== "ALL") {
      if (statusFilter === "ACTIVE") {
        result = result.filter((v) => v.status === "ACTIVE" || v.status === "APPROVED");
      } else if (statusFilter === "INACTIVE") {
        result = result.filter((v) => v.status === "INACTIVE");
      }
    }

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter((v) => {
        return (
          (v.name && v.name.toLowerCase().includes(q)) ||
          (v.contactPerson && v.contactPerson.toLowerCase().includes(q)) ||
          (v.email && v.email.toLowerCase().includes(q)) ||
          (v.phone && v.phone.toLowerCase().includes(q)) ||
          (v.id && String(v.id).toLowerCase().includes(q))
        );
      });
    }

    return result;
  }, [currentList, search, activeTab, statusFilter]);

  // Sorted dataset
  const sortedVendors = useMemo(() => {
    if (!sortConfig.key) return filteredVendors;
    return [...filteredVendors].sort((a, b) => {
      let aVal = a[sortConfig.key] ?? "";
      let bVal = b[sortConfig.key] ?? "";

      if (sortConfig.key === "createdAt" || sortConfig.key === "joinedDate") {
        const aDate = a.createdAt || a.joinedDate || "";
        const bDate = b.createdAt || b.joinedDate || "";
        const aTime = aDate ? new Date(aDate).getTime() : 0;
        const bTime = bDate ? new Date(bDate).getTime() : 0;
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
                  ? "Search active vendor by name, contact..."
                  : "Search pending application by name, email, phone..."
              }
              className="w-full sm:w-80"
            />

            {activeTab === "active" && (
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-500"
                >
                  <option value="ALL">All Statuses ({activeVendors.length})</option>
                  <option value="ACTIVE">Active Only ({activeCount})</option>
                  <option value="INACTIVE">Inactive Only ({inactiveCount})</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-xs text-slate-500">
              Showing <strong>{sortedVendors.length}</strong> {activeTab === "active" ? "partners" : "applications"}
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
                      <div className="flex items-center gap-2.5">
                        {/* Status Toggle Switch Button */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={v.status === "ACTIVE" || v.status === "APPROVED"}
                          disabled={togglingId === v.id}
                          onClick={() => handleToggleStatus(v)}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/20",
                            (v.status === "ACTIVE" || v.status === "APPROVED")
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : "bg-slate-300 hover:bg-slate-400",
                            togglingId === v.id && "opacity-50 cursor-wait"
                          )}
                          title={
                            (v.status === "ACTIVE" || v.status === "APPROVED")
                              ? "Click to deactivate vendor (disables login access)"
                              : "Click to activate vendor (enables login access)"
                          }
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                              (v.status === "ACTIVE" || v.status === "APPROVED")
                                ? "translate-x-4"
                                : "translate-x-0"
                            )}
                          />
                        </button>

                        {(v.status === "ACTIVE" || v.status === "APPROVED") ? (
                          <Badge variant="success" size="sm" dot>
                            ACTIVE
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm" dot className="bg-slate-100 text-slate-600 border-slate-300">
                            INACTIVE
                          </Badge>
                        )}
                      </div>
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

      {/* Add Vendor Partner Modal (Exact Replica of Vendor Registration) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalError(null);
          setCurrentStep(1);
        }}
        size="full"
        title="Fleet Partner Onboarding"
        subtitle="Provision a commercial fleet partner using the official partner onboarding standard"
      >
        <div className="bg-gradient-to-b from-[#FAF4E5] via-[#F6EED8] to-[#FAF4E5] -m-6 p-4 sm:p-8 rounded-b-2xl min-h-[500px]">
          {/* Stepper Progress Indicator */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Step {currentStep} of 3
              </span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                {currentStep === 1 && "Personal & Contact Details"}
                {currentStep === 2 && "Fleet Operating Model"}
                {currentStep === 3 && "Vehicle & Driver Assets"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  currentStep >= 1 ? "bg-amber-500" : "bg-amber-200/70"
                )}
              />
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  currentStep >= 2 ? "bg-amber-500" : "bg-amber-200/70"
                )}
              />
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  currentStep >= 3 ? "bg-amber-500" : "bg-amber-200/70"
                )}
              />
            </div>
          </div>

          {/* Global Error Banner */}
          {addModalError && (
            <div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-semibold">{addModalError}</div>
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            {/* ======================================================== */}
            {/* STEP 1: PERSONAL & CONTACT DETAILS                       */}
            {/* ======================================================== */}
            {currentStep === 1 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                {/* Step 1 Photo Banner */}
                <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                  <img
                    src="/images/cars/innova.jpg"
                    alt="Personal & Contact Details"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Step 1 of 3</span>
                    <h3 className="text-base font-bold text-white">Partner Identity & Verification</h3>
                    <p className="text-[11px] text-slate-200">Verified identity credentials ensure fast fleet onboarding & immediate trip assignment</p>
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-black text-slate-950">
                    Step 1: Personal & Contact Details
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provide partner primary contact and personal credentials for portal access and operations.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={newVendor.name}
                          onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Primary Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Primary Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={newVendor.phone}
                          onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value.replace(/[^0-9]/g, "") })}
                          placeholder="98765 43210"
                          className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold tracking-wider focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Alternate Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Alternative Phone Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={newVendor.alternatePhone}
                          onChange={(e) => setNewVendor({ ...newVendor, alternatePhone: e.target.value.replace(/[^0-9]/g, "") })}
                          placeholder="98765 12340"
                          className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold tracking-wider focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        {newVendor.email.trim() && (
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                              /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(newVendor.email.trim())
                                ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                                : "text-rose-700 bg-rose-50 border border-rose-200"
                            )}
                          >
                            {/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(newVendor.email.trim()) ? (
                              <>
                                <Check className="w-2.5 h-2.5 stroke-[3]" /> Valid Email
                              </>
                            ) : (
                              "Invalid Format"
                            )}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={newVendor.email}
                          onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                          placeholder="ramesh.kumar@gmail.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Initial Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Initial Portal Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={newVendor.password}
                          onChange={(e) => setNewVendor({ ...newVendor, password: e.target.value })}
                          placeholder="Min. 8 characters"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Operating City */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Operating City <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCityModalOpen(true)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200 transition-all cursor-pointer shadow-2xs"
                        >
                          <MapPin className="w-3 h-3 text-amber-600" />
                          <span>Choose Cities</span>
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={newVendor.city}
                          onChange={(e) => setNewVendor({ ...newVendor, city: e.target.value, businessCity: e.target.value })}
                          placeholder="e.g. Chennai, Bangalore, Coimbatore"
                          className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setIsCityModalOpen(true)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Select</span>
                        </button>
                      </div>

                      {/* City Badges */}
                      {newVendor.city && newVendor.city.includes(",") && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {newVendor.city.split(",").map((c) => c.trim()).filter(Boolean).map((cityName) => (
                            <span
                              key={cityName}
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80"
                            >
                              <span>{cityName}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const remaining = newVendor.city
                                    .split(",")
                                    .map((x) => x.trim())
                                    .filter((x) => x && x.toLowerCase() !== cityName.toLowerCase())
                                    .join(", ");
                                  setNewVendor({ ...newVendor, city: remaining, businessCity: remaining });
                                }}
                                className="text-amber-600 hover:text-rose-600 transition"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Residential / Communication Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Residential / Communication Address
                      </label>
                      <div className="relative">
                        <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <textarea
                          rows={2}
                          value={newVendor.address}
                          onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                          placeholder="Flat/House No., Street, Area, Landmark"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* Verification Proofs */}
                    <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                            Verification Proofs (ID & Address)
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Attach clear photos or PDF copies for account compliance.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* ID Proof Card */}
                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                Government ID Proof
                              </p>
                              <p className="text-[11px] text-slate-500">Aadhaar, Voter ID, Passport, or License</p>
                            </div>
                            {newVendor.idProofDocument && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" /> Attached
                              </span>
                            )}
                          </div>

                          <label className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload("idProofDocument", e.target.files?.[0])}
                            />
                            <UploadCloud className="w-4 h-4 text-amber-500" />
                            <span className="truncate">
                              {newVendor.idProofDocumentName || "Attach ID Proof (PDF / Image)"}
                            </span>
                          </label>
                        </div>

                        {/* Address Proof Card */}
                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                Residential / Address Proof <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                              </p>
                              <p className="text-[11px] text-slate-500">Electricity Bill or Rental Agreement</p>
                            </div>
                            {newVendor.addressProofDocument && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" /> Attached
                              </span>
                            )}
                          </div>

                          <label className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={(e) => handleDocumentUpload("addressProofDocument", e.target.files?.[0])}
                            />
                            <UploadCloud className="w-4 h-4 text-amber-500" />
                            <span className="truncate">
                              {newVendor.addressProofDocumentName || "Attach Address Proof (PDF / Image)"}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 1 Actions */}
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (!newVendor.name.trim()) {
                          setAddModalError("Partner Full Name is required");
                          return;
                        }
                        if (!newVendor.phone.trim()) {
                          setAddModalError("Primary Phone Number is required");
                          return;
                        }
                        if (!newVendor.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(newVendor.email.trim())) {
                          setAddModalError("Valid business email address is required");
                          return;
                        }
                        if (!newVendor.password || newVendor.password.length < 8) {
                          setAddModalError("Initial password must be at least 8 characters");
                          return;
                        }
                        setAddModalError(null);
                        setCurrentStep(2);
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                    >
                      <span>Save & Continue to Step 2</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* COMMENTED OUT IN VENDOR REGISTRATION: STEP 2 BUSINESS PROFILE & REGISTRATION (DEFAULT: INDIVIDUAL PARTNER) */}
            {/* ======================================================== */}
            {/* Individual Partner is set as default; bypassing this step to match official vendor registration */}
            {false && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                {/* Step 2 Photo Banner */}
                <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                  <img
                    src="/images/fleet/bus.jpg"
                    alt="Business Profile & Registration"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Step 2 of 4</span>
                    <h3 className="text-base font-bold text-white">Commercial & Enterprise Fleet Setup</h3>
                    <p className="text-[11px] text-slate-200">GST, MSME, or individual business profiles tailored for rental operations</p>
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-black text-slate-950">
                    Step 2: Business Profile & Registration
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Do you operate your fleet under a registered business or company?
                  </p>
                </div>

                {/* Question: Owns Business? (Cards matching vendor registration) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNewVendor({ ...newVendor, ownsBusiness: true })}
                    className={cn(
                      "p-5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer",
                      newVendor.ownsBusiness === true
                        ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        newVendor.ownsBusiness === true
                          ? "bg-amber-500 text-slate-950 font-bold"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          Yes, I have a Registered Business
                        </span>
                        {newVendor.ownsBusiness === true && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        GST-registered firm, Private Limited, LLP, or registered travel agency.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewVendor({ ...newVendor, ownsBusiness: false })}
                    className={cn(
                      "p-5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer",
                      newVendor.ownsBusiness === false
                        ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        newVendor.ownsBusiness === false
                          ? "bg-amber-500 text-slate-950 font-bold"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          No, I am an Individual Partner
                        </span>
                        {newVendor.ownsBusiness === false && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Independent vehicle owner, private car partner, or sole chauffeur.
                      </p>
                    </div>
                  </button>
                </div>

                {/* If YES: Collect Business Details */}
                {newVendor.ownsBusiness === true && (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <Building2 className="w-4 h-4 text-amber-600" />
                      <span>Company & Tax Information</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Legal Business / Company Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newVendor.businessName}
                          onChange={(e) => setNewVendor({ ...newVendor, businessName: e.target.value })}
                          placeholder="e.g. Apex Fleet Logistics Private Limited"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          GST Identification Number (GSTIN)
                        </label>
                        <input
                          type="text"
                          value={newVendor.gstin}
                          onChange={(e) => setNewVendor({ ...newVendor, gstin: e.target.value.toUpperCase() })}
                          placeholder="29AAAAA0000A1Z5"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Business PAN / Tax ID
                        </label>
                        <input
                          type="text"
                          value={newVendor.pan}
                          onChange={(e) => setNewVendor({ ...newVendor, pan: e.target.value.toUpperCase() })}
                          placeholder="AAAAA0000A"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Business Structure
                        </label>
                        <select
                          value={newVendor.businessType}
                          onChange={(e) => setNewVendor({ ...newVendor, businessType: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        >
                          <option value="Private Limited">Private Limited Company</option>
                          <option value="Sole Proprietorship">Sole Proprietorship</option>
                          <option value="Partnership Firm">Partnership Firm</option>
                          <option value="LLP">Limited Liability Partnership (LLP)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Operating City
                        </label>
                        <input
                          type="text"
                          value={newVendor.businessCity}
                          onChange={(e) => setNewVendor({ ...newVendor, businessCity: e.target.value })}
                          placeholder="e.g. Chennai, Bangalore"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Registered Office Address
                        </label>
                        <input
                          type="text"
                          value={newVendor.businessAddress}
                          onChange={(e) => setNewVendor({ ...newVendor, businessAddress: e.target.value })}
                          placeholder="Shop/Office No., Street, Area"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* If NO: Confirmation for Individual Partner */}
                {newVendor.ownsBusiness === false && (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <User className="w-4 h-4 text-amber-600" />
                      <span>Individual Partner Information</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Partner will be registered as an individual fleet partner. Commercial vehicles can be added and trip assignments will be received under their personal name.
                    </p>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* COMMENTED OUT IN VENDOR REGISTRATION: Commercial Transport Permit & PUC */}
                {/* ========================================================================= */}
                {/*
                <div className="p-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3 opacity-60">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Transport Permits & Compliance (Commented Out in Vendor Registration)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Commercial Permit Number"
                      placeholder="e.g. TN/2024/TCP/88219"
                      disabled
                      helperText="Commented out in vendor registration"
                    />
                    <Input
                      label="Pollution Certificate (PUC) Number"
                      placeholder="e.g. TN-01-PUC-49201"
                      disabled
                      helperText="Commented out in vendor registration"
                    />
                  </div>
                </div>
                */}

                {/* Step 2 Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Step 1
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (newVendor.ownsBusiness && !newVendor.businessName.trim()) {
                        setAddModalError("Legal Business / Company Name is required");
                        return;
                      }
                      setAddModalError(null);
                      setCurrentStep(3);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                  >
                    <span>Save & Continue to Step 3</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* STEP 2: FLEET OPERATING STRUCTURE                        */}
            {/* ======================================================== */}
            {currentStep === 2 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                {/* Step 2 Photo Banner */}
                <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                  <img
                    src="/images/hero-bg.jpg"
                    alt="Fleet Operating Structure"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Step 2 of 3</span>
                    <h3 className="text-base font-bold text-white">Select Fleet Operating Model</h3>
                    <p className="text-[11px] text-slate-200">Tailored dispatch configurations for owner-operators and commercial multi-fleet companies</p>
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-black text-slate-950">
                    Step 2: Fleet Operating Structure
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose how the fleet partner operates with Grab Rentals.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Option 1: I Drive My Own Fleet */}
                  <div
                    onClick={() => setNewVendor({ ...newVendor, fleetModel: 1 })}
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between group",
                      newVendor.fleetModel === 1
                        ? "border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20"
                        : "border-slate-200 hover:border-amber-400 bg-white hover:shadow-xs"
                    )}
                  >
                    <div className="space-y-4">
                      <div className="h-32 rounded-2xl overflow-hidden border border-slate-200 relative shadow-2xs">
                        <img
                          src="/images/cars/dzire.jpg"
                          alt="Owner-Driver Sedan"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-400/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                            Single Vehicle
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            Owner-Driver
                          </span>
                          <h3 className="text-base font-black text-slate-950 mt-0.5">
                            1. I Drive my own Fleet
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        Partner owns a vehicle and drives it themselves. Platform automatically registers the vehicle and assigns the partner as the designated chauffeur.
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Select Option 1 &rarr;
                      </span>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          newVendor.fleetModel === 1 ? "border-amber-500 bg-amber-500 text-slate-950" : "border-slate-300"
                        )}
                      >
                        {newVendor.fleetModel === 1 && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>

                  {/* Option 2: I Have Multiple Fleet and Multiple Vehicles */}
                  <div
                    onClick={() => setNewVendor({ ...newVendor, fleetModel: 2 })}
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between group",
                      newVendor.fleetModel === 2
                        ? "border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20"
                        : "border-slate-200 hover:border-amber-400 bg-white hover:shadow-xs"
                    )}
                  >
                    <div className="space-y-4">
                      <div className="h-32 rounded-2xl overflow-hidden border border-slate-200 relative shadow-2xs">
                        <img
                          src="/images/fleet/tempo.jpg"
                          alt="Multi-Fleet Operator"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 bg-purple-300/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                            Multiple Fleets
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 shadow-xs">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            Fleet Operator
                          </span>
                          <h3 className="text-base font-black text-slate-950 mt-0.5">
                            2. Multiple Fleet & Vehicles
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        Partner operates a commercial fleet with multiple cabs and assigns individual hired chauffeurs across their operations.
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Select Option 2 &rarr;
                      </span>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          newVendor.fleetModel === 2 ? "border-amber-500 bg-amber-500 text-slate-950" : "border-slate-300"
                        )}
                      >
                        {newVendor.fleetModel === 2 && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Step 1
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAddModalError(null);
                      setCurrentStep(3);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                  >
                    <span>Save & Continue to Step 3</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* STEP 3: VEHICLE & CHAUFFEUR SETUP                        */}
            {/* ======================================================== */}
            {currentStep === 3 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                {/* Step 3 Photo Banner */}
                <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                  <img
                    src="/images/fleet/suv.jpg"
                    alt="Owner-Driver Vehicle Setup"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Step 3 of 3</span>
                    <h3 className="text-base font-bold text-white">
                      {newVendor.fleetModel === 1 ? "Owner-Driver Vehicle & Chauffeur Profile" : "Commercial Multi-Fleet Configuration"}
                    </h3>
                    <p className="text-[11px] text-slate-200">
                      {newVendor.fleetModel === 1
                        ? "Register vehicle specifications, compliance dates, and commercial chauffeur qualifications"
                        : "Configure dispatch parameters, initial fleet scale, and platform commission contract rate"}
                    </p>
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-4">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full mb-1">
                    {newVendor.fleetModel === 1 ? <Car className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                    <span>{newVendor.fleetModel === 1 ? "Owner-Driver Fleet Asset" : "Fleet Operator Scale"}</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-950">
                    Step 3: Vehicle Details & Commercial Setup
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review and finalize fleet assets and platform agreement terms.
                  </p>
                </div>

                {newVendor.fleetModel === 1 ? (
                  <div className="space-y-6">
                    {/* Section 1: Assigned Chauffeur */}
                    <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-amber-700" />
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Chauffeur Information (Assigned to Partner)
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                          Primary Driver
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={newVendor.name}
                            readOnly
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                          <input
                            type="text"
                            value={`+91 ${newVendor.phone}`}
                            readOnly
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={newVendor.driverDob}
                            onChange={(e) => setNewVendor({ ...newVendor, driverDob: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                          <select
                            value={newVendor.driverGender}
                            onChange={(e) => setNewVendor({ ...newVendor, driverGender: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Licence Class</label>
                          <select
                            value={newVendor.driverLicenseClass}
                            onChange={(e) => setNewVendor({ ...newVendor, driverLicenseClass: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          >
                            <option value="LMV-TR (Transport)">LMV-TR (Commercial Transport)</option>
                            <option value="LMV (Light Motor Vehicle)">LMV (Light Motor Vehicle)</option>
                            <option value="HMV / HGMV">HMV / Heavy Transport</option>
                            <option value="Commercial PSV Badge">Commercial PSV Badge</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Commercial Driving License Number
                          </label>
                          <input
                            type="text"
                            value={newVendor.driverLicenseNumber}
                            onChange={(e) => setNewVendor({ ...newVendor, driverLicenseNumber: e.target.value.toUpperCase() })}
                            placeholder="e.g. DL-1420110012345"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Vehicle Details */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                        <Car className="w-4 h-4 text-amber-600" />
                        <span>Vehicle Specifications</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Registration Number (Plate) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newVendor.vehicleNumber}
                            onChange={(e) => setNewVendor({ ...newVendor, vehicleNumber: e.target.value.toUpperCase() })}
                            placeholder="e.g. TN-01-AB-1234"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Category</label>
                          <select
                            value={newVendor.vehicleCategory}
                            onChange={(e) => setNewVendor({ ...newVendor, vehicleCategory: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          >
                            <option value="Sedan">Sedan</option>
                            <option value="Hatchback">Hatchback</option>
                            <option value="SUV">SUV</option>
                            <option value="Innova">Innova</option>
                            <option value="Innovacrysta">Innova Crysta</option>
                            <option value="Tempo">Tempo Traveller</option>
                            <option value="Urbania">Urbania</option>
                            <option value="Bus">Bus</option>
                            <option value="Benz">Mercedes-Benz</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Make / Model Name</label>
                          <input
                            type="text"
                            value={newVendor.vehicleModel}
                            onChange={(e) => setNewVendor({ ...newVendor, vehicleModel: e.target.value })}
                            placeholder="e.g. Swift Dzire / Innova Crysta"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Seating Capacity</label>
                          <select
                            value={newVendor.seatingCapacity}
                            onChange={(e) => setNewVendor({ ...newVendor, seatingCapacity: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          >
                            <option value={4}>4 Seater</option>
                            <option value={6}>6 Seater</option>
                            <option value={7}>7 Seater</option>
                            <option value={12}>12 Seater</option>
                            <option value={16}>16 Seater</option>
                            <option value={21}>21 Seater</option>
                            <option value={32}>32 Seater</option>
                            <option value={45}>45 Seater</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Type</label>
                          <select
                            value={newVendor.fuelType}
                            onChange={(e) => setNewVendor({ ...newVendor, fuelType: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          >
                            <option value="Diesel">Diesel</option>
                            <option value="Petrol">Petrol</option>
                            <option value="CNG">CNG</option>
                            <option value="Electric">Electric</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Fitness Expiry Date</label>
                          <input
                            type="date"
                            value={newVendor.fitnessExpiry}
                            onChange={(e) => setNewVendor({ ...newVendor, fitnessExpiry: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Option 2: Multi-Fleet details */
                  <div className="p-6 rounded-2xl bg-purple-50/40 border border-purple-200 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-wider">
                      <Users className="w-4 h-4 text-purple-700" />
                      <span>Commercial Fleet Operator Capacity</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Estimated Initial Fleet Size (Vehicles)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newVendor.estimatedFleetSize}
                          onChange={(e) => setNewVendor({ ...newVendor, estimatedFleetSize: Number(e.target.value) })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">Individual vehicles & drivers can be linked anytime.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Operating Dispatch Base
                        </label>
                        <input
                          type="text"
                          value={newVendor.city}
                          readOnly
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 3: Platform Commercial Agreement */}
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Commercial Dispatch Contract & Account Status</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Platform Commission Contract Rate (%)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="30"
                        value={newVendor.commissionRate}
                        onChange={(e) => setNewVendor({ ...newVendor, commissionRate: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-slate-800"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">Standard rate is 12% on completed trips.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Initial Activation Status
                      </label>
                      <select
                        value={newVendor.status}
                        onChange={(e) => setNewVendor({ ...newVendor, status: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-emerald-700"
                      >
                        <option value="ACTIVE">ACTIVE (Authorized for immediate live booking dispatch)</option>
                        <option value="PENDING">PENDING (Awaiting document inspection & approval)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* COMMENTED OUT IN VENDOR REGISTRATION: Sub Category */}
                {/* ========================================================================= */}
                {/*
                <div className="p-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3 opacity-60">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    Vehicle Specs & Chauffeur Profile (Commented Out in Vendor Registration)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Vehicle Sub-Category"
                      placeholder="e.g. Sedan Executive / Luxury 7-Seater"
                      disabled
                      helperText="Commented out in vendor registration"
                    />
                    <Input
                      label="Year of Manufacture"
                      type="number"
                      placeholder="e.g. 2023"
                      disabled
                      helperText="Commented out in vendor registration"
                    />
                    <Input
                      label="Transmission & Engine CC"
                      placeholder="e.g. Automatic / 1998 cc"
                      disabled
                      helperText="Commented out in vendor registration"
                    />
                    <Input
                      label="RC Expiry Date"
                      type="date"
                      disabled
                      helperText="Commented out in vendor registration"
                    />
                    <Input
                      label="Commercial Permit Number"
                      placeholder="e.g. TN/2024/TCP/88219"
                      disabled
                      helperText="Commented out in vendor registration"
                    />
                    <Input
                      label="Pollution Certificate (PUC) Number"
                      placeholder="e.g. TN-01-PUC-49201"
                      disabled
                      helperText="Commented out in vendor registration"
                    />
                    <Input
                      label="Driver Experience & License Expiry"
                      placeholder="e.g. 5+ Years, Valid till 2030"
                      disabled
                      helperText="Commented out in vendor registration"
                    />
                    <Input
                      label="Chauffeur Status & Joining Date"
                      placeholder="e.g. Active / 2024-01-15"
                      disabled
                      helperText="Commented out in vendor registration"
                    />
                  </div>
                </div>
                */}

                {/* Step 3 Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Step 2
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsAddModalOpen(false)}
                      disabled={submittingAdd}
                    >
                      Cancel
                    </Button>
                    <button
                      type="button"
                      onClick={handleCreateVendor}
                      disabled={submittingAdd}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-50"
                    >
                      {submittingAdd ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Provisioning Partner...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Provision Vendor Partner</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* City Selector Modal (Replica of Vendor Registration) */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        initialCities={newVendor.city}
        onApply={(cities) => {
          const joined = cities.join(", ");
          setNewVendor({ ...newVendor, city: joined, businessCity: joined });
          setIsCityModalOpen(false);
        }}
      />
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
