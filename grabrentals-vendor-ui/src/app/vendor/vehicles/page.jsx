"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Car, 
  Plus, 
  Eye, 
  Edit3, 
  Calendar, 
  Trash2, 
  Users, 
  MapPin, 
  Filter
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Toast from "@/components/ui/Toast";
import DataTable from "@/components/ui/DataTable";
import { formatINR } from "@/lib/utils";
import { axiosClient } from "@/lib/axiosClient";

export default function VendorVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchVehicles = async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        axiosClient.get("/api/fleet/vehicles"),
        axiosClient.get("/api/fleet/drivers").catch(() => ({ data: { data: [] } }))
      ]);

      const drivers = Array.isArray(driversRes.data?.data) ? driversRes.data.data : [];

      if (vehiclesRes.data?.success && Array.isArray(vehiclesRes.data?.data)) {
        const beVehicles = vehiclesRes.data.data.map((v) => {
          const matchedDriver = drivers.find((d) => d.assignedVehicleId === v.id);
          const resolvedDriverName = v.assignedDriverName || matchedDriver?.name || "Unassigned";
          const resolvedDriverPhone = v.assignedDriverPhone || matchedDriver?.phone || "";
          const resolvedDriverId = v.assignedDriverId || matchedDriver?.id || null;

          return {
            id: v.id,
            model: v.model,
            vehicleNumber: v.vehicleNumber,
            type: v.vehicleType || "SUV",
            category: v.vehicleType || "SUV",
            seatingCapacity: v.seatingCapacity,
            fuelType: v.fuelType || "Diesel",
            transmission: "Manual",
            acType: v.acType || "Dual AC",
            year: v.year || 2024,
            status: v.status === "AVAILABLE" ? "Available" : v.status === "BOOKED" ? "Booked" : v.status === "ON_TRIP" ? "On Trip" : "Maintenance",
            currentLocation: v.currentLocation || "Deployment Hub",
            driverName: resolvedDriverName,
            driverPhone: resolvedDriverPhone,
            assignedDriverId: resolvedDriverId,
            dailyRate: v.dailyRate || 3500,
            perKmRate: v.perKmRate || 15,
            insuranceExpiry: v.insuranceExpiry,
            permitExpiry: v.permitExpiry,
            fitnessExpiry: v.fitnessExpiry,
            image: v.imageUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=60"
          };
        });
        setVehicles(beVehicles);
      }
    } catch (err) {
      console.warn("Using default fleet vehicles:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Filter by Type & Status dropdowns/pills
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesType = selectedType === "all" || v.type.toLowerCase() === selectedType.toLowerCase();
      const matchesStatus = selectedStatus === "all" || v.status.toLowerCase() === selectedStatus.toLowerCase();
      return matchesType && matchesStatus;
    });
  }, [vehicles, selectedType, selectedStatus]);

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    try {
      if (typeof vehicleToDelete.id === "string" && vehicleToDelete.id.length > 20) {
        await axiosClient.delete(`/api/fleet/vehicles/${vehicleToDelete.id}`);
      }
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete.id));
      setToastMessage(`Vehicle ${vehicleToDelete.vehicleNumber} (${vehicleToDelete.model}) was removed.`);
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      setToastMessage(`Failed to delete vehicle: ${err.response?.data?.message || err.message}`);
    } finally {
      setVehicleToDelete(null);
    }
  };

  const vehicleTypes = ["All", "Sedan", "SUV", "Van", "Tempo Traveller", "Bus"];
  const statusList = ["All", "Available", "Booked", "On Trip", "Maintenance"];

  // Table Column Definitions
  const columns = useMemo(() => [
    {
      key: "model",
      label: "Vehicle",
      sortable: true,
      render: (v) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <Link 
              href={`/vendor/vehicles/${v.id}`}
              className="font-bold text-slate-900 hover:text-amber-600 transition-colors"
            >
              {v.model}
            </Link>
            <p className="text-[11px] text-slate-400">{v.year} Model</p>
          </div>
        </div>
      )
    },
    {
      key: "vehicleNumber",
      label: "Plate Number",
      sortable: true,
      className: "whitespace-nowrap",
      render: (v) => <NumberPlate number={v.vehicleNumber} />
    },
    {
      key: "type",
      label: "Category",
      sortable: true,
      className: "font-semibold text-slate-700"
    },
    {
      key: "seatingCapacity",
      label: "Capacity",
      sortable: true,
      sortValue: (v) => Number(v.seatingCapacity) || 0,
      render: (v) => (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
          <Users className="w-3.5 h-3.5 text-slate-400" /> {v.seatingCapacity} Seater
        </span>
      )
    },
    {
      key: "fuelType",
      label: "Fuel & AC",
      sortable: true,
      render: (v) => (
        <div>
          <p className="font-semibold text-slate-700">{v.fuelType}</p>
          <p className="text-[11px] text-slate-400">{v.acType}</p>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (v) => <StatusBadge status={v.status} />
    },
    {
      key: "driverName",
      label: "Assigned Driver",
      sortable: true,
      render: (v) => (
        v.driverName && v.driverName !== "Unassigned" ? (
          <div>
            <p className="font-bold text-slate-900">{v.driverName}</p>
            <p className="text-[11px] text-slate-400">{v.driverPhone}</p>
          </div>
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        )
      )
    },
    {
      key: "currentLocation",
      label: "Current Hub / Location",
      sortable: true,
      render: (v) => (
        <span className="flex items-center gap-1 text-slate-600 max-w-[180px] truncate">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{v.currentLocation}</span>
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      sortable: false,
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5">
          <Link
            href={`/vendor/vehicles/${v.id}`}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/vendor/vehicles/${v.id}/edit`}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            title="Edit Asset"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/vendor/vehicles/availability`}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-amber-50 hover:text-amber-700 text-slate-600 transition-colors"
            title="Availability Calendar"
          >
            <Calendar className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setVehicleToDelete(v)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors"
            title="Delete Vehicle"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ], []);

  // Mobile Card Renderer
  const renderMobileCard = (v) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-amber-600">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <Link 
              href={`/vendor/vehicles/${v.id}`}
              className="font-black text-slate-900 hover:text-amber-600 transition-colors text-sm block"
            >
              {v.model}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <NumberPlate number={v.vehicleNumber} />
              <span className="text-[11px] text-slate-400 font-medium">{v.year} Model</span>
            </div>
          </div>
        </div>
        <StatusBadge status={v.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Type & Capacity</p>
          <p className="font-semibold text-slate-800 mt-0.5">{v.type} · {v.seatingCapacity} Seats</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Assigned Driver</p>
          <p className="font-semibold text-slate-800 mt-0.5 truncate">
            {v.driverName && v.driverName !== "Unassigned" ? v.driverName : "Unassigned"}
          </p>
        </div>
        <div className="col-span-2 text-[11px] text-slate-500 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{v.currentLocation}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <Link
          href={`/vendor/vehicles/${v.id}`}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center"
        >
          Details
        </Link>
        <Link
          href={`/vendor/vehicles/${v.id}/edit`}
          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold text-center"
        >
          Edit
        </Link>
        <Link
          href={`/vendor/vehicles/availability`}
          className="p-2 rounded-xl border border-slate-200 hover:bg-amber-50 hover:text-amber-700 text-slate-600"
          title="Availability"
        >
          <Calendar className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={() => setVehicleToDelete(v)}
          className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!vehicleToDelete}
        onClose={() => setVehicleToDelete(null)}
        onConfirm={handleDeleteVehicle}
        title="Delete Vehicle?"
        message={`Are you sure you want to remove ${vehicleToDelete?.model} (${vehicleToDelete?.vehicleNumber}) from your active fleet? Upcoming assigned trips may be affected.`}
        confirmText="Yes, Delete Vehicle"
        type="danger"
      />

      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs items={[{ label: "Vehicles" }]} />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Fleet Vehicle Management
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {loading ? "..." : `${vehicles.length} Assets`}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your owned and leased cars, vans, tempo travellers, and buses.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:w-auto items-center">
          <Link
            href="/vendor/vehicles/availability"
            className="px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 text-center"
          >
            <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">Availability</span>
          </Link>
          <Link
            href="/vendor/vehicles/add"
            className="px-3 sm:px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 text-center"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">Add Vehicle</span>
          </Link>
        </div>
      </div>

      {/* Quick Status Pills */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 pl-1">
          Quick Filter:
        </span>
        {["All", "Available", "Booked", "On Trip", "Maintenance"].map((st) => {
          const count = loading
            ? "-"
            : st === "All" 
              ? vehicles.length 
              : vehicles.filter(v => v.status.toLowerCase() === st.toLowerCase()).length;
          const isSelected = selectedStatus === st.toLowerCase();
          return (
            <button
              key={st}
              onClick={() => setSelectedStatus(st.toLowerCase())}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Vehicles DataTable */}
      <DataTable
        columns={columns}
        data={filteredVehicles}
        keyField="id"
        loading={loading}
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        searchPlaceholder="Search model, plate (TN-38...), driver, hub..."
        searchKeys={["model", "vehicleNumber", "driverName", "type", "currentLocation"]}
        exportFileName="GrabRentals_Fleet_Vehicles"
        emptyTitle="No Fleet Vehicles Found"
        emptyDescription="No vehicles matched your search filters. Try adjusting your query or click 'Add Vehicle' above."
        renderMobileCard={renderMobileCard}
        filters={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs focus:outline-hidden cursor-pointer"
              >
                {vehicleTypes.map((t) => (
                  <option key={t} value={t.toLowerCase()}>
                    {t === "All" ? "All Categories" : t}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs focus:outline-hidden cursor-pointer"
            >
              {statusList.map((s) => (
                <option key={s} value={s.toLowerCase()}>
                  {s === "All" ? "All Statuses" : s}
                </option>
              ))}
            </select>
          </div>
        }
      />

    </div>
  );
}
