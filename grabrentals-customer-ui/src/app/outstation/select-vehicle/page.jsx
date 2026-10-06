"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import VehicleTripHeader from "@/components/booking/VehicleTripHeader";
import ModifyBookingModal from "@/components/booking/ModifyBookingModal";
import VehicleDetailModal from "@/components/booking/VehicleDetailModal";
import { customerApi } from "@/lib/customerApi";
import { 
  Search, 
  RotateCcw, 
  Car, 
  Fuel, 
  Settings2, 
  Users, 
  Calendar, 
  MapPin, 
  User, 
  LayoutGrid, 
  List as ListIcon, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Check, 
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  SlidersHorizontal,
  Loader2
} from "lucide-react";

function estimateRouteDistance(from, to, stops, tripType) {
  const points = [from || ""];
  if (stops) {
    const list = Array.isArray(stops) ? stops : stops.split(/[|,]/);
    list.forEach((s) => { if (s && s.trim()) points.push(s.trim()); });
  }
  points.push(to || "");

  const getLegKm = (src, dst) => {
    const f = (src || "").toLowerCase();
    const t = (dst || "").toLowerCase();
    const match = (c1, c2) => (f.includes(c1) && t.includes(c2)) || (f.includes(c2) && t.includes(c1));

    if (match("bangalore", "coimbatore") || match("bengaluru", "coimbatore")) return 365;
    if (match("bangalore", "chennai") || match("bengaluru", "chennai")) return 347;
    if (match("bangalore", "mysore") || match("bengaluru", "mysore")) return 145;
    if (match("bangalore", "hyderabad") || match("bengaluru", "hyderabad")) return 575;
    if (match("bangalore", "ooty") || match("bengaluru", "ooty")) return 275;
    if (match("bangalore", "pondicherry") || match("bengaluru", "pondicherry")) return 315;
    if (match("bangalore", "salem") || match("bengaluru", "salem")) return 200;
    if (match("bangalore", "madurai") || match("bengaluru", "madurai")) return 435;
    if (match("salem", "coimbatore")) return 165;
    if (match("chennai", "coimbatore")) return 505;
    if (match("mumbai", "pune")) return 155;
    if (match("delhi", "jaipur")) return 280;
    if (match("delhi", "agra")) return 235;
    return 180;
  };

  let oneWayKm = 0;
  if (points.length <= 2) {
    oneWayKm = getLegKm(points[0], points[1]);
    if (oneWayKm === 180) oneWayKm = 320;
  } else {
    for (let i = 0; i < points.length - 1; i++) {
      oneWayKm += getLegKm(points[i], points[i + 1]);
    }
  }

  const isRound = (tripType || "").toLowerCase().includes("round");
  return isRound ? oneWayKm * 2 : oneWayKm;
}

function formatDateDisplay(rawDate) {
  if (!rawDate) return "28-09-2026";
  try {
    const parts = rawDate.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return rawDate;
  } catch {
    return rawDate;
  }
}

function formatTimeDisplay(rawTime) {
  if (!rawTime) return "7:00 AM";
  try {
    const [hh, mm] = rawTime.split(":");
    let h = parseInt(hh, 10);
    const m = mm || "00";
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  } catch {
    return rawTime;
  }
}

function cleanCityName(fullString) {
  if (!fullString) return "";
  return fullString.split(",")[0].trim();
}

function SelectVehicleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dynamic Query parameters from BookingWidget
  const queryFrom = searchParams.get("from") || "Bangalore, Karnataka";
  const queryTo = searchParams.get("to") || "Coimbatore, Tamil Nadu";
  const queryStops = searchParams.get("stops") || "";
  const queryTripType = searchParams.get("tripType") || "one-way";
  const queryDate = searchParams.get("pickupDate") || "2026-09-28";
  const queryTime = searchParams.get("pickupTime") || "07:00";

  const [trip, setTrip] = useState({
    from: queryFrom,
    to: queryTo,
    stops: queryStops,
    tripType: queryTripType.toLowerCase().includes("round") ? "Round trip" : "One way",
    date: queryDate,
    time: queryTime
  });

  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Real backend vehicles state (NO mock data)
  const [backendVehicles, setBackendVehicles] = useState([]);
  const [backendDistance, setBackendDistance] = useState(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedFuels, setSelectedFuels] = useState([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("all");

  // Sync state if query parameters change
  useEffect(() => {
    if (searchParams.get("from")) {
      setTrip({
        from: searchParams.get("from"),
        to: searchParams.get("to") || "Coimbatore, Tamil Nadu",
        stops: searchParams.get("stops") || "",
        tripType: (searchParams.get("tripType") || "one-way").toLowerCase().includes("round") ? "Round trip" : "One way",
        date: searchParams.get("pickupDate") || "2026-09-28",
        time: searchParams.get("pickupTime") || "07:00"
      });
    } else if (typeof window !== "undefined") {
      try {
        const pending = sessionStorage.getItem("grab_pending_trip");
        if (pending) {
          const parsed = JSON.parse(pending);
          setTrip(parsed);
        }
      } catch (err) {
        console.warn("Could not read pending trip", err);
      }
    }
  }, [searchParams]);

  // Compute Active Distance
  const fallbackDistance = useMemo(() => {
    return estimateRouteDistance(trip.from, trip.to, trip.stops, trip.tripType);
  }, [trip.from, trip.to, trip.stops, trip.tripType]);

  const activeDistance = backendDistance || fallbackDistance;

  // Fetch live vehicles from backend API
  useEffect(() => {
    let isCancelled = false;

    async function fetchLiveVehicles() {
      setIsLoadingVehicles(true);
      try {
        const res = await customerApi.searchVehicles({
          from: trip.from,
          to: trip.to,
          stops: trip.stops,
          tripType: trip.tripType.toLowerCase().includes("round") ? "ROUND_TRIP" : "ONE_WAY",
          pickupDate: trip.date,
          pickupTime: trip.time
        });

        if (!isCancelled && res?.data) {
          if (Array.isArray(res.data.vehicles)) {
            setBackendVehicles(res.data.vehicles);
          }
          if (res.data.distanceKm) {
            setBackendDistance(res.data.distanceKm);
          }
        }
      } catch (err) {
        console.warn("[SelectVehicle] Error fetching backend vehicles:", err);
        if (!isCancelled) {
          setBackendVehicles([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingVehicles(false);
        }
      }
    }

    fetchLiveVehicles();

    return () => {
      isCancelled = true;
    };
  }, [trip.from, trip.to, trip.stops, trip.tripType, trip.date, trip.time]);

  // Format and calculate live pricing for real backend vehicles
  const fleetWithPricing = useMemo(() => {
    return backendVehicles.map((car) => {
      const rawTitle = car.title || "Vehicle";
      const title = rawTitle.replace(/ or Equivalent/gi, "").trim();

      // Determine vehicle type
      let type = car.vehicleType;
      if (!type) {
        const cat = (car.category || "").toUpperCase();
        if (cat.includes("SUV")) type = "SUV";
        else if (cat.includes("HATCHBACK")) type = "Hatchback";
        else if (cat.includes("TEMPO") || cat.includes("VAN")) type = "Van / Minibus";
        else type = "Sedan";
      }

      // Fuel type
      let fuel = car.fuelType;
      if (!fuel) {
        if (Array.isArray(car.fuelOptions) && car.fuelOptions.length > 0) {
          fuel = typeof car.fuelOptions[0] === "string" ? car.fuelOptions[0] : (car.fuelOptions[0]?.name || "Diesel");
        } else {
          fuel = "Diesel";
        }
      }

      const transmission = car.transmission || "Automatic";
      const seats = car.seatingCapacity || car.seating || 4;
      const year = car.year || 2024;
      const reg = car.regNumber || car.vehicleNumber || "Commercial Fleet";
      const perKmRate = car.perKmRate || (type === "SUV" ? 19.5 : type === "Hatchback" ? 11.5 : 13.0);

      const tripDiscountedFare = car.pricing?.discountedPrice || Math.round(activeDistance * perKmRate);
      const originalFare = car.pricing?.originalPrice || Math.round(tripDiscountedFare * 1.14);
      const taxes = car.pricing?.chargesAndTaxes || Math.round(tripDiscountedFare * 0.35);
      const advance = car.pricing?.advanceAmount || Math.round((tripDiscountedFare + taxes) * 0.20);
      const dailyPrice = car.dailyPrice || Math.round(tripDiscountedFare / 1.15);

      return {
        id: car.id,
        title,
        regNumber: reg,
        vehicleType: type,
        category: car.category || "SEDAN",
        fuelType: fuel,
        transmission,
        seatingCapacity: seats,
        year,
        dailyPrice,
        perKmRate,
        location: car.location || cleanCityName(trip.from) || "Bangalore",
        chauffeur: car.chauffeur || "Assigned Commercial Chauffeur",
        chauffeurRating: car.chauffeurRating || 4.85,
        status: car.status || "Available",
        image: car.image || "/images/cars/dzire.jpg",
        rating: car.rating || 4.85,
        badge: car.badge || "Verified Fleet",
        distanceKm: activeDistance,
        pricing: {
          originalPrice: originalFare,
          discountedPrice: tripDiscountedFare,
          chargesAndTaxes: taxes,
          advanceAmount: advance,
          perDayRate: dailyPrice
        },
        inclusions: car.inclusions,
        exclusions: car.exclusions
      };
    });
  }, [backendVehicles, activeDistance, trip.from]);

  // Dynamic Filter Counts based on live vehicles
  const counts = useMemo(() => {
    const c = {
      types: { SUV: 0, Sedan: 0, Hatchback: 0, Luxury: 0, "Van / Minibus": 0 },
      fuels: { Petrol: 0, Diesel: 0, CNG: 0, Electric: 0, Hybrid: 0 },
      transmissions: { Automatic: 0, Manual: 0 }
    };

    fleetWithPricing.forEach((car) => {
      if (c.types[car.vehicleType] !== undefined) c.types[car.vehicleType]++;
      if (c.fuels[car.fuelType] !== undefined) c.fuels[car.fuelType]++;
      if (c.transmissions[car.transmission] !== undefined) c.transmissions[car.transmission]++;
    });

    return c;
  }, [fleetWithPricing]);

  // Filtered & Sorted Catalog
  const filteredVehicles = useMemo(() => {
    let result = fleetWithPricing.filter((car) => {
      // Rule: ONLY Available vehicles show to customers!
      if (car.status && car.status.toUpperCase() !== "AVAILABLE") return false;

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = car.title.toLowerCase().includes(q);
        const matchReg = car.regNumber.toLowerCase().includes(q);
        if (!matchTitle && !matchReg) return false;
      }

      // Vehicle Type Filter
      if (selectedTypes.length > 0) {
        if (!selectedTypes.includes(car.vehicleType)) return false;
      }

      // Fuel Type Filter
      if (selectedFuels.length > 0) {
        if (!selectedFuels.includes(car.fuelType)) return false;
      }

      // Transmission Filter
      if (selectedTransmissions.length > 0) {
        if (!selectedTransmissions.includes(car.transmission)) return false;
      }

      // Price Range Filter
      if (minPrice && car.dailyPrice < Number(minPrice)) return false;
      if (maxPrice && car.dailyPrice > Number(maxPrice)) return false;

      // Seating Capacity Filter
      if (seatingCapacity !== "all") {
        if (seatingCapacity === "4-5" && (car.seatingCapacity < 4 || car.seatingCapacity > 5)) return false;
        if (seatingCapacity === "6-7" && (car.seatingCapacity < 6 || car.seatingCapacity > 7)) return false;
        if (seatingCapacity === "8+" && car.seatingCapacity < 8) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => a.dailyPrice - b.dailyPrice);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.dailyPrice - a.dailyPrice);
    } else if (sortBy === "seats_desc") {
      result.sort((a, b) => b.seatingCapacity - a.seatingCapacity);
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [
    fleetWithPricing, 
    searchQuery, 
    selectedTypes, 
    selectedFuels, 
    selectedTransmissions, 
    minPrice, 
    maxPrice, 
    seatingCapacity, 
    sortBy
  ]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTypes, selectedFuels, selectedTransmissions, minPrice, maxPrice, seatingCapacity, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage) || 1;
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedFuels([]);
    setSelectedTransmissions([]);
    setMinPrice("");
    setMaxPrice("");
    setSeatingCapacity("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const handleCarSelect = (vehicle) => {
    if (typeof window !== "undefined") {
      const selectedData = {
        trip,
        distanceKm: activeDistance,
        car: {
          id: vehicle.id,
          title: vehicle.title,
          category: vehicle.category,
          fuel: vehicle.fuelType,
          withLuggageCarrier: false,
          seating: vehicle.seatingCapacity,
          fare: vehicle.pricing?.discountedPrice || (vehicle.dailyPrice * 1.2),
          taxes: vehicle.pricing?.chargesAndTaxes || Math.round((vehicle.dailyPrice * 1.2) * 0.35),
          totalFare: (vehicle.pricing?.discountedPrice || (vehicle.dailyPrice * 1.2)) + (vehicle.pricing?.chargesAndTaxes || 1200),
          advancePaid: vehicle.pricing?.advanceAmount || Math.round((vehicle.dailyPrice * 1.2) * 0.20),
          image: vehicle.image,
          regNumber: vehicle.regNumber,
          chauffeur: vehicle.chauffeur
        }
      };
      sessionStorage.setItem("grab_selected_booking", JSON.stringify(selectedData));
    }

    router.push("/outstation/review-pay");
  };

  const handleSaveTrip = (newTrip) => {
    setTrip(newTrip);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("grab_pending_trip", JSON.stringify(newTrip));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-5 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Dynamic Route Header */}
        <VehicleTripHeader
          from={cleanCityName(trip.from)}
          to={cleanCityName(trip.to)}
          stops={trip.stops}
          tripType={trip.tripType}
          date={formatDateDisplay(trip.date)}
          time={formatTimeDisplay(trip.time)}
          onModifyClick={() => setIsModifyOpen(true)}
        />

        {/* 2-Column Responsive Layout: Left Search/Filters + Right Vehicle Catalog */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
          
          {/* ===================== LEFT SIDEBAR: SEARCH & FILTERS ===================== */}
          <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-6">
            
            {/* Header: Title + Undo/Reset Icon */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                Search & Filters
              </h3>
              <button
                onClick={handleResetFilters}
                title="Reset all filters"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Search Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Vehicle name or registration number"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            {/* 2. Vehicle Type Checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Vehicle Type</label>
              <div className="space-y-2">
                {[
                  { label: "SUV", count: counts.types.SUV },
                  { label: "Sedan", count: counts.types.Sedan },
                  { label: "Hatchback", count: counts.types.Hatchback },
                  { label: "Luxury", count: counts.types.Luxury },
                  { label: "Van / Minibus", count: counts.types["Van / Minibus"] }
                ].map((item) => {
                  const isChecked = selectedTypes.includes(item.label);
                  return (
                    <label
                      key={item.label}
                      className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${isChecked ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white group-hover:border-slate-400"}`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="flex items-center gap-1.5 group-hover:text-slate-900">
                          <Car className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {item.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Availability Status (Customer Trust Badge) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Availability Status</label>
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Available Ready Fleet</span>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  {filteredVehicles.length}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium px-1">
                Only sanitized, active vehicles ready for immediate booking are displayed.
              </p>
            </div>

            {/* 4. Fuel Type Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Fuel Type</label>
              <div className="space-y-2">
                {[
                  { label: "Petrol", count: counts.fuels.Petrol },
                  { label: "Diesel", count: counts.fuels.Diesel },
                  { label: "CNG", count: counts.fuels.CNG },
                  { label: "Electric", count: counts.fuels.Electric },
                  { label: "Hybrid", count: counts.fuels.Hybrid }
                ].map((item) => {
                  const isChecked = selectedFuels.includes(item.label);
                  return (
                    <label
                      key={item.label}
                      className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${isChecked ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white group-hover:border-slate-400"}`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="flex items-center gap-1.5 group-hover:text-slate-900">
                          <Fuel className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {item.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 5. Transmission Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Transmission</label>
              <div className="space-y-2">
                {[
                  { label: "Automatic", count: counts.transmissions.Automatic },
                  { label: "Manual", count: counts.transmissions.Manual }
                ].map((item) => {
                  const isChecked = selectedTransmissions.includes(item.label);
                  return (
                    <label
                      key={item.label}
                      className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${isChecked ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white group-hover:border-slate-400"}`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="flex items-center gap-1.5 group-hover:text-slate-900">
                          <Settings2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {item.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 6. Price Range Inputs */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Price / Day (₹)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <span className="text-slate-400 font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* 7. Seating Capacity Select */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Seating Capacity</label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={seatingCapacity}
                  onChange={(e) => setSeatingCapacity(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 appearance-none cursor-pointer"
                >
                  <option value="all">Any Capacity</option>
                  <option value="4-5">4 - 5 Seats</option>
                  <option value="6-7">6 - 7 Seats</option>
                  <option value="8+">8+ Seats / Minibus</option>
                </select>
              </div>
            </div>

            {/* Clear Filters CTA */}
            <div className="pt-2">
              <button
                onClick={handleResetFilters}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-blue-600 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            </div>

          </aside>

          {/* ===================== RIGHT COLUMN: VEHICLE CATALOG ===================== */}
          <section className="lg:col-span-9 space-y-4">
            
            {/* Catalog Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 px-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {isLoadingVehicles ? "Searching..." : `${filteredVehicles.length} Vehicles`}
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  • Available for {cleanCityName(trip.from)}
                </span>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="newest">Newest Added</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="seats_desc">Seating Capacity</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>

                {/* Grid / List Toggles */}
                <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                  <button
                    onClick={() => setViewMode("grid")}
                    title="Grid View"
                    className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === "grid" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-400 hover:text-slate-700"}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    title="List View"
                    className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === "list" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-400 hover:text-slate-700"}`}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading Pulse Skeletons */}
            {isLoadingVehicles ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-44 h-32 bg-slate-100 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-10 bg-slate-50 rounded-xl border border-slate-100"></div>
                  </div>
                ))}
              </div>
            ) : paginatedVehicles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Car className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800">
                  {backendVehicles.length === 0 
                    ? "No vehicles currently available for this route" 
                    : "No vehicles match your selected filters"}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {backendVehicles.length === 0
                    ? "Our fleet network is currently updating. Try adjusting your pickup date or modifying your route."
                    : "Try clearing filters to see all available vehicles ready for booking."}
                </p>
                {backendVehicles.length === 0 ? (
                  <button
                    onClick={() => setIsModifyOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Modify Route
                  </button>
                ) : (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {paginatedVehicles.map((car) => (
                  <div
                    key={car.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    {/* Top Row: Left Image + Right Info */}
                    <div className="flex gap-4 items-start">
                      
                      {/* Vehicle Image */}
                      <div 
                        onClick={() => setSelectedVehicleForDetail(car)}
                        className="relative w-44 sm:w-48 h-32 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 cursor-pointer"
                      >
                        <Image
                          src={car.image}
                          alt={car.title}
                          fill
                          className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 176px, 192px"
                        />
                      </div>

                      {/* Right Details */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        
                        {/* Title + Green Available Badge */}
                        <div className="flex items-start justify-between gap-1">
                          <h4 
                            onClick={() => setSelectedVehicleForDetail(car)}
                            className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate hover:text-blue-600 cursor-pointer"
                          >
                            {car.title}
                          </h4>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Available
                          </span>
                        </div>

                        {/* Registration Number */}
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {car.regNumber}
                        </p>

                        {/* Specs Row 1: Type • Fuel • Transmission */}
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-semibold text-slate-600 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Car className="w-3.5 h-3.5 text-slate-400" />
                            {car.vehicleType}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1">
                            <Fuel className="w-3.5 h-3.5 text-slate-400" />
                            {car.fuelType}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1">
                            <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                            {car.transmission}
                          </span>
                        </div>

                        {/* Specs Row 2: Seats • Year */}
                        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {car.seatingCapacity} Seats
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {car.year}
                          </span>
                        </div>

                      </div>

                    </div>

                    {/* Bottom Area: Pricing, Chauffeur, and Actions */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      {/* Price & Location */}
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg sm:text-xl font-black text-blue-600">
                            ₹{car.dailyPrice.toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">/ day</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {car.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-slate-600">
                            <User className="w-3 h-3 text-slate-400" />
                            Chauffeur: {car.chauffeur}
                          </span>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => setSelectedVehicleForDetail(car)}
                          className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleCarSelect(car)}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition flex items-center gap-1 cursor-pointer"
                        >
                          Book Now
                        </button>
                        <button 
                          onClick={() => setSelectedVehicleForDetail(car)}
                          title="More options"
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            ) : (
              /* List View Mode */
              <div className="space-y-3">
                {paginatedVehicles.map((car) => (
                  <div
                    key={car.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:border-blue-400 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div 
                        onClick={() => setSelectedVehicleForDetail(car)}
                        className="relative w-40 h-28 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 cursor-pointer"
                      >
                        <Image
                          src={car.image}
                          alt={car.title}
                          fill
                          className="object-contain p-1 group-hover:scale-105 transition-transform"
                          sizes="160px"
                        />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 
                            onClick={() => setSelectedVehicleForDetail(car)}
                            className="font-bold text-slate-900 text-base hover:text-blue-600 cursor-pointer"
                          >
                            {car.title}
                          </h4>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Available
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 uppercase">
                            ({car.regNumber})
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                          <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5 text-slate-400" /> {car.vehicleType}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5 text-slate-400" /> {car.fuelType}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Settings2 className="w-3.5 h-3.5 text-slate-400" /> {car.transmission}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> {car.seatingCapacity} Seats</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {car.year}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <span>📍 {car.location}</span>
                          <span>•</span>
                          <span>👤 Chauffeur: {car.chauffeur}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-2 shrink-0">
                      <div className="text-left md:text-right">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-blue-600">₹{car.dailyPrice.toLocaleString()}</span>
                          <span className="text-xs font-semibold text-slate-400">/ day</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">Route Est: ₹{Math.round(activeDistance * car.perKmRate).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedVehicleForDetail(car)}
                          className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleCarSelect(car)}
                          className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition cursor-pointer"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoadingVehicles && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mt-4">
                <span className="text-xs font-semibold text-slate-500">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredVehicles.length)} - {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} of {filteredVehicles.length} vehicles
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${currentPage === pageNum ? "bg-blue-600 text-white shadow-2xs" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Assurance Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center text-xs text-slate-500 font-semibold shadow-2xs">
              <p className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                All Grab-Rental vehicles are covered with 24x7 Highway Breakdown Assistance and real-time GPS tracking.
              </p>
            </div>

          </section>

        </div>

      </div>

      {/* Vehicle Details Modal on Click */}
      <VehicleDetailModal
        isOpen={Boolean(selectedVehicleForDetail)}
        vehicle={selectedVehicleForDetail}
        trip={trip}
        distanceKm={activeDistance}
        onClose={() => setSelectedVehicleForDetail(null)}
        onBook={handleCarSelect}
      />

      {/* Modify Trip Route Modal */}
      <ModifyBookingModal
        isOpen={isModifyOpen}
        onClose={() => setIsModifyOpen(false)}
        currentTrip={trip}
        onSave={handleSaveTrip}
      />
    </main>
  );
}

export default function SelectVehiclePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-slate-500 font-bold text-sm animate-pulse">
          Loading available vehicles for your route...
        </div>
      </div>
    }>
      <SelectVehicleContent />
    </Suspense>
  );
}
