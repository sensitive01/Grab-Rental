"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Users, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  FileText 
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";
import { mockVehicles } from "@/lib/mockData";

export default function AddDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: "Senthil Nathan",
    phone: "+91 98421 99880",
    email: "senthil.n@kaveritravels.in",
    address: "24, Anna Nagar, Peelamedu, Coimbatore - 641004",
    licenseNumber: "TN38 20180004521",
    licenseExpiry: "2033-05-20",
    dob: "1990-04-18",
    experienceYears: 9,
    emergencyContact: "Vimala (+91 98421 99889)",
    bloodGroup: "B+",
    assignedVehicleId: "",
    status: "Available"
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
      setToastMessage("Chauffeur added to roster successfully!");
      setTimeout(() => {
        router.push("/vendor/drivers");
      }, 1000);
    }, 800);
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
            { label: "Add Chauffeur" }
          ]}
        />
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Add New Chauffeur
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Register verified commercial driver with license particulars and contact details.
            </p>
          </div>
          <Link
            href="/vendor/drivers"
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Personal & Contact Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Personal & Contact Information</h2>
              <p className="text-xs text-slate-500">Driver identity and emergency communication</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Full Legal Name *</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Primary Mobile Number *</label>
              <input
                type="text"
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98450 12345"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="driver@company.in"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Date of Birth *</label>
              <input
                type="date"
                required
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Driving Experience (Years) *</label>
              <input
                type="number"
                required
                min="1"
                max="40"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              >
                <option value="O+">O Positive (O+)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="O-">O Negative (O-)</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700">Residential Address *</label>
              <input
                type="text"
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Emergency Contact Name & Phone *</label>
              <input
                type="text"
                required
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Spouse / Parent (+91...)"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

          </div>
        </div>

        {/* Professional License & Vehicle Assignment */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Commercial License & Fleet Assignment</h2>
              <p className="text-xs text-slate-500">Commercial transport endorsement and vehicle pairing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Driving License Number *</label>
              <input
                type="text"
                required
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="TN38 20180004521"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">License Expiry Date *</label>
              <input
                type="date"
                required
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Assign to Vehicle</label>
              <select
                name="assignedVehicleId"
                value={formData.assignedVehicleId}
                onChange={handleChange}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
              >
                <option value="">-- Leave Unassigned --</option>
                {mockVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.model} ({v.vehicleNumber})
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Upload License Document Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-5 text-center space-y-2 cursor-pointer transition-colors bg-slate-50/50">
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-800 text-xs">Driving License Document Copy</p>
              <p className="text-[11px] text-slate-400">Front & Back (PDF or JPG)</p>
              <span className="inline-block text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Upload License File
              </span>
            </div>

            <div className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-5 text-center space-y-2 cursor-pointer transition-colors bg-slate-50/50">
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-800 text-xs">Driver Photo for Badge</p>
              <p className="text-[11px] text-slate-400">Passport style portrait</p>
              <span className="inline-block text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Upload Photo
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/vendor/drivers"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            {loading ? "Adding Chauffeur..." : "Save & Activate Chauffeur"}
          </button>
        </div>

      </form>
    </div>
  );
}
