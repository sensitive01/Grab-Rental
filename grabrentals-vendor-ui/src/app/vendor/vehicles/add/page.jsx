"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Car,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Sparkles,
  MapPin,
  Compass,
  Check,
  Tv,
  Wind,
  Navigation,
  Fuel,
  Gauge,
  ShieldCheck,
  Flame,
  Radio,
  Wifi,
  Zap,
  Tag
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Toast from "@/components/ui/Toast";
import NumberPlate from "@/components/ui/NumberPlate";
import InteractiveMapPicker from "@/components/ui/InteractiveMapPicker";
import MultipleVehiclePhotoUploader from "@/components/ui/MultipleVehiclePhotoUploader";
import { axiosClient } from "@/lib/axiosClient";
import { uploadSignedToCloudinary } from "@/lib/cloudinary";

const VEHICLE_SUB_CATEGORIES = {
  Sedan: ["Dzire", "Etios", "Aura"],
  Hatchback: ["WagonR", "Swift"],
  SUV: ["Xylo", "Ertiga", "Carens", "marazzo"],
  Innova: ["6+1 Seater", "7+1 Seater"],
  Tempo: ["12+1 Seater", "13+1 Seater"],
  urbania: ["10+1 Seater", "12+1 Seater", "16+1 Seater"],
};

const PRESET_COLORS = [
  { name: "Pearl White", hex: "#FFFFFF" },
  { name: "Arctic Silver", hex: "#E5E7EB" },
  { name: "Magma Grey", hex: "#4B5563" },
  { name: "Midnight Black", hex: "#111827" },
  { name: "Garnet Red", hex: "#991B1B" },
  { name: "Nexa Blue", hex: "#1E3A8A" },
  { name: "Golden Bronze", hex: "#92400E" }
];

const VEHICLE_FEATURE_OPTIONS = [
  { id: "Air Conditioner (AC)", label: "Climate Cooling", icon: Wind },
  { id: "Smart TV / Screen", label: "Rear Passenger Entertainment", icon: Tv },
  { id: "Dual-Zone AC", label: "Multi-Zone Automatic HVAC", icon: Wind },
  { id: "Ventilated Seats", label: "Active Cooling Leather", icon: Sparkles },
  { id: "Recliner Seats", label: "First-Class Push-Back Seats", icon: Sparkles },
  { id: "360° Surround Camera", label: "Blind-spot Assist", icon: Navigation },
  { id: "ADAS Safety Suite", label: "Autonomous Braking & Cruise", icon: ShieldCheck },
  { id: "Rooftop Luggage Carrier", label: "Top Luggage Tray", icon: Car },
  { id: "Music System (Bluetooth)", label: "Surround Audio", icon: Radio },
  { id: "High-Speed Wi-Fi", label: "In-Cabin 4G/5G Hotspot", icon: Wifi },
  { id: "GPS Live Tracker", label: "Real-Time Telematics", icon: Navigation },
  { id: "Safety Airbags", label: "Dual / 6 Airbags", icon: ShieldCheck },
  { id: "USB Rapid Charging Ports", label: "Fast Charging Sockets", icon: Zap },
  { id: "Pure Leather Seats", label: "Premium Interior Upholstery", icon: Sparkles },
  { id: "Ambient Cabin Lighting", label: "LED Mood Lighting", icon: Sparkles },
  { id: "Fastag Automatic Toll Pass", label: "Automatic Electronic Toll", icon: Tag },
];

export default function AddVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [plateWarning, setPlateWarning] = useState("");
  const [checkingPlate, setCheckingPlate] = useState(false);

  const verifyPlateLive = async (plate) => {
    const clean = (plate || "").trim().toUpperCase();
    if (!clean || clean.length < 3) {
      setPlateWarning("");
      return;
    }
    setCheckingPlate(true);
    try {
      const res = await axiosClient.get(`/api/vehicles/check-plate?plate=${encodeURIComponent(clean)}`);
      if (res.data?.data && res.data.data.exists) {
        setPlateWarning(res.data.data.message || `Vehicle '${clean}' is already registered on Grab Rentals by another fleet partner.`);
      } else {
        setPlateWarning("");
      }
    } catch {
      setPlateWarning("");
    } finally {
      setCheckingPlate(false);
    }
  };

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleModel: "",
    variant: "",
    color: "Pearl White",
    registrationType: "Yellow Board (Commercial)",
    vehicleCategory: "Sedan",
    subCategory: "",
    year: 2023,
    fuelType: "Diesel",
    alternateFuel: "None",
    transmission: "Automatic",
    seatingCapacity: 4,
    engineCc: 1498,
    parkingLocation: "Main Fleet Yard, India",
    features: ["Air Conditioner (AC)", "GPS Live Tracker", "Fastag Automatic Toll Pass"],

    // Compliance Proofs & Expiry Dates
    rcNumber: "",
    rcExpiry: "",
    rcDocumentUrl: "",

    insuranceNumber: "",
    insuranceExpiry: "",
    insuranceDocumentUrl: "",

    fitnessNumber: "",
    fitnessExpiry: "",
    fitnessDocumentUrl: "",

    permitNumber: "",
    permitExpiry: "",
    permitDocumentUrl: "",

    pucNumber: "",
    pucExpiry: "",
    pucDocumentUrl: "",

    // Photos
    imageUrl: "",
    photos: [],
  });

  const [photoSlots, setPhotoSlots] = useState({
    front: "",
    back: "",
    left: "",
    right: "",
    luggage: "",
    frontSeats: "",
    backSeats: "",
    handle: "",
  });

  const [uploadingDocs, setUploadingDocs] = useState({});
  const [docFileNames, setDocFileNames] = useState({});

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

  const handleDocUpload = async (docType, file) => {
    if (!file) return;

    setDocFileNames((prev) => ({ ...prev, [docType]: file.name }));
    setUploadingDocs((prev) => ({ ...prev, [docType]: true }));

    try {
      const url = await uploadSignedToCloudinary(file, "grabrentals/documents");
      if (url) {
        setFormData((prev) => ({ ...prev, [`${docType}DocumentUrl`]: url }));
        setToast({ message: `${docType.toUpperCase()} document uploaded securely!`, type: "success" });
      }
    } catch (err) {
      console.error(`Upload error for ${docType}:`, err);
      setToast({ message: "Upload failed. Please try again.", type: "error" });
    } finally {
      setUploadingDocs((prev) => ({ ...prev, [docType]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);

    if (!formData.vehicleNumber?.trim()) {
      setToast({ message: "Please enter Vehicle Plate Number", type: "error" });
      return;
    }

    if (!formData.insuranceExpiry) {
      setToast({ message: "Please provide the Vehicle Insurance expiry date", type: "error" });
      return;
    }

    if (!formData.rcExpiry) {
      setToast({ message: "Please provide the Registration Certificate (RC) expiry date", type: "error" });
      return;
    }

    // Compulsory photo validation (4 exterior + 3 interior)
    const missingPhotos = [];
    if (!photoSlots.front) missingPhotos.push("Front View");
    if (!photoSlots.back) missingPhotos.push("Back View");
    if (!photoSlots.left) missingPhotos.push("Left Side");
    if (!photoSlots.right) missingPhotos.push("Right Side");
    if (!photoSlots.frontSeats) missingPhotos.push("Front Seats");
    if (!photoSlots.backSeats) missingPhotos.push("Back Seats");
    if (!photoSlots.handle) missingPhotos.push("Handle & Steering");

    if (missingPhotos.length > 0) {
      setToast({
        message: `Please upload required photos (*): ${missingPhotos.join(", ")}`,
        type: "error"
      });
      return;
    }

    setLoading(true);

    try {
      const cleanPlate = formData.vehicleNumber.trim().toUpperCase();

      // Platform-wide cross-vendor uniqueness check
      try {
        const checkRes = await axiosClient.get(`/api/vehicles/check-plate?plate=${encodeURIComponent(cleanPlate)}`);
        if (checkRes.data?.data && checkRes.data.data.exists) {
          setToast({
            message: checkRes.data.data.message || `Vehicle with plate number '${cleanPlate}' is already registered on Grab Rentals by another fleet partner. Duplicate vehicle registrations across vendors are strictly prohibited.`,
            type: "error"
          });
          setLoading(false);
          return;
        }
      } catch (ignored) {}

      const mainImage = photoSlots.front || (formData.photos && formData.photos[0]) || formData.imageUrl || null;
      const photosPayload = (photoSlots && Object.values(photoSlots).some(Boolean))
        ? JSON.stringify({ slots: photoSlots, list: formData.photos })
        : (formData.photos && formData.photos.length > 0 ? JSON.stringify(formData.photos) : null);

      const payload = {
        vehicleNumber: cleanPlate,
        vehicleModel: formData.vehicleModel?.trim() || formData.subCategory || "Commercial Vehicle",
        vehicleType: formData.vehicleCategory,
        variant: formData.variant?.trim() || null,
        color: formData.color || "Pearl White",
        registrationType: formData.registrationType,
        alternateFuel: formData.alternateFuel,
        transmission: formData.transmission,
        engineCc: formData.engineCc ? Number(formData.engineCc) : 1498,
        parkingLocation: formData.parkingLocation || "Main Fleet Hub",
        currentLocation: formData.parkingLocation || "Main Fleet Hub",
        features: Array.isArray(formData.features) ? formData.features.join(", ") : formData.features,
        year: Number(formData.year) || 2023,
        seatingCapacity: Number(formData.seatingCapacity) || 4,
        fuelType: formData.fuelType || "Diesel",
        dailyRate: 2500,
        perKmRate: 14,
        imageUrl: mainImage,
        photos: photosPayload,
        insuranceExpiry: formData.insuranceExpiry || null,
        rcExpiry: formData.rcExpiry || null,
        fitnessExpiry: formData.fitnessExpiry || null,
        permitExpiry: formData.permitExpiry || null,
        rcDocumentUrl: formData.rcDocumentUrl || null,
        insuranceDocumentUrl: formData.insuranceDocumentUrl || null,
        permitDocumentUrl: formData.permitDocumentUrl || null,
        fitnessDocumentUrl: formData.fitnessDocumentUrl || null,
      };

      const res = await axiosClient.post("/api/vendor/vehicles", payload);

      if (res.data?.success) {
        setToast({
          message: `Vehicle ${cleanPlate} registered successfully!`,
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
      setToast({
        message: err.response?.data?.message || err.message || "Network error registering vehicle",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/vendor/dashboard" },
              { label: "Vehicles", href: "/vendor/vehicles" },
              { label: "Add Commercial Vehicle" }
            ]}
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Add Commercial Vehicle
          </h1>
          <p className="text-xs text-slate-500">
            Register a commercial fleet asset with specifications, inspection photos, and compliance proofs.
          </p>
        </div>

        <Link
          href="/vendor/vehicles"
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vehicles
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Columns: Input Cards */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card 1: Basic Specifications */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Vehicle Specifications & Attributes</h2>
                <p className="text-xs text-slate-500">Make, model, classification, registration type and powertrain details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">

              {/* Plate Number */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Vehicle Number *</label>
                <input
                  type="text"
                  required
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, vehicleNumber: e.target.value.toUpperCase() }));
                    if (plateWarning) setPlateWarning("");
                  }}
                  onBlur={(e) => verifyPlateLive(e.target.value)}
                  placeholder="e.g. MH 02 AB 1234"
                  className={`w-full py-2.5 px-3 bg-slate-50 border rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden uppercase transition-all ${
                    plateWarning
                      ? "border-rose-400 bg-rose-50/40 focus:border-rose-500"
                      : "border-slate-200 focus:border-amber-500"
                  }`}
                />
                {checkingPlate && (
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-500" /> Checking plate availability...
                  </p>
                )}
                {plateWarning && (
                  <p className="text-[10px] text-rose-600 flex items-start gap-1 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500 mt-0.5" />
                    <span>{plateWarning}</span>
                  </p>
                )}
              </div>

              {/* Model */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Model</label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  placeholder="e.g. Maruti Suzuki Dzire"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Variant */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Vehicle Variant</label>
                <input
                  type="text"
                  name="variant"
                  value={formData.variant}
                  onChange={handleChange}
                  placeholder="e.g. VXI / Titanium / ZX"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Color */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Vehicle Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="e.g. Pearl White"
                    className="flex-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                  <select
                    onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
                    className="py-2.5 px-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                    title="Quick pick color"
                  >
                    <option value="">Presets</option>
                    {PRESET_COLORS.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Registration Type */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Registration Type *</label>
                <select
                  name="registrationType"
                  value={formData.registrationType}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-900 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  <option value="Yellow Board (Commercial)">Yellow Board (Commercial)</option>
                  <option value="White Board (Self Drive)">White Board (Self Drive / Private)</option>
                  <option value="All India Tourist Permit (AITP)">All India Tourist Permit (AITP)</option>
                  <option value="Stage Carriage Permit">Stage Carriage Permit</option>
                </select>
              </div>

              {/* Vehicle Category */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Vehicle Category</label>
                <select
                  name="vehicleCategory"
                  value={formData.vehicleCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((p) => ({ ...p, vehicleCategory: val, subCategory: "" }));
                  }}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  <option value="Sedan">Sedan (Dzire, Etios, Aura)</option>
                  <option value="Hatchback">Hatchback (WagonR, Swift)</option>
                  <option value="SUV">SUV (Xylo, Ertiga, Carens, marazzo)</option>
                  <option value="Innova">Innova (6+1 Seater, 7+1 Seater)</option>
                  <option value="Innovacrysta">Innova Crysta</option>
                  <option value="innovahycross">Innova Hycross</option>
                  <option value="Tempo">Tempo Traveller (12+1 Seater, 13+1 Seater)</option>
                  <option value="urbania">Force Urbania (10+1 Seater, 12+1 Seater, 16+1 Seater)</option>
                  <option value="Bus">Bus</option>
                  <option value="Benz">Benz - Executive Class</option>
                </select>
              </div>

              {/* Sub Category (Conditional) */}
              {VEHICLE_SUB_CATEGORIES[formData.vehicleCategory] && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label className="font-bold text-slate-700">Sub Category</label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="w-full py-2.5 px-3 bg-amber-50/40 border border-amber-300 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">Select Sub Category</option>
                    {VEHICLE_SUB_CATEGORIES[formData.vehicleCategory].map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Year of Manufacture */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Year of Manufacture</label>
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

              {/* Primary Fuel Type */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Primary Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric (EV)</option>
                </select>
              </div>

              {/* Alternate Fuel */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Vehicle Alternate Fuel</label>
                <select
                  name="alternateFuel"
                  value={formData.alternateFuel}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  <option value="None">None (Single Fuel)</option>
                  <option value="CNG">CNG (Bi-fuel)</option>
                  <option value="Electric">Electric (Hybrid/Dual)</option>
                  <option value="LPG">LPG</option>
                </select>
              </div>

              {/* Transmission */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Vehicle Transmission</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              {/* Seating Capacity */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Seating Capacity</label>
                <select
                  name="seatingCapacity"
                  value={formData.seatingCapacity}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  <option value="4">4 Seater + Driver</option>
                  <option value="6">6 Seater + Driver</option>
                  <option value="7">7 Seater + Driver</option>
                  <option value="8">8 Seater</option>
                  <option value="12">12 Seater (Tempo)</option>
                  <option value="18">18 Seater (Tempo)</option>
                  <option value="26">26 Seater (Mini Bus)</option>
                  <option value="35">35 Seater (Coach)</option>
                </select>
              </div>

              {/* Engine CC */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Engine Displacement (CC)</label>
                <input
                  type="number"
                  name="engineCc"
                  value={formData.engineCc}
                  onChange={handleChange}
                  placeholder="e.g. 1498"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500"
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
                  <p className="text-xs text-slate-500">Designate the base parking yard or depot address</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Compass className="w-3 h-3" /> Live GPS Pin
              </span>
            </div>

            <div className="pt-2">
              <InteractiveMapPicker
                value={formData.parkingLocation}
                onChange={(loc) => setFormData((p) => ({ ...p, parkingLocation: loc }))}
                placeholder="Search or pin exact parking hub / depot address..."
              />
            </div>
          </div>

          {/* Card 3: Features & Amenities */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Vehicle Amenities & Features</h2>
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

          {/* Card 4: Inspection Photos (Exterior 5, Interior 3) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <MultipleVehiclePhotoUploader
              photos={formData.photos}
              photoSlots={photoSlots}
              onChange={(newPhotos, newSlots) => {
                setFormData((p) => ({
                  ...p,
                  photos: newPhotos,
                  imageUrl: newSlots?.front || newPhotos[0] || ""
                }));
                if (newSlots) setPhotoSlots(newSlots);
              }}
            />
          </div>

          {/* Card 5: Vehicle Compliance Proofs with Expiry Dates (All 5) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Vehicle Compliance Proofs with Expiry Dates</h2>
                <p className="text-xs text-slate-500">All 5 statutory documents mandatory for dispatch & compliance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

              {/* 1. Registration Certificate (RC) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">1. RC Certificate *</span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Required</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="rcNumber"
                    value={formData.rcNumber}
                    onChange={handleChange}
                    placeholder="RC Number"
                    className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                  <input
                    type="date"
                    required
                    name="rcExpiry"
                    value={formData.rcExpiry}
                    onChange={handleChange}
                    className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <label className="block">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => handleDocUpload("rc", e.target.files?.[0])}
                  />
                  <div className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                    formData.rcDocumentUrl ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-white text-slate-700 border-slate-200 hover:border-amber-400"
                  }`}>
                    {uploadingDocs.rc ? "Uploading..." : formData.rcDocumentUrl ? "✓ RC Uploaded" : "Upload RC Copy"}
                  </div>
                </label>
              </div>

              {/* 2. Insurance Policy */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">2. Commercial Insurance *</span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Required</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="insuranceNumber"
                    value={formData.insuranceNumber}
                    onChange={handleChange}
                    placeholder="Policy Number"
                    className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                  <input
                    type="date"
                    required
                    name="insuranceExpiry"
                    value={formData.insuranceExpiry}
                    onChange={handleChange}
                    className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <label className="block">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => handleDocUpload("insurance", e.target.files?.[0])}
                  />
                  <div className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                    formData.insuranceDocumentUrl ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-white text-slate-700 border-slate-200 hover:border-amber-400"
                  }`}>
                    {uploadingDocs.insurance ? "Uploading..." : formData.insuranceDocumentUrl ? "✓ Insurance Uploaded" : "Upload Insurance Copy"}
                  </div>
                </label>
              </div>

              {/* 3. Fitness Certificate */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">3. Fitness Certificate</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Optional</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="fitnessNumber"
                    value={formData.fitnessNumber}
                    onChange={handleChange}
                    placeholder="Certificate Number"
                    className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                  <input
                    type="date"
                    name="fitnessExpiry"
                    value={formData.fitnessExpiry}
                    onChange={handleChange}
                    className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <label className="block">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => handleDocUpload("fitness", e.target.files?.[0])}
                  />
                  <div className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                    formData.fitnessDocumentUrl ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-white text-slate-700 border-slate-200 hover:border-amber-400"
                  }`}>
                    {uploadingDocs.fitness ? "Uploading..." : formData.fitnessDocumentUrl ? "✓ Fitness Uploaded" : "Upload Fitness Copy"}
                  </div>
                </label>
              </div>

              {/* 4. State / Tourist Permit */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">4. Commercial Permit</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Optional</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="permitNumber"
                    value={formData.permitNumber}
                    onChange={handleChange}
                    placeholder="Permit Number"
                    className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                  <input
                    type="date"
                    name="permitExpiry"
                    value={formData.permitExpiry}
                    onChange={handleChange}
                    className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <label className="block">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => handleDocUpload("permit", e.target.files?.[0])}
                  />
                  <div className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                    formData.permitDocumentUrl ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-white text-slate-700 border-slate-200 hover:border-amber-400"
                  }`}>
                    {uploadingDocs.permit ? "Uploading..." : formData.permitDocumentUrl ? "✓ Permit Uploaded" : "Upload Permit Copy"}
                  </div>
                </label>
              </div>

              {/* 5. Pollution Under Control (PUC) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">5. PUC (Pollution Certificate)</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Optional</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="pucNumber"
                    value={formData.pucNumber}
                    onChange={handleChange}
                    placeholder="PUC Certificate Number"
                    className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                  <input
                    type="date"
                    name="pucExpiry"
                    value={formData.pucExpiry}
                    onChange={handleChange}
                    className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <label className="block">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => handleDocUpload("puc", e.target.files?.[0])}
                  />
                  <div className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                    formData.pucDocumentUrl ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-white text-slate-700 border-slate-200 hover:border-amber-400"
                  }`}>
                    {uploadingDocs.puc ? "Uploading..." : formData.pucDocumentUrl ? "✓ PUC Uploaded" : "Upload PUC Copy"}
                  </div>
                </label>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Preview & Action Box */}
        <div className="space-y-6 lg:sticky lg:top-20">

          {/* Vehicle Live Preview Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Live Preview</h3>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {formData.registrationType}
              </span>
            </div>

            <div className="space-y-3">
              {/* Cover Photo */}
              {(photoSlots.front || formData.imageUrl) && (
                <div className="relative h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={photoSlots.front || formData.imageUrl}
                    alt="Vehicle Front"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                    Front Cover
                  </span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <NumberPlate number={formData.vehicleNumber || "MH 00 XX 0000"} />
                  <span className="text-[10px] text-slate-400 font-bold">
                    {formData.year} Model
                  </span>
                </div>
                <h4 className="text-sm font-black tracking-tight line-clamp-1">
                  {formData.vehicleModel || "Commercial Vehicle"} {formData.subCategory ? `(${formData.subCategory})` : ""}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{formData.parkingLocation || "Parking Hub"}</span>
                </div>
              </div>

              {/* Spec Badges Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400">Color & Variant</p>
                  <p className="font-bold text-slate-800 truncate">{formData.color} {formData.variant ? `· ${formData.variant}` : ""}</p>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <p className="text-[10px] text-slate-400">Capacity & Transmission</p>
                  <p className="font-bold text-slate-800">{formData.seatingCapacity} Seater · {formData.transmission}</p>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 col-span-2">
                  <p className="text-[10px] text-slate-400">Fuel System</p>
                  <p className="font-bold text-slate-800 truncate">{formData.fuelType} {formData.alternateFuel !== "None" ? `+ ${formData.alternateFuel}` : ""}</p>
                </div>
              </div>

              {/* Selected Features Pill Tags */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Amenities ({formData.features.length})
                </p>
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

          {/* Registration Submit Action Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Submit & Register
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>RC Expiry:</span>
                <span className="font-bold font-mono text-slate-900">{formData.rcExpiry || "Pending"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Insurance Expiry:</span>
                <span className="font-bold font-mono text-slate-900">{formData.insuranceExpiry || "Pending"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Inspection Photos:</span>
                <span className="font-bold text-slate-900">{formData.photos.length} Uploaded</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Vehicle...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save & Register Commercial Vehicle
                </>
              )}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
