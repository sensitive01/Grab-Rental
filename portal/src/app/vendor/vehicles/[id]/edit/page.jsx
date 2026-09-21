"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Car, 
  CheckCircle2, 
  Calendar 
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";
import { mockVehicles } from "@/lib/mockData";

export default function EditVehiclePage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const vehicleId = unwrappedParams?.id || "VH-101";

  const vehicle = mockVehicles.find((v) => v.id === vehicleId) || mockVehicles[0];

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    vehicleType: vehicle.type,
    vehicleModel: vehicle.model,
    vehicleNumber: vehicle.vehicleNumber,
    seatingCapacity: vehicle.seatingCapacity,
    fuelType: vehicle.fuelType,
    acType: vehicle.acType,
    status: vehicle.status,
    currentLocation: vehicle.currentLocation,
    dailyRate: vehicle.dailyRate,
    perKmRate: vehicle.perKmRate
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setToastMessage("Vehicle details updated successfully!");
      setTimeout(() => {
        router.push(`/vendor/vehicles/${vehicle.id}`);
      }, 900);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header & Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Vehicles", href: "/vendor/vehicles" },
            { label: vehicle.vehicleNumber, href: `/vendor/vehicles/${vehicle.id}` },
            { label: "Edit" }
          ]}
        />
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Edit Vehicle: {vehicle.vehicleNumber}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Update rate card, operational status, or hub location.
            </p>
          </div>
          <Link
            href={`/vendor/vehicles/${vehicle.id}`}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Link>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-slate-700">Vehicle Model</label>
            <input
              type="text"
              required
              name="vehicleModel"
              value={formData.vehicleModel}
              onChange={handleChange}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Plate Number</label>
            <input
              type="text"
              disabled
              value={formData.vehicleNumber}
              className="w-full py-2.5 px-3 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-500 cursor-not-allowed uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Operational Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
            >
              <option value="Available">Available for Dispatch</option>
              <option value="Booked">Booked</option>
              <option value="On Trip">On Active Trip</option>
              <option value="Maintenance">Under Scheduled Maintenance</option>
              <option value="Inactive">Temporarily Inactive</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Daily Base Rate (₹)</label>
            <input
              type="number"
              name="dailyRate"
              value={formData.dailyRate}
              onChange={handleChange}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Extra KM Rate (₹ / KM)</label>
            <input
              type="number"
              name="perKmRate"
              value={formData.perKmRate}
              onChange={handleChange}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-slate-700">Current Stationed Hub / Location</label>
            <input
              type="text"
              name="currentLocation"
              value={formData.currentLocation}
              onChange={handleChange}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
            />
          </div>

        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            href={`/vendor/vehicles/${vehicle.id}`}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            {loading ? "Saving Changes..." : "Save Vehicle Changes"}
          </button>
        </div>
      </form>

    </div>
  );
}
