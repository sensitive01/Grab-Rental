"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  Car, 
  Edit3, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Users, 
  Fuel, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Sparkles, 
  Loader2, 
  Phone,
  Gauge,
  Wind,
  Check,
  Zap,
  Settings,
  Tv,
  Sun,
  Eye,
  Star,
  MessageCircle,
  HelpCircle,
  Share2,
  Heart,
  Award,
  Video,
  Play,
  Armchair,
  Maximize2,
  X,
  Layers
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { axiosClient } from "@/lib/axiosClient";
import { formatINR } from "@/lib/utils";
import { getCurrentUser, getVendorStatus, isVendorApproved } from "@/lib/auth";
import { vendorApi } from "@/lib/vendorApi";

export const EXTERIOR_SLOT_DEFS = [
  { id: "front", label: "Front View", subtitle: "Front bumper, grille & plate", required: true },
  { id: "back", label: "Back View", subtitle: "Rear boot, glass & taillights", required: true },
  { id: "left", label: "Left Side", subtitle: "Full left side profile", required: true },
  { id: "right", label: "Right Side", subtitle: "Full right side profile", required: true },
  { id: "luggage", label: "Luggage Carrier", subtitle: "Roof rack or carrier (optional)", required: false },
];

export const INTERIOR_SLOT_DEFS = [
  { id: "frontSeats", label: "Front Seats", subtitle: "Driver & co-passenger seats", required: true },
  { id: "backSeats", label: "Back Seats", subtitle: "Rear passenger cabin & legroom", required: true },
  { id: "handle", label: "Handle & Steering", subtitle: "Steering wheel & dashboard", required: true },
];

export default function VendorVehicleDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const vehicleId = unwrappedParams.id;

  const [vehicle, setVehicle] = useState(null);
  const [similarVehicles, setSimilarVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorStatus, setVendorStatus] = useState("PENDING");

  // Gallery state
  const [photoCategory, setPhotoCategory] = useState("all"); // "all" | "exterior" | "interior"
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null); // index or null
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Initial check from local user session
    const currentUser = getCurrentUser();
    if (currentUser?.status) {
      setVendorStatus(currentUser.status);
    }

    async function loadVehicle() {
      try {
        const [res, allRes, profileRes] = await Promise.all([
          axiosClient.get(`/api/vendor/vehicles/${vehicleId}`).catch(() => null),
          axiosClient.get("/api/vendor/vehicles").catch(() => null),
          vendorApi.getProfile().catch(() => null)
        ]);

        const freshStatus = profileRes?.status || profileRes?.approvalStatus;
        if (freshStatus) {
          setVendorStatus(freshStatus);
        }

        if (res?.data?.success && res.data?.data) {
          const v = res.data.data;
          let parsedPhotos = [];
          let photoSlots = {
            front: "",
            back: "",
            left: "",
            right: "",
            luggage: "",
            frontSeats: "",
            backSeats: "",
            handle: ""
          };

          if (v.photos) {
            try {
              const parsed = JSON.parse(v.photos);
              if (Array.isArray(parsed)) {
                parsedPhotos = parsed;
                // Standard order: [front, back, left, right, frontSeats, backSeats, handle, luggage]
                if (parsed[0]) photoSlots.front = parsed[0];
                if (parsed[1]) photoSlots.back = parsed[1];
                if (parsed[2]) photoSlots.left = parsed[2];
                if (parsed[3]) photoSlots.right = parsed[3];
                if (parsed[4]) photoSlots.frontSeats = parsed[4];
                if (parsed[5]) photoSlots.backSeats = parsed[5];
                if (parsed[6]) photoSlots.handle = parsed[6];
                if (parsed[7]) photoSlots.luggage = parsed[7];
              } else if (typeof parsed === "object" && parsed !== null) {
                if (parsed.slots) {
                  photoSlots = { ...photoSlots, ...parsed.slots };
                  parsedPhotos = parsed.list || Object.values(parsed.slots).filter(Boolean);
                } else {
                  photoSlots = { ...photoSlots, ...parsed };
                  parsedPhotos = Object.values(parsed).filter(Boolean);
                }
              }
            } catch {
              parsedPhotos = v.photos.split(",").map((s) => s.trim()).filter(Boolean);
              if (parsedPhotos[0]) photoSlots.front = parsedPhotos[0];
              if (parsedPhotos[1]) photoSlots.back = parsedPhotos[1];
              if (parsedPhotos[2]) photoSlots.left = parsedPhotos[2];
              if (parsedPhotos[3]) photoSlots.right = parsedPhotos[3];
              if (parsedPhotos[4]) photoSlots.frontSeats = parsedPhotos[4];
              if (parsedPhotos[5]) photoSlots.backSeats = parsedPhotos[5];
              if (parsedPhotos[6]) photoSlots.handle = parsedPhotos[6];
              if (parsedPhotos[7]) photoSlots.luggage = parsedPhotos[7];
            }
          }

          // Check if onboarding data from localStorage has slots
          if (typeof window !== "undefined") {
            try {
              const raw = localStorage.getItem("grabrentals_vendor_onboarding");
              if (raw) {
                const ob = JSON.parse(raw);
                if (ob?.vehiclePhotoSlots) {
                  Object.keys(ob.vehiclePhotoSlots).forEach((k) => {
                    if (ob.vehiclePhotoSlots[k] && !photoSlots[k]) {
                      photoSlots[k] = ob.vehiclePhotoSlots[k];
                    }
                  });
                }
                if (parsedPhotos.length === 0 && Array.isArray(ob?.vehiclePhotos) && ob.vehiclePhotos.length > 0) {
                  parsedPhotos = ob.vehiclePhotos;
                }
              }
            } catch (ignored) {}
          }

          if (!photoSlots.front && v.imageUrl) {
            photoSlots.front = v.imageUrl;
          }
          if (parsedPhotos.length === 0 && v.imageUrl) {
            parsedPhotos = [v.imageUrl];
          }

          setVehicle({
            id: v.id,
            model: v.model || "N/A",
            tag: "Active Fleet",
            type: v.vehicleType || "N/A",
            seatingCapacity: v.seatingCapacity ? `${v.seatingCapacity} Seats` : "N/A",
            transmission: v.transmission || "N/A",
            fuelType: v.fuelType || "N/A",
            year: v.year || "N/A",
            mileage: v.mileage || "N/A",
            doors: v.doors ? `${v.doors} Doors` : "N/A",
            ac: v.acType || (v.ac ? "Yes AC" : "N/A"),
            dailyRate: v.dailyRate || null,
            perKmRate: v.perKmRate || null,
            status: v.status === "AVAILABLE" ? "Available" : (v.status || "N/A"),
            location: v.parkingLocation || v.currentLocation || "N/A",
            plateNumber: v.vehicleNumber || "N/A",
            registrationNumber: v.registrationNumber || v.vehicleNumber || "N/A",
            rcExpiry: v.rcExpiry || v.fitnessExpiry || v.rcExpiryDate || "N/A",
            insuranceExpiry: v.insuranceExpiry || v.insuranceExpiryDate || "N/A",
            description: v.description || (v.model ? `${v.model} registered under fleet.` : "N/A"),
            about: v.about || (v.model ? `The ${v.model} (${v.vehicleNumber || "N/A"}) is registered with the fleet.` : "N/A"),
            highlights: [
              "Well maintained and regularly serviced",
              "Available with or without chauffeur"
            ],
            photos: parsedPhotos.length > 0 ? parsedPhotos : ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80"],
            photoSlots,
            features: v.features ? (typeof v.features === "string" ? v.features.split(",").map((f) => f.trim()).filter(Boolean) : v.features) : []
          });
        } else {
          setVehicle(null);
        }

        // Similar vehicles from real fleet
        if (allRes?.data?.success && Array.isArray(allRes.data?.data)) {
          const others = allRes.data.data
            .filter((item) => item.id !== vehicleId)
            .slice(0, 4)
            .map((item) => ({
              id: item.id,
              model: item.model,
              category: item.vehicleType || "Fleet",
              seats: `${item.seatingCapacity || 5} Seats`,
              transmission: item.transmission || "Automatic",
              price: item.dailyRate || 3500,
              rating: 4.8,
              image: item.imageUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80"
            }));
          setSimilarVehicles(others);
        }
      } catch (err) {
        console.warn("Error loading vehicle details:", err);
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    }

    loadVehicle();
  }, [vehicleId]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : combinedPhotos.length - 1));
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev < combinedPhotos.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-bold text-slate-600">Loading vehicle details & photos...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <Car className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">Vehicle Not Found</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The vehicle you are looking for does not exist in your fleet or may have been deleted.
        </p>
        <div className="pt-2">
          <Link
            href="/vendor/vehicles"
            className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors inline-block"
          >
            Back to Fleet Catalog
          </Link>
        </div>
      </div>
    );
  }

  const vData = vehicle;
  const photoSlots = vData.photoSlots || {};

  // Build categorized lists
  const exteriorPhotos = EXTERIOR_SLOT_DEFS.map((slot) => ({
    ...slot,
    category: "Exterior",
    url: photoSlots[slot.id] || ""
  })).filter((p) => Boolean(p.url));

  const interiorPhotos = INTERIOR_SLOT_DEFS.map((slot) => ({
    ...slot,
    category: "Interior",
    url: photoSlots[slot.id] || ""
  })).filter((p) => Boolean(p.url));

  // If both are empty (fallback from generic photos array)
  let combinedPhotos = [...exteriorPhotos, ...interiorPhotos];
  if (combinedPhotos.length === 0) {
    const rawPhotos = vData.photos && vData.photos.length > 0 ? vData.photos : ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80"];
    combinedPhotos = rawPhotos.map((url, idx) => {
      const isExt = idx < 4 || idx === 7;
      let label = "Vehicle View";
      let subtitle = "Vehicle Angle";
      if (idx === 0) { label = "Front View"; subtitle = "Front profile"; }
      else if (idx === 1) { label = "Back View"; subtitle = "Rear profile"; }
      else if (idx === 2) { label = "Left Side"; subtitle = "Left profile"; }
      else if (idx === 3) { label = "Right Side"; subtitle = "Right profile"; }
      else if (idx === 4) { label = "Front Seats"; subtitle = "Driver & front passenger"; }
      else if (idx === 5) { label = "Back Seats"; subtitle = "Rear cabin seats"; }
      else if (idx === 6) { label = "Handle & Steering"; subtitle = "Dashboard & steering wheel"; }
      else if (idx === 7) { label = "Luggage Carrier"; subtitle = "Roof luggage rack"; }

      return {
        id: `slot-${idx}`,
        label,
        subtitle,
        category: isExt ? "Exterior" : "Interior",
        url
      };
    });
  }

  // Active photos based on category tab
  const displayPhotos = photoCategory === "exterior"
    ? (exteriorPhotos.length > 0 ? exteriorPhotos : combinedPhotos.filter(p => p.category === "Exterior"))
    : photoCategory === "interior"
      ? (interiorPhotos.length > 0 ? interiorPhotos : combinedPhotos.filter(p => p.category === "Interior"))
      : combinedPhotos;

  const currentPhotoItem = displayPhotos[selectedPhotoIndex] || displayPhotos[0] || combinedPhotos[0];
  const currentPhotoUrl = currentPhotoItem?.url || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80";

  const handlePrevPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev === 0 ? displayPhotos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev === displayPhotos.length - 1 ? 0 : prev + 1));
  };

  const handleCategorySwitch = (cat) => {
    setPhotoCategory(cat);
    setSelectedPhotoIndex(0);
  };

  return (
    <div className="max-w-[1500px] mx-auto px-3 sm:px-6 py-4 space-y-8 pb-16">
      
      {/* ========================================================= */}
      {/* 1. BREADCRUMBS                                            */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <span>&gt;</span>
          <Link href="/vendor/vehicles" className="hover:text-amber-600 transition-colors">Cars</Link>
          <span>&gt;</span>
          <span className="text-slate-500">{vData.type}</span>
          <span>&gt;</span>
          <span className="text-slate-900 font-bold">{vData.model}</span>
        </nav>

        <Link
          href={`/vendor/vehicles/${vData.id}/edit`}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-xs shadow-amber-500/20 flex items-center gap-1.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit Vehicle
        </Link>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN 2-COLUMN SECTION: Gallery (Left) + Details (Right) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Photo Carousel & Thumbnails (Width 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Category Filter Pills (Exterior / Interior / All) */}
          <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/90 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleCategorySwitch("all")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  photoCategory === "all"
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Photos</span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded-full text-slate-700">
                  {combinedPhotos.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySwitch("exterior")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  photoCategory === "exterior"
                    ? "bg-amber-500 text-slate-950 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Exterior</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full">
                  {exteriorPhotos.length || 5}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySwitch("interior")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  photoCategory === "interior"
                    ? "bg-purple-600 text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Armchair className="w-3.5 h-3.5" />
                <span>Interior</span>
                <span className="text-[10px] bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded-full">
                  {interiorPhotos.length || 3}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const idx = combinedPhotos.findIndex((p) => p.url === currentPhotoUrl);
                setLightboxIndex(idx >= 0 ? idx : 0);
              }}
              className="text-xs text-amber-600 hover:text-amber-700 font-bold px-2 py-1 flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          </div>

          {/* Main Hero Photo Container */}
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/90 shadow-xs group select-none">
            <img
              src={currentPhotoUrl}
              alt={`${vData.model} - ${currentPhotoItem?.label || "Vehicle View"}`}
              className="w-full h-full object-cover transition-transform duration-300"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80";
              }}
            />

            {/* Top-Left Badges: Category & Slot Name */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold backdrop-blur-md shadow-xs ${
                currentPhotoItem?.category === "Interior"
                  ? "bg-purple-900/80 text-purple-200 border border-purple-500/30"
                  : "bg-slate-900/80 text-amber-300 border border-amber-400/30"
              }`}>
                {currentPhotoItem?.category === "Interior" ? (
                  <Armchair className="w-3.5 h-3.5 text-purple-300" />
                ) : (
                  <Car className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{currentPhotoItem?.category || "Exterior"}</span>
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md">
                {currentPhotoItem?.label || "Vehicle View"}
              </span>
            </div>

            {/* Photo Counter Overlay (e.g. 1 / 8) */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-black/60 text-white backdrop-blur-md">
                {selectedPhotoIndex + 1} / {displayPhotos.length}
              </span>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrevPhoto}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all opacity-80 hover:opacity-100 cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              onClick={handleNextPhoto}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all opacity-80 hover:opacity-100 cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* ALL Thumbnails Strip with Category Badges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Showing {displayPhotos.length} {photoCategory.toUpperCase()} Photos</span>
              <span className="text-[11px] text-slate-400">Click thumbnail to switch photo</span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {displayPhotos.map((item, idx) => {
                const isSelected = selectedPhotoIndex === idx;
                const isInterior = item.category === "Interior";
                return (
                  <button
                    key={item.id || idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-24 sm:w-28 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer text-left group ${
                      isSelected
                        ? isInterior 
                          ? "border-purple-600 ring-2 ring-purple-500/20 shadow-md scale-102"
                          : "border-amber-500 ring-2 ring-amber-500/20 shadow-md scale-102"
                        : "border-slate-200 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400";
                      }}
                    />
                    
                    {/* Badge Overlay on Thumbnail */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1 pt-3 text-white">
                      <div className="flex items-center justify-between text-[9px] leading-tight font-extrabold truncate">
                        <span className="truncate">{item.label}</span>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isInterior ? "bg-purple-400" : "bg-amber-400"}`} />
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Video Thumbnail Tile */}
              <div className="relative w-24 sm:w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-900/90 text-white flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-950 transition-colors">
                <Play className="w-4 h-4 fill-white text-white" />
                <span className="text-[10px] font-bold tracking-tight">360° Video</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Vehicle Specs & Fleet Details Panel (Width 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header Title & Fleet Status */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-900 border border-amber-500/30">
                <Car className="w-3.5 h-3.5 text-amber-600" />
                {vData.type || "Fleet Vehicle"}
              </span>
              {vendorStatus === "PENDING" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Pending Admin Approval
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active in Fleet
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {vData.model}
            </h1>

            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-semibold">
              <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-800 font-mono font-bold tracking-wider">
                {vData.plateNumber || "REGISTRATION PENDING"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {vData.location || "Bangalore"}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
              {vData.description}
            </p>
          </div>

          {/* 8-Icon Specification Grid */}
          <div className="grid grid-cols-4 gap-2.5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
            {/* 1. Vehicle Type */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Car className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.type || "N/A"}</span>
              <span className="text-[10px] text-slate-400">Vehicle Type</span>
            </div>

            {/* 2. Seating Capacity */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Users className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.seatingCapacity || "N/A"}</span>
              <span className="text-[10px] text-slate-400">Seating Capacity</span>
            </div>

            {/* 3. Transmission */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Settings className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.transmission || "N/A"}</span>
              <span className="text-[10px] text-slate-400">Transmission</span>
            </div>

            {/* 4. Fuel Type */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Fuel className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.fuelType || "N/A"}</span>
              <span className="text-[10px] text-slate-400">Fuel Type</span>
            </div>

            {/* 5. Model Year */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Calendar className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.year || "N/A"}</span>
              <span className="text-[10px] text-slate-400">Model Year</span>
            </div>

            {/* 6. Mileage */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Gauge className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.mileage || "N/A"}</span>
              <span className="text-[10px] text-slate-400">Mileage</span>
            </div>

            {/* 7. Doors */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Car className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.doors || "N/A"}</span>
              <span className="text-[10px] text-slate-400">Doors</span>
            </div>

            {/* 8. AC */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Wind className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.ac || "N/A"}</span>
              <span className="text-[10px] text-slate-400">AC</span>
            </div>
          </div>

          {/* Vehicle Fleet Registration & Compliance Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Registration & Document Status
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Compliance verified fleet records</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            {/* Vehicle Fleet Parameters */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Plate Number</span>
                <span className="text-xs font-black text-slate-900 font-mono">{vData.plateNumber || "N/A"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Registered City</span>
                <span className="text-xs font-black text-slate-900">{vData.location || "N/A"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">RC Validity</span>
                <span className="text-xs font-bold text-slate-800">{vData.rcExpiry || "N/A"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Insurance Policy</span>
                <span className="text-xs font-bold text-slate-800">{vData.insuranceExpiry || "N/A"}</span>
              </div>
            </div>

            {/* Fleet Management Action Links */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <Link
                href="/vendor/vehicles"
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors text-center"
              >
                ← Back to Fleet
              </Link>
              <Link
                href="/vendor/vehicles/availability"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-xs shadow-amber-500/20 text-center"
              >
                Availability Calendar
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. DEDICATED FULL PHOTO SHOWCASE: Organized by Exterior & Interior Views   */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> High-Resolution Inspection Gallery
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Vehicle Photos (Exterior & Interior)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Complete photographic documentation uploaded during vendor registration. Click any photo to view in high resolution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              5 Exterior Slots
            </span>
            <span className="text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl">
              3 Interior Slots
            </span>
          </div>
        </div>

        {/* SECTION A: EXTERIOR PHOTOS (5 Slots) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Exterior Views ({exteriorPhotos.length}/5 Uploaded)
              </h3>
              <p className="text-xs text-slate-500">
                Front, Back, Left, Right profiles and roof luggage carrier
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {EXTERIOR_SLOT_DEFS.map((slot) => {
              const photoUrl = photoSlots[slot.id];
              const fullItemIndex = combinedPhotos.findIndex((p) => p.url === photoUrl);

              return (
                <div
                  key={slot.id}
                  onClick={() => {
                    if (photoUrl) {
                      setLightboxIndex(fullItemIndex >= 0 ? fullItemIndex : 0);
                    }
                  }}
                  className={`group relative rounded-2xl overflow-hidden border transition-all ${
                    photoUrl 
                      ? "border-slate-200 hover:border-amber-400 bg-white hover:shadow-md cursor-pointer" 
                      : "border-dashed border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                    {photoUrl ? (
                      <>
                        <img
                          src={photoUrl}
                          alt={slot.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-5 h-5 drop-shadow-md" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs p-3 text-center">
                        <Car className="w-6 h-6 text-slate-300 mb-1" />
                        <span className="text-[10px] font-bold text-slate-400">Not Uploaded</span>
                      </div>
                    )}

                    {/* Tag badge */}
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-xs text-amber-300 px-2 py-0.5 rounded-md">
                        Exterior
                      </span>
                    </div>

                    {slot.required && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs font-black bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-md">
                          *
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-white">
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                      {slot.label}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {slot.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION B: INTERIOR PHOTOS (3 Slots) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-700 flex items-center justify-center font-bold">
              <Armchair className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Interior Cabin Views ({interiorPhotos.length}/3 Uploaded)
              </h3>
              <p className="text-xs text-slate-500">
                Front seats, rear passenger cabin and steering/dashboard controls
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {INTERIOR_SLOT_DEFS.map((slot) => {
              const photoUrl = photoSlots[slot.id];
              const fullItemIndex = combinedPhotos.findIndex((p) => p.url === photoUrl);

              return (
                <div
                  key={slot.id}
                  onClick={() => {
                    if (photoUrl) {
                      setLightboxIndex(fullItemIndex >= 0 ? fullItemIndex : 0);
                    }
                  }}
                  className={`group relative rounded-2xl overflow-hidden border transition-all ${
                    photoUrl 
                      ? "border-slate-200 hover:border-purple-400 bg-white hover:shadow-md cursor-pointer" 
                      : "border-dashed border-slate-200 bg-slate-50/50"
                  }`}
                >
                  <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                    {photoUrl ? (
                      <>
                        <img
                          src={photoUrl}
                          alt={slot.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-5 h-5 drop-shadow-md" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs p-3 text-center">
                        <Armchair className="w-6 h-6 text-slate-300 mb-1" />
                        <span className="text-[10px] font-bold text-slate-400">Not Uploaded</span>
                      </div>
                    )}

                    {/* Tag badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-xs text-purple-300 px-2.5 py-0.5 rounded-md">
                        Interior
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-xs font-black bg-purple-600 text-white px-1.5 py-0.2 rounded-md">
                        *
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white">
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                      {slot.label}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {slot.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 4. TABBED CONTENT SECTION: Overview / Features / Terms...  */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
        
        {/* Tab Headers */}
        <div className="flex items-center gap-6 border-b border-slate-200/90 overflow-x-auto scrollbar-none">
          {[
            { id: "overview", label: "Overview" },
            { id: "features", label: "Features & Amenities" },
            { id: "terms", label: "Rental Terms & Policies" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                  isActive
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            
            {/* About this Vehicle */}
            <div>
              <h2 className="text-sm font-black text-slate-900 mb-2">
                About this Vehicle
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                {vData.about}
              </p>
            </div>

            {/* Key Highlights */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-900 tracking-tight mb-3">
                Fleet Highlights & Standards
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {vData.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

        {/* Tab 2: Features & Amenities */}
        {activeTab === "features" && (
          vData.features && vData.features.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {vData.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200/80 text-center text-xs font-bold text-slate-400">
              No features added (N/A)
            </div>
          )
        )}

        {/* Tab 3: Rental Terms */}
        {activeTab === "terms" && (
          <div className="space-y-4 text-xs text-slate-600">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900">Mileage & Fuel Policy</h4>
              <p>Vehicle should be returned with the same fuel level as dispatched. Standard trip distance and fuel terms apply as per fleet dispatch guidelines.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900">Security Deposit & Compliance</h4>
              <p>Government issued commercial permits, fitness certifications, and active insurance policy maintained in fleet records.</p>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* 6. FULLSCREEN LIGHTBOX MODAL                              */}
      {/* ========================================================= */}
      {lightboxIndex !== null && combinedPhotos[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          
          {/* Top modal bar */}
          <div className="w-full flex items-center justify-between text-white z-10 pb-2">
            <div className="flex items-center gap-2.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                combinedPhotos[lightboxIndex].category === "Interior" 
                  ? "bg-purple-600 text-white" 
                  : "bg-amber-500 text-slate-950"
              }`}>
                {combinedPhotos[lightboxIndex].category}
              </span>
              <h3 className="text-sm sm:text-base font-black truncate">
                {combinedPhotos[lightboxIndex].label}
              </h3>
              <span className="text-xs text-slate-400">
                ({lightboxIndex + 1} of {combinedPhotos.length})
              </span>
            </div>

            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Image in Lightbox */}
          <div className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-6 select-none">
            <img
              src={combinedPhotos[lightboxIndex].url}
              alt={combinedPhotos[lightboxIndex].label}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : combinedPhotos.length - 1));
              }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev < combinedPhotos.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Bottom thumbnails strip */}
          <div className="w-full max-w-3xl flex items-center justify-center gap-2 overflow-x-auto py-2">
            {combinedPhotos.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  lightboxIndex === idx ? "border-amber-400 scale-110" : "border-white/20 opacity-50 hover:opacity-100"
                }`}
              >
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
