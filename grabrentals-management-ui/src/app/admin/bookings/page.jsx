"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
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
import { Button } from "@/components/ui/Button";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { formatINR, getStatusStyle } from "@/lib/utils";
import {
  Eye,
  CalendarCheck,
  Filter,
  Car,
  Clock,
  Calendar,
  CheckCircle2,
  UserCheck,
  Search,
  Sparkles,
  Phone,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

function formatDateTime(val) {
  if (!val) return { date: "—", time: "" };
  try {
    const dt = new Date(val);
    if (isNaN(dt.getTime())) return { date: String(val), time: "" };
    const date = dt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const time = dt.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { date, time };
  } catch {
    return { date: String(val), time: "" };
  }
}

export default function AdminMasterBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Default arrange data from New to Old (chronological descending by creation date)
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

  // Fleet Allocation Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [assignChauffeurNow, setAssignChauffeurNow] = useState(false);
  const [vehicleTab, setVehicleTab] = useState("MATCHING");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [loadingFleet, setLoadingFleet] = useState(false);
  const [submittingAllocation, setSubmittingAllocation] = useState(false);
  const [toast, setToast] = useState(null);

  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await operationsApi.getBookings();
        if (!ignore) setBookings(res.data || []);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [reloadTrigger]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  // Open Fleet Allocation Modal
  const openAllocateModal = async (booking) => {
    setSelectedBooking(booking);
    setSelectedVehicle(null);
    setSelectedDriver(null);
    setAssignChauffeurNow(false);
    setVehicleSearch("");
    setVehicleTab("MATCHING");
    setIsModalOpen(true);
    setLoadingFleet(true);

    try {
      const [vehRes, drvRes] = await Promise.all([
        operationsApi.getVehicles("AVAILABLE"),
        operationsApi.getDrivers("AVAILABLE"),
      ]);
      const vList = vehRes.data || [];
      setAvailableVehicles(vList);
      setAvailableDrivers(drvRes.data || []);

      // Pre-select matching vehicle if any
      const reqCat = (booking.vehicleCategory || "").trim().toUpperCase();
      const match = vList.find((v) => (v.category || "").trim().toUpperCase() === reqCat);
      if (match) {
        setSelectedVehicle(match);
      } else if (vList.length > 0) {
        setSelectedVehicle(vList[0]);
        setVehicleTab("ALL");
      }
    } catch (err) {
      console.error("Failed to load available fleet:", err);
      setToast({ type: "error", message: "Failed to load available fleet." });
    } finally {
      setLoadingFleet(false);
    }
  };

  // Confirm Fleet Allocation
  const handleConfirmAllocation = async () => {
    if (!selectedBooking || !selectedVehicle) {
      setToast({
        type: "warning",
        message: "Please select an available vehicle to allocate.",
      });
      return;
    }

    setSubmittingAllocation(true);
    try {
      const bId = selectedBooking.rawId || selectedBooking.id;
      const vId = selectedVehicle.rawId || selectedVehicle.id;

      if (assignChauffeurNow && selectedDriver) {
        const dId = selectedDriver.rawId || selectedDriver.id;
        await operationsApi.assignVehicleAndDriver(bId, vId, dId);
        setToast({
          type: "success",
          message: `Vehicle ${selectedVehicle.model} (${selectedVehicle.registrationNumber}) and chauffeur ${selectedDriver.name} allocated to booking ${selectedBooking.id}!`,
        });
      } else {
        await operationsApi.assignVehicle(bId, vId);
        setToast({
          type: "success",
          message: `Vehicle ${selectedVehicle.model} (${selectedVehicle.registrationNumber}) allocated to booking ${selectedBooking.id}! Routed to Fleet Owner (${selectedVehicle.vendorName || "Partner Vendor"}) to assign chauffeur.`,
        });
      }

      setIsModalOpen(false);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Allocation failed:", err);
      setToast({
        type: "error",
        message: "Failed to allocate fleet. Please try again.",
      });
    } finally {
      setSubmittingAllocation(false);
    }
  };

  const filteredAndSortedBookings = useMemo(() => {
    let result = [...bookings];

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.id?.toLowerCase().includes(q) ||
          b.customerName?.toLowerCase().includes(q) ||
          b.customerPhone?.toLowerCase().includes(q) ||
          b.pickupLocation?.toLowerCase().includes(q) ||
          b.dropLocation?.toLowerCase().includes(q) ||
          b.vendorName?.toLowerCase().includes(q) ||
          b.assignedVehicleNumber?.toLowerCase().includes(q)
      );
    }

    // Sorting (New to Old by default)
    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === "fare" || sortConfig.key === "totalFare") {
        valA = Number(a.fare || a.totalFare || 0);
        valB = Number(b.fare || b.totalFare || 0);
      } else if (sortConfig.key === "createdAt" || sortConfig.key === "pickupDateTime") {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
        // Fallback to secondary date if equal
        if (valA === valB) {
          const secA = a.pickupDateTime ? new Date(a.pickupDateTime).getTime() : 0;
          const secB = b.pickupDateTime ? new Date(b.pickupDateTime).getTime() : 0;
          return sortConfig.direction === "asc" ? secA - secB : secB - secA;
        }
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [bookings, search, statusFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedBookings.length / pageSize) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedBookings.slice(start, start + pageSize);
  }, [filteredAndSortedBookings, currentPage, pageSize]);

  // Modal fleet filters
  const bookingCategory = (selectedBooking?.vehicleCategory || "").trim().toUpperCase();
  const matchingVehicles = useMemo(() => {
    if (!bookingCategory) return availableVehicles;
    return availableVehicles.filter(
      (v) => (v.category || "").trim().toUpperCase() === bookingCategory
    );
  }, [availableVehicles, bookingCategory]);

  const displayedVehicles = useMemo(() => {
    let list = vehicleTab === "MATCHING" && matchingVehicles.length > 0
      ? matchingVehicles
      : availableVehicles;

    if (vehicleSearch.trim()) {
      const q = vehicleSearch.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.registrationNumber?.toLowerCase().includes(q) ||
          v.model?.toLowerCase().includes(q) ||
          v.category?.toLowerCase().includes(q) ||
          v.vendorName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [vehicleTab, matchingVehicles, availableVehicles, vehicleSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Booking Ledger"
        subtitle="Platform-wide booking records across all customer accounts, live dispatch allocation, and vendor fleet"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Bookings" }]}
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
              placeholder="Search ID, customer, route, vendor, plate..."
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
                <option value="ALL">All Statuses ({bookings.length})</option>
                <option value="PENDING_ALLOCATION">Pending Allocation</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="ASSIGNED_TO_VENDOR">Assigned to Vendor</option>
                <option value="ALLOCATED">Allocated</option>
                <option value="ON_TRIP">On Trip</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredAndSortedBookings.length}</strong> bookings (New to Old)
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
                label="Booking ID"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="customerName"
                label="Customer"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Route / Service</TableHead>
              <SortableHeader
                columnKey="createdAt"
                label="Booking Date & Time"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="pickupDateTime"
                label="Pickup Date & Time"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                columnKey="vendorName"
                label="Partner Vendor"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <TableHead>Vehicle & Driver</TableHead>
              <SortableHeader
                columnKey="fare"
                label="Total Fare"
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
                <TableCell colSpan={10} className="py-12">
                  <LoadingAnimation inline title="Loading master booking ledger..." />
                </TableCell>
              </TableRow>
            ) : paginatedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-800 text-sm">No Bookings Found</div>
                    <p className="text-xs text-slate-500 mt-1">
                      {search || statusFilter !== "ALL"
                        ? "No bookings match your current filter criteria."
                        : "No bookings registered in the system."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedBookings.map((b) => {
                const statusStyle = getStatusStyle(b.status);
                const booked = formatDateTime(b.createdAt);
                const pickup = formatDateTime(b.pickupDateTime || b.pickupTime);
                const isAllocated = Boolean(b.assignedVehicleNumber);

                return (
                  <TableRow key={b.id}>
                    {/* Booking ID */}
                    <TableCell>
                      <span className="font-mono font-bold text-xs text-slate-900">{b.id}</span>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900">{b.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {b.customerPhone || b.customerEmail || ""}
                      </div>
                    </TableCell>

                    {/* Route / Service */}
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-800 max-w-[200px] truncate" title={`${b.pickupLocation} ➔ ${b.dropLocation}`}>
                        {b.pickupLocation} ➔ {b.dropLocation}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {b.serviceType || b.tripType || "Ride"}
                        </span>
                        {b.vehicleCategory && (
                          <span className="text-[10px] font-semibold text-blue-600">
                            • {b.vehicleCategory}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Booking Date & Time */}
                    <TableCell>
                      <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{booked.date}</span>
                      </div>
                      {booked.time && (
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{booked.time}</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Pickup Date & Time */}
                    <TableCell>
                      <div className="text-xs font-bold text-blue-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-500 shrink-0" />
                        <span>{pickup.date}</span>
                      </div>
                      {pickup.time && (
                        <div className="text-[11px] text-blue-600 font-mono font-medium mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-400 shrink-0" />
                          <span>{pickup.time}</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Partner Vendor */}
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-800">
                        {b.vendorName || "In-House Fleet"}
                      </span>
                    </TableCell>

                    {/* Vehicle & Driver */}
                    <TableCell>
                      {isAllocated ? (
                        <div className="space-y-1">
                          <NumberPlate registrationNumber={b.assignedVehicleNumber} />
                          <div className="text-[10px] text-slate-500">
                            {b.assignedDriverName || "Chauffeur pending vendor"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium italic">
                          Unallocated
                        </span>
                      )}
                    </TableCell>

                    {/* Fare */}
                    <TableCell>
                      <span className="font-bold text-xs text-slate-900">
                        {formatINR(b.fare || b.totalFare || 0)}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <span
                        className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusStyle.bg}`}
                      >
                        {statusStyle.label}
                      </span>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="xs"
                          variant={isAllocated ? "secondary" : "amber"}
                          icon={Car}
                          onClick={() => openAllocateModal(b)}
                          title={isAllocated ? "Reallocate Fleet" : "Allocate Commercial Vehicle"}
                        >
                          {isAllocated ? "Reallocate" : "Allocate"}
                        </Button>
                        <Link href={`/admin/bookings/${b.id}`}>
                          <Button size="xs" variant="secondary" icon={Eye} title="Audit Booking Details">
                            Audit
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {!loading && filteredAndSortedBookings.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredAndSortedBookings.length}
            pageSize={pageSize}
          />
        )}
      </Card>

      {/* Fleet Allocation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !submittingAllocation && setIsModalOpen(false)}
        title={`Allocate Fleet • Booking ${selectedBooking?.id || ""}`}
        subtitle="Assign an available commercial vehicle and chauffeur to fulfill this trip request"
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-slate-500">
              {selectedVehicle ? (
                <span className="text-slate-800 font-medium">
                  Selected: <strong>{selectedVehicle.model}</strong> ({selectedVehicle.registrationNumber}) • Vendor: <strong>{selectedVehicle.vendorName || "Partner"}</strong>
                </span>
              ) : (
                <span className="text-amber-600 font-medium">Please pick a vehicle from the fleet below</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={submittingAllocation}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                disabled={!selectedVehicle || submittingAllocation}
                onClick={handleConfirmAllocation}
              >
                {submittingAllocation ? "Allocating..." : "Confirm Allocation"}
              </Button>
            </div>
          </div>
        }
      >
        {selectedBooking && (
          <div className="space-y-5">
            {/* Trip Summary Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Customer</span>
                <span className="font-bold text-slate-900 block mt-0.5">{selectedBooking.customerName}</span>
                <span className="text-slate-500 font-mono text-[11px]">{selectedBooking.customerPhone}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-500 font-medium block">Route</span>
                <span className="font-semibold text-slate-900 block mt-0.5 truncate" title={`${selectedBooking.pickupLocation} ➔ ${selectedBooking.dropLocation}`}>
                  {selectedBooking.pickupLocation} ➔ {selectedBooking.dropLocation}
                </span>
                <span className="text-blue-600 font-medium text-[11px]">
                  Pickup: {formatDateTime(selectedBooking.pickupDateTime || selectedBooking.pickupTime).date} at {formatDateTime(selectedBooking.pickupDateTime || selectedBooking.pickupTime).time}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Vehicle Class & Fare</span>
                <span className="font-bold text-amber-700 uppercase block mt-0.5">
                  {selectedBooking.vehicleCategory || "Standard"}
                </span>
                <span className="font-bold text-slate-900 text-[11px]">
                  {formatINR(selectedBooking.fare || selectedBooking.totalFare || 0)}
                </span>
              </div>
            </div>

            {/* Fleet Selection Section */}
            <div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVehicleTab("MATCHING")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      vehicleTab === "MATCHING"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Matching Class ({matchingVehicles.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleTab("ALL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      vehicleTab === "ALL"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All Available Fleet ({availableVehicles.length})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    placeholder="Search model, plate, vendor..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>

              {loadingFleet ? (
                <div className="py-12 text-center">
                  <LoadingAnimation inline title="Querying available commercial fleet..." />
                </div>
              ) : displayedVehicles.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Car className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <div className="font-bold text-slate-700 text-xs">No Available Vehicles Found</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {vehicleTab === "MATCHING"
                      ? `No available vehicles in "${bookingCategory}" category. Click "All Available Fleet" to view alternative vehicles.`
                      : "All vehicles are currently dispatched or offline."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {displayedVehicles.map((v) => {
                    const isSelected =
                      selectedVehicle &&
                      (selectedVehicle.rawId || selectedVehicle.id) === (v.rawId || v.id);

                    return (
                      <div
                        key={v.id || v.rawId || v.registrationNumber}
                        onClick={() => setSelectedVehicle(v)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-50/70 border-blue-500 shadow-xs ring-2 ring-blue-500/20"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{v.model}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {v.category || v.vehicleType || "Standard"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <NumberPlate registrationNumber={v.registrationNumber} />
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{v.vendorName || "Grab In-House"}</span>
                            {v.seatingCapacity && (
                              <span className="text-slate-400">• {v.seatingCapacity} Seats</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Available
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chauffeur Assignment Options */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">Chauffeur Assignment</div>
                  <div className="text-[11px] text-slate-500">
                    {assignChauffeurNow
                      ? "Assign an available licensed driver immediately."
                      : "Route booking to the Fleet Owner / Vendor to designate their chauffeur."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAssignChauffeurNow(!assignChauffeurNow)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    assignChauffeurNow
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {assignChauffeurNow ? "Direct Chauffeur (Active)" : "Delegate to Vendor"}
                </button>
              </div>

              {assignChauffeurNow && (
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Driver ({availableDrivers.length} available)
                  </label>
                  <select
                    value={selectedDriver ? (selectedDriver.rawId || selectedDriver.id) : ""}
                    onChange={(e) => {
                      const d = availableDrivers.find(
                        (item) => String(item.rawId || item.id) === e.target.value
                      );
                      setSelectedDriver(d || null);
                    }}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  >
                    <option value="">-- Choose Chauffeur --</option>
                    {availableDrivers.map((d) => (
                      <option key={d.id || d.rawId} value={d.rawId || d.id}>
                        {d.name} ({d.phone || "No phone"}) • {d.vendorName || "In-House"} • Rating: {d.rating || 5.0}★
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Feedback */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
