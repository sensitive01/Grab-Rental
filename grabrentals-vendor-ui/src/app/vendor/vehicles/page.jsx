"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Car, 
  Plus, 
  Eye, 
  Edit3, 
  Calendar, 
  Trash2, 
  Users, 
  MapPin, 
  Filter,
  Search,
  RotateCcw,
  Fuel,
  Settings,
  MoreVertical,
  LayoutGrid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Gauge,
  Loader2
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Toast from "@/components/ui/Toast";
import { axiosClient } from "@/lib/axiosClient";

export default function VendorVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "year_desc"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]); // Default empty so all vehicles show
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedFuels, setSelectedFuels] = useState([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState([]);
  const [seatingCapacity, setSeatingCapacity] = useState("");

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchVehicles = async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        axiosClient.get("/api/vendor/vehicles").catch(() => ({ data: { data: [] } })),
        axiosClient.get("/api/vendor/drivers").catch(() => ({ data: { data: [] } }))
      ]);

      const drivers = Array.isArray(driversRes.data?.data) ? driversRes.data.data : [];
      let beData = Array.isArray(vehiclesRes.data?.data) ? [...vehiclesRes.data.data] : [];

      // If backend has no vehicles yet, check if vendor registered vehicles during onboarding
      if (beData.length === 0 && typeof window !== "undefined") {
        try {
          const rawOnboarding = localStorage.getItem("grabrentals_vendor_onboarding");
          if (rawOnboarding) {
            const parsed = JSON.parse(rawOnboarding);
            const onboardVehicles = Array.isArray(parsed?.vehiclesList) ? parsed.vehiclesList : [];
            if (onboardVehicles.length > 0) {
              for (const v of onboardVehicles) {
                try {
                  const syncRes = await axiosClient.post("/api/vendor/vehicles", {
                    vehicleNumber: v.vehicleNumber,
                    vehicleModel: v.vehicleModel || "Commercial Fleet Asset",
                    vehicleType: v.vehicleType || "SUV",
                    variant: v.variant || undefined,
                    color: v.color || undefined,
                    registrationType: v.registrationType || undefined,
                    alternateFuel: v.alternateFuel || undefined,
                    transmission: v.transmission || undefined,
                    engineCc: v.engineCc ? parseInt(v.engineCc) : undefined,
                    parkingLocation: v.parkingLocation || undefined,
                    features: v.features || undefined,
                    year: v.year ? parseInt(v.year) : 2024,
                    seatingCapacity: v.seatingCapacity ? Math.max(1, parseInt(v.seatingCapacity) || 5) : 5,
                    fuelType: v.fuelType || "Diesel",
                    dailyRate: 2500,
                    perKmRate: 14,
                    imageUrl: v.imageUrl || (v.photos && v.photos[0]) || undefined,
                    photos: Array.isArray(v.photos) ? JSON.stringify(v.photos) : (typeof v.photos === "object" ? JSON.stringify(v.photos) : v.photos),
                    insuranceExpiry: v.insuranceExpiry || undefined,
                    fitnessExpiry: v.fitnessExpiry || undefined,
                    permitExpiry: v.permitExpiry || undefined,
                    rcDocumentUrl: v.rcDocumentUrl || undefined,
                    insuranceDocumentUrl: v.insuranceDocumentUrl || undefined,
                    permitDocumentUrl: v.permitDocumentUrl || undefined,
                    fitnessDocumentUrl: v.fitnessDocumentUrl || undefined,
                  });
                  if (syncRes.data?.data) {
                    beData.push(syncRes.data.data);
                  }
                } catch (syncErr) {
                  console.warn("Auto-sync onboarding vehicle notice:", syncErr?.response?.data || syncErr?.message);
                  beData.push({
                    id: v.id || "v-" + Math.random(),
                    model: v.vehicleModel || "Commercial Fleet Asset",
                    variant: v.variant || "",
                    vehicleNumber: v.vehicleNumber,
                    vehicleType: v.vehicleType || "SUV",
                    seatingCapacity: v.seatingCapacity || 5,
                    fuelType: v.fuelType || "Diesel",
                    transmission: v.transmission || "Automatic",
                    year: v.year || 2024,
                    status: "AVAILABLE",
                    currentLocation: v.parkingLocation || "Bangalore",
                    imageUrl: v.imageUrl || (v.photos && v.photos[0]) || null,
                    photos: v.photos ? (typeof v.photos === "string" ? v.photos : JSON.stringify(v.photos)) : null,
                    dailyRate: 2500,
                    perKmRate: 14
                  });
                }
              }
            }
          }
        } catch (cacheErr) {
          console.warn("Onboarding cache read notice:", cacheErr);
        }
      }

      const beVehicles = beData.map((v) => {
        const matchedDriver = drivers.find((d) => d.assignedVehicleId === v.id || d.assignedVehicle === v.vehicleNumber);
        const resolvedDriverName = v.assignedDriverName || matchedDriver?.name || null;
        const resolvedDriverPhone = v.assignedDriverPhone || matchedDriver?.phone || "";

        let parsedPhotos = [];
        if (v.photos) {
          try {
            parsedPhotos = JSON.parse(v.photos);
          } catch {
            parsedPhotos = v.photos.split(",").map(s => s.trim()).filter(Boolean);
          }
        }

        return {
          id: v.id,
          model: v.model || "Vehicle",
          variant: v.variant || "",
          vehicleNumber: v.vehicleNumber,
          type: v.vehicleType || "SUV",
          category: v.vehicleType || "SUV",
          seatingCapacity: v.seatingCapacity || 5,
          fuelType: v.fuelType || "Diesel",
          transmission: v.transmission || "Automatic",
          year: v.year || 2024,
          status: v.status === "AVAILABLE" ? "Available" : v.status === "BOOKED" ? "Rented" : v.status === "ON_TRIP" ? "Reserved" : v.status === "MAINTENANCE" ? "Maintenance" : "Available",
          currentLocation: v.parkingLocation || v.currentLocation || "Bangalore",
          driverName: resolvedDriverName,
          driverPhone: resolvedDriverPhone,
          dailyRate: v.dailyRate || 4000,
          perKmRate: v.perKmRate || 15,
          image: (parsedPhotos && parsedPhotos[0]) || v.imageUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
          photos: parsedPhotos.length > 0 ? parsedPhotos : (v.imageUrl ? [v.imageUrl] : [])
        };
      });

      setVehicles(beVehicles);
    } catch (err) {
      console.warn("Failed to fetch vehicles from backend:", err.message);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Filter Counts Calculation
  const counts = useMemo(() => {
    const typeCount = { SUV: 0, Sedan: 0, Hatchback: 0, Luxury: 0, "Van / Minibus": 0 };
    const statusCount = { all: vehicles.length, Available: 0, Rented: 0, Reserved: 0, Maintenance: 0, Inactive: 0 };
    const fuelCount = { Petrol: 0, Diesel: 0, CNG: 0, Electric: 0, Hybrid: 0 };
    const transCount = { Automatic: 0, Manual: 0 };

    vehicles.forEach(v => {
      // Type
      const normType = v.type?.toLowerCase() || "";
      if (normType.includes("suv")) typeCount["SUV"] = (typeCount["SUV"] || 0) + 1;
      else if (normType.includes("sedan")) typeCount["Sedan"] = (typeCount["Sedan"] || 0) + 1;
      else if (normType.includes("hatch")) typeCount["Hatchback"] = (typeCount["Hatchback"] || 0) + 1;
      else if (normType.includes("lux")) typeCount["Luxury"] = (typeCount["Luxury"] || 0) + 1;
      else if (normType.includes("van") || normType.includes("bus") || normType.includes("tempo") || normType.includes("mpv")) {
        typeCount["Van / Minibus"] = (typeCount["Van / Minibus"] || 0) + 1;
      }

      // Status
      if (v.status === "Available") statusCount.Available++;
      else if (v.status === "Rented" || v.status === "Booked") statusCount.Rented++;
      else if (v.status === "Reserved" || v.status === "On Trip") statusCount.Reserved++;
      else if (v.status === "Maintenance") statusCount.Maintenance++;
      else statusCount.Inactive++;

      // Fuel
      const f = v.fuelType || "Petrol";
      if (fuelCount[f] !== undefined) fuelCount[f]++;

      // Transmission
      const t = v.transmission || "Automatic";
      if (transCount[t] !== undefined) transCount[t]++;
    });

    return { typeCount, statusCount, fuelCount, transCount };
  }, [vehicles]);

  // Toggle helpers
  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const handleFuelToggle = (fuel) => {
    setSelectedFuels(prev => 
      prev.includes(fuel) ? prev.filter(f => f !== fuel) : [...prev, fuel]
    );
    setCurrentPage(1);
  };

  const handleTransmissionToggle = (trans) => {
    setSelectedTransmissions(prev => 
      prev.includes(trans) ? prev.filter(t => t !== trans) : [...prev, trans]
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedStatus("all");
    setSelectedFuels([]);
    setSelectedTransmissions([]);
    setSeatingCapacity("");
    setCurrentPage(1);
  };

  // Filtered & Sorted vehicles
  const filteredVehicles = useMemo(() => {
    let result = vehicles.filter((v) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = v.model?.toLowerCase().includes(q);
        const matchesPlate = v.vehicleNumber?.toLowerCase().includes(q);
        const matchesDriver = v.driverName?.toLowerCase().includes(q);
        if (!matchesName && !matchesPlate && !matchesDriver) return false;
      }

      // Vehicle Type
      if (selectedTypes.length > 0) {
        const matchesAnyType = selectedTypes.some(t => {
          const normT = t.toLowerCase();
          const normV = (v.type || "").toLowerCase();
          if (normT.includes("van") || normT.includes("minibus")) {
            return normV.includes("van") || normV.includes("bus") || normV.includes("mpv") || normV.includes("tempo");
          }
          return normV.includes(normT);
        });
        if (!matchesAnyType) return false;
      }

      // Availability Status
      if (selectedStatus !== "all") {
        if (selectedStatus === "available" && v.status !== "Available") return false;
        if (selectedStatus === "rented" && v.status !== "Rented" && v.status !== "Booked") return false;
        if (selectedStatus === "reserved" && v.status !== "Reserved" && v.status !== "On Trip") return false;
        if (selectedStatus === "maintenance" && v.status !== "Maintenance") return false;
        if (selectedStatus === "inactive" && v.status !== "Inactive") return false;
      }

      // Fuel Type
      if (selectedFuels.length > 0) {
        if (!selectedFuels.includes(v.fuelType)) return false;
      }

      // Transmission
      if (selectedTransmissions.length > 0) {
        if (!selectedTransmissions.includes(v.transmission)) return false;
      }

      // Seating Capacity
      if (seatingCapacity) {
        const cap = Number(v.seatingCapacity) || 0;
        if (seatingCapacity === "4-5" && (cap < 4 || cap > 5)) return false;
        if (seatingCapacity === "6-7" && (cap < 6 || cap > 7)) return false;
        if (seatingCapacity === "8+" && cap < 8) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "year_desc") return (b.year || 0) - (a.year || 0);
      // Default: newest
      return (b.year || 2024) - (a.year || 2024);
    });

    return result;
  }, [
    vehicles, 
    searchQuery, 
    selectedTypes, 
    selectedStatus, 
    selectedFuels, 
    selectedTransmissions, 
    seatingCapacity, 
    sortBy
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage) || 1;
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    try {
      if (typeof vehicleToDelete.id === "string" && vehicleToDelete.id.length > 20) {
        await axiosClient.delete(`/api/vendor/vehicles/${vehicleToDelete.id}`);
      }
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete.id));
      setToastMessage(`Vehicle ${vehicleToDelete.vehicleNumber} was successfully removed.`);
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      setToastMessage(`Failed to delete vehicle: ${err.response?.data?.message || err.message}`);
    } finally {
      setVehicleToDelete(null);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Available":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "Rented":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "Reserved":
        return "bg-sky-50 text-sky-700 border-sky-200/60";
      case "Maintenance":
        return "bg-rose-50 text-rose-700 border-rose-200/60";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case "Available": return "bg-emerald-500";
      case "Rented": return "bg-amber-500";
      case "Reserved": return "bg-sky-500";
      case "Maintenance": return "bg-rose-500";
      default: return "bg-slate-400";
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto px-2 sm:px-4">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="info"
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!vehicleToDelete}
        title="Delete Vehicle"
        message={`Are you sure you want to remove ${vehicleToDelete?.model} (${vehicleToDelete?.vehicleNumber}) from your fleet?`}
        confirmLabel="Delete Vehicle"
        confirmVariant="danger"
        onConfirm={handleDeleteVehicle}
        onCancel={() => setVehicleToDelete(null)}
      />

      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <Breadcrumbs />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            Fleet Vehicles
            {loading ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                <span>Loading...</span>
              </span>
            ) : (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {vehicles.length} Total
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/vendor/vehicles/add"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-xs transition-all text-xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Vehicle</span>
          </Link>
        </div>
      </div>

      {/* Main Split Layout: Left Sidebar Filters + Right Vehicle Catalog */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ========================================================= */}
        {/* LEFT SIDEBAR: Search & Filters (Exact Match to Screenshot) */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Search & Filters
            </h2>
            <button
              onClick={handleClearFilters}
              title="Reset all filters"
              className="text-slate-400 hover:text-amber-600 transition-colors p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Vehicle name or registration number"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Vehicle Type Checkboxes */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="text-xs font-bold text-slate-700 block">Vehicle Type</label>
            <div className="space-y-1.5">
              {[
                { name: "SUV", count: counts.typeCount["SUV"] || 0 },
                { name: "Sedan", count: counts.typeCount["Sedan"] || 0 },
                { name: "Hatchback", count: counts.typeCount["Hatchback"] || 0 },
                { name: "Luxury", count: counts.typeCount["Luxury"] || 0 },
                { name: "Van / Minibus", count: counts.typeCount["Van / Minibus"] || 0 },
              ].map(({ name, count }) => {
                const isChecked = selectedTypes.includes(name);
                return (
                  <label
                    key={name}
                    className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700 select-none group"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTypeToggle(name)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <Car className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      <span>{name}</span>
                    </div>
                    {loading ? (
                      <span className="w-3.5 h-3 bg-slate-200/80 rounded animate-pulse inline-block" />
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">{count}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Availability Status Radios */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="text-xs font-bold text-slate-700 block">Availability Status</label>
            <div className="space-y-1.5">
              {[
                { key: "all", label: "All", dot: "bg-blue-600", count: counts.statusCount.all },
                { key: "available", label: "Available", dot: "bg-emerald-500", count: counts.statusCount.Available },
                { key: "rented", label: "Rented", dot: "bg-amber-500", count: counts.statusCount.Rented },
                { key: "reserved", label: "Reserved", dot: "bg-sky-500", count: counts.statusCount.Reserved },
                { key: "maintenance", label: "Maintenance", dot: "bg-rose-500", count: counts.statusCount.Maintenance },
                { key: "inactive", label: "Inactive", dot: "bg-slate-400", count: counts.statusCount.Inactive },
              ].map(({ key, label, dot, count }) => {
                const isSelected = selectedStatus === key;
                return (
                  <label
                    key={key}
                    className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700 select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="availabilityStatus"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedStatus(key);
                          setCurrentPage(1);
                        }}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                      <span>{label}</span>
                    </div>
                    {loading ? (
                      <span className="w-3.5 h-3 bg-slate-200/80 rounded animate-pulse inline-block" />
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">{count}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Fuel Type Checkboxes */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="text-xs font-bold text-slate-700 block">Fuel Type</label>
            <div className="space-y-1.5">
              {[
                { name: "Petrol", count: counts.fuelCount["Petrol"] || 0 },
                { name: "Diesel", count: counts.fuelCount["Diesel"] || 0 },
                { name: "CNG", count: counts.fuelCount["CNG"] || 0 },
                { name: "Electric", count: counts.fuelCount["Electric"] || 0 },
                { name: "Hybrid", count: counts.fuelCount["Hybrid"] || 0 },
              ].map(({ name, count }) => {
                const isChecked = selectedFuels.includes(name);
                return (
                  <label
                    key={name}
                    className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700 select-none group"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleFuelToggle(name)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <Fuel className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      <span>{name}</span>
                    </div>
                    {loading ? (
                      <span className="w-3.5 h-3 bg-slate-200/80 rounded animate-pulse inline-block" />
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">{count}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Transmission Checkboxes */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="text-xs font-bold text-slate-700 block">Transmission</label>
            <div className="space-y-1.5">
              {[
                { name: "Automatic", count: counts.transCount["Automatic"] || 0 },
                { name: "Manual", count: counts.transCount["Manual"] || 0 },
              ].map(({ name, count }) => {
                const isChecked = selectedTransmissions.includes(name);
                return (
                  <label
                    key={name}
                    className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700 select-none group"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTransmissionToggle(name)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      <span>{name}</span>
                    </div>
                    {loading ? (
                      <span className="w-3.5 h-3 bg-slate-200/80 rounded animate-pulse inline-block" />
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">{count}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Seating Capacity Selector */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="text-xs font-bold text-slate-700 block">Seating Capacity</label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={seatingCapacity}
                onChange={(e) => {
                  setSeatingCapacity(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 cursor-pointer appearance-none"
              >
                <option value="">Any Capacity</option>
                <option value="4-5">4 - 5 Seats</option>
                <option value="6-7">6 - 7 Seats</option>
                <option value="8+">8+ Seats</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Bottom Button */}
          <button
            onClick={handleClearFilters}
            className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </aside>

        {/* ========================================================= */}
        {/* RIGHT AREA: Vehicle Catalog Header & Cards Grid           */}
        {/* ========================================================= */}
        <div className="flex-1 w-full space-y-4">
          
          {/* Catalog Top Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 px-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              {loading ? (
                <>
                  <div className="h-5 w-20 bg-slate-200/80 rounded-md animate-pulse" />
                  <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5 ml-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading fleet...
                  </span>
                </>
              ) : (
                `${filteredVehicles.length} Vehicles`
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
                >
                  <option value="newest">Newest Added</option>
                  <option value="year_desc">Year: New to Old</option>
                </select>
              </div>

              {/* Grid / List Mode Toggle Buttons */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="List View"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading Skeleton State */}
          {loading && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-900 text-xs font-medium">
                <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                <span>Fetching commercial fleet vehicles and real-time status data...</span>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between animate-pulse"
                    >
                      <div>
                        {/* Image Skeleton */}
                        <div className="relative aspect-[16/9] w-full rounded-xl bg-slate-200/80 mb-3.5 flex items-center justify-center overflow-hidden">
                          <Car className="w-10 h-10 text-slate-300" />
                          <div className="absolute top-2.5 right-2.5">
                            <div className="h-5 w-16 bg-slate-300/80 rounded-full" />
                          </div>
                        </div>

                        {/* Title & Plate Number */}
                        <div className="space-y-1.5 mb-2.5">
                          <div className="h-4 bg-slate-200/80 rounded w-2/3" />
                          <div className="h-3.5 bg-slate-200/80 rounded w-1/3" />
                        </div>

                        {/* Spec Icons Bar */}
                        <div className="flex items-center gap-3 py-2 border-y border-slate-100 my-2">
                          <div className="h-3 bg-slate-200/80 rounded w-12" />
                          <div className="h-3 bg-slate-200/80 rounded w-12" />
                          <div className="h-3 bg-slate-200/80 rounded w-16" />
                          <div className="h-3 bg-slate-200/80 rounded w-14" />
                        </div>

                        {/* Location */}
                        <div className="h-3 bg-slate-200/80 rounded w-24 mb-1.5" />

                        {/* Chauffeur */}
                        <div className="h-3 bg-slate-200/80 rounded w-36 mb-3" />
                      </div>

                      {/* Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                        <div className="h-7 w-14 bg-slate-200/80 rounded-xl" />
                        <div className="h-7 w-14 bg-slate-200/80 rounded-xl" />
                        <div className="h-7 w-7 bg-slate-200/80 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-14 rounded-xl bg-slate-200/80 shrink-0" />
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200/80 rounded w-40" />
                          <div className="h-3 bg-slate-200/80 rounded w-52" />
                          <div className="h-2.5 bg-slate-200/80 rounded w-28" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="space-y-1.5 text-right">
                          <div className="h-5 bg-slate-200/80 rounded-full w-16" />
                        </div>
                        <div className="h-8 w-14 bg-slate-200/80 rounded-xl" />
                        <div className="h-8 w-14 bg-slate-200/80 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && paginatedVehicles.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {vehicles.length === 0 ? "No Vehicles in Your Fleet Yet" : "No Vehicles Match Your Filter"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                {vehicles.length === 0 
                  ? "You have not registered any vehicles yet. Click below to add your first vehicle."
                  : "Try selecting different vehicle types, clearing availability filters, or adding a new fleet vehicle."}
              </p>
              {vehicles.length === 0 ? (
                <Link
                  href="/vendor/vehicles/add"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Vehicle</span>
                </Link>
              ) : (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}

          {/* Grid View (Matches Screenshot 1 Exactly) */}
          {!loading && viewMode === "grid" && paginatedVehicles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedVehicles.map((v) => {
                const isMenuOpen = activeMenuId === v.id;
                return (
                  <div
                    key={v.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Image Box with Status Pill */}
                      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 mb-3.5 border border-slate-100">
                        <img
                          src={v.image}
                          alt={v.model}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80";
                          }}
                        />
                        {/* Live Status Badge */}
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-xs shadow-2xs ${getStatusBadgeStyle(
                              v.status
                            )}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(v.status)}`} />
                            {v.status}
                          </span>
                        </div>
                      </div>

                      {/* Title & Plate Number */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <Link
                            href={`/vendor/vehicles/${v.id}`}
                            className="font-extrabold text-sm text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                          >
                            {v.model}
                          </Link>
                          <div className="mt-0.5">
                            <span className="text-xs font-bold text-slate-700 tracking-wider">
                              {v.vehicleNumber}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Spec Icons Bar */}
                      <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 py-1.5 border-y border-slate-100 my-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-slate-400" />
                          <span>{v.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel className="w-3.5 h-3.5 text-slate-400" />
                          <span>{v.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Settings className="w-3.5 h-3.5 text-slate-400" />
                          <span>{v.transmission}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{v.seatingCapacity} Seats</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{v.year}</span>
                        </div>
                      </div>

                      {/* City Location */}
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 mb-1 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{v.currentLocation || "Bangalore"}</span>
                      </div>

                      {/* Chauffeur Indicator */}
                      <div className="flex items-center gap-1.5 text-[11px] font-medium mb-3">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {v.driverName ? (
                          <span className="text-slate-700">
                            Chauffeur: <span className="font-bold text-slate-900">{v.driverName}</span>
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold">
                            Chauffeur: Not Assigned
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 relative">
                      <Link
                        href={`/vendor/vehicles/${v.id}`}
                        className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/vendor/vehicles/${v.id}/edit`}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                      >
                        Edit
                      </Link>

                      {/* More Options Menu (⋮) */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(isMenuOpen ? null : v.id)}
                          className="p-1.5 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                            <Link
                              href={`/vendor/vehicles/${v.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                              onClick={() => setActiveMenuId(null)}
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              View Full Details
                            </Link>
                            <Link
                              href={`/vendor/vehicles/${v.id}/edit`}
                              className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                              onClick={() => setActiveMenuId(null)}
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                              Edit Fleet Info
                            </Link>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setVehicleToDelete(v);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 font-medium text-left cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              Remove Vehicle
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View Alternative */}
          {!loading && viewMode === "list" && paginatedVehicles.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
              {paginatedVehicles.map((v) => (
                <div key={v.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img
                      src={v.image}
                      alt={v.model}
                      className="w-20 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div>
                      <Link href={`/vendor/vehicles/${v.id}`} className="font-extrabold text-sm text-slate-900 hover:text-blue-600">
                        {v.model}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-bold text-slate-700">{v.vehicleNumber}</span>
                        <span>•</span>
                        <span>{v.type}</span>
                        <span>•</span>
                        <span>{v.seatingCapacity} Seats</span>
                        <span>•</span>
                        <span>{v.transmission}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {v.driverName ? `Chauffeur: ${v.driverName}` : <span className="text-rose-600 font-bold">Chauffeur: Not Assigned</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadgeStyle(v.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(v.status)}`} />
                        {v.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/vendor/vehicles/${v.id}`} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">
                        View
                      </Link>
                      <Link href={`/vendor/vehicles/${v.id}/edit`} className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls Matching Screenshot */}
          {!loading && filteredVehicles.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200/80">
              <div className="flex items-center gap-1 mx-auto sm:mx-0">
                {/* Previous Button */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pg
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                {totalPages > 5 && (
                  <>
                    <span className="px-1 text-slate-400 font-bold">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold border border-slate-200 transition-all cursor-pointer ${
                        currentPage === totalPages ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                {/* Next Button */}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Showing X - Y of Z text */}
              <div className="text-xs font-semibold text-slate-500 text-center sm:text-right">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredVehicles.length)} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} of {filteredVehicles.length} vehicles
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
