"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Users, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Phone, 
  Star, 
  Car,
  Filter
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Toast from "@/components/ui/Toast";
import DataTable from "@/components/ui/DataTable";
import { axiosClient } from "@/lib/axiosClient";

export default function VendorDriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/api/fleet/drivers");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setDrivers(res.data.data);
      }
    } catch (err) {
      console.warn("Could not fetch drivers from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      return selectedStatus === "all" || (d.status || "").toLowerCase() === selectedStatus.toLowerCase();
    });
  }, [drivers, selectedStatus]);

  const handleDeleteDriver = async () => {
    if (!driverToDelete) return;
    try {
      await axiosClient.delete(`/api/fleet/drivers/${driverToDelete.id}`);
      setDrivers(prev => prev.filter(d => d.id !== driverToDelete.id));
      setToastMessage(`Chauffeur ${driverToDelete.name} was removed from your roster.`);
    } catch (err) {
      console.error("Failed to delete driver:", err);
      setToastMessage(err.response?.data?.message || "Failed to remove chauffeur.");
    } finally {
      setDriverToDelete(null);
    }
  };

  // Table Columns Definition
  const columns = useMemo(() => [
    {
      key: "name",
      label: "Driver Name",
      sortable: true,
      render: (d) => (
        <div className="flex items-center gap-3">
          {d.photoUrl ? (
            <img 
              src={d.photoUrl} 
              alt={d.name} 
              className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200" 
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
              {d.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <Link
              href={`/vendor/drivers/${d.id}`}
              className="font-bold text-slate-900 hover:text-amber-600 transition-colors"
            >
              {d.name}
            </Link>
            <p className="text-[11px] text-slate-400">{d.experienceYears} Yrs Exp · {d.bloodGroup || "N/A"}</p>
          </div>
        </div>
      )
    },
    {
      key: "phone",
      label: "Contact Phone",
      sortable: true,
      render: (d) => (
        <span className="flex items-center gap-1 font-semibold text-slate-700">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          {d.phone}
        </span>
      )
    },
    {
      key: "licenseNumber",
      label: "License Number",
      sortable: true,
      className: "font-mono font-bold text-slate-800"
    },
    {
      key: "licenseExpiry",
      label: "License Expiry",
      sortable: true,
      className: "text-slate-600"
    },
    {
      key: "assignedVehicle",
      label: "Assigned Vehicle",
      sortable: true,
      render: (d) => (
        d.assignedVehicle ? (
          <span className="flex items-center gap-1 font-medium text-slate-800">
            <Car className="w-3.5 h-3.5 text-slate-400" />
            {d.assignedVehicle}
          </span>
        ) : (
          <span className="text-slate-400 italic">Floating / Unassigned</span>
        )
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (d) => <StatusBadge status={d.status} />
    },
    {
      key: "rating",
      label: "Rating & Trips",
      sortable: true,
      sortValue: (d) => Number(d.rating) || 5.0,
      render: (d) => (
        <div className="flex items-center gap-1 text-slate-800 font-bold">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{d.rating || "5.0"}</span>
          <span className="text-[11px] text-slate-400 font-normal">({d.totalTrips || 0} trips)</span>
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      sortable: false,
      render: (d) => (
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
            title="Edit Chauffeur"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 text-slate-600 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setDriverToDelete(d)}
            title="Remove Driver"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ], []);

  // Mobile Card Renderer
  const renderMobileCard = (d) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {d.photoUrl ? (
            <img 
              src={d.photoUrl} 
              alt={d.name} 
              className="w-11 h-11 rounded-2xl object-cover shrink-0 border border-slate-200" 
            />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
              {d.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <Link
              href={`/vendor/drivers/${d.id}`}
              className="font-black text-slate-900 hover:text-amber-600 transition-colors text-sm block"
            >
              {d.name}
            </Link>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>{d.experienceYears} Years Exp</span>
              <span>·</span>
              <span className="flex items-center gap-0.5 text-slate-700 font-bold">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                {d.rating || "5.0"}
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={d.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Contact</p>
          <p className="font-semibold text-slate-800 mt-0.5">{d.phone}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Commercial DL</p>
          <p className="font-semibold font-mono text-slate-800 mt-0.5">{d.licenseNumber}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Assigned Fleet Asset</p>
          <p className="font-semibold text-slate-800 mt-0.5">
            {d.assignedVehicle || "Floating / Unassigned"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <Link
          href={`/vendor/drivers/${d.id}`}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center transition-colors"
        >
          View Profile
        </Link>
        <Link
          href={`/vendor/drivers/${d.id}/edit`}
          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-amber-50 hover:text-amber-800 text-slate-700 text-xs font-bold text-center transition-colors"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => setDriverToDelete(d)}
          className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors"
          title="Remove Driver"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

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
              {loading ? "..." : `${drivers.length} Drivers`}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your verified highway drivers, background verifications, and assigned vehicles.
          </p>
        </div>

        <Link
          href="/vendor/drivers/add"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 shrink-0 text-center"
        >
          <Plus className="w-4 h-4" /> Add Chauffeur
        </Link>
      </div>

      {/* Main Drivers DataTable */}
      <DataTable
        columns={columns}
        data={filteredDrivers}
        keyField="id"
        loading={loading}
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        searchPlaceholder="Search driver name, phone, license..."
        searchKeys={["name", "phone", "licenseNumber", "assignedVehicle", "status"]}
        exportFileName="GrabRentals_Drivers_Roster"
        emptyTitle="No Chauffeurs Found"
        emptyDescription="You haven't registered any chauffeurs in your roster or no drivers match your criteria."
        renderMobileCard={renderMobileCard}
        filters={
          <div className="flex items-center gap-1.5 text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="booked">Booked</option>
              <option value="off_duty">Off Duty</option>
            </select>
          </div>
        }
      />

    </div>
  );
}
