"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeftRight,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Minus,
  Plane,
  Heart,
  ShieldCheck,
  Check,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CityAutocompleteInput from "@/components/booking/CityAutocompleteInput";
import AirportSearchDropdown from "@/components/booking/AirportSearchDropdown";
import TimeSelectDropdown from "@/components/booking/TimeSelectDropdown";
import PackageSelectDropdown from "@/components/booking/PackageSelectDropdown";
import { AIRPORT_LIST } from "@/components/home/BookingWidget";
import { detectRouteDistance, fetchGoogleRouteDistance } from "@/lib/cities";
import { useLanguage } from "@/context/LanguageContext";
import {
  formatLocalDate,
  getMinPickupDateTimeString,
  getMinPickupDate,
  getDefaultPickupDateTime,
  sanitizePickupDateTime,
  generateTimeSlots,
} from "@/lib/dateTimeUtils";
import { fetchLocalPackages, getCachedLocalPackages, DEFAULT_LOCAL_PACKAGES } from "@/lib/packageUtils";

export default function PetBookingWidget() {
  const router = useRouter();
  const { t } = useLanguage();

  // 1. Trip Mode: "one-way" | "round-trip" | "multicity" | "local" | "airport"
  const [tripMode, setTripMode] = useState("one-way");

  // Airport transfer direction
  const [airportTripType, setAirportTripType] = useState("drop"); // "drop" = to airport, "pickup" = from airport
  const [selectedAirport, setSelectedAirport] = useState(AIRPORT_LIST[0].name);

  // Locations
  const [pickupCity, setPickupCity] = useState("Bangalore, Karnataka");
  const [dropCity, setDropCity] = useState("Coimbatore, Tamil Nadu");
  const [pickupDetails, setPickupDetails] = useState(null);
  const [dropDetails, setDropDetails] = useState(null);
  const [stops, setStops] = useState([]); // for multicity
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [stopsCoords, setStopsCoords] = useState([]);
  const [airportCoords, setAirportCoords] = useState({ lat: 13.1986, lng: 77.7066 });
  const [googleRoute, setGoogleRoute] = useState(null);

  // Dates & Times
  const [pickupDate, setPickupDate] = useState(() => getDefaultPickupDateTime().date);
  const [dropDate, setDropDate] = useState(() => {
    const initial = getDefaultPickupDateTime();
    const d = new Date(`${initial.date}T00:00:00`);
    d.setDate(d.getDate() + 1);
    return formatLocalDate(d);
  });
  const [pickupTime, setPickupTime] = useState(() => getDefaultPickupDateTime().time);
  const [localPackages, setLocalPackages] = useState(() => getCachedLocalPackages() || DEFAULT_LOCAL_PACKAGES);
  const [selectedPackage, setSelectedPackage] = useState(() => {
    const cached = getCachedLocalPackages();
    return cached && cached.length > 0 ? cached[0].value : (DEFAULT_LOCAL_PACKAGES[0]?.value || "4hr-40km");
  });

  useEffect(() => {
    let isMounted = true;
    fetchLocalPackages().then((pkgs) => {
      if (isMounted && Array.isArray(pkgs) && pkgs.length > 0) {
        setLocalPackages(pkgs);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Pet Selection States
  const [petType, setPetType] = useState("Dog"); // "Dog" | "Cat" | "Birds" | "Others"
  const [customPetName, setCustomPetName] = useState("");
  const [petCount, setPetCount] = useState(1);

  // Time slots
  const allTimeSlots = useMemo(() => generateTimeSlots(15), []);
  const minDateStr = useMemo(() => formatLocalDate(new Date()), []);
  const isToday = pickupDate === minDateStr;
  const currentMinDate = getMinPickupDate();
  const minTimeMinutes = currentMinDate.getHours() * 60 + currentMinDate.getMinutes();

  const availableTimeSlots = useMemo(() => {
    if (!isToday) return allTimeSlots;
    return allTimeSlots.filter((slot) => {
      const [h, m] = slot.value.split(":").map(Number);
      const slotMinutes = h * 60 + m;
      return slotMinutes >= minTimeMinutes;
    });
  }, [allTimeSlots, isToday, minTimeMinutes]);

  useEffect(() => {
    if (availableTimeSlots.length > 0 && !availableTimeSlots.some((s) => s.value === pickupTime)) {
      setPickupTime(availableTimeSlots[0].value);
    }
  }, [availableTimeSlots, pickupTime]);

  const handlePickupDateChange = (newDate) => {
    if (!newDate) return;
    const sanitized = sanitizePickupDateTime(newDate, pickupTime);
    setPickupDate(sanitized.date);
    setPickupTime(sanitized.time);
    if (dropDate && dropDate < sanitized.date) {
      const nextDay = new Date(`${sanitized.date}T00:00:00`);
      nextDay.setDate(nextDay.getDate() + 1);
      setDropDate(formatLocalDate(nextDay));
    }
  };

  const handlePickupTimeChange = (newTime) => {
    if (!newTime) return;
    const sanitized = sanitizePickupDateTime(pickupDate, newTime);
    setPickupDate(sanitized.date);
    setPickupTime(sanitized.time);
  };

  // Multicity Stops Handlers
  const handleAddStop = () => {
    if (stops.length < 5) {
      setStops([...stops, ""]);
    }
  };

  const handleRemoveStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
    setStopsCoords(stopsCoords.filter((_, i) => i !== index));
  };

  const handleStopChange = (index, value, coords) => {
    const updated = [...stops];
    updated[index] = value;
    setStops(updated);
    const updatedCoords = [...stopsCoords];
    updatedCoords[index] = coords || null;
    setStopsCoords(updatedCoords);
  };

  const handleSwapCities = () => {
    if (tripMode === "airport" || tripMode === "local") return;
    setPickupCity(dropCity);
    setDropCity(pickupCity);
    const tempCoords = pickupCoords;
    setPickupCoords(dropCoords);
    setDropCoords(tempCoords);
    const tempDetails = pickupDetails;
    setPickupDetails(dropDetails);
    setDropDetails(tempDetails);
  };

  // Route Estimate
  const effectiveFrom = useMemo(() => {
    if (tripMode === "airport") {
      return airportTripType === "drop" ? pickupCity : selectedAirport;
    }
    return pickupCity;
  }, [tripMode, airportTripType, pickupCity, selectedAirport]);

  const effectiveTo = useMemo(() => {
    if (tripMode === "airport") {
      return airportTripType === "drop" ? selectedAirport : dropCity;
    }
    if (tripMode === "local") {
      return selectedPackage;
    }
    return dropCity;
  }, [tripMode, airportTripType, selectedAirport, dropCity, selectedPackage]);

  const initialEstimate = useMemo(() => {
    if (tripMode === "local") {
      return { isDetected: false, distanceKm: 0, durationHours: 0, durationText: "" };
    }
    const cleanStops = stops.filter((s) => s && s.trim());
    return detectRouteDistance(effectiveFrom, effectiveTo, cleanStops, tripMode);
  }, [effectiveFrom, effectiveTo, stops, tripMode]);

  useEffect(() => {
    let cancelled = false;
    async function loadGoogleRoute() {
      if (!effectiveFrom || !effectiveTo || tripMode === "local") return;
      try {
        const cleanStops = stops.filter((s) => s && s.trim());
        const res = await fetchGoogleRouteDistance(effectiveFrom, effectiveTo, cleanStops, tripMode, {
          originCoords: tripMode === "airport" && airportTripType === "pickup" ? airportCoords : pickupCoords,
          destinationCoords: tripMode === "airport" && airportTripType === "drop" ? airportCoords : dropCoords,
          stopsCoords: stopsCoords,
        });
        if (!cancelled && res?.isDetected) {
          setGoogleRoute(res);
        }
      } catch (err) {
        console.warn("Could not fetch Google Route for Pet widget:", err);
      }
    }
    loadGoogleRoute();
    return () => {
      cancelled = true;
    };
  }, [effectiveFrom, effectiveTo, stops, tripMode, pickupCoords, dropCoords, airportCoords, stopsCoords, airportTripType]);

  const routeEstimate = googleRoute || initialEstimate;

  // URL Building
  const buildExploreUrl = () => {
    const params = new URLSearchParams();
    params.set("isPetFriendly", "true");
    params.set("petType", petType === "Others" ? (customPetName.trim() || "Other Pet") : petType);
    params.set("petCount", String(petCount));

    if (tripMode === "airport") {
      params.set("from", airportTripType === "drop" ? pickupCity : selectedAirport);
      params.set("to", airportTripType === "drop" ? selectedAirport : dropCity);
      params.set("airportTripType", airportTripType);
      params.set("airport", selectedAirport);
      params.set("tripType", airportTripType === "drop" ? "Airport Drop" : "Airport Pickup");
      params.set("serviceType", "AIRPORT");
    } else if (tripMode === "local") {
      params.set("from", pickupCity);
      params.set("package", selectedPackage);
      params.set("to", selectedPackage);
      params.set("tripType", "local");
      params.set("serviceType", "LOCAL");
    } else {
      params.set("from", pickupCity);
      params.set("to", dropCity);
      const validStops = stops.filter((s) => s.trim());
      if (validStops.length > 0) {
        params.set("stops", validStops.join("|"));
      }
      params.set("tripType", tripMode === "multicity" ? "multi-city-tour" : tripMode);
      params.set("serviceType", "OUTSTATION");
    }

    params.set("pickupDate", pickupDate);
    if ((tripMode === "round-trip" || tripMode === "multicity") && dropDate) {
      params.set("dropDate", dropDate);
    }
    params.set("pickupTime", pickupTime);
    if (pickupDetails?.city) params.set("fromCity", pickupDetails.city);
    if (pickupDetails?.state) params.set("fromState", pickupDetails.state);
    if (dropDetails?.city) params.set("toCity", dropDetails.city);
    if (routeEstimate?.distanceKm > 0) {
      params.set("distanceKm", String(routeEstimate.distanceKm));
    }
    return `/outstation/select-vehicle?${params.toString()}`;
  };

  const handleExploreClick = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    const validStops = stops.filter((s) => s.trim());
    const serviceType = tripMode === "local" ? "LOCAL" : tripMode === "airport" ? "AIRPORT" : "OUTSTATION";

    let fromLoc = pickupCity;
    let toLoc = dropCity;
    let pkgVal = undefined;

    if (tripMode === "airport") {
      fromLoc = airportTripType === "drop" ? pickupCity : selectedAirport;
      toLoc = airportTripType === "drop" ? selectedAirport : dropCity;
    } else if (tripMode === "local") {
      toLoc = selectedPackage;
      pkgVal = selectedPackage;
    }

    const bookingConfig = {
      trip: {
        type: tripMode === "multicity" ? "multi-city-tour" : tripMode,
        from: fromLoc,
        to: toLoc,
        stops: validStops,
        date: pickupDate,
        returnDate: (tripMode === "round-trip" || tripMode === "multicity") ? dropDate : undefined,
        time: pickupTime,
        distanceKm: routeEstimate.distanceKm || (tripMode === "local" ? 80 : 250),
        duration: routeEstimate.durationText || undefined,
        airportTripType: tripMode === "airport" ? airportTripType : undefined,
        airport: tripMode === "airport" ? selectedAirport : undefined,
        package: pkgVal,
      },
      petDetails: {
        isPetFriendly: true,
        petType: petType === "Others" ? (customPetName.trim() || "Other Pet") : petType,
        customPetName: petType === "Others" ? customPetName.trim() : "",
        petCount: petCount,
      },
      serviceType: serviceType,
    };

    try {
      localStorage.setItem("grabrentals_booking_config", JSON.stringify(bookingConfig));
      if (typeof window !== "undefined") {
        sessionStorage.setItem("grab_pending_trip", JSON.stringify({
          from: fromLoc,
          to: toLoc,
          fromCity: pickupDetails?.city || undefined,
          fromState: pickupDetails?.state || undefined,
          toCity: dropDetails?.city || undefined,
          pickupDetails,
          dropDetails,
          type: bookingConfig.trip.type,
          date: pickupDate,
          returnDate: bookingConfig.trip.returnDate,
          time: pickupTime,
          isPetFriendly: true,
          petDetails: bookingConfig.petDetails,
          serviceType,
        }));
      }
    } catch (err) {
      console.warn("Could not save pet booking config to storage", err);
    }

    router.push(buildExploreUrl());
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden text-slate-800">
      
      {/* 1. Header Banner & Trip Mode Dropdown */}
      <div className="bg-slate-900 text-white p-4 sm:px-6 sm:py-5 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
              🐶
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Book Pet Friendly Cab</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/30">
                  Zero Refusal
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Verified animal-friendly chauffeurs & sanitized AC cabs for your journey
              </p>
            </div>
          </div>

          {/* Trip Mode Dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[220px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Select Trip Type
            </label>
            <div className="relative">
              <select
                value={tripMode}
                onChange={(e) => setTripMode(e.target.value)}
                className="w-full pl-3.5 pr-9 py-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 focus:border-[#0082fe] focus:ring-2 focus:ring-[#0082fe]/20 rounded-xl text-xs sm:text-sm font-bold text-white outline-none cursor-pointer appearance-none transition-all shadow-sm"
              >
                <option value="one-way">One Way</option>
                <option value="round-trip">Round Trip</option>
                <option value="multicity">Multicity Tour</option>
                <option value="local">Hourly / Local</option>
                <option value="airport">Airport Transfer</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Form Body */}
      <div className="p-4 sm:p-6 lg:p-7 space-y-5">
        
        {/* Airport Transfer Toggle (if airport) */}
        {tripMode === "airport" && (
          <div className="flex items-center gap-2 sm:gap-3 p-1 bg-slate-100 rounded-2xl w-fit">
            {[
              { id: "drop", label: "Drop to Airport" },
              { id: "pickup", label: "Pickup from Airport" },
            ].map((dir) => {
              const selected = airportTripType === dir.id;
              return (
                <button
                  key={dir.id}
                  type="button"
                  onClick={() => setAirportTripType(dir.id)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    selected ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {dir.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Journey Fields (Row 1: Locations) */}
        <div>
          {/* Outstation One-Way: All 4 Fields in One Row */}
          {tripMode === "one-way" && (
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-end w-full">
              {/* Pickup Location */}
              <div className="flex-1 min-w-0 w-full">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0082fe]" />
                  <span>Pickup City / Area</span>
                </label>
                <CityAutocompleteInput
                  value={pickupCity}
                  onChange={(val, coords, details) => {
                    setPickupCity(val);
                    setPickupCoords(coords || null);
                    if (details) setPickupDetails(details);
                  }}
                  placeholder="Enter pickup city (e.g. Bangalore)"
                />
              </div>

              {/* Swap Button */}
              <div className="hidden lg:flex items-center justify-center pb-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSwapCities}
                  title="Swap Locations"
                  className="w-9 h-9 rounded-full border border-slate-200 hover:border-[#0082fe] hover:bg-blue-50 text-slate-400 hover:text-[#0082fe] flex items-center justify-center transition-all cursor-pointer shadow-xs group"
                >
                  <ArrowLeftRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Destination City */}
              <div className="flex-1 min-w-0 w-full">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Destination City</span>
                </label>
                <CityAutocompleteInput
                  value={dropCity}
                  onChange={(val, coords, details) => {
                    setDropCity(val);
                    setDropCoords(coords || null);
                    if (details) setDropDetails(details);
                  }}
                  placeholder="Enter destination city (e.g. Coimbatore)"
                />
              </div>

              {/* Pickup Date */}
              <div className="w-full lg:w-48 shrink-0">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#0082fe]" />
                  <span>Pickup Date</span>
                </label>
                <div className="relative group min-w-0 w-full">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0082fe] w-4 h-4 pointer-events-none shrink-0" />
                  <input
                    type="date"
                    min={minDateStr}
                    value={pickupDate}
                    suppressHydrationWarning
                    onChange={(e) => handlePickupDateChange(e.target.value)}
                    className="w-full min-w-0 block pl-10 pr-3 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] transition-all shadow-2xs cursor-pointer box-border"
                  />
                </div>
              </div>

              {/* Pickup Time */}
              <div className="w-full lg:w-44 shrink-0">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pickup Time</span>
                </label>
                <TimeSelectDropdown
                  value={pickupTime}
                  onChange={handlePickupTimeChange}
                  availableSlots={availableTimeSlots}
                />
              </div>
            </div>
          )}

          {/* Outstation Round-Trip */}
          {tripMode === "round-trip" && (
            <div className="grid grid-cols-1 md:grid-cols-11 gap-3 sm:gap-4 items-center">
              {/* Pickup Location */}
              <div className="md:col-span-5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0082fe]" />
                  <span>Pickup City / Area</span>
                </label>
                <CityAutocompleteInput
                  value={pickupCity}
                  onChange={(val, coords, details) => {
                    setPickupCity(val);
                    setPickupCoords(coords || null);
                    if (details) setPickupDetails(details);
                  }}
                  placeholder="Enter pickup city (e.g. Bangalore)"
                />
              </div>

              {/* Swap Button */}
              <div className="hidden md:flex justify-center items-center pt-5 md:col-span-1">
                <button
                  type="button"
                  onClick={handleSwapCities}
                  title="Swap Locations"
                  className="w-9 h-9 rounded-full border border-slate-200 hover:border-[#0082fe] hover:bg-blue-50 text-slate-400 hover:text-[#0082fe] flex items-center justify-center transition-all cursor-pointer shadow-xs group"
                >
                  <ArrowLeftRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Drop Location */}
              <div className="md:col-span-5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Destination City</span>
                </label>
                <CityAutocompleteInput
                  value={dropCity}
                  onChange={(val, coords, details) => {
                    setDropCity(val);
                    setDropCoords(coords || null);
                    if (details) setDropDetails(details);
                  }}
                  placeholder="Enter destination city (e.g. Coimbatore)"
                />
              </div>
            </div>
          )}

          {/* Multicity */}
          {tripMode === "multicity" && (
            <div className="grid grid-cols-1 md:grid-cols-11 gap-3 sm:gap-4 items-center">
              <div className="md:col-span-5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0082fe]" />
                  <span>Starting City / Area</span>
                </label>
                <CityAutocompleteInput
                  value={pickupCity}
                  onChange={(val, coords, details) => {
                    setPickupCity(val);
                    setPickupCoords(coords || null);
                    if (details) setPickupDetails(details);
                  }}
                  placeholder="Enter starting city (e.g. Bangalore)"
                />
              </div>

              <div className="hidden md:flex justify-center items-center pt-5 md:col-span-1">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="md:col-span-5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Final Destination</span>
                </label>
                <CityAutocompleteInput
                  value={dropCity}
                  onChange={(val, coords, details) => {
                    setDropCity(val);
                    setDropCoords(coords || null);
                    if (details) setDropDetails(details);
                  }}
                  placeholder="Enter final destination (e.g. Ooty)"
                />
              </div>
            </div>
          )}

          {/* Local Hourly Rental: All 4 Fields in One Row */}
          {tripMode === "local" && (
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-end w-full">
              {/* Pickup Location */}
              <div className="flex-1 min-w-0 w-full">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0082fe]" />
                  <span>Pickup City / Area</span>
                </label>
                <CityAutocompleteInput
                  value={pickupCity}
                  onChange={(val, coords, details) => {
                    setPickupCity(val);
                    setPickupCoords(coords || null);
                    if (details) setPickupDetails(details);
                  }}
                  placeholder="Enter pickup city (e.g. Bangalore)"
                />
              </div>

              {/* Package Select */}
              <div className="flex-1 min-w-0 w-full">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Select Rental Package</span>
                </label>
                <PackageSelectDropdown
                  value={selectedPackage}
                  onChange={setSelectedPackage}
                  packages={localPackages}
                />
              </div>

              {/* Pickup Date */}
              <div className="w-full lg:w-48 shrink-0">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#0082fe]" />
                  <span>Pickup Date</span>
                </label>
                <div className="relative group min-w-0 w-full">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0082fe] w-4 h-4 pointer-events-none shrink-0" />
                  <input
                    type="date"
                    min={minDateStr}
                    value={pickupDate}
                    suppressHydrationWarning
                    onChange={(e) => handlePickupDateChange(e.target.value)}
                    className="w-full min-w-0 block pl-10 pr-3 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] transition-all shadow-2xs cursor-pointer box-border"
                  />
                </div>
              </div>

              {/* Pickup Time */}
              <div className="w-full lg:w-44 shrink-0">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pickup Time</span>
                </label>
                <TimeSelectDropdown
                  value={pickupTime}
                  onChange={handlePickupTimeChange}
                  availableSlots={availableTimeSlots}
                />
              </div>
            </div>
          )}

          {/* Airport Transfer: All 4 Fields in One Row */}
          {tripMode === "airport" && (
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-end w-full">
              {airportTripType === "pickup" ? (
                <>
                  <div className="flex-1 min-w-0 w-full">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0082fe]" />
                      <span>Pickup Airport</span>
                    </label>
                    <AirportSearchDropdown
                      value={selectedAirport}
                      onChange={(val, coords) => {
                        setSelectedAirport(val);
                        if (coords) setAirportCoords(coords);
                      }}
                    />
                  </div>
                  <div className="hidden lg:flex items-center justify-center pb-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAirportTripType("drop")}
                      title="Switch to Drop to Airport"
                      className="w-9 h-9 rounded-full border border-slate-200 hover:border-[#0082fe] hover:bg-blue-50 text-slate-400 hover:text-[#0082fe] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>Destination City / Area</span>
                    </label>
                    <CityAutocompleteInput
                      value={dropCity}
                      onChange={(val, coords, details) => {
                        setDropCity(val);
                        setDropCoords(coords || null);
                        if (details) setDropDetails(details);
                      }}
                      placeholder="Enter destination area (e.g. Indiranagar)"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0 w-full">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0082fe]" />
                      <span>Pickup City / Area</span>
                    </label>
                    <CityAutocompleteInput
                      value={pickupCity}
                      onChange={(val, coords, details) => {
                        setPickupCity(val);
                        setPickupCoords(coords || null);
                        if (details) setPickupDetails(details);
                      }}
                      placeholder="Enter pickup area (e.g. Koramangala)"
                    />
                  </div>
                  <div className="hidden lg:flex items-center justify-center pb-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAirportTripType("pickup")}
                      title="Switch to Pickup from Airport"
                      className="w-9 h-9 rounded-full border border-slate-200 hover:border-[#0082fe] hover:bg-blue-50 text-slate-400 hover:text-[#0082fe] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>Destination Airport</span>
                    </label>
                    <AirportSearchDropdown
                      value={selectedAirport}
                      onChange={(val, coords) => {
                        setSelectedAirport(val);
                        if (coords) setAirportCoords(coords);
                      }}
                    />
                  </div>
                </>
              )}

              {/* Pickup Date */}
              <div className="w-full lg:w-48 shrink-0">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#0082fe]" />
                  <span>Pickup Date</span>
                </label>
                <div className="relative group min-w-0 w-full">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0082fe] w-4 h-4 pointer-events-none shrink-0" />
                  <input
                    type="date"
                    min={minDateStr}
                    value={pickupDate}
                    suppressHydrationWarning
                    onChange={(e) => handlePickupDateChange(e.target.value)}
                    className="w-full min-w-0 block pl-10 pr-3 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] transition-all shadow-2xs cursor-pointer box-border"
                  />
                </div>
              </div>

              {/* Pickup Time */}
              <div className="w-full lg:w-44 shrink-0">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pickup Time</span>
                </label>
                <TimeSelectDropdown
                  value={pickupTime}
                  onChange={handlePickupTimeChange}
                  availableSlots={availableTimeSlots}
                />
              </div>
            </div>
          )}
        </div>

        {/* Multicity Dynamic Stops */}
        {tripMode === "multicity" && (
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Intermediate Tour Stops:</span>
              <button
                type="button"
                onClick={handleAddStop}
                disabled={stops.length >= 5}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-blue-700 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" /> Add Stop
              </button>
            </div>
            {stops.map((stop, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-400 w-14 shrink-0">Stop #{idx + 1}:</span>
                <div className="flex-1">
                  <CityAutocompleteInput
                    value={stop}
                    onChange={(val, coords) => handleStopChange(idx, val, coords)}
                    placeholder="Enter intermediate city (e.g. Mysore, Bandipur)"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveStop(idx)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove Stop"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Journey Fields (Row 2: Schedule - Date & Time) - only for round-trip and multicity */}
        {(tripMode === "round-trip" || tripMode === "multicity") && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end pt-3 border-t border-slate-100">
            {/* Pickup Date */}
            <div className="min-w-0">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#0082fe]" />
                <span>Pickup Date</span>
              </label>
              <div className="relative group min-w-0 w-full">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0082fe] w-4 h-4 pointer-events-none shrink-0" />
                <input
                  type="date"
                  min={minDateStr}
                  value={pickupDate}
                  suppressHydrationWarning
                  onChange={(e) => handlePickupDateChange(e.target.value)}
                  className="w-full min-w-0 block pl-10 pr-3 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] transition-all shadow-2xs cursor-pointer box-border"
                />
              </div>
            </div>

            {/* Pickup Time */}
            <div className="min-w-0">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Pickup Time</span>
              </label>
              <TimeSelectDropdown
                value={pickupTime}
                onChange={handlePickupTimeChange}
                availableSlots={availableTimeSlots}
              />
            </div>

            {/* Return Date */}
            <div className="min-w-0">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Return Date</span>
              </label>
              <div className="relative group min-w-0 w-full">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none shrink-0" />
                <input
                  type="date"
                  min={pickupDate || minDateStr}
                  value={dropDate}
                  suppressHydrationWarning
                  onChange={(e) => setDropDate(e.target.value)}
                  className="w-full min-w-0 block pl-10 pr-3 py-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] transition-all shadow-2xs cursor-pointer box-border"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Extra Fields: Pet Selection Dropdowns */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/70 to-orange-50/40 rounded-2xl border border-amber-200 shadow-xs space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <span>🐾</span>
                <span>Select Your Traveling Companion:</span>
              </span>
              <p className="text-[11px] text-amber-800">
                Helps us dispatch the optimal sanitized cab and pet-friendly chauffeur.
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100/90 border border-amber-200 px-2.5 py-1 rounded-md shrink-0">
              100% Pet Friendly Chauffeur
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {/* Pet Type Dropdown */}
            <div className={petType === "Others" ? "sm:col-span-5" : "sm:col-span-8"}>
              <label className="block text-[11px] font-bold text-amber-950 mb-1.5">
                Choose Pet *
              </label>
              <div className="relative">
                <select
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-3 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none shadow-2xs appearance-none cursor-pointer"
                >
                  <option value="Dog">🐶 Dog</option>
                  <option value="Cat">🐱 Cat (Carrier Recommended)</option>
                  <option value="Birds">🦜 Birds (Cage Safe Transport)</option>
                  <option value="Others">🐾 Others (Rabbits, Hamsters, etc.)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* If Others: Text Input */}
            {petType === "Others" && (
              <div className="sm:col-span-4 animate-fade-in">
                <label className="block text-[11px] font-bold text-amber-950 mb-1.5">
                  Specify Pet Type *
                </label>
                <input
                  type="text"
                  required
                  value={customPetName}
                  onChange={(e) => setCustomPetName(e.target.value)}
                  placeholder="E.g. 2 Rabbits, Hamster"
                  className="w-full px-3.5 py-3 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none shadow-2xs"
                />
              </div>
            )}

            {/* Pet Count Dropdown */}
            <div className={petType === "Others" ? "sm:col-span-3" : "sm:col-span-4"}>
              <label className="block text-[11px] font-bold text-amber-950 mb-1.5">
                Pet Count
              </label>
              <div className="relative">
                <select
                  value={petCount}
                  onChange={(e) => setPetCount(Number(e.target.value))}
                  className="w-full pl-3.5 pr-8 py-3 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none shadow-2xs appearance-none cursor-pointer"
                >
                  <option value={1}>1 Pet</option>
                  <option value={2}>2 Pets</option>
                  <option value={3}>3+ Pets</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Distance / Route Estimate Banner (if applicable) */}
        {routeEstimate?.distanceKm > 0 && tripMode !== "local" && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/70 border border-blue-200/80 px-4 py-2.5 rounded-xl text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-600">Auto-Detected Route:</span>
              <strong className="text-slate-900 text-sm font-black">{routeEstimate.distanceKm} km</strong>
              <span className="text-xs font-semibold text-slate-500 capitalize">
                ({tripMode === "airport"
                  ? (airportTripType === "drop" ? "Airport Drop" : "Airport Pickup")
                  : tripMode === "one-way" ? "One Way" : tripMode === "round-trip" ? "Round Trip" : "Multicity"})
              </span>
            </div>
            {routeEstimate.durationText && (
              <div className="text-xs font-bold text-blue-900 bg-white/90 px-3 py-1 rounded-lg border border-blue-200/60 flex items-center gap-1.5 shadow-2xs">
                <span>⏱️ Estimated Driving Time:</span>
                <span className="text-slate-900 font-extrabold">{routeEstimate.durationText}</span>
              </div>
            )}
          </div>
        )}

        {/* 5. CTA Button */}
        <div>
          <button
            type="button"
            onClick={handleExploreClick}
            className="w-full py-4 bg-[#0082fe] hover:bg-[#006ed6] text-white rounded-2xl font-black text-sm uppercase tracking-wide transition-all shadow-lg shadow-[#0082fe]/30 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Pet-Friendly Cabs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2">
            Instant booking confirmation • Experienced pet-friendly verified chauffeurs • No hidden fees
          </p>
        </div>

      </div>
    </div>
  );
}
