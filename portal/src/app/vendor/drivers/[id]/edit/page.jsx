"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Users, 
  CheckCircle2, 
  Calendar 
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";
import { mockDrivers, mockVehicles } from "@/lib/mockData";

export default function EditDriverPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const driverId = unwrappedParams?.id || "DRV-101";

  const driver = mockDrivers.find(d => d.id === driverId) || mockDrivers[0];

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: driver.name,
    phone: driver.phone,
    email: driver.email,
    address: driver.address,
    emergencyContact: driver.emergencyContact,
    assignedVehicleId: driver.assignedVehicleId || "",
    status: driver.status
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setToastMessage("Chauffeur details updated successfully!");
      setTimeout(() => {
        router.push(`/vendor/drivers/${driver.id}`);
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
            { label: "Chauffeurs", href: "/vendor/drivers" },
            { label: driver.name, href: `/vendor/drivers/${driver.id}` },
            { label: "Edit" }
          ]}
        />
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Edit Chauffeur: {driver.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Update contact info, assigned vehicle, or operational availability.
            </p>
          </div>
          <Link
            href={`/vendor/drivers/${driver.id}`}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Driver Name</label>
            <input
              type="text"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Primary Phone</label>
            <input
              type="text"
              required
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
            >
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Booked">Booked</option>
              <option value="Inactive">Inactive / On Leave</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Assigned Vehicle</label>
            <select
              name="assignedVehicleId"
              value={formData.assignedVehicleId}
              onChange={handleChange}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
            >
              <option value="">-- Unassigned --</option>
              {mockVehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.model} ({v.vehicleNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-slate-700">Residential Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-slate-700">Emergency Contact</label>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
            />
          </div>

        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            href={`/vendor/drivers/${driver.id}`}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            {loading ? "Saving Changes..." : "Save Driver Changes"}
          </button>
        </div>
      </form>

    </div>
  );
}
