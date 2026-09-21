"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Calendar, 
  Trash2, 
  Fuel, 
  Users, 
  MapPin, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Toast from "@/components/ui/Toast";
import { mockVehicles } from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function VendorVehiclesPage() {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = 
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.driverName && v.driverName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === "all" || v.type.toLowerCase() === selectedType.toLowerCase();
    const matchesStatus = selectedStatus === "all" || v.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDeleteVehicle = () => {
    if (!vehicleToDelete) return;
    setVehicles(vehicles.filter((v) => v.id !== vehicleToDelete.id));
    setToastMessage(`Vehicle ${vehicleToDelete.vehicleNumber} (${vehicleToDelete.model}) was removed.`);
    setVehicleToDelete(null);
  };

  const vehicleTypes = ["All", "Sedan", "SUV", "Van", "Tempo Traveller", "Bus"];
  const statusList = ["All", "Available", "Booked", "On Trip", "Maintenance"];

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
              {vehicles.length} Assets
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your owned and leased cars, vans, tempo travellers, and buses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/vendor/vehicles/availability"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-amber-500" /> Availability Calendar
          </Link>
          <Link
            href="/vendor/vehicles/add"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by model, registration (TN-38...), or assigned driver..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Type Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              {vehicleTypes.map((t) => (
                <option key={t} value={t.toLowerCase()}>
                  {t === "All" ? "All Vehicle Types" : t}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              {statusList.map((s) => (
                <option key={s} value={s.toLowerCase()}>
                  {s === "All" ? "All Statuses" : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick status pill counters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Quick Filter:
          </span>
          {["All", "Available", "Booked", "On Trip", "Maintenance"].map((st) => {
            const count = st === "All" 
              ? vehicles.length 
              : vehicles.filter(v => v.status.toLowerCase() === st.toLowerCase()).length;
            const isSelected = selectedStatus === st.toLowerCase();
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st.toLowerCase())}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Vehicle Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredVehicles.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Car className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-black text-slate-800">No Vehicles Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No vehicles matched your search filters. Try adjusting your query or add a new vehicle to your fleet.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedType("all");
                setSelectedStatus("all");
              }}
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Number</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Capacity</th>
                  <th className="py-3.5 px-4">Fuel & AC</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Driver</th>
                  <th className="py-3.5 px-4">Current Hub / Location</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
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
                          <p className="text-[11px] text-slate-400">{v.year} Model · {v.odometer}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-black text-slate-900 font-mono tracking-tight">
                      <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200">
                        {v.vehicleNumber}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {v.type}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> {v.seatingCapacity} Seater
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <p className="font-semibold">{v.fuelType}</p>
                      <p className="text-[11px] text-slate-400">{v.acType}</p>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={v.status} />
                    </td>

                    <td className="py-4 px-4">
                      {v.driverName && v.driverName !== "Unassigned" ? (
                        <div>
                          <p className="font-bold text-slate-900">{v.driverName}</p>
                          <p className="text-[11px] text-slate-400">{v.driverPhone}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-slate-600 max-w-[180px] truncate">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{v.currentLocation}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/vendor/vehicles/${v.id}`}
                          title="View Details"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/vendor/vehicles/${v.id}/edit`}
                          title="Edit Vehicle"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/vendor/vehicles/availability`}
                          title="Block Dates"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-amber-50 hover:text-amber-700 text-slate-600 transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setVehicleToDelete(v)}
                          title="Delete Vehicle"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
