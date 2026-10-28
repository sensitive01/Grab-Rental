"use client";

import { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import VehicleTripHeader from "@/components/booking/VehicleTripHeader";
import ModifyBookingModal from "@/components/booking/ModifyBookingModal";
import VehicleDetailModal from "@/components/booking/VehicleDetailModal";
import { customerApi } from "@/lib/customerApi";
import { useLanguage } from "@/context/LanguageContext";
import { getDefaultPickupDateTime } from "@/lib/dateTimeUtils";
import { formatVehicleSavaariTitle } from "@/lib/vehicleUtils";
import { formatPackageLabel, parsePackageKm } from "@/lib/packageUtils";
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
  CheckCircle2,
  SlidersHorizontal,
  Loader2,
  X
} from "lucide-react";

import { detectRouteDistance, fetchGoogleRouteDistance } from "@/lib/cities";
import { isNightPickup } from "@/lib/dateTimeUtils";

function estimateRouteDistance(from, to, stops, tripType) {
  const result = detectRouteDistance(from, to, stops, tripType);
  return result.distanceKm || 0;
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

function parseDateToMidnight(rawDate) {
  if (!rawDate) return null;
  if (rawDate instanceof Date) return rawDate;
  try {
    const s = String(rawDate).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const [y, m, d] = s.substring(0, 10).split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(s)) {
      const [d, m, y] = s.substring(0, 10).split(/[-/]/).map(Number);
      return new Date(y, m - 1, d);
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
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

const INDIAN_STATES = new Set([
  "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
  "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka",
  "kerala", "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram",
  "nagaland", "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu",
  "telangana", "tripura", "uttar pradesh", "uttarakhand", "west bengal",
  "delhi", "chandigarh", "puducherry", "pondicherry", "jammu and kashmir", "ladakh"
]);

function cleanCityName(fullString, cityHint = "") {
  if (cityHint && typeof cityHint === "string" && cityHint.trim()) {
    const hint = cityHint.trim();
    const hintLower = hint.toLowerCase();
    if (hintLower === "bengaluru") return "Bangalore";
    if (hintLower === "mysuru") return "Mysore";
    return hint;
  }
  if (!fullString) return "";
  const lower = fullString.toLowerCase();
  if (lower.includes("bangalore") || lower.includes("bengaluru") || lower.includes("basavanagudi") || lower.includes("mallikarjuna") || lower.includes("indiranagar") || lower.includes("koramangala") || lower.includes("whitefield") || lower.includes("jayanagar")) return "Bangalore";
  if (lower.includes("madurai")) return "Madurai";
  if (lower.includes("coimbatore")) return "Coimbatore";
  if (lower.includes("chennai") || lower.includes("madras")) return "Chennai";
  if (lower.includes("mysore") || lower.includes("mysuru")) return "Mysore";
  if (lower.includes("salem")) return "Salem";
  if (lower.includes("trichy") || lower.includes("tiruchirappalli")) return "Trichy";
  if (lower.includes("tirunelveli")) return "Tirunelveli";
  if (lower.includes("dindigul")) return "Dindigul";
  if (lower.includes("erode")) return "Erode";
  if (lower.includes("tiruppur")) return "Tiruppur";
  if (lower.includes("vellore")) return "Vellore";
  if (lower.includes("thanjavur")) return "Thanjavur";
  if (lower.includes("hyderabad")) return "Hyderabad";
  if (lower.includes("mumbai") || lower.includes("bombay")) return "Mumbai";
  if (lower.includes("pune")) return "Pune";
  if (lower.includes("delhi") || lower.includes("new delhi")) return "Delhi";
  
  const parts = fullString.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      const pLower = p.toLowerCase();
      // Skip numbers, pincodes, India, and state names
      if (!/^\d+$/.test(p) && !pLower.includes("india") && !INDIAN_STATES.has(pLower) && p.length > 2) {
        if (!/^(no\.|flat|house|#|\d+)/i.test(p)) {
          return p;
        }
      }
    }
  }
  return parts[0] || fullString;
}

function SelectVehicleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // Dynamic Query parameters from BookingWidget (SSR & Hydration safe)
  const [trip, setTrip] = useState(() => {
    const fromVal = searchParams.get("from") || "Bangalore, Karnataka";
    const toVal = searchParams.get("to") || "Coimbatore, Tamil Nadu";
    const stopsVal = searchParams.get("stops") || "";
    const rawTripType = searchParams.get("tripType") || "Round trip";
    const defaultDT = getDefaultPickupDateTime();
    const dateVal = searchParams.get("pickupDate") || searchParams.get("date") || defaultDT.date;
    const timeVal = searchParams.get("pickupTime") || searchParams.get("time") || defaultDT.time;
    const serviceTypeVal = (searchParams.get("serviceType") || "OUTSTATION").toUpperCase();
    const isLocal = serviceTypeVal === "LOCAL" || (toVal && toVal.toLowerCase().includes("hr"));
    const dropDateVal = isLocal ? "" : (searchParams.get("dropDate") || searchParams.get("returnDate") || "");

    return {
      from: fromVal,
      to: toVal,
      stops: stopsVal,
      tripType: isLocal ? "Hourly Package" : (rawTripType.toLowerCase().includes("round") ? "Round trip" : "One way"),
      date: dateVal,
      time: timeVal,
      dropDate: dropDateVal,
      serviceType: serviceTypeVal,
      pickupCoords: null,
      dropCoords: null,
      stopsCoords: null,
      pickupDetails: null,
      dropDetails: null,
      fromCity: searchParams.get("fromCity") || "",
      fromState: searchParams.get("fromState") || "",
      toCity: searchParams.get("toCity") || "",
      isPetFriendly: searchParams.get("isPetFriendly") === "true",
      petType: searchParams.get("petType") || "",
      petCount: Number(searchParams.get("petCount")) || 1,
    };
  });

  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Real backend vehicles state (NO mock data)
  const [backendVehicles, setBackendVehicles] = useState([]);
  const [backendDistance, setBackendDistance] = useState(() => {
    const urlDist = Number(searchParams?.get("distanceKm"));
    return urlDist > 0 ? urlDist : null;
  });
  const [googleRouteDetails, setGoogleRouteDetails] = useState(() => {
    const urlDist = Number(searchParams?.get("distanceKm"));
    const urlDuration = searchParams?.get("duration");
    const urlToll = Number(searchParams?.get("tollPrice"));
    if (urlDist > 0) {
      return {
        isDetected: true,
        distanceKm: urlDist,
        durationText: urlDuration || null,
        tollPrice: urlToll || Math.round(urlDist * 1.35),
      };
    }
    return null;
  });

  // Client-only mount effect: Hydrate from sessionStorage safely without hydration mismatch
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const stored = sessionStorage.getItem("grab_pending_trip");
      if (stored) {
        const pendingTrip = JSON.parse(stored);
        setTrip((prev) => ({
          ...prev,
          from: searchParams.get("from") || pendingTrip.from || prev.from,
          to: searchParams.get("to") || pendingTrip.to || prev.to,
          stops: searchParams.get("stops") || pendingTrip.stops || prev.stops,
          tripType: searchParams.get("tripType") || pendingTrip.tripType || prev.tripType,
          date: searchParams.get("pickupDate") || searchParams.get("date") || pendingTrip.date || prev.date,
          time: searchParams.get("pickupTime") || searchParams.get("time") || pendingTrip.time || prev.time,
          dropDate: searchParams.get("dropDate") || searchParams.get("returnDate") || pendingTrip.dropDate || pendingTrip.returnDate || prev.dropDate,
          serviceType: searchParams.get("serviceType") || pendingTrip.serviceType || prev.serviceType,
          pickupCoords: pendingTrip.pickupCoords || prev.pickupCoords,
          dropCoords: pendingTrip.dropCoords || prev.dropCoords,
          stopsCoords: pendingTrip.stopsCoords || prev.stopsCoords,
          pickupDetails: pendingTrip.pickupDetails || prev.pickupDetails,
          dropDetails: pendingTrip.dropDetails || prev.dropDetails,
          fromCity: searchParams.get("fromCity") || pendingTrip.fromCity || prev.fromCity,
          fromState: searchParams.get("fromState") || pendingTrip.fromState || prev.fromState,
          toCity: searchParams.get("toCity") || pendingTrip.toCity || prev.toCity,
        }));
        if (pendingTrip.distanceKm > 0 && !searchParams.get("distanceKm")) {
          setBackendDistance(pendingTrip.distanceKm);
          setGoogleRouteDetails((prev) => prev || {
            isDetected: true,
            distanceKm: pendingTrip.distanceKm,
            durationText: pendingTrip.durationText || null,
            tollPrice: pendingTrip.tollPrice || Math.round(pendingTrip.distanceKm * 1.35),
          });
        }
      }
    } catch (e) {
      console.warn("Could not load sessionStorage pending trip:", e);
    }
  }, [searchParams]);

  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [serviceStatus, setServiceStatus] = useState({
    available: true,
    city: "",
    message: "",
  });

  // Filter States
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedFuels, setSelectedFuels] = useState([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("all");

  // Dynamic pricing & tax configuration from backend
  const [pricingConfig, setPricingConfig] = useState({
    gstPercentage: 6,
    gstAmount: 400,
    gstType: "FLAT",
    driverAllowancePercentage: 11,
    driverAllowanceAmount: 500,
    driverAllowanceType: "FLAT",
  });

  useEffect(() => {
    async function loadPricingConfig() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/vehicles/pricing-tax`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setPricingConfig({
              gstPercentage: Number(json.data.gstPercentage) || 6,
              gstAmount: Number(json.data.gstAmount) || 400,
              gstType: json.data.gstType || "FLAT",
              driverAllowancePercentage: Number(json.data.driverAllowancePercentage) || 11,
              driverAllowanceAmount: Number(json.data.driverAllowanceAmount) || 500,
              driverAllowanceType: json.data.driverAllowanceType || "FLAT",
            });
          }
        }
      } catch (err) {
        console.warn("[SelectVehicle] Could not load pricing config:", err);
      }
    }
    loadPricingConfig();
  }, []);

  // Prevent background scroll when mobile filter drawer is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileFilterOpen]);

  // Sync state ONLY if query parameters actually change on subsequent navigations (avoids redundant mount renders)
  const isInitialSearchSync = useRef(true);
  useEffect(() => {
    if (isInitialSearchSync.current) {
      isInitialSearchSync.current = false;
      return;
    }

    const urlFrom = searchParams.get("from");
    if (!urlFrom) return;

    const urlTo = searchParams.get("to") || "Coimbatore, Tamil Nadu";
    const urlStops = searchParams.get("stops") || "";
    const rawUrlTripType = searchParams.get("tripType") || "Round trip";
    const urlTripType = rawUrlTripType.toLowerCase().includes("round") ? "Round trip" : "One way";
    const defaultDT = getDefaultPickupDateTime();
    const urlDate = searchParams.get("pickupDate") || searchParams.get("date") || defaultDT.date;
    const urlTime = searchParams.get("pickupTime") || searchParams.get("time") || defaultDT.time;
    const urlDropDate = searchParams.get("dropDate") || searchParams.get("returnDate") || "";
    const urlServiceType = (searchParams.get("serviceType") || "OUTSTATION").toUpperCase();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTrip((prev) => {
      if (
        prev.from === urlFrom &&
        prev.to === urlTo &&
        prev.stops === urlStops &&
        prev.tripType === urlTripType &&
        prev.date === urlDate &&
        prev.time === urlTime &&
        prev.dropDate === urlDropDate &&
        prev.serviceType === urlServiceType
      ) {
        return prev;
      }
      return {
        ...prev,
        from: urlFrom,
        to: urlTo,
        stops: urlStops,
        tripType: urlTripType,
        date: urlDate,
        time: urlTime,
        dropDate: urlDropDate,
        serviceType: urlServiceType
      };
    });

    const urlDistance = Number(searchParams.get("distanceKm"));
    if (urlDistance > 0) {
      setBackendDistance(urlDistance);
      setGoogleRouteDetails((prev) => ({
        ...(prev || {}),
        isDetected: true,
        distanceKm: urlDistance,
        durationText: searchParams.get("duration") || prev?.durationText || null,
        tollPrice: Number(searchParams.get("tollPrice")) || prev?.tollPrice || Math.round(urlDistance * 1.35),
      }));
    }
  }, [searchParams]);

  // Compute Active Distance
  const isAirportBooking = trip.serviceType === "AIRPORT" || (searchParams?.get("serviceType") || "").toUpperCase() === "AIRPORT";
  const isLocalBooking = !isAirportBooking && (trip.serviceType === "LOCAL" || (trip.to && trip.to.toLowerCase().includes("hr")));

  const packageLabel = formatPackageLabel(trip.to);

  useEffect(() => {
    let isCancelled = false;
    async function loadGoogleRoute() {
      if (isLocalBooking || !trip.from || !trip.to) return;
      try {
        const details = await fetchGoogleRouteDistance(trip.from, trip.to, trip.stops, trip.tripType, {
          originCoords: trip.pickupCoords,
          destinationCoords: trip.dropCoords,
          stopsCoords: trip.stopsCoords
        });
        if (!isCancelled && details?.isDetected) {
          setGoogleRouteDetails(details);
          if (details.distanceKm) {
            setBackendDistance(details.distanceKm);
          }
        }
      } catch (err) {
        console.warn("Could not fetch Google Route details:", err);
      }
    }
    loadGoogleRoute();
    return () => {
      isCancelled = true;
    };
  }, [isLocalBooking, trip.from, trip.to, trip.stops, trip.tripType, trip.pickupCoords, trip.dropCoords, trip.stopsCoords]);

  const fallbackDistance = useMemo(() => {
    if (isLocalBooking) return parsePackageKm(trip.to);
    return estimateRouteDistance(trip.from, trip.to, trip.stops, trip.tripType);
  }, [isLocalBooking, trip.from, trip.to, trip.stops, trip.tripType]);

  const activeDistance = isLocalBooking 
    ? parsePackageKm(trip.to) 
    : (googleRouteDetails?.distanceKm || backendDistance || fallbackDistance || 0);

  const isRoundTripBooking = !isLocalBooking && !isAirportBooking && (trip.tripType || "").toLowerCase().includes("round");

  const tripDays = useMemo(() => {
    if (!isRoundTripBooking) return 1;
    const dropDateVal = trip.dropDate || trip.returnDate;
    if (trip.date && dropDateVal) {
      try {
        const d1 = parseDateToMidnight(trip.date);
        const d2 = parseDateToMidnight(dropDateVal);
        if (d1 && d2) {
          const diffTime = d2.getTime() - d1.getTime();
          const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
          return Math.max(1, diffDays + 1);
        }
      } catch {}
    }
    return 1;
  }, [isRoundTripBooking, trip.date, trip.dropDate, trip.returnDate]);

  const effectiveTripDistance = useMemo(() => {
    if (isLocalBooking) return activeDistance;
    if (isRoundTripBooking) {
      const minDailyKm = tripDays * 250;
      return Math.max(activeDistance || 0, minDailyKm);
    }
    return activeDistance;
  }, [isLocalBooking, isRoundTripBooking, activeDistance, tripDays]);

  // Fetch live vehicles from backend API
  useEffect(() => {
    let isCancelled = false;

    async function fetchLiveVehicles() {
      setIsLoadingVehicles(true);
      try {
        const dynamicDistance = googleRouteDetails?.distanceKm || backendDistance || undefined;
        const resolvedFromCity = cleanCityName(trip.from, trip.fromCity || trip.pickupDetails?.city);
        const resolvedToCity = cleanCityName(trip.to, trip.toCity || trip.dropDetails?.city);
        const res = await customerApi.searchVehicles({
          from: trip.from,
          fromCity: resolvedFromCity,
          fromState: trip.fromState || trip.pickupDetails?.state || undefined,
          to: trip.to,
          toCity: resolvedToCity,
          stops: trip.stops,
          tripType: trip.tripType.toLowerCase().includes("round") ? "ROUND_TRIP" : "ONE_WAY",
          pickupDate: trip.date,
          pickupTime: trip.time,
          returnDate: trip.dropDate || trip.returnDate || undefined,
          serviceType: trip.serviceType || "OUTSTATION",
          distanceKm: dynamicDistance
        });

        if (!isCancelled && res?.data) {
          if (res.data.serviceAvailable === false) {
            setServiceStatus({
              available: false,
              city: res.data.serviceCity || resolvedFromCity,
              message: res.data.serviceMessage || `Service will Be Soon in ${res.data.serviceCity || resolvedFromCity}`,
            });
            setBackendVehicles([]);
          } else {
            setServiceStatus({
              available: true,
              city: res.data.serviceCity || "",
              message: "",
            });
            if (Array.isArray(res.data.vehicles)) {
              setBackendVehicles(res.data.vehicles);
            }
          }
          if (res.data.distanceKm && !googleRouteDetails?.distanceKm) {
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
  }, [trip.from, trip.to, trip.stops, trip.tripType, trip.date, trip.time, trip.serviceType, trip.dropDate, trip.returnDate]);

  // Format and calculate live pricing for real backend vehicles
  const fleetWithPricing = useMemo(() => {
    return backendVehicles.map((car) => {
      // Determine vehicle type
      let type = car.vehicleType;
      if (!type) {
        const cat = (car.category || "").toUpperCase();
        if (cat.includes("SUV")) type = "SUV";
        else if (cat.includes("HATCHBACK")) type = "Hatchback";
        else if (cat.includes("TEMPO") || cat.includes("VAN")) type = "Van / Minibus";
        else type = "Sedan";
      }

      const rawTitle = car.title || car.model || "Vehicle";
      const title = formatVehicleSavaariTitle(rawTitle, car.category, type);

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

      const minKmThreshold = isRoundTripBooking
        ? Math.max(effectiveTripDistance, car.includedKms || 250)
        : ((!isLocalBooking && !isAirportBooking) ? (car.includedKms || 250) : 0);

      const effectiveTripKm = (isLocalBooking || isAirportBooking)
        ? (activeDistance || car.includedKms || 0)
        : Math.max(activeDistance || 0, minKmThreshold);

      const standardRateFare = (isLocalBooking || isAirportBooking)
        ? (car.pricing?.originalPrice || car.dailyPrice || car.baseFare || 2000)
        : (effectiveTripKm > 0 && perKmRate > 0
            ? Math.round(effectiveTripKm * perKmRate)
            : (car.pricing?.originalPrice || car.baseFare || car.fare || 0));

      const discountPercentage = parseFloat(car.pricing?.discountPercentage || car.discountPercentage || 0);

      // Model B: Direct Fare Reduction
      // originalFare = Standard rate before discount
      const originalFare = Math.round(standardRateFare);

      // displayFare = Discounted price directly deducted by discount%
      const displayFare = car.pricing?.discountedPrice
        ? Math.round(car.pricing.discountedPrice)
        : (discountPercentage > 0
            ? Math.round(originalFare * (1 - (discountPercentage / 100)))
            : originalFare);

      const baseFare = displayFare;
      const tripDiscountedFare = displayFare;

      // Check if night pickup (10 PM to 6 AM)
      const isNightTime = isNightPickup(trip.time);

      // Driver Allowance: prioritize backend vehicle's resolved driver allowance from dedicated rules
      const backendAllowance = car.pricing?.driverAllowance;
      const isDriverFlat = car.pricing?.driverAllowanceType === "FLAT" || (pricingConfig.driverAllowanceType === "FLAT" && pricingConfig.driverAllowanceAmount > 0);

      let driverAllowance = 0;
      if (!isLocalBooking && !isAirportBooking) {
        if (backendAllowance != null && !isNaN(Number(backendAllowance))) {
          driverAllowance = Math.round(Number(backendAllowance));
        } else if (isDriverFlat) {
          const perDay = pricingConfig.driverAllowanceAmount > 0 ? Math.round(pricingConfig.driverAllowanceAmount) : 450;
          driverAllowance = isRoundTripBooking ? perDay * tripDays : perDay;
        } else {
          const pct = Number(car.pricing?.driverAllowancePercentage || pricingConfig.driverAllowancePercentage || 10);
          driverAllowance = Math.round(displayFare * (pct / 100));
        }
      }

      const driverAllowanceLabel = "Driver Allowance";

      // GST / Taxes
      const taxes = isAirportBooking
        ? (car.pricing?.chargesAndTaxes ? Math.round(Number(car.pricing.chargesAndTaxes)) : 0)
        : ((pricingConfig.gstType === "FLAT" && pricingConfig.gstAmount > 0)
            ? Math.round(pricingConfig.gstAmount)
            : Math.round((displayFare + driverAllowance) * (pricingConfig.gstPercentage / 100)));

      // Toll price (0 for local, 0 for airport, 0 for round trips, dynamic FASTag toll for outstation one-way)
      const tollPrice = (isLocalBooking || isAirportBooking || isRoundTripBooking)
        ? 0
        : (googleRouteDetails?.tollPrice > 0
            ? Math.round(googleRouteDetails.tollPrice)
            : (activeDistance > 20 ? Math.round(activeDistance * 1.35) : 0));

      // Total Charges & Taxes (GST + driver allowance + toll)
      const chargesAndTaxesTotal = Math.round(driverAllowance + taxes + tollPrice);

      const tripTotalFare = Math.round(baseFare + chargesAndTaxesTotal);
      const advance = Math.round(tripTotalFare * 0.25);
      const dailyPrice = car.dailyPrice || Math.round(displayFare / 1.15);

      let resolvedInclusions = car.inclusions || [];
      if (isRoundTripBooking && Array.isArray(resolvedInclusions)) {
        resolvedInclusions = resolvedInclusions.filter(inc => !inc.toLowerCase().includes("state tax") && !inc.toLowerCase().includes("toll"));
      }
      if (isNightTime && Array.isArray(resolvedInclusions)) {
        resolvedInclusions = resolvedInclusions.filter(inc => !inc.toLowerCase().includes("driver"));
      }

      const baseExclusions = Array.isArray(car.exclusions) ? car.exclusions : [];
      const resolvedExclusions = [
        ...(isRoundTripBooking ? ["Tolls, State Entry Tax & Parking fees at actuals"] : []),
        ...(isNightTime
          ? ["Driver Allowance (Night travel 10:00 PM – 6:00 AM: excluded from package, payable to driver)"]
          : ["Driver Night Allowance (Between 10:00 PM – 6:00 AM)"]),
        ...baseExclusions.filter(exc => 
          !exc.toLowerCase().includes("state entry") && 
          !exc.toLowerCase().includes("toll") && 
          !exc.toLowerCase().includes("night") &&
          !(isNightTime && exc.toLowerCase().includes("driver"))
        )
      ];

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
        tripFare: displayFare,
        perKmRate,
        location: car.location || cleanCityName(trip.from, trip.fromCity || trip.pickupDetails?.city) || "Bangalore",
        chauffeur: car.chauffeur || "Assigned Commercial Chauffeur",
        chauffeurRating: car.chauffeurRating || 4.85,
        status: car.status || "Available",
        image: car.image || "/images/cars/dzire.jpg",
        rating: car.rating || 4.85,
        badge: car.badge || "Verified Fleet",
        distanceKm: effectiveTripKm,
        pricing: {
          originalPrice: originalFare,
          discountedPrice: tripTotalFare,
          baseFare: baseFare,
          displayFare: displayFare,
          discountPercentage: discountPercentage,
          chargesAndTaxes: taxes,
          driverAllowance: driverAllowance,
          driverAllowanceLabel: driverAllowanceLabel,
          tollPrice: tollPrice,
          chargesAndTaxesTotal: chargesAndTaxesTotal,
          gstPercentage: pricingConfig.gstPercentage,
          driverAllowancePercentage: pricingConfig.driverAllowancePercentage,
          advanceAmount: advance,
          perDayRate: dailyPrice
        },
        inclusions: resolvedInclusions,
        exclusions: resolvedExclusions
      };
    });
  }, [backendVehicles, activeDistance, effectiveTripDistance, isRoundTripBooking, isAirportBooking, tripDays, trip.from, trip.tripType, isLocalBooking, pricingConfig, googleRouteDetails]);

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
      const effectiveFare = car.tripFare || car.pricing?.discountedPrice || 0;
      if (minPrice && effectiveFare < Number(minPrice)) return false;
      if (maxPrice && effectiveFare > Number(maxPrice)) return false;

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
      result.sort((a, b) => (a.tripFare || 0) - (b.tripFare || 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (b.tripFare || 0) - (a.tripFare || 0));
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

  // Reset pagination when filter changes (skip initial mount)
  const isInitialFilterMount = useRef(true);
  useEffect(() => {
    if (isInitialFilterMount.current) {
      isInitialFilterMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [searchQuery, selectedTypes, selectedFuels, selectedTransmissions, minPrice, maxPrice, seatingCapacity, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage) || 1;
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    count += selectedTypes.length;
    count += selectedFuels.length;
    count += selectedTransmissions.length;
    if (minPrice || maxPrice) count++;
    if (seatingCapacity !== "all") count++;
    return count;
  }, [searchQuery, selectedTypes, selectedFuels, selectedTransmissions, minPrice, maxPrice, seatingCapacity]);

  const toggleType = (label) => {
    setSelectedTypes((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  };

  const toggleFuel = (label) => {
    setSelectedFuels((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  };

  const toggleTransmission = (label) => {
    setSelectedTransmissions((prev) =>
      prev.includes(label) ? prev.filter((tr) => tr !== label) : [...prev, label]
    );
  };

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
    const isRoundTripBooking = !isLocalBooking && !isAirportBooking && (trip.tripType || "").toLowerCase().includes("round");
    const minKmFloor = isRoundTripBooking
      ? (tripDays * 250)
      : ((!isLocalBooking && !isAirportBooking) ? (vehicle.includedKms || 250) : 0);
    const chosenDistance = (!isLocalBooking && !isAirportBooking)
      ? Math.max(activeDistance || 0, minKmFloor)
      : (activeDistance || vehicle.includedKms || 0);
    if (typeof window !== "undefined") {
      const selectedData = {
        trip,
        distanceKm: chosenDistance,
        actualDistanceKm: activeDistance,
        routeDistanceKm: activeDistance,
        minPackageKm: minKmFloor > 0 ? minKmFloor : null,
        tollPrice: (isRoundTripBooking || isLocalBooking || isAirportBooking)
          ? 0
          : (vehicle.pricing?.tollPrice ?? (googleRouteDetails?.tollPrice || (activeDistance > 20 ? Math.round(activeDistance * 1.35) : 0))),
        duration: googleRouteDetails?.durationText || null,
        petDetails: {
          isPetFriendly: Boolean(trip.isPetFriendly),
          petType: trip.petType || "Dog",
          petCount: trip.petCount || 1,
          petCharge: vehicle.pricing?.petCharge != null ? Number(vehicle.pricing.petCharge) : 0,
          vendorPetCharge: vehicle.pricing?.vendorPetCharge != null ? Number(vehicle.pricing.vendorPetCharge) : 0,
        },
        car: {
          id: vehicle.id,
          title: vehicle.title,
          model: vehicle.model || vehicle.modelName || (vehicle.title ? vehicle.title.split(" ")[0] : "Swift"),
          modelName: vehicle.modelName || vehicle.model || (vehicle.title ? vehicle.title.split(" ")[0] : "Swift"),
          category: vehicle.category,
          fuel: vehicle.fuelType,
          withLuggageCarrier: false,
          seating: vehicle.seatingCapacity,
          perKmRate: vehicle.perKmRate ?? 0,
          discountPercentage: vehicle.pricing?.discountPercentage ?? vehicle.discountPercentage ?? 0,
          originalPrice: vehicle.pricing?.originalPrice ?? (chosenDistance > 0 ? Math.round(chosenDistance * (vehicle.perKmRate || 12)) : (vehicle.fare || 0)),
          fare: vehicle.pricing?.displayFare ?? vehicle.pricing?.baseFare ?? vehicle.pricing?.discountedPrice ?? (vehicle.dailyPrice * 1.2),
          baseFare: vehicle.pricing?.baseFare ?? vehicle.pricing?.displayFare ?? (chosenDistance > 0 ? Math.round(chosenDistance * (vehicle.perKmRate || 12)) : (vehicle.fare || 0)),
          petCharge: vehicle.pricing?.petCharge != null ? Number(vehicle.pricing.petCharge) : 0,
          vendorPetCharge: vehicle.pricing?.vendorPetCharge != null ? Number(vehicle.pricing.vendorPetCharge) : 0,
          driverAllowance: (isNightPickup(trip.time) || isLocalBooking || isAirportBooking) ? 0 : (vehicle.pricing?.driverAllowance ?? 0),
          driverAllowanceLabel: vehicle.pricing?.driverAllowanceLabel,
          taxes: isAirportBooking ? 0 : (vehicle.pricing?.chargesAndTaxes ?? 0),
          gstPercentage: isAirportBooking ? 0 : (vehicle.pricing?.gstPercentage ?? 5),
          driverAllowancePercentage: isAirportBooking ? 0 : (vehicle.pricing?.driverAllowancePercentage ?? 10),
          totalFare: vehicle.pricing?.discountedPrice ?? ((vehicle.pricing?.baseFare || 0) + (vehicle.pricing?.chargesAndTaxesTotal || 0)),
          advancePaid: vehicle.pricing?.advanceAmount ?? Math.round((vehicle.pricing?.discountedPrice ?? ((vehicle.pricing?.baseFare || 0) + (vehicle.pricing?.chargesAndTaxesTotal || 0))) * 0.25),
          inclusions: vehicle.inclusions || [],
          exclusions: vehicle.exclusions || [],
          image: vehicle.image,
          regNumber: vehicle.regNumber,
          chauffeur: vehicle.chauffeur,
          pricing: vehicle.pricing
        }
      };
      sessionStorage.setItem("grab_selected_booking", JSON.stringify(selectedData));
      sessionStorage.removeItem("grab_review_pay_draft");
    }

    router.push("/outstation/review-pay");
  };

  const handleSaveTrip = (newTrip) => {
    setBackendDistance(null);
    setGoogleRouteDetails(null);
    setTrip(newTrip);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("grab_pending_trip", JSON.stringify(newTrip));
    }
    try {
      const params = new URLSearchParams();
      if (newTrip.serviceType) params.set("serviceType", newTrip.serviceType);
      if (newTrip.from) params.set("from", newTrip.from);
      if (newTrip.to) params.set("to", newTrip.to);
      if (newTrip.tripType) params.set("tripType", newTrip.tripType);
      if (newTrip.fromCity) params.set("fromCity", newTrip.fromCity);
      if (newTrip.toCity) params.set("toCity", newTrip.toCity);
      if (newTrip.date) params.set("date", newTrip.date);
      if (newTrip.time) params.set("time", newTrip.time);
      if (newTrip.dropDate) params.set("dropDate", newTrip.dropDate);
      if (newTrip.stops) params.set("stops", newTrip.stops);
      router.replace(`/outstation/select-vehicle?${params.toString()}`, { scroll: false });
    } catch (e) {
      console.warn("Could not sync URL in handleSaveTrip:", e);
    }
  };

  // Reusable Filter Form for both Desktop Sidebar and Mobile Drawer
  const renderFilterForm = () => (
    <div className="space-y-6">
      {/* 1. Search Box */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 block">{t("search_filters")}</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] transition"
          />
        </div>
      </div>

      {/* 2. Vehicle Type Checkboxes */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block">{t("vehicle_type")}</label>
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
              <div
                key={item.label}
                onClick={() => toggleType(item.label)}
                className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer select-none group py-0.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${isChecked ? "bg-[#0082fe] border-[#0082fe] text-white" : "border-slate-300 bg-white group-hover:border-slate-400"}`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="flex items-center gap-1.5 group-hover:text-slate-900">
                    <Car className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0082fe]" />
                    {item.label}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Availability Status (Customer Trust Badge) */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 block">{t("availability_status")}</label>
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t("available_ready_fleet")}</span>
          </div>
          <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
            {filteredVehicles.length}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium px-1">
          {t("available_fleet_note")}
        </p>
      </div>

      {/* 4. Fuel Type Checkboxes */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 block">{t("fuel_type")}</label>
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
              <div
                key={item.label}
                onClick={() => toggleFuel(item.label)}
                className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer select-none group py-0.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${isChecked ? "bg-[#0082fe] border-[#0082fe] text-white" : "border-slate-300 bg-white group-hover:border-slate-400"}`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="flex items-center gap-1.5 group-hover:text-slate-900">
                    <Fuel className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0082fe]" />
                    {item.label}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Transmission Checkboxes */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 block">{t("transmission")}</label>
        <div className="space-y-2">
          {[
            { label: "Automatic", count: counts.transmissions.Automatic },
            { label: "Manual", count: counts.transmissions.Manual }
          ].map((item) => {
            const isChecked = selectedTransmissions.includes(item.label);
            return (
              <div
                key={item.label}
                onClick={() => toggleTransmission(item.label)}
                className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer select-none group py-0.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${isChecked ? "bg-[#0082fe] border-[#0082fe] text-white" : "border-slate-300 bg-white group-hover:border-slate-400"}`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="flex items-center gap-1.5 group-hover:text-slate-900">
                    <Settings2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0082fe]" />
                    {item.label}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Price Range Inputs */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 block">Trip Fare Range (₹)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0082fe]"
          />
          <span className="text-slate-400 font-bold">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0082fe]"
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
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0082fe] appearance-none cursor-pointer"
          >
            <option value="all">Any Capacity</option>
            <option value="4-5">4 - 5 Seats</option>
            <option value="6-7">6 - 7 Seats</option>
            <option value="8+">8+ Seats / Minibus</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 py-5 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Dynamic Route Header */}
        <VehicleTripHeader
          from={cleanCityName(trip.from, trip.fromCity || trip.pickupDetails?.city)}
          to={isLocalBooking ? trip.to : cleanCityName(trip.to, trip.toCity || trip.dropDetails?.city)}
          stops={trip.stops}
          tripType={trip.tripType}
          date={formatDateDisplay(trip.date)}
          time={formatTimeDisplay(trip.time)}
          returnDate={!isLocalBooking && trip.tripType.toLowerCase().includes("round") && trip.dropDate ? formatDateDisplay(trip.dropDate) : null}
          distanceKm={isRoundTripBooking ? effectiveTripDistance : activeDistance}
          tollPrice={isLocalBooking ? 0 : googleRouteDetails?.tollPrice}
          duration={isLocalBooking ? null : googleRouteDetails?.durationText}
          serviceType={trip.serviceType}
          onModifyClick={() => setIsModifyOpen(true)}
        />

        {/* Layout: Vehicle Catalog (Filter sidebar commented out) */}
        <div className="w-full pt-2">
          
          {/* ===================== LEFT SIDEBAR: SEARCH & FILTERS (COMMENTED OUT) ===================== */}
          {/*
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#0082fe]" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {t("search_filters")}
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                title={t("reset_filters")}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#0082fe] hover:bg-blue-50 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {renderFilterForm()}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-blue-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#0082fe]" />
                Clear Filters
              </button>
            </div>

          </aside>
          */}

          {/* ===================== VEHICLE CATALOG ===================== */}
          <section className="w-full space-y-4">
            
            {/* Catalog Toolbar */}
            <div className="bg-white p-3.5 px-4 sm:px-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 sm:space-y-0">
              <div className="flex items-center justify-between sm:justify-end gap-3">
                {/* Mobile Filter Button (Commented Out) */}
                {/*
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden shrink-0 flex items-center gap-2 px-3.5 py-2 bg-[#0082fe] hover:bg-[#006ed6] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-white text-[#0082fe] text-[10px] font-black flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                */}

                {/* Toolbar Sort and Mode Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span>Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0082fe] cursor-pointer"
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
                      type="button"
                      onClick={() => setViewMode("grid")}
                      title="Grid View"
                      className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === "grid" ? "bg-[#0082fe] text-white shadow-2xs" : "text-slate-400 hover:text-slate-700"}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      title="List View"
                      className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === "list" ? "bg-[#0082fe] text-white shadow-2xs" : "text-slate-400 hover:text-slate-700"}`}
                    >
                      <ListIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filter Chips (Mobile Quick Clear) */}
              {activeFiltersCount > 0 && (
                <div className="lg:hidden flex items-center gap-1.5 pt-2 border-t border-slate-100 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Active:</span>
                  {selectedTypes.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {t}
                      <button type="button" onClick={() => toggleType(t)} className="cursor-pointer hover:text-blue-900">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {selectedFuels.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {f}
                      <button type="button" onClick={() => toggleFuel(f)} className="cursor-pointer hover:text-blue-900">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {selectedTransmissions.map((tr) => (
                    <span key={tr} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {tr}
                      <button type="button" onClick={() => toggleTransmission(tr)} className="cursor-pointer hover:text-blue-900">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  {(minPrice || maxPrice) && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ₹{minPrice || 0} - ₹{maxPrice || "Any"}
                      <button type="button" onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="cursor-pointer hover:text-blue-900">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  {seatingCapacity !== "all" && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {seatingCapacity} seats
                      <button type="button" onClick={() => setSeatingCapacity("all")} className="cursor-pointer hover:text-blue-900">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[10px] font-bold text-[#0082fe] hover:underline ml-auto cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              )}
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
            ) : !serviceStatus.available ? (
              <div className="bg-white rounded-2xl border-2 border-blue-200/80 p-8 sm:p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-[#0082fe] flex items-center justify-center mx-auto shadow-inner">
                  <MapPin className="w-8 h-8 text-[#0082fe] animate-bounce" />
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 uppercase tracking-wider">
                    🚀 Launching Soon
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
                    Service will Be Soon in {serviceStatus.city || cleanCityName(trip.from, trip.fromCity || trip.pickupDetails?.city)}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  We are actively expanding our fleet network to <strong className="text-slate-900">{serviceStatus.city || cleanCityName(trip.from, trip.fromCity || trip.pickupDetails?.city)}</strong>. Verified drivers, transparent per-KM fares, and instant bookings will be available in this hub very soon!
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setIsModifyOpen(true)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#0082fe] hover:bg-[#006ed6] text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                  >
                    Change Pickup Location
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Explore Other Hubs
                  </button>
                </div>
              </div>
            ) : paginatedVehicles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-[#0082fe] flex items-center justify-center mx-auto">
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
                    className="px-4 py-2 bg-[#0082fe] hover:bg-[#006ed6] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Modify Route
                  </button>
                ) : (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-[#0082fe] hover:bg-[#006ed6] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
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
                    className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-[#0082fe] hover:shadow-md transition-all flex flex-col justify-between group"
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
                          unoptimized={typeof car.image === "string" && car.image.startsWith("http")}
                          className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 176px, 192px"
                        />
                      </div>

                      {/* Right Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        
                        {/* Title - Clickable to View */}
                        <div>
                          <h4 
                            onClick={() => setSelectedVehicleForDetail(car)}
                            className="font-bold text-[#0082fe] text-sm sm:text-base leading-tight line-clamp-2 hover:underline cursor-pointer"
                          >
                            {car.title}
                          </h4>
                        </div>

                        {/* Vehicle Type Subtitle */}
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {car.vehicleType || "Hatchback"}
                        </p>

                        {/* Specs: Fuel • Capacity */}
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-semibold text-slate-600 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Fuel className="w-3.5 h-3.5 text-slate-400" />
                            {car.fuelType}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {car.seatingCapacity} Seater AC Cab
                          </span>
                        </div>

                        {/* Price Block (Moved up next to car image) */}
                        <div className="pt-1.5">
                          {car.pricing?.discountPercentage > 0 && (
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="text-[10px] sm:text-[11px] font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-md tracking-tight">
                                {car.pricing.discountPercentage}% OFF
                              </span>
                              <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold">
                                ₹{(car.pricing?.originalPrice || Math.round((car.pricing?.displayFare || 4000) * 1.1)).toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div className="text-lg sm:text-2xl font-black text-[#0082fe] leading-tight">
                            ₹{(car.pricing?.displayFare || car.pricing?.baseFare || car.dailyPrice).toLocaleString()}
                          </div>
                          {isAirportBooking ? (
                            <div className="text-[10px] sm:text-[11px] font-bold text-emerald-600 mt-0.5">
                              ✓ All-Inclusive Airport Fare
                            </div>
                          ) : (
                            <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-0.5">
                              + ₹{(car.pricing?.chargesAndTaxesTotal || 0).toLocaleString()} Charges &amp; Taxes
                            </div>
                          )}
                          {isLocalBooking ? (
                            <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 leading-tight mt-0.5">
                              Included: <strong className="text-[#0082fe]">{packageLabel}</strong> • Extra: ₹{parseFloat(car.perKmRate || 14).toFixed(0)}/km
                            </p>
                          ) : isAirportBooking ? (
                            <p className="text-[10px] sm:text-[11px] font-medium text-slate-600 leading-tight mt-0.5">
                              {car.includedKms || 35} KM Included | Additional Rs.{Math.round(car.perKmRate || 14)} / KM
                            </p>
                          ) : (isRoundTripBooking ? effectiveTripDistance : activeDistance) > 0 ? (
                            <p className="text-[10px] sm:text-[11px] font-medium text-slate-600 leading-tight mt-0.5">
                              {car.distanceKm || (isRoundTripBooking ? effectiveTripDistance : activeDistance)} KM Included | Additional Rs.{Math.round(car.perKmRate || 10)} / KM
                            </p>
                          ) : null}
                        </div>

                      </div>

                    </div>

                    {/* Bottom Area: Actions */}
                    <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-end">
                      <button
                        onClick={() => handleCarSelect(car)}
                        className="w-full sm:w-auto px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#0082fe] hover:bg-[#006ed6] rounded-xl shadow-2xs transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {t("book_now") || "Book Now"}
                      </button>
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
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:border-[#0082fe] hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
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
                          unoptimized={typeof car.image === "string" && car.image.startsWith("http")}
                          className="object-contain p-1 group-hover:scale-105 transition-transform"
                          sizes="160px"
                        />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 
                            onClick={() => setSelectedVehicleForDetail(car)}
                            className="font-bold text-[#0082fe] text-base hover:underline cursor-pointer"
                          >
                            {car.title}
                          </h4>
                          <span className="text-[11px] font-bold text-slate-500 uppercase">
                            ({car.vehicleType || "Hatchback"})
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                          <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5 text-slate-400" /> {car.fuelType}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> {car.seatingCapacity} Seater AC Cab</span>
                        </div>

                        {/* Location and Chauffeur
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <span>📍 {car.location}</span>
                          <span>•</span>
                          <span>👤 Chauffeur: {car.chauffeur}</span>
                        </div>
                        */}
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-2 shrink-0">
                      <div className="text-left md:text-right">
                        {car.pricing?.discountPercentage > 0 && (
                          <div className="flex items-center gap-1.5 mb-1 justify-start md:justify-end flex-wrap">
                            <span className="text-[10px] sm:text-[11px] font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-md tracking-tight">
                              {car.pricing.discountPercentage}% OFF
                            </span>
                            <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold">
                              ₹{(car.pricing?.originalPrice || Math.round((car.pricing?.displayFare || 4000) * 1.1)).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="text-2xl sm:text-3xl font-black text-[#0082fe] leading-tight">
                          ₹{(car.pricing?.displayFare || car.pricing?.baseFare || car.dailyPrice).toLocaleString()}
                        </div>
                        {isAirportBooking ? (
                          <div className="text-[11px] font-bold text-emerald-600 md:text-right mt-0.5">
                            ✓ All-Inclusive Airport Fare
                          </div>
                        ) : (
                          <div className="text-[11px] font-bold text-slate-500 md:text-right mt-0.5">
                            + ₹{(car.pricing?.chargesAndTaxesTotal || 0).toLocaleString()} Charges &amp; Taxes
                          </div>
                        )}
                        {isLocalBooking ? (
                          <p className="text-[11px] font-bold text-slate-700">
                            Included: <strong className="text-[#0082fe]">{packageLabel}</strong> • Extra: ₹{parseFloat(car.perKmRate || 14).toFixed(0)}/km
                          </p>
                        ) : isAirportBooking ? (
                          <p className="text-[11px] font-medium text-slate-600">
                            {car.includedKms || 35} KM Included | Additional Rs.{Math.round(car.perKmRate || 14)} / KM
                          </p>
                        ) : (isRoundTripBooking ? effectiveTripDistance : activeDistance) > 0 ? (
                          <p className="text-[11px] font-medium text-slate-600">
                            {car.distanceKm || (isRoundTripBooking ? effectiveTripDistance : activeDistance)} KM Included | Additional Rs.{Math.round(car.perKmRate || 10)} / KM
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCarSelect(car)}
                          className="px-5 py-2 text-xs font-bold text-white bg-[#0082fe] hover:bg-[#006ed6] rounded-lg shadow-2xs transition cursor-pointer"
                        >
                          {t("book_now") || "Book Now"}
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
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${currentPage === pageNum ? "bg-[#0082fe] text-white shadow-2xs" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
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
                All Grab Rentals vehicles are covered with 24x7 Highway Breakdown Assistance and real-time GPS tracking.
              </p>
            </div>

          </section>

        </div>

      </div>

      {/* ===================== MOBILE FILTER MODAL / DRAWER (COMMENTED OUT) ===================== */}
      {/*
      {isMobileFilterOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden flex justify-end"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white h-full max-h-screen flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-4 px-5 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0082fe] flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-none">
                    {t("search_filters")}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">
                    {filteredVehicles.length} vehicles matching
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-[#0082fe] hover:text-[#006ed6] hover:underline px-2 py-1 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {renderFilterForm()}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white shadow-lg flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer text-center"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-2 py-3 px-4 rounded-xl bg-[#0082fe] hover:bg-[#006ed6] active:scale-98 text-white font-black text-xs transition cursor-pointer text-center shadow-md flex items-center justify-center gap-2"
              >
                <span>Apply Filters</span>
                <span className="bg-[#006ed6]/80 px-2 py-0.5 rounded-full text-[11px]">
                  {filteredVehicles.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      */}

      {/* Vehicle Details Modal on Click */}
      <VehicleDetailModal
        isOpen={Boolean(selectedVehicleForDetail)}
        vehicle={selectedVehicleForDetail}
        trip={trip}
        distanceKm={isRoundTripBooking ? effectiveTripDistance : activeDistance}
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
