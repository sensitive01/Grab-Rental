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
import NumberPlate from "@/components/ui/NumberPlate";
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
    <div className="max-w-7xl mx-auto space-y-6">
      
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <Breadcrumbs
            items={[
              { label: "Vehicles", href: "/vendor/vehicles" },
              { label: vehicle.vehicleNumber, href: `/vendor/vehicles/${vehicle.id}` },
              { label: "Edit" }
            ]}
          />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Edit Vehicle: {vehicle.vehicleNumber}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Update rate card, operational status, or hub location.
          </p>
        </div>
        <Link
          href={`/vendor/vehicles/${vehicle.id}`}
          className="self-start sm:self-auto px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Details
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Edit Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-500" />
                  Vehicle Configuration & Operational Details
                </h2>
                <p className="text-xs text-slate-500">Modify model identification, rate metrics, and depot assignment.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700">Vehicle Model *</label>
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
                  <label className="font-bold text-slate-700">Plate Number (RTO)</label>
                  <input
                    type="text"
                    disabled
                    value={formData.vehicleNumber}
                    className="w-full py-2.5 px-3 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-500 cursor-not-allowed uppercase"
                  />
                  <p className="text-[10px] text-slate-400">Plate numbers are locked to registration certificate.</p>
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
            </div>
          </div>

          {/* Right Side Panel (1 col) */}
          <div className="space-y-6 lg:sticky lg:top-20">
            {/* Live Preview Card */}
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
              
              <div className="pt-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {formData.vehicleModel || "Vehicle Model"}
                  </h3>
                  <div className="mt-1">
                    <NumberPlate number={formData.vehicleNumber} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="bg-slate-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Daily Rate</p>
                    <p className="font-black text-slate-900 mt-0.5">₹{Number(formData.dailyRate || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Per KM</p>
                    <p className="font-black text-slate-900 mt-0.5">₹{formData.perKmRate || 0}/km</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                  <span className="font-semibold text-slate-700">Stationed at:</span> {formData.currentLocation || "Not assigned"}
                </div>
              </div>
            </div>

            {/* Save & Action Controls */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Action Controls
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Modifications update the platform fleet registry immediately upon saving.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Saving Changes..." : "Save Vehicle Changes"}
              </button>
              <Link
                href={`/vendor/vehicles/${vehicle.id}`}
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
