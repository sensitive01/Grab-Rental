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
  Play
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { axiosClient } from "@/lib/axiosClient";
import { formatINR } from "@/lib/utils";

export default function VendorVehicleDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const vehicleId = unwrappedParams.id;

  const [vehicle, setVehicle] = useState(null);
  const [similarVehicles, setSimilarVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  // Booking Card state
  const [pickupLocation, setPickupLocation] = useState("Bangalore");
  const [pickupDate, setPickupDate] = useState("2026-09-15");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropoffDate, setDropoffDate] = useState("2026-09-16");
  const [dropoffTime, setDropoffTime] = useState("10:00");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    async function loadVehicle() {
      try {
        const [res, allRes] = await Promise.all([
          axiosClient.get(`/api/vendor/vehicles/${vehicleId}`).catch(() => null),
          axiosClient.get("/api/vendor/vehicles").catch(() => null)
        ]);

        if (res?.data?.success && res.data?.data) {
          const v = res.data.data;
          let parsedPhotos = [];
          if (v.photos) {
            try {
              parsedPhotos = JSON.parse(v.photos);
            } catch {
              parsedPhotos = v.photos.split(",").map(s => s.trim()).filter(Boolean);
            }
          }

          if (parsedPhotos.length === 0 && v.imageUrl) {
            parsedPhotos = [v.imageUrl];
          }

          setVehicle({
            id: v.id,
            model: v.model,
            tag: "Active Fleet",
            rating: 4.8,
            reviewsCount: 12,
            type: v.vehicleType || "SUV",
            seatingCapacity: v.seatingCapacity || 7,
            transmission: v.transmission || "Automatic",
            fuelType: v.fuelType || "Diesel",
            year: v.year || 2024,
            mileage: "14 km/l",
            doors: "4 Doors",
            ac: v.acType ? "Yes AC" : "Yes AC",
            dailyRate: v.dailyRate || 3500,
            status: v.status === "AVAILABLE" ? "Available" : "Available",
            location: v.parkingLocation || v.currentLocation || "Bangalore",
            plateNumber: v.vehicleNumber,
            description: `${v.model} offers superior ride quality, spacious interior and uncompromised safety standards for your journeys.`,
            about: `The ${v.model} (${v.vehicleNumber}) is thoroughly inspected and certified for premium chauffeur and self-drive deployments. Well-suited for business executives, family tours, and airport transfers.`,
            highlights: [
              "Well maintained and regularly serviced",
              "Comfortable for long drives",
              "Large luggage space",
              "Available with or without chauffeur",
              "Ideal for family trips, corporate travel and tours"
            ],
            whyRentWithUs: [
              "Well maintained vehicles",
              "Flexible rental plans (hourly, daily, outstation)",
              "Professional chauffeurs (optional)",
              "Transparent pricing",
              "24/7 customer support",
              "Easy online booking"
            ],
            photos: parsedPhotos.length > 0 ? parsedPhotos : ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80"],
            features: v.features ? (typeof v.features === "string" ? v.features.split(",").map(f => f.trim()) : v.features) : ["Dual-Zone AC", "ABS with EBD", "Airbags", "Bluetooth"]
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-bold text-slate-600">Loading vehicle details...</p>
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
  const photos = vData.photos && vData.photos.length > 0 ? vData.photos : ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80"];
  const currentPhoto = photos[selectedPhotoIndex] || photos[0];

  const handlePrevPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="max-w-[1500px] mx-auto px-3 sm:px-6 py-4 space-y-8 pb-16">
      
      {/* ========================================================= */}
      {/* 1. BREADCRUMBS (Matches Screenshot 2)                      */}
      {/* ========================================================= */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>&gt;</span>
        <Link href="/vendor/vehicles" className="hover:text-blue-600 transition-colors">Cars</Link>
        <span>&gt;</span>
        <span className="text-slate-500">{vData.type}</span>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold">{vData.model}</span>
      </nav>

      {/* ========================================================= */}
      {/* 2. MAIN 2-COLUMN SECTION: Gallery (Left) + Details (Right) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Photo Carousel & Thumbnails (Width 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Hero Photo Container */}
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-xs group select-none">
            <img
              src={currentPhoto}
              alt={vData.model}
              className="w-full h-full object-cover transition-transform duration-300"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80";
              }}
            />

            {/* Popular Badge */}
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Popular
              </span>
            </div>

            {/* Photo Counter Overlay (e.g. 1 / 8) */}
            <div className="absolute bottom-4 right-4 z-10">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-black/60 text-white backdrop-blur-md">
                {selectedPhotoIndex + 1} / {photos.length}
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

          {/* Thumbnail Strip with Video Button */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {photos.slice(0, 5).map((photoUrl, idx) => {
              const isSelected = selectedPhotoIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-500/20 shadow-xs scale-102"
                      : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                >
                  <img
                    src={photoUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400";
                    }}
                  />
                </button>
              );
            })}

            {/* Video Thumbnail Tile */}
            <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-900/90 text-white flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-950 transition-colors">
              <Play className="w-4 h-4 fill-white text-white" />
              <span className="text-[10px] font-bold tracking-tight">Video</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Vehicle Specs & Booking Panel (Width 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header Title & Ratings */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {vData.model}
            </h1>
            
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{vData.rating || 4.8}</span>
              </div>
              <span className="text-slate-400">({vData.reviewsCount || 256} reviews)</span>
              <span className="text-slate-300">•</span>
              <button className="text-blue-600 font-semibold hover:underline cursor-pointer">
                Write a review
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
              {vData.description}
            </p>
          </div>

          {/* 8-Icon Specification Grid (Exact Match to Screenshot 2) */}
          <div className="grid grid-cols-4 gap-2.5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
            {/* 1. Vehicle Type */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Car className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.type}</span>
              <span className="text-[10px] text-slate-400">Vehicle Type</span>
            </div>

            {/* 2. Seating Capacity */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Users className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.seatingCapacity} Seats</span>
              <span className="text-[10px] text-slate-400">Seating Capacity</span>
            </div>

            {/* 3. Transmission */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Settings className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.transmission}</span>
              <span className="text-[10px] text-slate-400">Transmission</span>
            </div>

            {/* 4. Fuel Type */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Fuel className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.fuelType}</span>
              <span className="text-[10px] text-slate-400">Fuel Type</span>
            </div>

            {/* 5. Model Year */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Calendar className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.year}</span>
              <span className="text-[10px] text-slate-400">Model Year</span>
            </div>

            {/* 6. Mileage */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Gauge className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.mileage || "12 km/l"}</span>
              <span className="text-[10px] text-slate-400">Mileage</span>
            </div>

            {/* 7. Doors */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Car className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.doors || "4 Doors"}</span>
              <span className="text-[10px] text-slate-400">Doors</span>
            </div>

            {/* 8. AC */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-2xs">
              <Wind className="w-5 h-5 text-slate-700 mb-1" />
              <span className="text-[11px] font-extrabold text-slate-900">{vData.ac || "Yes"}</span>
              <span className="text-[10px] text-slate-400">AC</span>
            </div>
          </div>

          {/* Sticky Booking Widget Box (Exact Match to Screenshot 2) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            
            {/* Price Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-blue-600">
                    {formatINR(vData.dailyRate)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">/ day</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Inclusive of basic insurance</p>
              </div>

              {/* Status Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Available
              </span>
            </div>

            {/* Booking Form Fields */}
            <div className="space-y-3">
              
              {/* Pick-up Location */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Pick-up Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
              </div>

              {/* Pick-up Date & Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Pick-up Date</label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Pick-up Time</label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Drop-off Date & Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Drop-off Date</label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={dropoffDate}
                      onChange={(e) => setDropoffDate(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Drop-off Time</label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="time"
                      value={dropoffTime}
                      onChange={(e) => setDropoffTime(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Action Buttons: Book Now + Enquire on WhatsApp */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => setBookingSuccess(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Book Now</span>
              </button>

              <a
                href={`https://wa.me/919876543210?text=Hi,%20I%20am%20interested%20in%20booking%20the%20${encodeURIComponent(vData.model)}%20(${vData.plateNumber})`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Enquire on WhatsApp</span>
              </a>

              {bookingSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Booking inquiry initialized! Partner fleet team will confirm slot.</span>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. TABBED CONTENT SECTION: Overview / Features / Terms...  */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
        
        {/* Tab Headers */}
        <div className="flex items-center gap-6 border-b border-slate-200/90 overflow-x-auto scrollbar-none">
          {[
            { id: "overview", label: "Overview" },
            { id: "features", label: "Features & Amenities" },
            { id: "terms", label: "Rental Terms" },
            { id: "reviews", label: "Reviews (256)" },
            { id: "faqs", label: "FAQs" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                  isActive
                    ? "border-blue-600 text-blue-600"
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

            {/* Key Highlights & Why Rent With Us */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
              
              {/* Key Highlights */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 tracking-tight">
                  Key Highlights
                </h3>
                <ul className="space-y-2">
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

              {/* Why Rent with Us? */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 tracking-tight">
                  Why Rent with Us?
                </h3>
                <ul className="space-y-2">
                  {vData.whyRentWithUs.map((w, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Features & Amenities */}
        {activeTab === "features" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {vData.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Rental Terms */}
        {activeTab === "terms" && (
          <div className="space-y-4 text-xs text-slate-600">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900">Mileage & Fuel Policy</h4>
              <p>Base pricing includes up to 250 km/day. Additional travel is charged at ₹{vData.perKmRate || 16}/km. Vehicle should be returned with the same fuel level as dispatched.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900">Security Deposit & ID Proof</h4>
              <p>Government issued Photo ID and commercial driving permit required for verification upon handover.</p>
            </div>
          </div>
        )}

        {/* Tab 4: Reviews */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="text-3xl font-black text-blue-600">4.8</div>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">Based on 256 verified vendor and customer trips</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: FAQs */}
        {activeTab === "faqs" && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">What documents are required during vehicle pickup?</div>
              <p className="text-slate-600">A valid government ID (Aadhaar or Passport) along with booking reference confirmation.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">Is interstate permit included?</div>
              <p className="text-slate-600">State border taxes and toll charges are payable directly at toll plazas or billed transparently based on trip route.</p>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* 4. SIMILAR VEHICLES ROW (Matches Screenshot 2)             */}
      {/* ========================================================= */}
      {similarVehicles && similarVehicles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Similar Vehicles
            </h2>
            <div className="flex items-center gap-3">
              <Link
                href="/vendor/vehicles"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarVehicles.map((sim) => (
              <div
                key={sim.id}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-100">
                    <img
                      src={sim.image}
                      alt={sim.model}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                    {sim.model}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{sim.category}</p>

                  <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 my-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{sim.seats}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="w-3 h-3 text-slate-400" />
                      <span>{sim.transmission}</span>
                    </div>
                  </div>

                  <div className="text-sm font-black text-blue-600 my-1">
                    {formatINR(sim.price)} <span className="text-[11px] font-bold text-slate-400">/ day</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{sim.rating}</span>
                  </div>
                  <Link
                    href={`/vendor/vehicles/${sim.id}`}
                    className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
