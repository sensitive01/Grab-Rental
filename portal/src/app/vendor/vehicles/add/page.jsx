"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Car, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Sparkles
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";

export default function AddVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    vehicleType: "SUV",
    vehicleModel: "Toyota Innova Crysta 2.4 GX",
    vehicleNumber: "TN-38-XY-9900",
    registrationNumber: "TN382024009900",
    seatingCapacity: 7,
    fuelType: "Diesel",
    acType: "Dual AC",
    year: 2024,
    insuranceExpiry: "2027-04-30",
    permitExpiry: "2027-02-28",
    fitnessExpiry: "2027-08-15",
    dailyRate: 3600,
    perKmRate: 16,
    status: "Available",
    currentLocation: "Peelamedu Hub, Coimbatore"
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
      setToastMessage("Vehicle successfully registered and added to fleet!");
      setTimeout(() => {
        router.push("/vendor/vehicles");
      }, 1000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header & Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: "Vehicles", href: "/vendor/vehicles" }, { label: "Add Vehicle" }]} />
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Add New Fleet Vehicle
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Register commercial car, van, tempo traveller or tourist coach to your fleet roster.
            </p>
          </div>
          <Link
            href="/vendor/vehicles"
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Link>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Card 1: Basic Specifications */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Vehicle Classification & Model</h2>
              <p className="text-xs text-slate-500">Commercial make, capacity, and registration particulars</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Vehicle Type *</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              >
                <option value="Sedan">Sedan (4 Seater)</option>
                <option value="SUV">SUV (6-7 Seater)</option>
                <option value="Hatchback">Hatchback (4 Seater)</option>
                <option value="Van">Van (Force Urbania 9-13 Seater)</option>
                <option value="Tempo Traveller">Tempo Traveller (12-17 Seater)</option>
                <option value="Mini Bus">Mini Bus (21-26 Seater)</option>
                <option value="Bus">Bus / Tourist Coach (36-45 Seater)</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700">Vehicle Make & Model *</label>
              <input
                type="text"
                required
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleChange}
                placeholder="e.g. Toyota Innova Crysta 2.4 VX"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Vehicle Plate Number *</label>
              <input
                type="text"
                required
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                placeholder="e.g. TN-38-AB-1234"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Registration Number (RTO) *</label>
              <input
                type="text"
                required
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="e.g. TN382024001234"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Seating Capacity (Excl. Driver) *</label>
              <input
                type="number"
                required
                min="1"
                max="60"
                name="seatingCapacity"
                value={formData.seatingCapacity}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Fuel Type *</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              >
                <option value="Diesel">Diesel</option>
                <option value="Petrol">Petrol</option>
                <option value="Petrol Hybrid">Petrol Hybrid</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric (EV)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Air Conditioning *</label>
              <select
                name="acType"
                value={formData.acType}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              >
                <option value="Dual AC">Dual AC (Front & Rear)</option>
                <option value="Climate Control">Automatic Climate Control</option>
                <option value="AC">Standard AC</option>
                <option value="Individual Vents">Individual Passenger Vents (Bus/Van)</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Manufacturing Year *</label>
              <input
                type="number"
                min="2015"
                max="2026"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

          </div>
        </div>

        {/* Card 2: Compliance & Legal Expiry Dates */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Commercial Permits & Validity Dates</h2>
              <p className="text-xs text-slate-500">Ensure statutory compliance to prevent dispatch blocks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Commercial Insurance Expiry *</label>
              <input
                type="date"
                required
                name="insuranceExpiry"
                value={formData.insuranceExpiry}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Tourist Permit Expiry (AITP) *</label>
              <input
                type="date"
                required
                name="permitExpiry"
                value={formData.permitExpiry}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Fitness Certificate (FC) Expiry *</label>
              <input
                type="date"
                required
                name="fitnessExpiry"
                value={formData.fitnessExpiry}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Document Uploads & Photos */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Document Uploads & Fleet Photos</h2>
              <p className="text-xs text-slate-500">Upload PDF or JPG documents for platform verification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            
            {/* RC Upload Box */}
            <div className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-5 text-center space-y-2 cursor-pointer transition-colors bg-slate-50/50">
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-800">Vehicle RC Copy</p>
              <p className="text-[11px] text-slate-400">PDF, JPG up to 5MB</p>
              <span className="inline-block text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Browse File
              </span>
            </div>

            {/* Insurance Upload Box */}
            <div className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-5 text-center space-y-2 cursor-pointer transition-colors bg-slate-50/50">
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-800">Insurance Certificate</p>
              <p className="text-[11px] text-slate-400">PDF, JPG up to 5MB</p>
              <span className="inline-block text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Browse File
              </span>
            </div>

            {/* Photos Upload Box */}
            <div className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-5 text-center space-y-2 cursor-pointer transition-colors bg-slate-50/50">
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-800">Vehicle Exterior Photos</p>
              <p className="text-[11px] text-slate-400">Front, Side, Interior</p>
              <span className="inline-block text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Upload 3 Photos
              </span>
            </div>

          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/vendor/vehicles"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                Registering Vehicle...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Register & Activate Vehicle
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
