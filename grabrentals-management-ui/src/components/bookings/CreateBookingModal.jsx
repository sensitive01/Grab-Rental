"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { operationsApi } from "@/lib/operationsApi";
import { formatINR, cn } from "@/lib/utils";
import LocationAutocompleteInput from "@/components/ui/LocationAutocompleteInput";
import LocationPickerModal from "@/components/ui/LocationPickerModal";
import PackageSelectDropdown from "@/components/ui/PackageSelectDropdown";
import AirportSearchDropdown, { AIRPORT_LIST } from "@/components/ui/AirportSearchDropdown";
import {
  DEFAULT_LOCAL_PACKAGES,
  fetchLocalPackages,
  parsePackageHours,
  parsePackageKm,
  formatPackageLabel,
} from "@/lib/packageUtils";
import { detectRouteDistance } from "@/lib/cities";
import {
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Luggage,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Send,
  Navigation,
  Plus,
  Trash2,
  Users,
  Map,
  RefreshCw,
  Check,
  ChevronDown,
  Plane,
  Fuel,
} from "lucide-react";

export const SINGLE_MODELS_CATALOG = [
  {
    id: "dzire",
    modelName: "Maruti Suzuki Dzire",
    category: "SEDAN",
    filterCategory: "SEDAN",
    seating: "4 Seater",
    fuelType: "Diesel",
    ratePerKm: 13.5,
    minKm: 250,
    driverAllowance: 400,
  },
  {
    id: "etios",
    modelName: "Toyota Etios",
    category: "SEDAN",
    filterCategory: "SEDAN",
    seating: "4 Seater",
    fuelType: "Diesel",
    ratePerKm: 13.5,
    minKm: 250,
    driverAllowance: 400,
  },
  {
    id: "aura",
    modelName: "Hyundai Aura",
    category: "SEDAN",
    filterCategory: "SEDAN",
    seating: "4 Seater",
    fuelType: "Diesel",
    ratePerKm: 13.5,
    minKm: 250,
    driverAllowance: 400,
  },
  {
    id: "ertiga",
    modelName: "Maruti Ertiga",
    category: "SUV",
    filterCategory: "SUV",
    seating: "6 Seater",
    fuelType: "Diesel",
    ratePerKm: 18.0,
    minKm: 250,
    driverAllowance: 500,
  },
  {
    id: "carens",
    modelName: "Kia Carens",
    category: "SUV",
    filterCategory: "SUV",
    seating: "6 Seater",
    fuelType: "Diesel",
    ratePerKm: 18.5,
    minKm: 250,
    driverAllowance: 500,
  },
  {
    id: "innova_crysta",
    modelName: "Toyota Innova Crysta",
    category: "INNOVA_CRYSTA",
    filterCategory: "INNOVA",
    seating: "7 Seater",
    fuelType: "Diesel",
    ratePerKm: 23.0,
    minKm: 300,
    driverAllowance: 600,
  },
  {
    id: "innova_hycross",
    modelName: "Toyota Innova Hycross",
    category: "INNOVA_CRYSTA",
    filterCategory: "INNOVA",
    seating: "7 Seater",
    fuelType: "Hybrid / Petrol",
    ratePerKm: 25.0,
    minKm: 300,
    driverAllowance: 600,
  },
  {
    id: "urbania",
    modelName: "Force Urbania",
    category: "TEMPO_TRAVELLER",
    filterCategory: "TEMPO",
    seating: "12 Seater",
    fuelType: "Diesel",
    ratePerKm: 28.0,
    minKm: 300,
    driverAllowance: 700,
  },
  {
    id: "tempo_traveller",
    modelName: "Force Tempo Traveller",
    category: "TEMPO_TRAVELLER",
    filterCategory: "TEMPO",
    seating: "12 Seater",
    fuelType: "Diesel",
    ratePerKm: 26.0,
    minKm: 300,
    driverAllowance: 700,
  },
  {
    id: "camry_luxury",
    modelName: "Toyota Camry / Luxury",
    category: "LUXURY",
    filterCategory: "LUXURY",
    seating: "4 Seater",
    fuelType: "Petrol / Hybrid",
    ratePerKm: 45.0,
    minKm: 250,
    driverAllowance: 1000,
  },
];

const LOCAL_PACKAGE_TARIFFS = {
  "4hr-40km": {
    SEDAN: 1499,
    PRIME_SEDAN: 1699,
    SUV: 2199,
    INNOVA_CRYSTA: 2799,
    TEMPO_TRAVELLER: 3899,
    LUXURY: 4999,
  },
  "8hr-80km": {
    SEDAN: 2299,
    PRIME_SEDAN: 2599,
    SUV: 3299,
    INNOVA_CRYSTA: 4199,
    TEMPO_TRAVELLER: 5899,
    LUXURY: 7999,
  },
  "12hr-120km": {
    SEDAN: 3199,
    PRIME_SEDAN: 3599,
    SUV: 4499,
    INNOVA_CRYSTA: 5699,
    TEMPO_TRAVELLER: 7999,
    LUXURY: 10999,
  },
  "16hr-160km": {
    SEDAN: 4199,
    PRIME_SEDAN: 4699,
    SUV: 5899,
    INNOVA_CRYSTA: 7399,
    TEMPO_TRAVELLER: 10299,
    LUXURY: 13999,
  },
  "24hr-240km": {
    SEDAN: 5999,
    PRIME_SEDAN: 6699,
    SUV: 8299,
    INNOVA_CRYSTA: 10499,
    TEMPO_TRAVELLER: 14999,
    LUXURY: 19999,
  },
};

const AIRPORT_BASE_TARIFFS = {
  SEDAN: 1449,
  PRIME_SEDAN: 1649,
  SUV: 2249,
  INNOVA_CRYSTA: 2949,
  TEMPO_TRAVELLER: 3949,
  LUXURY: 5499,
};

function cleanCityName(fullString) {
  if (!fullString) return "";
  const lower = fullString.toLowerCase();
  if (lower.includes("bangalore") || lower.includes("bengaluru")) return "Bangalore";
  if (lower.includes("chennai") || lower.includes("madras")) return "Chennai";
  if (lower.includes("madurai")) return "Madurai";
  if (lower.includes("coimbatore")) return "Coimbatore";
  if (lower.includes("mysore") || lower.includes("mysuru")) return "Mysore";
  if (lower.includes("salem")) return "Salem";
  if (lower.includes("trichy") || lower.includes("tiruchirappalli")) return "Trichy";
  if (lower.includes("tirunelveli")) return "Tirunelveli";
  if (lower.includes("hyderabad")) return "Hyderabad";
  if (lower.includes("mumbai") || lower.includes("bombay")) return "Mumbai";
  if (lower.includes("pune")) return "Pune";
  if (lower.includes("delhi")) return "Delhi";
  const parts = fullString.split(",").map((p) => p.trim()).filter(Boolean);
  return parts[0] || fullString;
}

export function CreateBookingModal({ isOpen = true, onClose, onSuccess, onToast, isPage = false }) {
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [tripType, setTripType] = useState("ONE_WAY");
  const [pickupCity, setPickupCity] = useState("Chennai, Tamil Nadu");
  const [dropCity, setDropCity] = useState("Bengaluru, Karnataka");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);

  // Airport Transfer State (Customer Portal Parity)
  const [airportTripType, setAirportTripType] = useState("drop"); // "drop" = Drop to Airport, "pickup" = Pickup from Airport
  const [selectedAirport, setSelectedAirport] = useState(AIRPORT_LIST[0].name);
  const [airportCoords, setAirportCoords] = useState({ lat: 13.1986, lng: 77.7066 });

  // Local Hourly Package State (Customer Portal Parity)
  const [selectedPackage, setSelectedPackage] = useState("8hr-80km");
  const [localPackages, setLocalPackages] = useState(DEFAULT_LOCAL_PACKAGES);

  // Dynamic Multi-Stop Builder (for Outstation)
  const [stopList, setStopList] = useState([]);

  // Map Picker Modal state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState("pickup"); // "pickup" | "drop" | "airport" | "stop-<id>"

  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");

  // Route & Live Pricing state
  const [backendDistanceKm, setBackendDistanceKm] = useState(null);
  const [liveBackendQuotes, setLiveBackendQuotes] = useState({});
  const [liveVehicles, setLiveVehicles] = useState([]);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [serviceAvailable, setServiceAvailable] = useState(true);
  const [hasSearchedVehicles, setHasSearchedVehicles] = useState(false);
  const [showStandardFallback, setShowStandardFallback] = useState(false);

  // Manual Overrides
  const [isManualFareOverride, setIsManualFareOverride] = useState(false);
  const [manualTotalFare, setManualTotalFare] = useState("5317");
  const [isManualAdvanceOverride, setIsManualAdvanceOverride] = useState(false);
  const [manualAdvancePaid, setManualAdvancePaid] = useState("5317");

  // Dates default: 1 hour from now
  const [pickupDateTime, setPickupDateTime] = useState(() => {
    const d = new Date(Date.now() + 3600000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [returnDateTime, setReturnDateTime] = useState("");

  // Passenger
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);

  // Single Model Selection & Vehicle Category (Customer Parity)
  const [selectedModelId, setSelectedModelId] = useState("dzire");
  const [selectedVehicleModel, setSelectedVehicleModel] = useState("Maruti Suzuki Dzire");
  const [vehicleCategory, setVehicleCategory] = useState("SEDAN");
  const [modelFilterCategory, setModelFilterCategory] = useState("ALL");

  // Customer Addons
  const [addonLanguage, setAddonLanguage] = useState(false);
  const [chauffeurLang, setChauffeurLang] = useState("English");
  const [addonLuggage, setAddonLuggage] = useState(false);
  const [addonNewCar, setAddonNewCar] = useState(false);
  const [addonPet, setAddonPet] = useState(false);
  const [petType, setPetType] = useState("Dog");
  const [petCount, setPetCount] = useState(1);
  const [petCharge, setPetCharge] = useState(500);

  // Financials
  const [paymentStatus, setPaymentStatus] = useState("ADVANCE_PAID");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentUtrNumber, setPaymentUtrNumber] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  // Dispatch Mode
  const [dispatchMode, setDispatchMode] = useState("QUEUE"); // "QUEUE" or "DIRECT"
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [loadingFleet, setLoadingFleet] = useState(false);

  // Fetch local packages from backend on mount
  useEffect(() => {
    let isMounted = true;
    fetchLocalPackages().then((pkgs) => {
      if (isMounted && Array.isArray(pkgs) && pkgs.length > 0) {
        setLocalPackages(pkgs);
        setSelectedPackage((prev) => (pkgs.some((p) => p.value === prev) ? prev : pkgs[0].value));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Multi-stop management handlers
  const handleAddStop = () => {
    if (stopList.length >= 5) {
      onToast?.({ type: "warning", message: "Maximum 5 intermediate stops allowed." });
      return;
    }
    setStopList((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        city: "",
        coords: null,
      },
    ]);
  };

  const handleRemoveStop = (id) => {
    setStopList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateStop = (id, newCity, details = null) => {
    setStopList((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          city: newCity,
          coords: details?.lat && details?.lng ? { lat: details.lat, lng: details.lng } : s.coords,
        };
      })
    );
  };

  // 1. Route distance & duration calculation based on Trip Type
  const localRoute = useMemo(() => {
    if (tripType === "LOCAL") {
      const km = parsePackageKm(selectedPackage);
      const hours = parsePackageHours(selectedPackage);
      return { distanceKm: km, durationHours: hours, isDetected: true };
    }

    if (tripType === "AIRPORT") {
      const cityPoint = airportTripType === "drop" ? pickupCity.trim() : dropCity.trim();
      if (!cityPoint || !selectedAirport) {
        return { distanceKm: 38, durationHours: 1.1, isDetected: true };
      }
      const est = detectRouteDistance(cityPoint, selectedAirport, [], "one-way");
      const km = est?.distanceKm && est.distanceKm > 15 ? est.distanceKm : 38;
      const hours = est?.durationHours || Math.round((km / 45) * 10) / 10;
      return { distanceKm: km, durationHours: hours, isDetected: true };
    }

    // Outstation (ONE_WAY / ROUND_TRIP)
    const cleanStops = stopList.map((s) => s.city.trim()).filter(Boolean);
    if (!pickupCity.trim()) return { distanceKm: 0, durationHours: 0 };
    const destination = dropCity.trim();
    if (!destination) return { distanceKm: 0, durationHours: 0 };
    const isRound = tripType === "ROUND_TRIP";
    return detectRouteDistance(pickupCity.trim(), destination, cleanStops, isRound ? "round-trip" : "one-way");
  }, [tripType, selectedPackage, airportTripType, pickupCity, dropCity, selectedAirport, stopList]);

  const effectiveDistanceKm = backendDistanceKm || localRoute.distanceKm || 0;
  const effectiveDurationHours = localRoute.durationHours || 0;

  const availableFleetModels = useMemo(() => {
    if (liveVehicles.length > 0) {
      return liveVehicles.map((v, idx) => {
        const modelName = v.model || v.modelName || v.title || "Standard Fleet";
        const categoryUpper = (v.category || "SEDAN").toUpperCase();
        let filterCat = "SEDAN";
        if (categoryUpper.includes("HATCHBACK") || modelName.toLowerCase().includes("wagon")) filterCat = "HATCHBACK";
        else if (categoryUpper.includes("INNOVA")) filterCat = "INNOVA";
        else if (categoryUpper.includes("SUV")) filterCat = "SUV";
        else if (categoryUpper.includes("TEMPO") || categoryUpper.includes("VAN")) filterCat = "TEMPO";
        else if (categoryUpper.includes("LUXURY")) filterCat = "LUXURY";
        else if (categoryUpper.includes("SEDAN")) filterCat = "SEDAN";

        const seating = v.seatingCapacity
          ? typeof v.seatingCapacity === "string" && v.seatingCapacity.includes("Seat")
            ? v.seatingCapacity
            : `${v.seatingCapacity} Seater`
          : v.seats
          ? `${v.seats} Seater`
          : "4 Seater";

        const price = v.pricing?.totalFare || v.pricing?.displayFare || v.pricing?.baseFare || v.dailyPrice || 0;
        const totalFareNum = Math.round(Number(price));

        const id = v.id || `${modelName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${idx}`;

        return {
          id,
          modelName,
          category: categoryUpper,
          filterCategory: filterCat,
          seating,
          totalFare: totalFareNum,
          fuelType: v.fuelType || "Diesel",
          rawVehicle: v,
        };
      });
    }

    // If backend vehicles search has run and returned 0 (meaning no tariffs are configured for this city/service),
    // return empty array so that fake mock cards with unconfigured rates are NOT rendered across Local, One Way, and Round Trip!
    if (hasSearchedVehicles && !showStandardFallback) {
      return [];
    }

    if (tripType === "LOCAL") {
      return [];
    }

    // Default or fallback if requested
    return SINGLE_MODELS_CATALOG;
  }, [liveVehicles, tripType, hasSearchedVehicles, showStandardFallback]);

  // Derive category filter buttons dynamically based on available models
  const modelFilterTabs = useMemo(() => {
    if (availableFleetModels.length === 0) return [];
    const setCats = new Set(availableFleetModels.map((m) => m.filterCategory));
    const tabs = [{ id: "ALL", label: `All Fleet (${availableFleetModels.length})` }];
    const categoryLabels = {
      HATCHBACK: "Hatchback",
      SEDAN: "Sedan",
      SUV: "SUV",
      INNOVA: "Innova",
      TEMPO: "Tempo / Van",
      LUXURY: "Luxury",
    };
    setCats.forEach((cat) => {
      const count = availableFleetModels.filter((m) => m.filterCategory === cat).length;
      tabs.push({
        id: cat,
        label: `${categoryLabels[cat] || cat} (${count})`,
      });
    });
    return tabs;
  }, [availableFleetModels]);

  // Filter single models by selected tab
  const filteredModels = useMemo(() => {
    if (modelFilterCategory === "ALL") return availableFleetModels;
    return availableFleetModels.filter((m) => m.filterCategory === modelFilterCategory);
  }, [availableFleetModels, modelFilterCategory]);

  // When availableFleetModels updates, ensure a valid model is selected
  useEffect(() => {
    if (availableFleetModels.length > 0) {
      const exists = availableFleetModels.some(
        (m) => m.id === selectedModelId || m.modelName === selectedVehicleModel
      );
      if (!exists) {
        const first = availableFleetModels[0];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedModelId(first.id);
        setSelectedVehicleModel(first.modelName);
        setVehicleCategory(first.category);
      }
    }
  }, [availableFleetModels, selectedModelId, selectedVehicleModel]);

  // 2. Compute calculated base fare for a vehicle category and specific single model
  const getCalculatedBaseFare = useCallback(
    (category, modelId = null) => {
      // If this model exists in availableFleetModels with a live totalFare, use it directly!
      const activeModel = availableFleetModels.find(
        (m) => m.id === modelId || m.modelName === selectedVehicleModel
      );
      if (activeModel && activeModel.totalFare > 0) {
        return activeModel.totalFare;
      }

      if (modelId && liveBackendQuotes[modelId]) {
        return liveBackendQuotes[modelId];
      }
      if (liveBackendQuotes[category]) {
        return liveBackendQuotes[category];
      }

      const spec =
        SINGLE_MODELS_CATALOG.find((v) => v.id === modelId) ||
        SINGLE_MODELS_CATALOG.find((v) => v.category === category) ||
        SINGLE_MODELS_CATALOG[0];

      if (tripType === "LOCAL") {
        const pkgTariff = LOCAL_PACKAGE_TARIFFS[selectedPackage] || LOCAL_PACKAGE_TARIFFS["8hr-80km"];
        const baseCatTariff = pkgTariff[category] || 2299;
        if (modelId === "innova_hycross") return Math.round(baseCatTariff * 1.08);
        if (modelId === "urbania") return Math.round(baseCatTariff * 1.05);
        return baseCatTariff;
      }

      if (tripType === "AIRPORT") {
        const base = AIRPORT_BASE_TARIFFS[category] || 1449;
        let modelBase = base;
        if (modelId === "innova_hycross") modelBase = Math.round(base * 1.08);
        if (modelId === "urbania") modelBase = Math.round(base * 1.05);
        if (effectiveDistanceKm > 40) {
          return Math.round(modelBase + (effectiveDistanceKm - 40) * spec.ratePerKm);
        }
        return modelBase;
      }

      // Outstation (ONE_WAY / ROUND_TRIP)
      const km = Math.max(effectiveDistanceKm || spec.minKm, spec.minKm);
      const isRound = tripType === "ROUND_TRIP";
      const totalKm = isRound ? km * 2 : km;
      const base = totalKm * spec.ratePerKm + spec.driverAllowance;
      return Math.round(base * 1.05); // including 5% GST
    },
    [availableFleetModels, selectedVehicleModel, liveBackendQuotes, tripType, selectedPackage, effectiveDistanceKm]
  );

  // 3. Total add-on price
  const addonsTotal = useMemo(() => {
    let sum = 0;
    if (addonLanguage) sum += 199;
    if (addonLuggage) sum += 249;
    if (addonNewCar) sum += 299;
    if (addonPet) sum += Number(petCharge) || 500;
    return sum;
  }, [addonLanguage, addonLuggage, addonNewCar, addonPet, petCharge]);

  // 4. Derived automated total fare and advance amount
  const autoBaseFare = getCalculatedBaseFare(vehicleCategory, selectedModelId);
  const autoTotalFare = autoBaseFare + addonsTotal;

  const currentTotalFareStr = isManualFareOverride ? manualTotalFare : String(autoTotalFare);
  const currentAdvancePaidStr = isManualAdvanceOverride
    ? manualAdvancePaid
    : isManualFareOverride
    ? manualTotalFare
    : String(autoTotalFare);

  const fareNum = Number(currentTotalFareStr) || 0;
  const advanceNum = Number(currentAdvancePaidStr) || 0;
  const balanceDue = Math.max(0, fareNum - advanceNum);

  // Async fetch of backend quotes from /api/vehicles/search
  useEffect(() => {
    let isCancelled = false;

    async function fetchQuotes() {
      setIsCalculatingPrice(true);
      setShowStandardFallback(false);
      try {
        const cleanStops = stopList.map((s) => s.city.trim()).filter(Boolean);
        let fromParam = pickupCity.trim();
        let fromCityClean = cleanCityName(fromParam);
        let toParam = dropCity.trim();
        let toCityClean = cleanCityName(toParam);
        let serviceTypeParam = "OUTSTATION";

        if (tripType === "LOCAL") {
          serviceTypeParam = "LOCAL";
          fromParam = fromCityClean || pickupCity.trim();
          fromCityClean = fromCityClean || pickupCity.trim();
          toParam = selectedPackage || "8hr-80km";
          toCityClean = selectedPackage || "8hr-80km";
        } else if (tripType === "AIRPORT") {
          serviceTypeParam = "AIRPORT";
          fromParam = airportTripType === "drop" ? pickupCity.trim() : selectedAirport;
          fromCityClean = airportTripType === "drop" ? cleanCityName(pickupCity) : selectedAirport;
          toParam = airportTripType === "drop" ? selectedAirport : dropCity.trim();
          toCityClean = airportTripType === "drop" ? selectedAirport : cleanCityName(dropCity);
        }

        const res = await operationsApi.searchAvailableVehicles({
          from: fromParam,
          fromCity: fromCityClean,
          to: toParam,
          toCity: toCityClean,
          stops: cleanStops.join(" | "),
          tripType: tripType,
          serviceType: serviceTypeParam,
          distanceKm: localRoute?.distanceKm || undefined,
        });

        if (!isCancelled) {
          setHasSearchedVehicles(true);
          if (res?.data) {
            setServiceAvailable(res.data.serviceAvailable !== false);
            const returnedVehicles = Array.isArray(res.data.vehicles) ? res.data.vehicles : [];
            setLiveVehicles(returnedVehicles);

            const quotes = {};
            returnedVehicles.forEach((v) => {
              const price = v.pricing?.totalFare || v.pricing?.displayFare || v.pricing?.baseFare || v.dailyPrice;
              if (price) {
                const numPrice = Math.round(Number(price));
                if (v.category && (!quotes[v.category] || numPrice < quotes[v.category])) {
                  quotes[v.category] = numPrice;
                }
                const raw = (v.model || v.modelName || v.title || "").toLowerCase();
                if (raw.includes("wagon")) quotes["wagonr"] = numPrice;
                if (raw.includes("dzire")) quotes["dzire"] = numPrice;
                if (raw.includes("etios")) quotes["etios"] = numPrice;
                if (raw.includes("aura")) quotes["aura"] = numPrice;
                if (raw.includes("ertiga")) quotes["ertiga"] = numPrice;
                if (raw.includes("carens")) quotes["carens"] = numPrice;
                if (raw.includes("crysta")) quotes["innova_crysta"] = numPrice;
                if (raw.includes("hycross")) quotes["innova_hycross"] = numPrice;
                if (raw.includes("urbania")) quotes["urbania"] = numPrice;
                if (raw.includes("tempo")) quotes["tempo_traveller"] = numPrice;
                if (raw.includes("camry") || raw.includes("luxury")) quotes["camry_luxury"] = numPrice;
              }
            });
            setLiveBackendQuotes(quotes);
            if (res.data.distanceKm) {
              setBackendDistanceKm(res.data.distanceKm);
            }
          } else {
            setLiveVehicles([]);
            setServiceAvailable(false);
          }
        }
      } catch (err) {
        console.warn("Backend vehicle search fallback to local matrix:", err);
        if (!isCancelled) {
          setLiveVehicles([]);
        }
      } finally {
        if (!isCancelled) setIsCalculatingPrice(false);
      }
    }

    fetchQuotes();

    return () => {
      isCancelled = true;
    };
  }, [pickupCity, dropCity, stopList, tripType, airportTripType, selectedAirport, selectedPackage, localRoute.distanceKm]);

  // Fetch available vehicles & drivers when Direct Allocation is selected
  useEffect(() => {
    if (dispatchMode === "DIRECT" && isOpen) {
      async function loadFleet() {
        setLoadingFleet(true);
        try {
          const [vRes, dRes] = await Promise.all([
            operationsApi.getVehicles("AVAILABLE"),
            operationsApi.getDrivers("AVAILABLE"),
          ]);
          setAvailableVehicles(vRes.data || []);
          setAvailableDrivers(dRes.data || []);
        } catch (err) {
          console.error("Failed to fetch available fleet:", err);
        } finally {
          setLoadingFleet(false);
        }
      }
      loadFleet();
    }
  }, [dispatchMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passengerName.trim()) {
      onToast?.({ type: "error", message: "Passenger Name is required." });
      return;
    }
    if (!passengerPhone.trim()) {
      onToast?.({ type: "error", message: "Passenger Phone Number is required for WhatsApp dispatch." });
      return;
    }
    if (tripType !== "AIRPORT" || airportTripType === "drop") {
      if (!pickupCity.trim()) {
        onToast?.({ type: "error", message: "Pickup Location / City is required." });
        return;
      }
    }
    if (!pickupAddress.trim()) {
      onToast?.({ type: "error", message: "Detailed Pickup Address is required." });
      return;
    }
    if (fareNum <= 0) {
      onToast?.({ type: "error", message: "Total Fare must be greater than zero." });
      return;
    }

    if (dispatchMode === "DIRECT" && !selectedVehicleId) {
      onToast?.({ type: "warning", message: "Please select an assigned vehicle for Direct Allocation." });
      return;
    }

    setSubmitting(true);

    try {
      // Build special instructions string incorporating add-ons & trip details
      const instructionParts = [];
      if (selectedVehicleModel) {
        instructionParts.push(`Vehicle: ${selectedVehicleModel}`);
      }
      if (tripType === "LOCAL") {
        instructionParts.push(`Local Hourly Package: ${formatPackageLabel(selectedPackage)}`);
      } else if (tripType === "AIRPORT") {
        instructionParts.push(`Airport Transfer: ${airportTripType === "drop" ? "Drop to Airport" : "Pickup from Airport"} (${selectedAirport})`);
      }
      if (specialNotes.trim()) instructionParts.push(specialNotes.trim());
      if (addonLanguage) instructionParts.push(`Language Chauffeur (${chauffeurLang}) (₹199)`);
      if (addonLuggage) instructionParts.push(`Luggage Carrier Added (₹249)`);
      if (addonNewCar) instructionParts.push(`Car < 3 Years (₹299)`);
      if (addonPet) instructionParts.push(`Pet Friendly Cab (${petType} × ${petCount}, Pet Fee: ₹${petCharge})`);

      // Determine pickup and drop city based on trip type
      let resolvedPickupCity = pickupCity.trim();
      let resolvedDropCity = dropCity.trim() || pickupCity.trim();
      let resolvedDropAddress = dropAddress.trim();

      if (tripType === "LOCAL") {
        resolvedDropCity = pickupCity.trim();
        resolvedDropAddress = dropAddress.trim() || `${pickupCity.trim()} City Center - Local Usage (${formatPackageLabel(selectedPackage)})`;
      } else if (tripType === "AIRPORT") {
        if (airportTripType === "drop") {
          resolvedPickupCity = pickupCity.trim();
          resolvedDropCity = selectedAirport;
          resolvedDropAddress = dropAddress.trim() || `${selectedAirport} Departure Terminal`;
        } else {
          resolvedPickupCity = selectedAirport;
          resolvedDropCity = dropCity.trim() || pickupCity.trim();
          resolvedDropAddress = dropAddress.trim() || `${resolvedDropCity} Destination`;
        }
      }

      const cleanStops = tripType === "ONE_WAY" || tripType === "ROUND_TRIP"
        ? stopList.map((s) => s.city.trim()).filter(Boolean)
        : [];
      const stopsSerialized = cleanStops.length > 0 ? cleanStops.join(" | ") : null;

      const payload = {
        tripType,
        pickupCity: resolvedPickupCity,
        dropCity: resolvedDropCity,
        stops: stopsSerialized,
        pickupAddress: pickupAddress.trim(),
        dropAddress: resolvedDropAddress,
        pickupDateTime: `${pickupDateTime}:00`,
        returnDateTime: tripType === "ROUND_TRIP" && returnDateTime ? `${returnDateTime}:00` : null,
        vehicleCategory,
        passengerCount: Number(passengerCount) || 1,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        passengerEmail: passengerEmail.trim() || null,
        totalFare: fareNum,
        advancePaid: advanceNum,
        paymentStatus,
        paymentMethod,
        paymentUtrNumber: paymentUtrNumber.trim() || null,
        isPetFriendly: addonPet,
        petType: addonPet ? petType : null,
        petCount: addonPet ? Number(petCount) : 0,
        petCharge: addonPet ? Number(petCharge) : 0,
        specialInstructions: instructionParts.join(" | "),
        initialStatus: dispatchMode === "DIRECT" ? "CONFIRMED" : "PENDING_ALLOCATION",
        assignedVehicleId: dispatchMode === "DIRECT" && selectedVehicleId ? selectedVehicleId : null,
        assignedDriverId: dispatchMode === "DIRECT" && selectedDriverId ? selectedDriverId : null,
      };

      const res = await operationsApi.createBooking(payload);

      if (res && res.success) {
        onToast?.({
          type: "success",
          message: `Booking #${res.data?.bookingReference || "CREATED"} created successfully! ${
            dispatchMode === "DIRECT" ? "Scenario 2 Confirmed Voucher" : "Scenario 1 Estimate"
          } dispatched via WhatsApp.`,
        });
        onSuccess?.(res.data);
        onClose();
      } else {
        throw new Error(res?.message || "Failed to create booking.");
      }
    } catch (err) {
      console.error("Create booking error:", err);
      onToast?.({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to create manual booking.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const formElement = (
    <form onSubmit={handleSubmit} className={cn("space-y-6", isPage ? "p-4 sm:p-8" : "p-4 sm:p-6")}>
          {/* Section 1: Passenger Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" /> Passenger &amp; Contact Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Passenger Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="e.g. Arun Kumar"
                  className="w-full h-[44px] text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Passenger Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full h-[44px] text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Receives automated WhatsApp document</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Passenger Email <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                  placeholder="arun@example.com"
                  className="w-full h-[44px] text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Passenger Count</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(e.target.value)}
                  className="w-full h-[44px] text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Trip Type & Itinerary with Location Pickers */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-500" /> Route &amp; Pickup Schedule
              </h4>

              {/* Route / Package Distance Telemetry Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-[11px] font-bold text-amber-900 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {tripType === "LOCAL" ? (
                  <span>
                    Package: <strong className="font-mono">{formatPackageLabel(selectedPackage)}</strong> • Local Hourly Rental
                  </span>
                ) : tripType === "AIRPORT" ? (
                  <span>
                    Airport: <strong className="font-mono">{effectiveDistanceKm} KM</strong> • ~{effectiveDurationHours} hrs drive ({airportTripType === "drop" ? "Drop to Airport" : "Pickup from Airport"})
                  </span>
                ) : (
                  <span>
                    Route: <strong className="font-mono">{effectiveDistanceKm} KM</strong> • ~{effectiveDurationHours} hrs drive
                  </span>
                )}
                {isCalculatingPrice && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
              </div>
            </div>

            {/* Airport Direction Toggle (Only when tripType === "AIRPORT") */}
            {tripType === "AIRPORT" && (
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setAirportTripType("drop")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    airportTripType === "drop"
                      ? "bg-white text-sky-700 shadow-xs border border-slate-200 font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Plane className="w-3.5 h-3.5 text-sky-600" />
                  <span>Drop to Airport</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAirportTripType("pickup")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    airportTripType === "pickup"
                      ? "bg-white text-sky-700 shadow-xs border border-slate-200 font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Plane className="w-3.5 h-3.5 text-emerald-600 rotate-90" />
                  <span>Pickup from Airport</span>
                </button>
              </div>
            )}

            {/* 3-Column Dynamic Inputs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Column 1: Trip Type Select */}
              <div className="min-w-0">
                <div className="h-5 flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Trip Type</label>
                </div>
                <div className="relative flex items-center w-full min-w-0">
                  <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none shrink-0" />
                  <select
                    value={tripType}
                    onChange={(e) => {
                      setTripType(e.target.value);
                      setIsManualFareOverride(false);
                      setIsManualAdvanceOverride(false);
                    }}
                    className="w-full min-w-0 h-[44px] pl-10 pr-9 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="ONE_WAY">One Way Outstation</option>
                    <option value="ROUND_TRIP">Round Trip Outstation</option>
                    <option value="LOCAL">Local Hourly Rental</option>
                    <option value="AIRPORT">Airport Transfer</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none shrink-0" />
                </div>
              </div>

              {/* Column 2 & Column 3 Dynamic Adaptation */}

              {/* CASE A: LOCAL HOURLY RENTAL */}
              {tripType === "LOCAL" && (
                <>
                  {/* Column 2: Rental City */}
                  <div className="min-w-0">
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Rental City <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMapTarget("pickup");
                          setIsMapModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Map className="w-3 h-3" /> Choose on Map
                      </button>
                    </div>
                    <LocationAutocompleteInput
                      value={pickupCity}
                      onChange={(val, details) => {
                        setPickupCity(val);
                        if (details?.formattedAddress && !pickupAddress) {
                          setPickupAddress(details.formattedAddress);
                        }
                        if (details?.lat && details?.lng) {
                          setPickupCoords({ lat: details.lat, lng: details.lng });
                        }
                      }}
                      placeholder="e.g. Bangalore, Karnataka"
                      iconColor="text-emerald-600"
                      onOpenMap={() => {
                        setMapTarget("pickup");
                        setIsMapModalOpen(true);
                      }}
                      required
                    />
                  </div>

                  {/* Column 3: Select Hourly Package Dropdown */}
                  <div className="min-w-0">
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Select Hourly Package <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
                        Hourly &amp; Km
                      </span>
                    </div>
                    <PackageSelectDropdown
                      value={selectedPackage}
                      onChange={(val) => {
                        setSelectedPackage(val);
                        setIsManualFareOverride(false);
                        setIsManualAdvanceOverride(false);
                      }}
                      packages={localPackages}
                    />
                  </div>
                </>
              )}

              {/* CASE B: AIRPORT TRANSFER */}
              {tripType === "AIRPORT" && (
                <>
                  {/* If Drop to Airport: Col 2 is Pickup Location, Col 3 is Drop Airport */}
                  {airportTripType === "drop" ? (
                    <>
                      <div className="min-w-0">
                        <div className="h-5 flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Pickup Location <span className="text-rose-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setMapTarget("pickup");
                              setIsMapModalOpen(true);
                            }}
                            className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Map className="w-3 h-3" /> Choose on Map
                          </button>
                        </div>
                        <LocationAutocompleteInput
                          value={pickupCity}
                          onChange={(val, details) => {
                            setPickupCity(val);
                            if (details?.formattedAddress && !pickupAddress) {
                              setPickupAddress(details.formattedAddress);
                            }
                            if (details?.lat && details?.lng) {
                              setPickupCoords({ lat: details.lat, lng: details.lng });
                            }
                          }}
                          placeholder="e.g. Indiranagar, Bangalore"
                          iconColor="text-emerald-600"
                          onOpenMap={() => {
                            setMapTarget("pickup");
                            setIsMapModalOpen(true);
                          }}
                          required
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="h-5 flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Drop Airport <span className="text-rose-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setMapTarget("airport");
                              setIsMapModalOpen(true);
                            }}
                            className="text-[10px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Map className="w-3 h-3" /> Choose on Map
                          </button>
                        </div>
                        <AirportSearchDropdown
                          value={selectedAirport}
                          onChange={(val, coords) => {
                            setSelectedAirport(val);
                            if (coords) setAirportCoords(coords);
                            setIsManualFareOverride(false);
                            setIsManualAdvanceOverride(false);
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    /* If Pickup from Airport: Col 2 is Pickup Airport, Col 3 is Drop Destination */
                    <>
                      <div className="min-w-0">
                        <div className="h-5 flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Pickup Airport <span className="text-rose-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setMapTarget("airport");
                              setIsMapModalOpen(true);
                            }}
                            className="text-[10px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Map className="w-3 h-3" /> Choose on Map
                          </button>
                        </div>
                        <AirportSearchDropdown
                          value={selectedAirport}
                          onChange={(val, coords) => {
                            setSelectedAirport(val);
                            if (coords) setAirportCoords(coords);
                            setIsManualFareOverride(false);
                            setIsManualAdvanceOverride(false);
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="h-5 flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Drop Destination <span className="text-rose-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setMapTarget("drop");
                              setIsMapModalOpen(true);
                            }}
                            className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Map className="w-3 h-3" /> Choose on Map
                          </button>
                        </div>
                        <LocationAutocompleteInput
                          value={dropCity}
                          onChange={(val, details) => {
                            setDropCity(val);
                            if (details?.formattedAddress && !dropAddress) {
                              setDropAddress(details.formattedAddress);
                            }
                            if (details?.lat && details?.lng) {
                              setDropCoords({ lat: details.lat, lng: details.lng });
                            }
                          }}
                          placeholder="e.g. Koramangala, Bangalore"
                          iconColor="text-rose-500"
                          onOpenMap={() => {
                            setMapTarget("drop");
                            setIsMapModalOpen(true);
                          }}
                          required
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* CASE C: OUTSTATION (ONE_WAY / ROUND_TRIP) */}
              {(tripType === "ONE_WAY" || tripType === "ROUND_TRIP") && (
                <>
                  {/* Column 2: Pickup Location */}
                  <div className="min-w-0">
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Pickup Location <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMapTarget("pickup");
                          setIsMapModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Map className="w-3 h-3" /> Choose on Map
                      </button>
                    </div>
                    <LocationAutocompleteInput
                      value={pickupCity}
                      onChange={(val, details) => {
                        setPickupCity(val);
                        if (details?.formattedAddress && !pickupAddress) {
                          setPickupAddress(details.formattedAddress);
                        }
                        if (details?.lat && details?.lng) {
                          setPickupCoords({ lat: details.lat, lng: details.lng });
                        }
                      }}
                      placeholder="e.g. Chennai, Tamil Nadu"
                      iconColor="text-emerald-600"
                      onOpenMap={() => {
                        setMapTarget("pickup");
                        setIsMapModalOpen(true);
                      }}
                      required
                    />
                  </div>

                  {/* Column 3: Drop Destination */}
                  <div className="min-w-0">
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Drop Destination <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMapTarget("drop");
                          setIsMapModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Map className="w-3 h-3" /> Choose on Map
                      </button>
                    </div>
                    <LocationAutocompleteInput
                      value={dropCity}
                      onChange={(val, details) => {
                        setDropCity(val);
                        if (details?.formattedAddress && !dropAddress) {
                          setDropAddress(details.formattedAddress);
                        }
                        if (details?.lat && details?.lng) {
                          setDropCoords({ lat: details.lat, lng: details.lng });
                        }
                      }}
                      placeholder="e.g. Bengaluru, Karnataka"
                      iconColor="text-rose-500"
                      onOpenMap={() => {
                        setMapTarget("drop");
                        setIsMapModalOpen(true);
                      }}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            {/* Dynamic Multi-Stop Builder (Only for Outstation ONE_WAY / ROUND_TRIP) */}
            {(tripType === "ONE_WAY" || tripType === "ROUND_TRIP") && (
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" /> Intermediate Stops (Optional)
                    {stopList.length > 0 && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                        {stopList.length} stop{stopList.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddStop}
                    disabled={stopList.length >= 5}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-white hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" /> Add Stop
                  </button>
                </div>

                {stopList.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    No intermediate stops added. Click &quot;Add Stop&quot; to include via-cities (e.g. Vellore, Hosur) for route calculation.
                  </p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {stopList.map((stop, idx) => (
                      <div key={stop.id} className="flex items-center gap-2">
                        <div className="w-16 h-[44px] shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-600 bg-white rounded-xl border border-slate-200">
                          Stop {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <LocationAutocompleteInput
                            value={stop.city}
                            onChange={(val, details) => handleUpdateStop(stop.id, val, details)}
                            placeholder="e.g. Vellore, Tamil Nadu"
                            iconColor="text-amber-500"
                            onOpenMap={() => {
                              setMapTarget(`stop-${stop.id}`);
                              setIsMapModalOpen(true);
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(stop.id)}
                          className="h-[44px] w-[44px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                          title="Remove stop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pickup Date &amp; Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={pickupDateTime}
                  onChange={(e) => setPickupDateTime(e.target.value)}
                  className="w-full h-[44px] text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {tripType === "ROUND_TRIP" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Return Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={returnDateTime}
                    onChange={(e) => setReturnDateTime(e.target.value)}
                    className="w-full h-[44px] text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Detailed Pickup Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder={tripType === "AIRPORT" && airportTripType === "pickup" ? "Terminal number, flight number, or arrival gate" : "Door No, Street, Landmark, Pincode"}
                  className="w-full h-[44px] text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Detailed Destination Address {tripType === "LOCAL" && <span className="text-slate-400 font-normal">(Optional)</span>}
                </label>
                <input
                  type="text"
                  value={dropAddress}
                  onChange={(e) => setDropAddress(e.target.value)}
                  placeholder={
                    tripType === "LOCAL"
                      ? "Local Usage within City (or specific drop landmark)"
                      : tripType === "AIRPORT" && airportTripType === "drop"
                      ? "Terminal number, airline name, or departure gate"
                      : "Drop landmark, hotel, or office address"
                  }
                  className="w-full h-[44px] text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Unique Fleet Model Selection (Single Model Parity - No Images) */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-500" /> Unique Fleet Model Selection
              </h4>
              <span className="text-[11px] text-slate-500">
                Select a vehicle model to instantly calculate automated fare
              </span>
            </div>

            {/* Category Filter Pills (Customer Parity) */}
            {modelFilterTabs.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs no-scrollbar flex-nowrap">
                {modelFilterTabs.map((f) => {
                  const isActive = modelFilterCategory === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setModelFilterCategory(f.id)}
                      className={`px-3 py-1 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 border ${
                        isActive
                          ? "bg-amber-500 border-amber-500 text-white shadow-xs font-black"
                          : "bg-slate-100/80 hover:bg-slate-200/80 border-slate-200 text-slate-600"
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Single Vehicle Model Choosing Cards Grid or Empty State Banner */}
            {filteredModels.length === 0 ? (
              isCalculatingPrice ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">
                    Searching active vehicle tariffs for {cleanCityName(pickupCity)}...
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 text-left space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-slate-900">
                        {tripType === "LOCAL"
                          ? `No Vehicle Tariffs Configured for ${cleanCityName(pickupCity) || "this city"} (${formatPackageLabel(selectedPackage)})`
                          : tripType === "AIRPORT"
                          ? `No Vehicle Tariffs Configured for Airport Transfer (${selectedAirport})`
                          : `No Vehicle Tariffs Configured for ${cleanCityName(pickupCity)} → ${cleanCityName(dropCity)} (${
                              tripType === "ROUND_TRIP" ? "Round Trip" : "One Way"
                            })`}
                      </h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        There are currently no pricing rules added in the <strong>Pricing Matrix</strong> for{" "}
                        <strong>
                          {tripType === "LOCAL"
                            ? `${cleanCityName(pickupCity) || "this city"} (${formatPackageLabel(selectedPackage)})`
                            : tripType === "AIRPORT"
                            ? `Airport Transfer (${selectedAirport})`
                            : `${cleanCityName(pickupCity)} → ${cleanCityName(dropCity)} (${
                                tripType === "ROUND_TRIP" ? "Round Trip" : "One Way"
                              })`}
                        </strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualFareOverride(true);
                        setIsManualAdvanceOverride(true);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Enable Manual Fare Override
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowStandardFallback(true)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      Show Standard Catalog
                    </button>
                    <a
                      href="/admin/pricing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-amber-300 text-amber-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      Open Pricing Matrix ↗
                    </a>
                  </div>
                </div>
              )
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {filteredModels.map((v) => {
                  const isSelected = selectedModelId === v.id || selectedVehicleModel === v.modelName;
                  const calculatedRate = v.totalFare || getCalculatedBaseFare(v.category, v.id);

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedModelId(v.id);
                        setSelectedVehicleModel(v.modelName);
                        setVehicleCategory(v.category);
                        setIsManualFareOverride(false);
                        setIsManualAdvanceOverride(false);
                      }}
                      className={`p-3 rounded-2xl border text-left transition relative cursor-pointer flex flex-col justify-between min-h-[96px] ${
                        isSelected
                          ? "bg-amber-50/80 border-amber-500 shadow-sm ring-2 ring-amber-400"
                          : "bg-white border-slate-200 hover:border-amber-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              {v.seating}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              {v.filterCategory}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Fuel className="w-2.5 h-2.5 text-emerald-600" />
                              {v.fuelType || "Diesel"}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <h5 className="text-xs font-black text-slate-900 leading-tight">
                          {v.modelName}
                        </h5>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Total Fare</span>
                        <span className="text-xs font-mono font-black text-amber-700">
                          {isCalculatingPrice ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                              <Loader2 className="w-3 h-3 animate-spin text-amber-600" /> Calc...
                            </span>
                          ) : (
                            `₹${calculatedRate.toLocaleString("en-IN")}`
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Customer Add-ons Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 mt-3">
              <span className="text-[11px] font-bold text-slate-700 block">Select Customer Add-ons:</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addonLanguage}
                    onChange={(e) => {
                      setAddonLanguage(e.target.checked);
                      setIsManualFareOverride(false);
                      setIsManualAdvanceOverride(false);
                    }}
                    className="rounded text-amber-500 focus:ring-amber-400 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800">🗣️ Language Chauffeur (+₹199)</span>
                    <p className="text-[10px] text-slate-500">Appoint driver fluent in customer&apos;s preferred language</p>
                    {addonLanguage && (
                      <select
                        value={chauffeurLang}
                        onChange={(e) => setChauffeurLang(e.target.value)}
                        className="mt-1 text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white font-medium"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Kannada">Kannada</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Malayalam">Malayalam</option>
                      </select>
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addonLuggage}
                    onChange={(e) => {
                      setAddonLuggage(e.target.checked);
                      setIsManualFareOverride(false);
                      setIsManualAdvanceOverride(false);
                    }}
                    className="rounded text-amber-500 focus:ring-amber-400 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800">🧳 Luggage / Rooftop Carrier (+₹249)</span>
                    <p className="text-[10px] text-slate-500">Cab with secure luggage rack and waterproof tarpaulin</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addonNewCar}
                    onChange={(e) => {
                      setAddonNewCar(e.target.checked);
                      setIsManualFareOverride(false);
                      setIsManualAdvanceOverride(false);
                    }}
                    className="rounded text-amber-500 focus:ring-amber-400 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800">✨ Guaranteed Car &lt; 3 Years (+₹299)</span>
                    <p className="text-[10px] text-slate-500">Pristine, late-model vehicle (model year 2023+)</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={addonPet}
                    onChange={(e) => {
                      setAddonPet(e.target.checked);
                      setIsManualFareOverride(false);
                      setIsManualAdvanceOverride(false);
                    }}
                    className="rounded text-amber-500 focus:ring-amber-400 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800">🐾 Pet Friendly Cab</span>
                    <p className="text-[10px] text-slate-500">Cabin seat protector &amp; pet travel package</p>
                    {addonPet && (
                      <div className="flex items-center gap-2 mt-1">
                        <select
                          value={petType}
                          onChange={(e) => setPetType(e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white font-medium"
                        >
                          <option value="Dog">Dog</option>
                          <option value="Cat">Cat</option>
                          <option value="Bird">Bird</option>
                        </select>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={petCount}
                          onChange={(e) => setPetCount(e.target.value)}
                          className="w-16 text-xs border border-slate-200 rounded-lg px-2 py-1"
                          placeholder="Count"
                        />
                        <input
                          type="number"
                          min="0"
                          value={petCharge}
                          onChange={(e) => {
                            setPetCharge(e.target.value);
                            setIsManualFareOverride(false);
                            setIsManualAdvanceOverride(false);
                          }}
                          className="w-24 text-xs border border-slate-200 rounded-lg px-2 py-1 font-mono"
                          placeholder="Fee (₹)"
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Pricing & Advance Payment */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-500" /> Pricing &amp; Payment Settlement
              </h4>

              {isManualFareOverride ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsManualFareOverride(false);
                    setIsManualAdvanceOverride(false);
                  }}
                  className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-amber-600" /> Reset to Auto Fare (₹
                  {autoTotalFare.toLocaleString("en-IN")})
                </button>
              ) : (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Auto-calculated (Editable)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Total Ride Fare (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={currentTotalFareStr}
                  onChange={(e) => {
                    setManualTotalFare(e.target.value);
                    setIsManualFareOverride(true);
                  }}
                  className="w-full h-[44px] text-sm font-mono font-bold px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Advance Amount Paid (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={currentAdvancePaidStr}
                  onChange={(e) => {
                    setManualAdvancePaid(e.target.value);
                    setIsManualAdvanceOverride(true);
                  }}
                  className="w-full h-[44px] text-sm font-mono font-bold text-emerald-700 px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Balance Due at Drop</label>
                <div className="w-full h-[44px] flex items-center text-sm font-mono font-black px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-amber-800">
                  ₹{balanceDue.toLocaleString("en-IN")}.00
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full h-[44px] text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ADVANCE_PAID">ADVANCE_PAID (Advance Received)</option>
                  <option value="PAID">PAID (Fully Prepaid)</option>
                  <option value="PENDING">PENDING (Cash on Drop)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (UPI Proof Uploaded)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Payment Mode</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-[44px] text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CASH">Cash / Spot Payment</option>
                  <option value="BANK_TRANSFER">NEFT / Bank Transfer</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="PAY_AT_DROP">Pay directly to Chauffeur</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">UTR / Transaction Ref</label>
                <input
                  type="text"
                  value={paymentUtrNumber}
                  onChange={(e) => setPaymentUtrNumber(e.target.value)}
                  placeholder="Bank UTR or Cash receipt"
                  className="w-full h-[44px] text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Special Dispatch Notes</label>
              <textarea
                rows="2"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="e.g. VIP passenger, child safety seat requested, specific landmark note..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Automated WhatsApp notification will be dispatched to:{" "}
              <span className="font-mono font-bold text-slate-900">{passengerPhone || "—"}</span>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={submitting}
                className="w-full sm:w-auto justify-center"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="amber"
                size="sm"
                icon={submitting ? Loader2 : Send}
                disabled={submitting}
                className="w-full sm:w-auto justify-center"
              >
                {submitting ? "Creating Reservation..." : "Create Booking & Dispatch"}
              </Button>
            </div>
          </div>
        </form>
  );

  return (
    <>
      {isPage ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-4 py-3 sm:px-8 sm:py-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Create Manual Booking &amp; Reservation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customer-portal location picker, intermediate stops &amp; automated vehicle pricing engine
              </p>
            </div>
          </div>
          {formElement}
        </div>
      ) : (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="Create Manual Booking & Reservation"
          subtitle="Customer-portal location picker, intermediate stops & automated vehicle pricing engine"
          size="xl"
        >
          {formElement}
        </Modal>
      )}

      {/* Interactive Location Picker Modal (Map & Pin) */}
      {isMapModalOpen && (
        <LocationPickerModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          activeTarget={mapTarget}
          pickupValue={pickupCity}
          dropValue={dropCity}
          airportValue={selectedAirport}
          tripType={tripType === "ROUND_TRIP" ? "round-trip" : "one-way"}
          stops={stopList.map((s) => s.city)}
          initialPickupCoords={pickupCoords}
          initialDropCoords={dropCoords}
          initialAirportCoords={airportCoords}
          onSelect={(selectedLocation, coords, target, allValues, details) => {
            if (target === "pickup") {
              setPickupCity(selectedLocation);
              if (details?.formattedAddress && !pickupAddress) {
                setPickupAddress(details.formattedAddress);
              }
              if (coords) setPickupCoords(coords);
            } else if (target === "drop") {
              setDropCity(selectedLocation);
              if (details?.formattedAddress && !dropAddress) {
                setDropAddress(details.formattedAddress);
              }
              if (coords) setDropCoords(coords);
            } else if (target === "airport") {
              setSelectedAirport(selectedLocation);
              if (coords) setAirportCoords(coords);
            } else if (target && target.startsWith("stop-")) {
              const stopId = target.replace("stop-", "");
              handleUpdateStop(stopId, selectedLocation, details);
            }

            if (allValues) {
              if (allValues.pickup && target !== "pickup") setPickupCity(allValues.pickup);
              if (allValues.drop && target !== "drop") setDropCity(allValues.drop);
              if (allValues.airport && target !== "airport") setSelectedAirport(allValues.airport);
              if (Array.isArray(allValues.stops) && allValues.stops.length > 0) {
                setStopList(
                  allValues.stops.map((cityName, i) => ({
                    id: stopList[i]?.id || Math.random().toString(36).substring(2, 9),
                    city: cityName,
                    coords: allValues.stopsCoords?.[i] || null,
                  }))
                );
              }
            }

            setIsMapModalOpen(false);
          }}
          onSelectPickup={(val, coords, details) => {
            setPickupCity(val);
            if (details?.formattedAddress && !pickupAddress) {
              setPickupAddress(details.formattedAddress);
            }
            if (coords) setPickupCoords(coords);
          }}
          onSelectDrop={(val, coords, details) => {
            setDropCity(val);
            if (details?.formattedAddress && !dropAddress) {
              setDropAddress(details.formattedAddress);
            }
            if (coords) setDropCoords(coords);
          }}
          onSelectAirport={(val, coords) => {
            setSelectedAirport(val);
            if (coords) setAirportCoords(coords);
          }}
        />
      )}
    </>
  );
}
