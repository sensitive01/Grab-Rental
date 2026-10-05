"use client";

import { useState, useRef } from "react";
import Image from "next/image";
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
  Image as ImageIcon,
  MapPin,
  ShieldCheck,
  Check,
  Gauge,
  Wind,
  Layers,
  Fuel,
  Compass,
  Zap,
  Sliders,
  Tv,
  Sun,
  Eye,
  Camera
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";
import NumberPlate from "@/components/ui/NumberPlate";
import InteractiveMapPicker from "@/components/ui/InteractiveMapPicker";
import MultipleVehiclePhotoUploader from "@/components/ui/MultipleVehiclePhotoUploader";
import { axiosClient } from "@/lib/axiosClient";
import { uploadSignedToCloudinary } from "@/lib/cloudinary";

const VEHICLE_FEATURE_OPTIONS = [
  { id: "Sunroof", label: "Sunroof / Skyroof", icon: Sun },
  { id: "360", label: "360° Surround Camera", icon: Eye },
  { id: "adas", label: "ADAS (Active Driver Assist)", icon: Compass },
  { id: "Luggage carrier", label: "Luggage Carrier / Roof Rails", icon: Layers },
  { id: "tv", label: "TV / Entertainment Display", icon: Tv },
  { id: "AC", label: "AC / Climate Control", icon: Wind },
  { id: "Ventilated Seats", label: "Ventilated Cushioned Seats", icon: Sparkles },
  { id: "Recliner Seats", label: "Maharaja Recliner Seats", icon: Sliders },
  { id: "Airbags", label: "Front & Side Airbags (Safety)", icon: ShieldCheck },
  { id: "GPS Tracking", label: "GPS Real-time Telematics", icon: MapPin },
  { id: "USB Fast Charging", label: "Fast USB & Type-C Chargers", icon: Zap },
  { id: "WiFi", label: "Complimentary Onboard WiFi", icon: Zap }
];

const PRESET_COLORS = [
  { name: "Pearl White", hex: "#FFFFFF" },
  { name: "Silky Silver", hex: "#E2E8F0" },
  { name: "Magma Grey", hex: "#64748B" },
  { name: "Midnight Black", hex: "#0F172A" },
  { name: "Imperial Blue", hex: "#1E3A8A" },
  { name: "Wine Red", hex: "#991B1B" },
  { name: "Champagne Gold", hex: "#CA8A04" }
];

const PARKING_HUBS = [
  "Airport Logistic Hub (Terminal 1 & 2 Bay)",
  "Central Railway Station Deployment Depot",
  "Peelamedu Commercial Transport Nagar",
  "Electronic City / Tech Park Parking Yard",
  "Guindy Industrial Logistics Hub"
];

export default function AddVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

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
    variant: "",
    color: "Pearl White",
    registrationType: "Yellow Board",
    fuelType: "Diesel",
    alternateFuel: "CNG",
    transmission: "Automatic",
    seatingCapacity: 7,
    engineCc: 2393,
    parkingLocation: "Airport Logistic Hub (Terminal 1 & 2 Bay)",
    features: ["AC", "Sunroof", "360", "adas", "Recliner Seats", "Luggage carrier", "Airbags", "GPS Tracking"],
    vehicleNumber: "",
    registrationNumber: "",
    acType: "Dual AC",
    year: new Date().getFullYear(),
    insuranceExpiry: "",
    permitExpiry: "",
    fitnessExpiry: "",
    dailyRate: "",
    perKmRate: "",
    currentLocation: "Airport Logistic Hub (Terminal 1 & 2 Bay)",
    imageUrl: "",
    photos: [],
    rcDocumentUrl: "",
    insuranceDocumentUrl: "",
    permitDocumentUrl: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (featureId) => {
    setFormData((prev) => {
      const exists = prev.features.includes(featureId);
      const updated = exists 
        ? prev.features.filter((f) => f !== featureId)
        : [...prev.features, featureId];
      return { ...prev, features: updated };
    });
  };

  const handleFileUpload = async (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        variant: formData.variant?.trim() || null,
        color: formData.color || "Pearl White",
        registrationType: formData.registrationType || "Yellow Board",
        alternateFuel: formData.alternateFuel || null,
        transmission: formData.transmission || "Manual",
        engineCc: formData.engineCc ? Number(formData.engineCc) : null,
        parkingLocation: formData.parkingLocation || formData.currentLocation || "Airport Logistic Hub",
        features: Array.isArray(formData.features) ? formData.features.join(", ") : formData.features,
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
        currentLocation: formData.parkingLocation || formData.currentLocation || "Airport Logistic Hub",
        imageUrl: (formData.photos && formData.photos[0]) || formData.imageUrl || null,
        photos: formData.photos && formData.photos.length > 0 ? formData.photos.join(",") : null,
        rcDocumentUrl: formData.rcDocumentUrl || null,
        insuranceDocumentUrl: formData.insuranceDocumentUrl || null,
        permitDocumentUrl: formData.permitDocumentUrl || null
      };

      const res = await axiosClient.post("/api/vendor/vehicles", payload);

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
      if (err.response?.data?.data && typeof err.response.data.data === "object") {
        const errorList = Object.values(err.response.data.data).filter(Boolean);
        if (errorList.length > 0) {
          errMsg = errorList.join(" • ");
        }
      }
      setToast({ message: errMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
              Register commercial car, van, tempo traveller or coach with complete variant, features, and map pin location.
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

      {/* Page Hero Photo Banner (Requirement: Every page has at least 1 image) */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 text-white shadow-sm">
        <div className="absolute inset-0 opacity-30">
          <Image 
            src="/images/fleet/suv.jpg" 
            alt="Add Vehicle Banner" 
            fill 
            priority
            className="object-cover" 
          />
        </div>
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" /> Fleet Expansion Roster
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Commercial Vehicle Registration & Compliance</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Ensure accurate variant, transmission, engine CC, alternate fuels, and commercial yellow-board documents for immediate customer booking eligibility.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div className="text-xs">
              <p className="font-extrabold text-white">Instant RTO Verification</p>
              <p className="text-[11px] text-slate-300">Commercial Taxi Shield</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form & Side Space Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Input Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Basic Specifications & New Fields */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Vehicle Classification, Model & Variant</h2>
                <p className="text-xs text-slate-500">Commercial make, variant, registration type & technical powertrain</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              
              {/* Vehicle Type */}
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
                  <option value="Bus">Bus / Tourist Coach (36-55 Seater)</option>
                </select>
              </div>

              {/* Vehicle Make & Model */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">Vehicle Make & Model *</label>
                <input
                  type="text"
                  required
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  placeholder="e.g. Toyota Innova Crysta, Maruti Dzire"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* 1. Vehicle Variant Field */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Vehicle Variant *</span>
                  <span className="text-[10px] text-amber-600 font-semibold">Trim / Badge</span>
                </label>
                <input
                  type="text"
                  name="variant"
                  value={formData.variant}
                  onChange={handleChange}
                  placeholder="e.g. 2.4 ZX, ZXi+, Alpha, Titanium"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* 2. Vehicle Color Field */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Vehicle Color *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="e.g. Pearl White, Silver"
                    className="flex-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                  <select
                    onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
                    className="py-2.5 px-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    title="Quick pick color"
                  >
                    <option value="">Presets</option>
                    {PRESET_COLORS.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Registration Type */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Registration Type *</label>
                <select
                  name="registrationType"
                  value={formData.registrationType}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-900 focus:outline-hidden focus:border-amber-500"
                >
                  <option value="Yellow Board">Yellow Board (Commercial Taxi / Tourist)</option>
                  <option value="White Board">White Board (Private Lease / Corporate)</option>
                  <option value="Black Board">Black Board (Self Drive Luxury Commercial)</option>
                  <option value="EV Green Commercial">Green Board (Commercial Electric)</option>
                </select>
              </div>

              {/* Vehicle Plate Number */}
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

              {/* 4. Transmission */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Vehicle Transmission *</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                >
                  <option value="Automatic">Automatic (AT / DCT / CVT / AMT)</option>
                  <option value="Manual">Manual (5/6 Speed Synchromesh)</option>
                </select>
              </div>

              {/* 5. Seating Capacity */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Seating Capacity (Excl. Driver) *</label>
                <select
                  name="seatingCapacity"
                  value={formData.seatingCapacity}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                >
                  <option value={4}>4 Seater (Compact / Executive Sedan)</option>
                  <option value={5}>5 Seater</option>
                  <option value={6}>6 Seater (Captain Seats)</option>
                  <option value={7}>7 Seater (Innova / SUV)</option>
                  <option value={8}>8 Seater</option>
                  <option value={9}>9 Seater</option>
                  <option value={12}>12 Seater (Tempo Traveller / Van)</option>
                  <option value={16}>16-17 Seater (Tempo Traveller)</option>
                  <option value={26}>26 Seater (Mini Bus)</option>
                  <option value={36}>36 Seater (Coach)</option>
                  <option value={45}>45-55 Seater (Volvo Coach)</option>
                </select>
              </div>

              {/* Primary Fuel Type */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Primary Fuel Type *</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric (EV)</option>
                  <option value="Petrol Hybrid">Petrol Hybrid</option>
                </select>
              </div>

              {/* 6. Vehicle Alternate Fuel */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Alternate Fuel Option</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Dual Fuel</span>
                </label>
                <select
                  name="alternateFuel"
                  value={formData.alternateFuel}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                >
                  <option value="None">None (Single Fuel)</option>
                  <option value="CNG">CNG (Dual Fuel Factory / Kit)</option>
                  <option value="Electric">Electric / Hybrid Motor</option>
                  <option value="Petrol">Petrol (Secondary)</option>
                  <option value="Diesel">Diesel</option>
                </select>
              </div>

              {/* 7. Engine CC */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Engine Displacement (CC)</span>
                  <span className="text-[10px] text-slate-400">Power Rating</span>
                </label>
                <input
                  type="number"
                  name="engineCc"
                  value={formData.engineCc}
                  onChange={handleChange}
                  placeholder="e.g. 1197, 1498, 2393 cc"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Air Conditioning */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Air Conditioning *</label>
                <select
                  name="acType"
                  value={formData.acType}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                >
                  <option value="Dual AC">Dual AC (Front & Rear Vents)</option>
                  <option value="Climate Control">Automatic Multi-Zone Climate Control</option>
                  <option value="AC">Standard AC</option>
                  <option value="Individual Vents">Individual Passenger Roof Vents</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
              </div>

              {/* Manufacturing Year */}
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

              {/* RTO Registration Number */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">RTO Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g. TN382024001234"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 uppercase"
                />
              </div>

            </div>
          </div>

          {/* Card 2: Parking Location (Map Pin) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Parking Location (Map Pin)</h2>
                  <p className="text-xs text-slate-500">Designate the base parking yard or airport bay where this fleet resides</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Compass className="w-3 h-3" /> Live GPS Pin
              </span>
            </div>

            <div className="pt-2">
              <InteractiveMapPicker
                value={formData.parkingLocation}
                onChange={(loc) => setFormData((p) => ({ ...p, parkingLocation: loc, currentLocation: loc }))}
                placeholder="Search or pin exact parking hub / depot address..."
              />
            </div>
          </div>

          {/* Card 3: Vehicle Features & Amenities (Sunroof, 360, ADAS, Recliner Seats, etc.) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Vehicle Features & Luxury Options</h2>
                  <p className="text-xs text-slate-500">Select all installed features available in this vehicle</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                {formData.features.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {VEHICLE_FEATURE_OPTIONS.map((item) => {
                const isSelected = formData.features.includes(item.id);
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleFeatureToggle(item.id)}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-50/70 border-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-400/50"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-500"
                    }`}>
                      {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <IconComponent className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">{item.id}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 4: Compliance & Legal Expiry Dates */}
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

          {/* Card 5: Rates & Deployment Hub */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Base Rates & Operational Billing</h2>
                <p className="text-xs text-slate-500">Commercial billing rates for local 8hr and outstation kilometer dispatch</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
            </div>
          </div>

          {/* Card 6: Document Uploads & Photos */}
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

            </div>
          </div>

          {/* Card: Multiple Vehicle Photos (Exterior, Interior, Angles) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <MultipleVehiclePhotoUploader
              photos={formData.photos && formData.photos.length > 0 ? formData.photos : (formData.imageUrl ? [formData.imageUrl] : [])}
              onChange={(newPhotos) => {
                setFormData((p) => ({
                  ...p,
                  photos: newPhotos,
                  imageUrl: newPhotos[0] || ""
                }));
                setFileDetails((f) => ({
                  ...f,
                  photoPreview: newPhotos[0] || null
                }));
              }}
              maxPhotos={8}
              label="Vehicle Photos (Exterior & Interior Gallery)"
              subtitle="Upload multiple high-resolution photos (front, rear, side profile, dashboard, and passenger seats)."
            />
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
                {formData.registrationType}
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
                  {formData.vehicleModel || "Vehicle Make & Model"} {formData.variant ? `(${formData.variant})` : ""}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{formData.parkingLocation || "Base Hub"}</span>
                </div>
              </div>

              {/* Spec Badges Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400">Color & Trim</p>
                  <p className="font-bold text-slate-800 truncate">{formData.color} {formData.variant ? `· ${formData.variant}` : ""}</p>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400">Capacity & Powertrain</p>
                  <p className="font-bold text-slate-800">{formData.seatingCapacity}S · {formData.transmission}</p>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400">Fuel & Alternate</p>
                  <p className="font-bold text-slate-800 truncate">{formData.fuelType} {formData.alternateFuel !== "None" ? `+ ${formData.alternateFuel}` : ""}</p>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400">Daily Base Rate</p>
                  <p className="font-bold text-amber-600">₹{Number(formData.dailyRate || 0).toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Selected Features Pill Tags */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Active Amenities ({formData.features.length})</p>
                <div className="flex flex-wrap gap-1">
                  {formData.features.map((f) => (
                    <span key={f} className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                      {f}
                    </span>
                  ))}
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
                  Yellow board commercial documents verified by Grab-Rental operations team within 2 hours.
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
