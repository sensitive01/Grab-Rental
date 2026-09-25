"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Users, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  Loader2,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";
import { axiosClient } from "@/lib/axiosClient";
import { uploadSignedToCloudinary } from "@/lib/cloudinary";

export default function EditDriverPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const driverId = unwrappedParams?.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [toast, setToast] = useState(null);

  // Vendor's real vehicles from backend
  const [vehicles, setVehicles] = useState([]);

  // File upload states
  const licenseDocRef = useRef(null);
  const photoInputRef = useRef(null);

  const [uploading, setUploading] = useState({
    licenseDoc: false,
    photo: false,
  });

  const [fileDetails, setFileDetails] = useState({
    licenseDocName: "",
    photoName: "",
    photoPreview: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    licenseNumber: "",
    licenseExpiry: "",
    dob: "",
    experienceYears: "",
    emergencyContact: "",
    bloodGroup: "B+",
    assignedVehicleId: "",
    status: "AVAILABLE",
    licenseDocumentUrl: "",
    photoUrl: "",
  });

  // Load driver and vehicles data
  useEffect(() => {
    async function loadData() {
      if (!driverId) return;
      try {
        setFetching(true);
        setFetchError(null);

        // Fetch driver & vehicles in parallel
        const [driverRes, vehiclesRes] = await Promise.all([
          axiosClient.get(`/api/fleet/drivers/${driverId}`),
          axiosClient.get("/api/fleet/vehicles")
        ]);

        if (driverRes.data?.success && driverRes.data.data) {
          const d = driverRes.data.data;
          setFormData({
            name: d.name || "",
            phone: d.phone || "",
            email: d.email || "",
            address: d.address || "",
            licenseNumber: d.licenseNumber || "",
            licenseExpiry: d.licenseExpiry || "",
            dob: d.dob || "",
            experienceYears: d.experienceYears ?? "",
            emergencyContact: d.emergencyContact || "",
            bloodGroup: d.bloodGroup || "B+",
            assignedVehicleId: d.assignedVehicleId || "",
            status: d.status || "AVAILABLE",
            licenseDocumentUrl: d.licenseDocumentUrl || "",
            photoUrl: d.photoUrl || "",
          });

          if (d.photoUrl) {
            setFileDetails(prev => ({ ...prev, photoPreview: d.photoUrl }));
          }
        } else {
          setFetchError("Driver not found or inaccessible.");
        }

        if (vehiclesRes.data?.success && Array.isArray(vehiclesRes.data.data)) {
          setVehicles(vehiclesRes.data.data);
        }
      } catch (err) {
        console.error("Failed to load driver details:", err);
        setFetchError(err.response?.data?.message || "Failed to load chauffeur information");
      } finally {
        setFetching(false);
      }
    }

    loadData();
  }, [driverId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "photo") {
      const localPreview = URL.createObjectURL(file);
      setFileDetails((prev) => ({ ...prev, photoPreview: localPreview, photoName: file.name }));
    } else if (type === "licenseDoc") {
      setFileDetails((prev) => ({ ...prev, licenseDocName: file.name }));
    }

    setUploading((prev) => ({ ...prev, [type]: true }));

    try {
      const folder = type === "photo" ? "grabrentals/drivers/photos" : "grabrentals/drivers/documents";
      const uploadedUrl = await uploadSignedToCloudinary(file, folder);

      if (uploadedUrl) {
        if (type === "photo") {
          setFormData((prev) => ({ ...prev, photoUrl: uploadedUrl }));
        } else if (type === "licenseDoc") {
          setFormData((prev) => ({ ...prev, licenseDocumentUrl: uploadedUrl }));
        }
        setToast({ 
          message: `${type === "photo" ? "Driver photo" : "License copy"} uploaded successfully!`, 
          type: "success" 
        });
      }
    } catch (err) {
      console.error(`Upload error for ${type}:`, err);
      setToast({ 
        message: `Upload failed: ${err.message || "Could not reach storage"}`, 
        type: "error" 
      });
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);

    // Client-side validations
    if (!formData.name?.trim()) {
      setToast({ message: "Please enter the driver's full legal name", type: "error" });
      return;
    }

    if (!formData.phone?.trim()) {
      setToast({ message: "Please enter a primary mobile number", type: "error" });
      return;
    }

    if (!formData.address?.trim()) {
      setToast({ message: "Please enter the residential address", type: "error" });
      return;
    }

    if (!formData.emergencyContact?.trim()) {
      setToast({ message: "Please enter an emergency contact with relation & phone", type: "error" });
      return;
    }

    if (!formData.licenseNumber?.trim()) {
      setToast({ message: "Please enter the commercial driving license number", type: "error" });
      return;
    }

    if (!formData.licenseExpiry) {
      setToast({ message: "Please specify the driving license expiry date", type: "error" });
      return;
    }

    if (formData.experienceYears === "" || Number(formData.experienceYears) < 0) {
      setToast({ message: "Please enter driving experience in years", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || null,
        address: formData.address.trim(),
        dob: formData.dob || null,
        bloodGroup: formData.bloodGroup || "B+",
        emergencyContact: formData.emergencyContact.trim(),
        licenseNumber: formData.licenseNumber.trim().toUpperCase(),
        licenseExpiry: formData.licenseExpiry,
        experienceYears: Number(formData.experienceYears) || 0,
        assignedVehicleId: formData.assignedVehicleId || null,
        status: formData.status || "AVAILABLE",
        licenseDocumentUrl: formData.licenseDocumentUrl || null,
        photoUrl: formData.photoUrl || null,
      };

      const res = await axiosClient.put(`/api/fleet/drivers/${driverId}`, payload);

      if (res.data?.success) {
        setToast({ message: "Chauffeur details updated successfully!", type: "success" });
        setTimeout(() => {
          router.push("/vendor/drivers");
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to update driver:", err);
      const serverMessage = err.response?.data?.message || err.message || "Failed to update chauffeur";
      setToast({ message: serverMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicleObj = vehicles.find((v) => v.id === formData.assignedVehicleId);

  if (fetching) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-xs font-semibold">Loading chauffeur details from backend...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Could Not Find Chauffeur</h2>
        <p className="text-xs text-slate-500">{fetchError}</p>
        <Link
          href="/vendor/drivers"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Drivers Roster
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header & Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Chauffeurs", href: "/vendor/drivers" },
            { label: formData.name || "Driver Profile", href: `/vendor/drivers/${driverId}` },
            { label: "Edit" }
          ]}
        />
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Edit Chauffeur: {formData.name || "Driver"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Update verified commercial driver details, assigned vehicle, and badge photo.
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Driver Information */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Personal & Contact Details */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold shrink-0">
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
                <label className="font-bold text-slate-700">Email Address (Optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="driver@example.com"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">Residential Address *</label>
                <input
                  type="text"
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House number, Street, City & Pincode"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
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
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Operational Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                >
                  <option value="AVAILABLE">Available for Dispatch</option>
                  <option value="ON_TRIP">On Active Highway Trip</option>
                  <option value="BOOKED">Booked</option>
                  <option value="OFF_DUTY">Off Duty / Rest</option>
                  <option value="INACTIVE">Inactive / On Leave</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">Emergency Contact (Relation & Phone) *</label>
                <input
                  type="text"
                  required
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="e.g. Spouse / Brother (+91 98450 00000)"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

            </div>
          </div>

          {/* Card 2: License Particulars & Experience */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Commercial License Particulars</h2>
                <p className="text-xs text-slate-500">Transport authority badges and driving history</p>
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
                  placeholder="e.g. TN38 20180004521"
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
                <label className="font-bold text-slate-700">Driving Experience (Years) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="50"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">Primary Assigned Fleet Asset</label>
                <select
                  name="assignedVehicleId"
                  value={formData.assignedVehicleId}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                >
                  <option value="">-- No Vehicle Assigned (Floating Chauffeur) --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.model} ({v.vehicleNumber}) - {v.vehicleType}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Upload License Document Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* License Document Upload */}
              <div 
                onClick={() => licenseDocRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center space-y-2 cursor-pointer transition-colors ${
                  formData.licenseDocumentUrl 
                    ? "border-emerald-300 bg-emerald-50/40" 
                    : "border-slate-200 hover:border-amber-400 bg-slate-50/50"
                }`}
              >
                <input 
                  type="file" 
                  ref={licenseDocRef} 
                  className="hidden" 
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload("licenseDoc", e)}
                />
                
                {uploading.licenseDoc ? (
                  <Loader2 className="w-6 h-6 text-amber-500 mx-auto animate-spin" />
                ) : formData.licenseDocumentUrl ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                ) : (
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                )}

                <p className="font-bold text-slate-800 text-xs">Driving License Document Copy</p>
                <p className="text-[11px] text-slate-400 truncate max-w-xs mx-auto">
                  {fileDetails.licenseDocName || (formData.licenseDocumentUrl ? "Document on file ✓" : "Front & Back (PDF or JPG)")}
                </p>

                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                  formData.licenseDocumentUrl 
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "text-amber-600 bg-amber-50 border-amber-200"
                }`}>
                  {uploading.licenseDoc ? "Uploading to Cloud..." : formData.licenseDocumentUrl ? "Change Document" : "Upload License File"}
                </span>
              </div>

              {/* Driver Photo Upload */}
              <div 
                onClick={() => photoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center space-y-2 cursor-pointer transition-colors ${
                  formData.photoUrl 
                    ? "border-emerald-300 bg-emerald-50/40" 
                    : "border-slate-200 hover:border-amber-400 bg-slate-50/50"
                }`}
              >
                <input 
                  type="file" 
                  ref={photoInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload("photo", e)}
                />

                {uploading.photo ? (
                  <Loader2 className="w-6 h-6 text-amber-500 mx-auto animate-spin" />
                ) : formData.photoUrl ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                ) : (
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                )}

                <p className="font-bold text-slate-800 text-xs">Driver Photo for Badge</p>
                <p className="text-[11px] text-slate-400 truncate max-w-xs mx-auto">
                  {fileDetails.photoName || (formData.photoUrl ? "Photo on file ✓" : "Passport style portrait")}
                </p>

                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                  formData.photoUrl 
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "text-amber-600 bg-amber-50 border-amber-200"
                }`}>
                  {uploading.photo ? "Uploading Photo..." : formData.photoUrl ? "Change Photo" : "Upload Photo"}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Right 1 Column: Side Space Panels */}
        <div className="space-y-6 lg:sticky lg:top-20">
          
          {/* Side Card 1: Live Driver ID Badge Preview */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Chauffeur Badge</h3>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {formData.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-3.5">
                {formData.photoUrl || fileDetails.photoPreview ? (
                  <img
                    src={formData.photoUrl || fileDetails.photoPreview}
                    alt={formData.name || "Chauffeur"}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shrink-0">
                    {(formData.name || "D").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-black text-sm text-white truncate">
                    {formData.name || "Driver Name"}
                  </h4>
                  <p className="text-xs text-amber-400 font-medium truncate">
                    {formData.phone || "+91 XXXXX XXXXX"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {formData.licenseNumber || "License Pending"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400 font-medium">Experience</p>
                  <p className="font-bold text-slate-800">
                    {formData.experienceYears !== "" ? `${formData.experienceYears} Years` : "—"}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400 font-medium">Blood Group</p>
                  <p className="font-bold text-slate-800">{formData.bloodGroup}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">License Valid Till:</span>
                  <span className="font-semibold text-slate-800">{formData.licenseExpiry || "Pending"}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Assigned Vehicle:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                    {selectedVehicleObj
                      ? `${selectedVehicleObj.model} (${selectedVehicleObj.vehicleNumber})`
                      : "Floating"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Side Card 2: Update Controls */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Update Controls
            </h3>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || uploading.photo || uploading.licenseDoc}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  "Save Chauffeur Changes"
                )}
              </button>

              <Link
                href="/vendor/drivers"
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                Cancel & Return
              </Link>
            </div>
          </div>

        </div>

      </form>
    </div>
  );
}
