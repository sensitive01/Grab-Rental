"use client";

import { useState, useRef } from "react";
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
  Sparkles,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";
import NumberPlate from "@/components/ui/NumberPlate";
import { axiosClient } from "@/lib/axiosClient";
import { uploadSignedToCloudinary } from "@/lib/cloudinary";

export default function AddVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  // File input refs
  const photoInputRef = useRef(null);
  const rcInputRef = useRef(null);
  const insuranceInputRef = useRef(null);

  // Upload progress states
  const [uploading, setUploading] = useState({
    photo: false,
    rc: false,
    insurance: false
  });

  // Local file previews / names
  const [fileDetails, setFileDetails] = useState({
    photoPreview: null,
    photoName: "",
    rcName: "",
    insuranceName: ""
  });

  const [formData, setFormData] = useState({
    vehicleType: "SUV",
    vehicleModel: "",
    vehicleNumber: "",
    registrationNumber: "",
    seatingCapacity: 7,
    fuelType: "Diesel",
    acType: "Dual AC",
    year: new Date().getFullYear(),
    insuranceExpiry: "",
    permitExpiry: "",
    fitnessExpiry: "",
    dailyRate: "",
    perKmRate: "",
    currentLocation: "",
    imageUrl: "",
    rcDocumentUrl: "",
    insuranceDocumentUrl: "",
    permitDocumentUrl: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set local preview if it's an image
    if (type === "photo") {
      const localUrl = URL.createObjectURL(file);
      setFileDetails((prev) => ({ ...prev, photoPreview: localUrl, photoName: file.name }));
    } else if (type === "rc") {
      setFileDetails((prev) => ({ ...prev, rcName: file.name }));
    } else if (type === "insurance") {
      setFileDetails((prev) => ({ ...prev, insuranceName: file.name }));
    }

    setUploading((prev) => ({ ...prev, [type]: true }));

    try {
      const folder = type === "photo" ? "grabrentals/vehicles" : "grabrentals/documents";
      const uploadedUrl = await uploadSignedToCloudinary(file, folder);

      if (uploadedUrl) {
        if (type === "photo") {
          setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
        } else if (type === "rc") {
          setFormData((prev) => ({ ...prev, rcDocumentUrl: uploadedUrl }));
        } else if (type === "insurance") {
          setFormData((prev) => ({ ...prev, insuranceDocumentUrl: uploadedUrl }));
        }
        setToast({ message: `${type.toUpperCase()} file uploaded securely!`, type: "success" });
      }
    } catch (err) {
      console.error(`Failed to upload ${type}:`, err);
      setToast({ message: `Upload failed: ${err.message || "Could not reach storage"}`, type: "error" });
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    // Client-side required field validations
    if (!formData.vehicleModel?.trim()) {
      setToast({ message: "Please enter Vehicle Make & Model", type: "error" });
      setLoading(false);
      return;
    }

    if (!formData.vehicleNumber?.trim()) {
      setToast({ message: "Please enter Vehicle Plate Number (e.g. TN-38-XY-9900)", type: "error" });
      setLoading(false);
      return;
    }

    if (!formData.dailyRate || Number(formData.dailyRate) <= 0) {
      setToast({ message: "Please enter a Daily Base Rate (₹) greater than 0", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        vehicleType: formData.vehicleType,
        vehicleModel: formData.vehicleModel.trim(),
        vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
        registrationNumber: formData.registrationNumber?.trim() ? formData.registrationNumber.trim().toUpperCase() : null,
        seatingCapacity: Number(formData.seatingCapacity) || 4,
        fuelType: formData.fuelType || "Diesel",
        acType: formData.acType || "Dual AC",
        year: Number(formData.year) || new Date().getFullYear(),
        insuranceExpiry: formData.insuranceExpiry || null,
        permitExpiry: formData.permitExpiry || null,
        fitnessExpiry: formData.fitnessExpiry || null,
        dailyRate: Number(formData.dailyRate),
        perKmRate: Number(formData.perKmRate || 0),
        currentLocation: formData.currentLocation?.trim() || "Deployment Hub",
        imageUrl: formData.imageUrl || null,
        rcDocumentUrl: formData.rcDocumentUrl || null,
        insuranceDocumentUrl: formData.insuranceDocumentUrl || null,
        permitDocumentUrl: formData.permitDocumentUrl || null
      };

      const res = await axiosClient.post("/api/fleet/vehicles", payload);

      if (res.data?.success) {
        setToast({
          message: `Vehicle ${payload.vehicleNumber} registered successfully!`,
          type: "success"
        });
        setTimeout(() => {
          router.push("/vendor/vehicles");
        }, 1200);
      } else {
        setToast({
          message: res.data?.message || "Failed to register vehicle",
          type: "error"
        });
      }
    } catch (err) {
      console.error("Vehicle registration error:", err);
      let errMsg = err.response?.data?.message || err.message || "Failed to register vehicle";
      
      // Extract specific field errors if backend returned a validation map
      if (err.response?.data?.data && typeof err.response.data.data === "object") {
        const errorList = Object.values(err.response.data.data).filter(Boolean);
        if (errorList.length > 0) {
          errMsg = errorList.join(" • ");
        }
      }
      
      setToast({
        message: errMsg,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
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

      {/* Main Form & Side Space Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Input Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Basic Specifications */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
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
                <label className="font-bold text-slate-700">Registration Number (RTO)</label>
                <input
                  type="text"
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
                  min="2010"
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
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold shrink-0">
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
                <label className="font-bold text-slate-700">Tourist Permit Expiry (AITP)</label>
                <input
                  type="date"
                  name="permitExpiry"
                  value={formData.permitExpiry}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Fitness Certificate (FC) Expiry</label>
                <input
                  type="date"
                  name="fitnessExpiry"
                  value={formData.fitnessExpiry}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Rates & Deployment Hub */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Base Rates & Operational Hub</h2>
                <p className="text-xs text-slate-500">Commercial billing rates and deployment garage location</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Daily Base Rate (₹) *</label>
                <input
                  type="number"
                  required
                  min="500"
                  step="50"
                  name="dailyRate"
                  value={formData.dailyRate}
                  onChange={handleChange}
                  placeholder="e.g. 3600"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Extra / Per KM Rate (₹) *</label>
                <input
                  type="number"
                  required
                  min="5"
                  step="1"
                  name="perKmRate"
                  value={formData.perKmRate}
                  onChange={handleChange}
                  placeholder="e.g. 16"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Deployment Hub / Base City *</label>
                <input
                  type="text"
                  required
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleChange}
                  placeholder="e.g. Peelamedu Hub, Coimbatore"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Document Uploads & Photos */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Document Uploads & Fleet Photos</h2>
                <p className="text-xs text-slate-500">Securely uploaded to Cloudinary CDN for platform verification</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              
              {/* RC Upload Box */}
              <input 
                type="file" 
                ref={rcInputRef} 
                onChange={(e) => handleFileUpload("rc", e)}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden" 
              />
              <div 
                onClick={() => !uploading.rc && rcInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center space-y-2 cursor-pointer transition-colors ${
                  formData.rcDocumentUrl 
                    ? "border-emerald-500 bg-emerald-50/30" 
                    : "border-slate-200 hover:border-amber-400 bg-slate-50/50"
                }`}
              >
                {uploading.rc ? (
                  <Loader2 className="w-6 h-6 text-amber-500 mx-auto animate-spin" />
                ) : formData.rcDocumentUrl ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                ) : (
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                )}
                <p className="font-bold text-slate-800">Vehicle RC Copy</p>
                <p className="text-[11px] text-slate-400 truncate max-w-[180px] mx-auto">
                  {fileDetails.rcName || "PDF, JPG up to 10MB"}
                </p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                  formData.rcDocumentUrl
                    ? "text-emerald-700 bg-emerald-100 border-emerald-300"
                    : "text-amber-600 bg-amber-50 border-amber-200"
                }`}>
                  {uploading.rc ? "Uploading..." : formData.rcDocumentUrl ? "Uploaded" : "Browse File"}
                </span>
              </div>

              {/* Insurance Upload Box */}
              <input 
                type="file" 
                ref={insuranceInputRef} 
                onChange={(e) => handleFileUpload("insurance", e)}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden" 
              />
              <div 
                onClick={() => !uploading.insurance && insuranceInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center space-y-2 cursor-pointer transition-colors ${
                  formData.insuranceDocumentUrl 
                    ? "border-emerald-500 bg-emerald-50/30" 
                    : "border-slate-200 hover:border-amber-400 bg-slate-50/50"
                }`}
              >
                {uploading.insurance ? (
                  <Loader2 className="w-6 h-6 text-amber-500 mx-auto animate-spin" />
                ) : formData.insuranceDocumentUrl ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                ) : (
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                )}
                <p className="font-bold text-slate-800">Insurance Certificate</p>
                <p className="text-[11px] text-slate-400 truncate max-w-[180px] mx-auto">
                  {fileDetails.insuranceName || "PDF, JPG up to 10MB"}
                </p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                  formData.insuranceDocumentUrl
                    ? "text-emerald-700 bg-emerald-100 border-emerald-300"
                    : "text-amber-600 bg-amber-50 border-amber-200"
                }`}>
                  {uploading.insurance ? "Uploading..." : formData.insuranceDocumentUrl ? "Uploaded" : "Browse File"}
                </span>
              </div>

              {/* Photos Upload Box */}
              <input 
                type="file" 
                ref={photoInputRef} 
                onChange={(e) => handleFileUpload("photo", e)}
                accept="image/*"
                className="hidden" 
              />
              <div 
                onClick={() => !uploading.photo && photoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center space-y-2 cursor-pointer transition-colors ${
                  formData.imageUrl 
                    ? "border-emerald-500 bg-emerald-50/30" 
                    : "border-slate-200 hover:border-amber-400 bg-slate-50/50"
                }`}
              >
                {uploading.photo ? (
                  <Loader2 className="w-6 h-6 text-amber-500 mx-auto animate-spin" />
                ) : formData.imageUrl ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400 mx-auto" />
                )}
                <p className="font-bold text-slate-800">Vehicle Exterior Photo</p>
                <p className="text-[11px] text-slate-400 truncate max-w-[180px] mx-auto">
                  {fileDetails.photoName || "PNG, JPG for Preview"}
                </p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                  formData.imageUrl
                    ? "text-emerald-700 bg-emerald-100 border-emerald-300"
                    : "text-amber-600 bg-amber-50 border-amber-200"
                }`}>
                  {uploading.photo ? "Uploading..." : formData.imageUrl ? "Photo Uploaded" : "Upload Photo"}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Right 1 Column: Side Space Panels (Preview & Actions) */}
        <div className="space-y-6 lg:sticky lg:top-20">
          
          {/* Side Card 1: Live Vehicle Fleet Preview */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Live Vehicle Preview</h3>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {formData.vehicleType || "Asset"}
              </span>
            </div>

            <div className="space-y-3">
              {/* Photo Banner if available */}
              {(fileDetails.photoPreview || formData.imageUrl) && (
                <div className="relative h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img 
                    src={fileDetails.photoPreview || formData.imageUrl} 
                    alt="Vehicle preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                    Live Photo
                  </span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <NumberPlate number={formData.vehicleNumber || "TN-00-XX-0000"} />
                  <span className="text-[10px] text-slate-400 font-bold">
                    {formData.year} Model
                  </span>
                </div>
                <h4 className="text-sm font-black tracking-tight line-clamp-1">
                  {formData.vehicleModel || "Vehicle Make & Model"}
                </h4>
                <p className="text-xs text-slate-400">
                  {formData.currentLocation || "Base Hub / Operational City"}
                </p>
              </div>

              {/* Spec Badges Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2">
                  <span className="text-base">💺</span>
                  <div>
                    <p className="text-[10px] text-slate-400">Capacity</p>
                    <p className="font-bold text-slate-800">{formData.seatingCapacity} Seater</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2">
                  <span className="text-base">⛽</span>
                  <div>
                    <p className="text-[10px] text-slate-400">Fuel</p>
                    <p className="font-bold text-slate-800">{formData.fuelType}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2">
                  <span className="text-base">❄️</span>
                  <div>
                    <p className="text-[10px] text-slate-400">Cooling</p>
                    <p className="font-bold text-slate-800">{formData.acType}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-2">
                  <span className="text-base">🏷️</span>
                  <div>
                    <p className="text-[10px] text-slate-400">Daily Rate</p>
                    <p className="font-bold text-amber-600">₹{Number(formData.dailyRate || 0).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>

              {/* Permit Expiry Summary */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Commercial Insurance:</span>
                  <span className="font-semibold text-slate-800">{formData.insuranceExpiry || "Pending"}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Tourist Permit (AITP):</span>
                  <span className="font-semibold text-slate-800">{formData.permitExpiry || "Pending"}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Side Card 2: Quick Action & Registration Controls */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Registration Controls
            </h3>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || uploading.photo || uploading.rc || uploading.insurance}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering Vehicle...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Register & Activate Vehicle
                  </>
                )}
              </button>

              <Link
                href="/vendor/vehicles"
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                Cancel & Return
              </Link>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Fast-Track Verification</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Vehicle documents are verified by Grab-Rental operations team within 2 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Side Card 3: Commercial Compliance Checklist */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Compliance Checklist
            </h3>
            
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>Commercial Yellow Board Registration</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>Active All-India Tourist Permit (AITP)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>Commercial Passenger Taxi Insurance</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>Speed governor & fitness certificate</span>
              </li>
            </ul>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Need assistance? Call Partner SOS helpline <span className="font-bold text-slate-700">+91 1800 209 8899</span>
            </div>
          </div>

        </div>

      </form>
    </div>
  );
}
