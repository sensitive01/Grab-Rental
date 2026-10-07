"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  Loader2,
  Clock,
  Award,
  Phone,
  Mail,
  User,
  FileCheck,
  Camera,
  Star
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";
import { axiosClient } from "@/lib/axiosClient";
import { uploadSignedToCloudinary } from "@/lib/cloudinary";

const LANGUAGE_OPTIONS = ["English", "Tamil", "Hindi", "Telugu", "Kannada", "Malayalam"];
const ID_PROOF_TYPES = ["Aadhaar Card", "Voter ID", "Passport", "PAN Card"];
const LICENSE_CLASSES = [
  { value: "LMV-TR (Transport)", label: "LMV-TR (Commercial Transport)" },
  { value: "LMV (Light Motor Vehicle)", label: "LMV (Light Motor Vehicle)" },
  { value: "HMV / HGMV", label: "HMV / Heavy Transport" },
  { value: "Commercial PSV Badge", label: "Commercial PSV Badge" }
];
const CHAUFFEUR_STATUSES = [
  { value: "Available", label: "Available (Default)" },
  { value: "Assigned", label: "Assigned" },
  { value: "Off-duty", label: "Off-duty" },
  { value: "Inactive", label: "Inactive" }
];

export default function AddDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // File upload refs
  const photoInputRef = useRef(null);
  const licenseDocRef = useRef(null);
  const idProofDocRef = useRef(null);

  const [uploading, setUploading] = useState({
    photo: false,
    licenseDoc: false,
    idProofDoc: false
  });

  const [fileDetails, setFileDetails] = useState({
    photoName: "",
    photoPreview: null,
    licenseDocName: "",
    idProofDocName: ""
  });

  const [formData, setFormData] = useState({
    // Driver Identity & Contact
    name: "",
    phone: "",
    email: "",
    dob: "1990-05-15",
    gender: "Male",
    photoUrl: "",

    // ID Proof
    idProofType: "Aadhaar Card",
    idProofNumber: "",
    idProofDocumentUrl: "",

    // Driving License & Experience
    licenseNumber: "",
    licenseClass: "LMV-TR (Transport)",
    licenseExpiry: "",
    licenseDocumentUrl: "",
    drivingSince: "2016-04-10",
    experienceYears: 8,
    experienceLabel: "8 Years",

    // Status & Joining Date
    status: "Available",
    joiningDate: "",

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",

    // Languages
    languagesSpoken: ["English", "Tamil", "Hindi"]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Automatic Experience calculation when "Driving Since" date is picked
  const handleDrivingSinceChange = (e) => {
    const dateVal = e.target.value;
    if (!dateVal) {
      setFormData((prev) => ({ ...prev, drivingSince: "", experienceYears: 0, experienceLabel: "0 Years" }));
      return;
    }

    const sinceDate = new Date(dateVal);
    const today = new Date();
    let years = today.getFullYear() - sinceDate.getFullYear();
    let months = today.getMonth() - sinceDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < sinceDate.getDate())) {
      years--;
      months = (months + 12) % 12;
    }
    const finalYears = Math.max(0, years);
    const label = `${finalYears} Year${finalYears !== 1 ? "s" : ""}`;

    setFormData((prev) => ({
      ...prev,
      drivingSince: dateVal,
      experienceYears: finalYears,
      experienceLabel: label
    }));
  };

  const handleLanguageToggle = (lang) => {
    setFormData((prev) => {
      const exists = prev.languagesSpoken.includes(lang);
      const updated = exists 
        ? prev.languagesSpoken.filter((l) => l !== lang)
        : [...prev.languagesSpoken, lang];
      return { ...prev, languagesSpoken: updated };
    });
  };

  const handleFileUpload = async (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "photo") {
      const localPreview = URL.createObjectURL(file);
      setFileDetails((prev) => ({ ...prev, photoPreview: localPreview, photoName: file.name }));
    } else if (type === "licenseDoc") {
      setFileDetails((prev) => ({ ...prev, licenseDocName: file.name }));
    } else if (type === "idProofDoc") {
      setFileDetails((prev) => ({ ...prev, idProofDocName: file.name }));
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
        } else if (type === "idProofDoc") {
          setFormData((prev) => ({ ...prev, idProofDocumentUrl: uploadedUrl }));
        }
        setToast({ message: `${type.toUpperCase()} file uploaded securely!`, type: "success" });
      }
    } catch (err) {
      console.error(`Upload error for ${type}:`, err);
      setToast({ message: `Upload failed: ${err.message || "Could not reach storage"}`, type: "error" });
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);

    // Client-side validations
    if (!formData.name?.trim()) {
      setToast({ message: "Please enter the chauffeur's full legal name", type: "error" });
      return;
    }

    if (!formData.phone?.trim()) {
      setToast({ message: "Please enter a valid mobile number", type: "error" });
      return;
    }

    if (!formData.dob) {
      setToast({ message: "Please select date of birth", type: "error" });
      return;
    }

    if (!formData.idProofNumber?.trim()) {
      setToast({ message: "Please enter ID proof number", type: "error" });
      return;
    }

    if (!formData.licenseNumber?.trim()) {
      setToast({ message: "Please enter the driving license number", type: "error" });
      return;
    }

    if (!formData.licenseExpiry) {
      setToast({ message: "Please specify the driving license expiry date", type: "error" });
      return;
    }

    if (!formData.licenseDocumentUrl) {
      setToast({ message: "Please upload the driving license proof copy", type: "error" });
      return;
    }

    if (!formData.emergencyContactName?.trim() || !formData.emergencyContactPhone?.trim()) {
      setToast({ message: "Please enter emergency contact name and phone number", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const emergencyContactStr = `${formData.emergencyContactName.trim()} (${formData.emergencyContactPhone.trim()})`;

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || null,
        dob: formData.dob || null,
        gender: formData.gender,
        photoUrl: formData.photoUrl || null,

        idProofType: formData.idProofType,
        idProofNumber: formData.idProofNumber?.trim() || null,
        idProofDocumentUrl: formData.idProofDocumentUrl || null,

        licenseNumber: formData.licenseNumber.trim().toUpperCase(),
        licenseClass: formData.licenseClass,
        licenseExpiry: formData.licenseExpiry,
        licenseDocumentUrl: formData.licenseDocumentUrl || null,
        drivingSince: formData.drivingSince || null,
        experienceYears: Number(formData.experienceYears) || 0,

        status: formData.status ? formData.status.toUpperCase().replace("-", "_") : "AVAILABLE",
        joiningDate: formData.joiningDate || null,

        emergencyContact: emergencyContactStr,
        emergencyContactName: formData.emergencyContactName?.trim() || null,
        emergencyContactPhone: formData.emergencyContactPhone?.trim() || null,

        languagesSpoken: Array.isArray(formData.languagesSpoken) ? formData.languagesSpoken.join(", ") : formData.languagesSpoken,
        verificationStatus: "Verified",
        rating: 5.0,
        totalTrips: 0,
        notes: null
      };

      const res = await axiosClient.post("/api/vendor/drivers", payload);

      if (res.data?.success) {
        setToast({ message: `Chauffeur ${payload.name} enrolled successfully!`, type: "success" });
        setTimeout(() => {
          router.push("/vendor/drivers");
        }, 1200);
      } else {
        setToast({ message: res.data?.message || "Failed to register chauffeur", type: "error" });
      }
    } catch (err) {
      console.error("Failed to add driver:", err);
      const serverMessage = err.response?.data?.message || err.message || "Failed to register chauffeur";
      setToast({ message: serverMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Breadcrumbs & Header */}
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: "All Drivers", href: "/vendor/drivers" }, { label: "Add Drivers" }]} />
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Add Professional Driver
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Onboard verified commercial drivers with driving license, identity proofs, photo, and experience details.
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

      {/* Page Hero Photo Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 text-white shadow-sm">
        <div className="absolute inset-0 opacity-35">
          <Image 
            src="/images/login-hero.jpg" 
            alt="Chauffeur Onboarding Banner" 
            fill 
            priority
            className="object-cover" 
          />
        </div>
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border border-amber-400/30">
              <Award className="w-3.5 h-3.5" /> Elite Chauffeur Network
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Chauffeur Credentials & Background Check</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              All chauffeurs are equipped with verified commercial driving licenses, identity proofs, and multilingual communication.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div className="text-xs">
              <p className="font-extrabold text-white">100% Verified Profile</p>
              <p className="text-[11px] text-slate-300">Commercial Chauffeur Shield</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Input Sections */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Chauffeur Identity & Personal Particulars */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Personal & Identity Particulars</h2>
                <p className="text-xs text-slate-500">Chauffeur full legal name, phone, gender, date of birth and portrait photo</p>
              </div>
            </div>

            {/* Photo Upload & Preview Row */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <input 
                type="file" 
                ref={photoInputRef} 
                onChange={(e) => handleFileUpload("photo", e)} 
                accept="image/*" 
                className="hidden" 
              />
              <div 
                onClick={() => !uploading.photo && photoInputRef.current?.click()}
                className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white border-2 border-dashed border-amber-400 flex items-center justify-center shrink-0 cursor-pointer group shadow-xs"
              >
                {fileDetails.photoPreview || formData.photoUrl ? (
                  <img src={fileDetails.photoPreview || formData.photoUrl} alt="Driver" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-[10px] text-center p-2">
                    <Camera className="w-6 h-6 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
                    <span>Upload Photo</span>
                  </div>
                )}
                {uploading.photo && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-xs font-black text-slate-900">Chauffeur Photo</h4>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.2 rounded-full">Professional Portrait</span>
                </div>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  Clear front face photo wearing neat shirt. Displayed on guest booking vouchers.
                </p>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline pt-1 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {formData.photoUrl ? "Change Photo" : "Upload Professional Photo"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              
              {/* Chauffeur Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">Full Name <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Kumar S"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Phone Number <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Email (Optional) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="driver@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Date of Birth <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  required
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Gender <span className="text-rose-500">*</span></label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

            </div>
          </div>

          {/* Card 2: ID Proof Particulars */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">National ID Proof & Verification</h2>
                <p className="text-xs text-slate-500">Government identity document with upload for KYC compliance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">ID Proof Type <span className="text-rose-500">*</span></label>
                <select
                  name="idProofType"
                  value={formData.idProofType}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                >
                  {ID_PROOF_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">ID Proof Number <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  name="idProofNumber"
                  value={formData.idProofNumber}
                  onChange={handleChange}
                  placeholder="e.g. 1234 5678 9012"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white uppercase"
                />
              </div>

              {/* Upload ID Proof Document */}
              <div className="sm:col-span-2">
                <input 
                  type="file" 
                  ref={idProofDocRef} 
                  onChange={(e) => handleFileUpload("idProofDoc", e)} 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  className="hidden" 
                />
                <div 
                  onClick={() => !uploading.idProofDoc && idProofDocRef.current?.click()}
                  className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-between cursor-pointer transition-all ${
                    formData.idProofDocumentUrl ? "border-emerald-400 bg-emerald-50/30" : "border-slate-200 hover:border-amber-400 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center text-slate-600">
                      {uploading.idProofDoc ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <FileText className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Upload ID Proof Copy</p>
                      <p className="text-[11px] text-slate-400">{fileDetails.idProofDocName || "Front & Back copy (PDF, JPG, PNG)"}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                    formData.idProofDocumentUrl ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-white text-slate-700 border-slate-200"
                  }`}>
                    {formData.idProofDocumentUrl ? "Uploaded ✓" : "Browse File"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Driving License & Experience */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Driving License & Experience</h2>
                <p className="text-xs text-slate-500">Commercial DL badge, licence class, and automated experience calculation</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Driving License Number */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Driving License Number <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="DL-1420110012345"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white uppercase"
                />
              </div>

              {/* License Class / Type */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Licence Type / Class <span className="text-rose-500">*</span></label>
                <select
                  name="licenseClass"
                  value={formData.licenseClass}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                >
                  {LICENSE_CLASSES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* License Expiry Date */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">License Expiry Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  required
                  name="licenseExpiry"
                  value={formData.licenseExpiry}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Driving Since (date) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Driving Since (Date)</span>
                  <span className="text-[10px] text-amber-600 font-bold">Auto Calculates Exp</span>
                </label>
                <input
                  type="date"
                  name="drivingSince"
                  value={formData.drivingSince}
                  onChange={handleDrivingSinceChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Automatically Experience field should display the experience number */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Experience</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Auto-Calculated
                  </span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.experienceLabel}
                    readOnly
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/80 text-amber-950 font-bold text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Chauffeur status */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Chauffeur Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-emerald-700 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                >
                  {CHAUFFEUR_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Upload Driving License Copy */}
              <div className="sm:col-span-2">
                <input 
                  type="file" 
                  ref={licenseDocRef} 
                  onChange={(e) => handleFileUpload("licenseDoc", e)} 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  className="hidden" 
                />
                <div 
                  onClick={() => !uploading.licenseDoc && licenseDocRef.current?.click()}
                  className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-between cursor-pointer transition-all ${
                    formData.licenseDocumentUrl ? "border-emerald-400 bg-emerald-50/30" : "border-slate-200 hover:border-amber-400 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center text-slate-600">
                      {uploading.licenseDoc ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <Award className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Upload Driving License Proof <span className="text-rose-500">*</span></p>
                      <p className="text-[11px] text-slate-400">{fileDetails.licenseDocName || "Front & Back RTO Smart Card Copy (PDF, JPG, PNG)"}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                    formData.licenseDocumentUrl ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-white text-slate-700 border-slate-200"
                  }`}>
                    {formData.licenseDocumentUrl ? "Uploaded ✓" : "Browse File"}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Card 4: Emergency Contacts & Languages */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Emergency Contact & Languages Spoken</h2>
                <p className="text-xs text-slate-500">SOS kin contact details and languages spoken</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              
              {/* Emergency Contact Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Emergency Contact Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="e.g. Spouse / Sibling"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Emergency Contact Phone */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Emergency Contact Phone <span className="text-rose-500">*</span></label>
                <input
                  type="tel"
                  required
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Joining Date (Optional) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Joining Date</span>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* Languages Spoken Chips */}
              <div className="sm:col-span-2 lg:col-span-3 space-y-2 pt-1">
                <label className="font-bold text-slate-700 block">Languages Spoken</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => {
                    const isSelected = formData.languagesSpoken.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleLanguageToggle(lang)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 border-amber-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right 1 Column: Live Preview & Action Card */}
        <div className="space-y-6 lg:sticky lg:top-20">
          
          {/* Live Chauffeur Identity Card Preview */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Chauffeur Badge Card</h3>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {formData.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 overflow-hidden border border-amber-300 shrink-0 flex items-center justify-center">
                  {fileDetails.photoPreview || formData.photoUrl ? (
                    <img src={fileDetails.photoPreview || formData.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-amber-700" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-black text-slate-900 truncate">
                    {formData.name || "Chauffeur Full Name"}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500">{formData.phone || "+91 98765 00000"}</p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>5.0 Rating</span>
                    <span className="text-slate-400">· Active</span>
                  </div>
                </div>
              </div>

              {/* Badges List */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">License No:</span>
                  <span className="font-mono font-bold text-amber-400">{formData.licenseNumber || "PENDING"}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">Class:</span>
                  <span className="font-bold text-white truncate max-w-[150px]">{formData.licenseClass}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">Experience:</span>
                  <span className="font-bold text-white">{formData.experienceYears} Years</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">ID Proof:</span>
                  <span className="font-bold text-emerald-400">{formData.idProofType}</span>
                </div>
              </div>

              {/* Spoken Languages */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Languages Spoken</p>
                <div className="flex flex-wrap gap-1">
                  {formData.languagesSpoken.map((lang) => (
                    <span key={lang} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Submission Action Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Roster Controls
            </h3>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || uploading.photo || uploading.licenseDoc || uploading.idProofDoc}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enrolling Driver...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save & Activate Driver
                  </>
                )}
              </button>

              <Link
                href="/vendor/drivers"
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                Cancel & Return
              </Link>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Instant Dispatch Link</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Available chauffeurs are immediately visible in operations dispatch when bookings arrive.
                </p>
              </div>
            </div>
          </div>

        </div>

      </form>
    </div>
  );
}
