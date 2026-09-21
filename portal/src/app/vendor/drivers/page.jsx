"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Phone, 
  Star, 
  ShieldCheck, 
  Car,
  AlertCircle
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Toast from "@/components/ui/Toast";
import { mockDrivers } from "@/lib/mockData";

export default function VendorDriversPage() {
  const [drivers, setDrivers] = useState(mockDrivers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "all" || d.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleDeleteDriver = () => {
    if (!driverToDelete) return;
    setDrivers(drivers.filter(d => d.id !== driverToDelete.id));
    setToastMessage(`Chauffeur ${driverToDelete.name} was removed.`);
    setDriverToDelete(null);
  };

  return (
    <div className="space-y-6">
      
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!driverToDelete}
        onClose={() => setDriverToDelete(null)}
        onConfirm={handleDeleteDriver}
        title="Remove Chauffeur?"
        message={`Are you sure you want to remove ${driverToDelete?.name} (${driverToDelete?.phone}) from your driver roster?`}
        confirmText="Remove Driver"
        type="danger"
      />

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs items={[{ label: "Chauffeurs" }]} />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Chauffeur & Driver Roster
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {drivers.length} Drivers
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your verified highway drivers, background verifications, and assigned vehicles.
          </p>
        </div>

        <Link
          href="/vendor/drivers/add"
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Chauffeur
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by driver name, mobile number, or license..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="on trip">On Trip</option>
            <option value="booked">Booked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Driver Name</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4">License Number</th>
                <th className="py-3.5 px-4">License Expiry</th>
                <th className="py-3.5 px-4">Assigned Vehicle</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Rating & Trips</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDrivers.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                        {d.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <Link
                          href={`/vendor/drivers/${d.id}`}
                          className="font-bold text-slate-900 hover:text-amber-600 transition-colors"
                        >
                          {d.name}
                        </Link>
                        <p className="text-[11px] text-slate-400">{d.experienceYears} Yrs Exp · {d.bloodGroup}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {d.phone}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-mono font-bold text-slate-800">
                    {d.licenseNumber}
                  </td>

                  <td className="py-4 px-4 text-slate-600">
                    {d.licenseExpiry}
                  </td>

                  <td className="py-4 px-4">
                    {d.assignedVehicle ? (
                      <span className="flex items-center gap-1 font-medium text-slate-800">
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                        {d.assignedVehicle}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <StatusBadge status={d.status} />
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 text-slate-800 font-bold">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{d.rating}</span>
                      <span className="text-[11px] text-slate-400 font-normal">({d.totalTrips} trips)</span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link
                        href={`/vendor/drivers/${d.id}`}
                        title="View Profile"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/vendor/drivers/${d.id}/edit`}
                        title="Edit Driver"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDriverToDelete(d)}
                        title="Remove Driver"
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
      </div>

    </div>
  );
}
