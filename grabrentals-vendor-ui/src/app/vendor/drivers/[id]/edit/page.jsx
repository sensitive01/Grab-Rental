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

  const assignedVehicle = mockVehicles.find(v => v.id === formData.assignedVehicleId);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <Breadcrumbs
            items={[
              { label: "Chauffeurs", href: "/vendor/drivers" },
              { label: driver.name, href: `/vendor/drivers/${driver.id}` },
              { label: "Edit" }
            ]}
          />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Edit Chauffeur: {driver.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Update contact info, assigned vehicle, or operational availability.
          </p>
        </div>
        <Link
          href={`/vendor/drivers/${driver.id}`}
          className="self-start sm:self-auto px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Edit Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  Chauffeur Particulars & Roster Assignment
                </h2>
                <p className="text-xs text-slate-500">Maintain contact information, emergency phone, and dedicated vehicle.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Driver Name *</label>
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
                  <label className="font-bold text-slate-700">Primary Phone *</label>
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
                  <label className="font-bold text-slate-700">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="Available">Available for Dispatch</option>
                    <option value="On Trip">On Active Trip</option>
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
                    <option value="">-- Unassigned (Floating) --</option>
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
            </div>
          </div>

          {/* Right Side Panel (1 col) */}
          <div className="space-y-6 lg:sticky lg:top-20">
            {/* Live Chauffeur Card Preview */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Live Preview</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  formData.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  formData.status === 'On Trip' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  formData.status === 'Booked' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                  'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {formData.status}
                </span>
              </div>
              
              <div className="pt-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 font-black text-base flex items-center justify-center shrink-0">
                  {formData.name ? formData.name.split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase() : "DR"}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 leading-tight truncate">
                    {formData.name || "Chauffeur Name"}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {formData.phone || "+91 00000 00000"}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Chauffeur ID:</span>
                  <span className="font-mono font-bold text-slate-800">{driver.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dedicated Vehicle:</span>
                  <span className="font-bold text-slate-800">
                    {assignedVehicle ? `${assignedVehicle.model} (${assignedVehicle.vehicleNumber})` : "Floating"}
                  </span>
                </div>
              </div>
            </div>

            {/* Save & Action Controls */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Action Controls
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Save modifications to update dispatcher roster records across platform trips.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Saving Changes..." : "Save Driver Changes"}
              </button>
              <Link
                href={`/vendor/drivers/${driver.id}`}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center text-center"
              >
                Cancel
              </Link>
            </div>
          </div>

        </div>
      </form>

    </div>
  );
}
