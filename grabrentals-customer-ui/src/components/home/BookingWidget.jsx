"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowLeftRight, MapPin, Calendar, Clock, ArrowRight, Plus, Minus, Navigation, ChevronLeft, ChevronRight, ChevronDown, Plane } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import CityAutocompleteInput from "@/components/booking/CityAutocompleteInput";
import LocationPickerModal from "@/components/booking/LocationPickerModal";
import AirportSearchDropdown from "@/components/booking/AirportSearchDropdown";
import TimeSelectDropdown from "@/components/booking/TimeSelectDropdown";
import PackageSelectDropdown from "@/components/booking/PackageSelectDropdown";
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

export const AIRPORT_LIST = [
  { id: "BLR", name: "Kempegowda International Airport (BLR), Bengaluru", city: "Bangalore, Karnataka", lat: 13.1986, lng: 77.7066 },
  { id: "MAA", name: "Chennai International Airport (MAA), Chennai", city: "Chennai, Tamil Nadu", lat: 12.9941, lng: 80.1709 },
  { id: "CJB", name: "Coimbatore International Airport (CJB), Coimbatore", city: "Coimbatore, Tamil Nadu", lat: 11.0298, lng: 77.0434 },
  { id: "IXM", name: "Madurai Airport (IXM), Madurai", city: "Madurai, Tamil Nadu", lat: 9.8345, lng: 78.0934 },
  { id: "TRZ", name: "Tiruchirappalli International Airport (TRZ), Trichy", city: "Tiruchirappalli, Tamil Nadu", lat: 10.7654, lng: 78.7107 },
  { id: "SXV", name: "Salem Airport (SXV), Salem", city: "Salem, Tamil Nadu", lat: 11.7836, lng: 78.0650 },
  { id: "TCR", name: "Tuticorin Airport (TCR), Thoothukudi", city: "Thoothukudi, Tamil Nadu", lat: 8.7236, lng: 78.0264 },
  { id: "COK", name: "Cochin International Airport (COK), Kochi", city: "Kochi, Kerala", lat: 10.1518, lng: 76.3930 },
  { id: "CCJ", name: "Calicut International Airport (CCJ), Kozhikode", city: "Kozhikode, Kerala", lat: 11.1362, lng: 75.9553 },
  { id: "TRV", name: "Trivandrum International Airport (TRV), Thiruvananthapuram", city: "Thiruvananthapuram, Kerala", lat: 8.4821, lng: 76.9200 },
  { id: "HYD", name: "Rajiv Gandhi International Airport (HYD), Hyderabad", city: "Hyderabad, Telangana", lat: 17.2403, lng: 78.4294 },
  { id: "IXE", name: "Mangalore International Airport (IXE), Mangaluru", city: "Mangalore, Karnataka", lat: 12.9613, lng: 74.8900 },
  { id: "GOI", name: "Goa International Airport (GOI / GOX), Goa", city: "Goa, Goa", lat: 15.3800, lng: 73.8314 },
  { id: "BOM", name: "Chhatrapati Shivaji Maharaj Airport (BOM), Mumbai", city: "Mumbai, Maharashtra", lat: 19.0896, lng: 72.8656 },
  { id: "DEL", name: "Indira Gandhi International Airport (DEL), New Delhi", city: "Delhi, Delhi", lat: 28.5562, lng: 77.1000 },
];

const getTabFromPath = (path) => {
  if (!path) return "outstation";
  if (path.startsWith("/airport")) return "airport";
  if (path.startsWith("/local")) return "local";
  if (path.startsWith("/packages") || path.startsWith("/package")) return "package";
  // if (path.startsWith("/vans")) return "van";
  // if (path.startsWith("/buses")) return "bus";
  return "outstation";
};

const getPathFromTab = (tabId) => {
  switch (tabId) {
    case "local": return "/local";
    case "airport": return "/airport";
    case "package": return "/packages";
    // case "van": return "/vans";
    // case "bus": return "/buses";
    case "outstation":
    default: return "/";
  }
};

export default function BookingWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(pathname));
  const [tripType, setTripType] = useState("round-trip");
  const [airportTripType, setAirportTripType] = useState("drop"); // "drop" = Drop to Airport, "pickup" = Pickup from Airport
  const [selectedAirport, setSelectedAirport] = useState(AIRPORT_LIST[0].name);
  const [airportCoords, setAirportCoords] = useState({ lat: 13.1986, lng: 77.7066 });
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState("pickup"); // 'pickup' | 'drop' | 'airport'

  // Location inputs & exact GPS coordinates
  const [pickupCity, setPickupCity] = useState("Bangalore, Karnataka");
  const [dropCity, setDropCity] = useState("Coimbatore, Tamil Nadu");
  const [stops, setStops] = useState([]); // Array of optional intermediate stops

  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [stopsCoords, setStopsCoords] = useState([]);
  const [pickupDetails, setPickupDetails] = useState(null);
  const [dropDetails, setDropDetails] = useState(null);

  // Date & Time inputs (timezone-aware & never in the past)
  const [pickupDate, setPickupDate] = useState(() => getDefaultPickupDateTime().date);
  const [dropDate, setDropDate] = useState(() => {
    const initial = getDefaultPickupDateTime();
    const d = new Date(`${initial.date}T00:00:00`);
    d.setDate(d.getDate() + 1);
    return formatLocalDate(d);
  });
  const [pickupTime, setPickupTime] = useState(() => getDefaultPickupDateTime().time);
  const [minPickupDateTime, setMinPickupDateTime] = useState(() => getMinPickupDateTimeString());
  const [localPackages, setLocalPackages] = useState(() => getCachedLocalPackages() || []);
  const [selectedPackage, setSelectedPackage] = useState(() => {
    const cached = getCachedLocalPackages();
    return cached && cached.length > 0 ? cached[0].value : "4hr-40km";
  });

  useEffect(() => {
    let isMounted = true;
    fetchLocalPackages(true).then((pkgs) => {
      if (isMounted && Array.isArray(pkgs) && pkgs.length > 0) {
        setLocalPackages(pkgs);
        setSelectedPackage((prev) => (pkgs.some((p) => p.value === prev) ? prev : pkgs[0].value));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const allowsStops = activeTab === "outstation";
  const showSwap = allowsStops || activeTab === "airport";

  // Tab scroll navigation for mobile view
  const tabsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = tabsRef.current;
    if (!el) return;

    const timer = setTimeout(checkScroll, 100);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScroll);
    };
  }, [t]);

  // Synchronize active tab with URL path changes (e.g. when user clicks a service in top navbar)
  useEffect(() => {
    const matchedTab = getTabFromPath(pathname);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab(matchedTab);
    if (matchedTab === "package" || matchedTab === "outstation") {
      setTripType("round-trip");
    } else if (matchedTab === "local") {
      setSelectedPackage((prev) => (prev && prev.includes("hr") ? prev : (localPackages[0]?.value || "4hr-40km")));
    }

    if (tabsRef.current) {
      const activeBtn = tabsRef.current.querySelector(`[data-tab-id="${matchedTab}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [pathname]);

  // Keep min pickup datetime current and ensure loaded/stored pickup is not in the past
  useEffect(() => {
    const currentMin = getMinPickupDateTimeString();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMinPickupDateTime(currentMin);
    const sanitized = sanitizePickupDateTime(pickupDate, pickupTime);
    if (sanitized.date !== pickupDate || sanitized.time !== pickupTime) {
      setPickupDate(sanitized.date);
      setPickupTime(sanitized.time);
    }
  }, []);

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

  // If currently selected time is not in available slots (e.g. was in the past), snap to first available
  useEffect(() => {
    if (availableTimeSlots.length > 0 && !availableTimeSlots.some((s) => s.value === pickupTime)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleTabClick = (tabId, e) => {
    setActiveTab(tabId);
    if (tabId === "outstation" || tabId === "package") {
      setTripType("round-trip");
    } else if (tabId === "local") {
      setSelectedPackage((prev) => (prev && prev.includes("hr") ? prev : (localPackages[0]?.value || "4hr-40km")));
    }
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
    const targetPath = getPathFromTab(tabId);
    if (pathname !== targetPath) {
      router.push(targetPath, { scroll: false });
    }
  };

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 160;
      tabsRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth"
      });
      setTimeout(checkScroll, 320);
    }
  };

  // Effective From & To for route calculation depending on active tab
  const effectiveFrom = useMemo(() => {
    if (activeTab === "airport") {
      return airportTripType === "drop" ? pickupCity : selectedAirport;
    }
    return pickupCity;
  }, [activeTab, airportTripType, pickupCity, selectedAirport]);

  const effectiveTo = useMemo(() => {
    if (activeTab === "airport") {
      return airportTripType === "drop" ? selectedAirport : dropCity;
    }
    if (activeTab === "local") {
      return "";
    }
    return dropCity;
  }, [activeTab, airportTripType, dropCity, selectedAirport]);

  // Automatic KM & Route Duration Detection (Instant synchronous fallback + Google Routes API async)
  const initialEstimate = useMemo(() => {
    if (activeTab === "local") {
      return { isDetected: false, distanceKm: 0, durationHours: 0, durationText: "" };
    }
    return detectRouteDistance(effectiveFrom, effectiveTo, allowsStops ? stops : [], tripType);
  }, [effectiveFrom, effectiveTo, stops, tripType, activeTab, allowsStops]);

  const [googleRoute, setGoogleRoute] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadGoogleRoute() {
      if (!effectiveFrom || !effectiveTo || activeTab === "local" || activeTab === "package") return;
      try {
        const res = await fetchGoogleRouteDistance(effectiveFrom, effectiveTo, allowsStops ? stops : [], tripType, {
          originCoords: activeTab === "airport" && airportTripType === "pickup" ? airportCoords : pickupCoords,
          destinationCoords: activeTab === "airport" && airportTripType === "drop" ? airportCoords : dropCoords,
          stopsCoords: allowsStops ? stopsCoords : []
        });
        if (!cancelled && res?.isDetected) {
          setGoogleRoute(res);
        }
      } catch (err) {
        console.warn("Could not fetch Google Route:", err);
      }
    }
    loadGoogleRoute();
    return () => {
      cancelled = true;
    };
  }, [effectiveFrom, effectiveTo, stops, tripType, pickupCoords, dropCoords, airportCoords, stopsCoords, activeTab, allowsStops, airportTripType]);

  const routeEstimate = googleRoute || initialEstimate;

  // Stop management
  const handleAddStop = (index) => {
    if (stops.length >= 3) return; // Max 3 stops
    if (typeof index === "number") {
      const nextStops = [...stops];
      nextStops.splice(index + 1, 0, "");
      setStops(nextStops);

      const nextCoords = [...stopsCoords];
      nextCoords.splice(index + 1, 0, null);
      setStopsCoords(nextCoords);
    } else {
      setStops([...stops, ""]);
      setStopsCoords([...stopsCoords, null]);
    }
  };

  const handleRemoveStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
    setStopsCoords(stopsCoords.filter((_, i) => i !== index));
  };

  const handleStopChange = (index, value, coords = null) => {
    const updated = [...stops];
    updated[index] = value;
    setStops(updated);

    const updatedCoords = [...stopsCoords];
    updatedCoords[index] = coords;
    setStopsCoords(updatedCoords);
  };

  const handleSwap = () => {
    const tempDetails = pickupDetails;
    setPickupDetails(dropDetails);
    setDropDetails(tempDetails);

    if (activeTab === "airport") {
      if (airportTripType === "drop") {
        setDropCity(pickupCity);
        setDropCoords(pickupCoords);
        setAirportTripType("pickup");
      } else {
        setPickupCity(dropCity);
        setPickupCoords(dropCoords);
        setAirportTripType("drop");
      }
      return;
    }
    setPickupCity(dropCity);
    setDropCity(pickupCity);
    setPickupCoords(dropCoords);
    setDropCoords(pickupCoords);
    if (stops.length > 0) {
      setStops([...stops].reverse());
      setStopsCoords([...stopsCoords].reverse());
    }
  };

  const handleTripTypeChange = (type) => {
    setTripType(type);
    if (type === "multi-city-tour" && stops.length === 0) {
      setStops([""]);
    }
  };

  // Build target explore URL with search parameters
  const buildExploreUrl = () => {
    const params = new URLSearchParams();
    const resolvedServiceType = activeTab === "local" ? "LOCAL" : activeTab === "airport" ? "AIRPORT" : "OUTSTATION";
    params.set("serviceType", resolvedServiceType);

    if (activeTab === "airport") {
      const fromLoc = airportTripType === "drop" ? pickupCity : selectedAirport;
      const toLoc = airportTripType === "drop" ? selectedAirport : dropCity;
      params.set("from", fromLoc);
      params.set("to", toLoc);
      params.set("airportTripType", airportTripType);
      params.set("airport", selectedAirport);
      params.set("tripType", airportTripType === "drop" ? "Airport Drop" : "Airport Pickup");
    } else if (activeTab === "package") {
      const fromLoc = pickupCity || "Bangalore, Karnataka";
      const toLoc = dropCity || "Coimbatore, Tamil Nadu";
      params.set("from", fromLoc);
      params.set("to", toLoc);
      params.set("tripType", "round-trip");
    } else if (activeTab === "local") {
      if (pickupCity) params.set("from", pickupCity);
      params.set("package", selectedPackage);
      params.set("to", selectedPackage);
      params.set("tripType", "local");
    } else {
      if (pickupCity) params.set("from", pickupCity);
      if (dropCity) params.set("to", dropCity);
      const validStops = stops.filter((s) => s.trim());
      if (validStops.length > 0) {
        params.set("stops", validStops.join("|"));
      }
      params.set("tripType", tripType);
    }

    if (pickupDetails?.city) params.set("fromCity", pickupDetails.city);
    if (pickupDetails?.state) params.set("fromState", pickupDetails.state);
    if (dropDetails?.city) params.set("toCity", dropDetails.city);

    params.set("pickupDate", pickupDate);
    if ((tripType === "round-trip" || activeTab === "package") && dropDate && activeTab !== "local") {
      params.set("dropDate", dropDate);
    }
    params.set("pickupTime", pickupTime);
    if (routeEstimate?.distanceKm > 0) {
      params.set("distanceKm", String(routeEstimate.distanceKm));
    }
    if (routeEstimate?.durationText) {
      params.set("duration", routeEstimate.durationText);
    }
    if (routeEstimate?.tollPrice > 0) {
      params.set("tollPrice", String(routeEstimate.tollPrice));
    }
    return `/outstation/select-vehicle?${params.toString()}`;
  };

  const handleExploreClick = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    const validStops = stops.filter((s) => s.trim());
    const resolvedServiceType = activeTab === "local" ? "LOCAL" : activeTab === "airport" ? "AIRPORT" : "OUTSTATION";

    let fromLoc = pickupCity;
    let toLoc = dropCity;
    let pkgVal = undefined;

    if (activeTab === "airport") {
      fromLoc = airportTripType === "drop" ? pickupCity : selectedAirport;
      toLoc = airportTripType === "drop" ? selectedAirport : dropCity;
    } else if (activeTab === "local") {
      toLoc = selectedPackage;
      pkgVal = selectedPackage;
    } else if (activeTab === "package") {
      fromLoc = pickupCity || "Bangalore, Karnataka";
      toLoc = dropCity || "Coimbatore, Tamil Nadu";
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("grab_pending_trip", JSON.stringify({
        from: fromLoc,
        fromCity: pickupDetails?.city || undefined,
        fromState: pickupDetails?.state || undefined,
        to: toLoc,
        toCity: dropDetails?.city || undefined,
        airportTripType: activeTab === "airport" ? airportTripType : undefined,
        airport: activeTab === "airport" ? selectedAirport : undefined,
        package: pkgVal,
        stops: validStops.join("|"),
        pickupCoords,
        dropCoords,
        stopsCoords,
        pickupDetails,
        dropDetails,
        distanceKm: routeEstimate.distanceKm,
        durationText: routeEstimate.durationText,
        tollPrice: routeEstimate.tollPrice,
        tripType: activeTab === "airport"
          ? (airportTripType === "drop" ? "Airport Drop" : "Airport Pickup")
          : activeTab === "package"
            ? "round-trip"
            : activeTab === "local"
              ? "local"
              : tripType,
        serviceType: resolvedServiceType,
        date: pickupDate,
        time: pickupTime,
        dropDate: (activeTab !== "local" && (tripType === "round-trip" || activeTab === "package")) ? dropDate : undefined,
      }));
    }

    const targetUrl = buildExploreUrl();
    router.push(targetUrl);
  };

  const hasStops = allowsStops && stops.length > 0;
  const isRoundTrip = tripType === "round-trip";

  return (
    <div className="bg-white text-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 max-w-6xl mx-auto border border-black">

      {/* Top Segmented Tabs */}
      <div className="relative mb-4 sm:mb-6">
        {/* Left Arrow (Mobile View) */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-[1px] flex items-center pr-3 bg-gradient-to-r from-white via-white/95 to-transparent z-10 sm:hidden">
            <button
              type="button"
              onClick={() => scrollTabs("left")}
              aria-label="Scroll tabs left"
              className="w-7 h-7 rounded-full bg-white shadow-md border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-brand-amber active:scale-90 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Scrollable / Centered Tabs */}
        <div
          ref={tabsRef}
          onScroll={checkScroll}
          className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar pb-1 gap-1 sm:gap-2 scroll-smooth justify-center items-center w-full"
        >
          {[
            { id: "outstation", label: t("outstation") || "Outstation" },
            { id: "local", label: t("local_rental") },
            { id: "airport", label: t("airport") },
            // { id: "van", label: t("tempo_traveller") },
            // { id: "bus", label: t("luxury_buses") },
            { id: "package", label: t("packages") || "Packages" },
          ].map((tab) => (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              onClick={(e) => handleTabClick(tab.id, e)}
              className={`flex-1 sm:flex-none text-center px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-colors border-b-[3px] cursor-pointer whitespace-nowrap ${activeTab === tab.id
                  ? "text-brand-amber border-brand-amber bg-blue-50/50 rounded-t-lg"
                  : "text-slate-500 border-transparent hover:text-slate-800"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Arrow (Mobile View) */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-[1px] flex items-center pl-3 bg-gradient-to-l from-white via-white/95 to-transparent z-10 sm:hidden">
            <button
              type="button"
              onClick={() => scrollTabs("right")}
              aria-label="Scroll tabs right"
              className="w-7 h-7 rounded-full bg-white shadow-md border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-brand-amber active:scale-90 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>

      {/* Trip Type Radios / Direction Options */}
      {activeTab === "airport" ? (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5 animate-fade-in">
          {[
            { id: "drop", label: t("drop_to_airport") || "Drop to Airport" },
            { id: "pickup", label: t("pickup_from_airport") || "Pickup from Airport" },
          ].map((item) => {
            const isSelected = airportTripType === item.id;
            return (
              <label
                key={item.id}
                className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border transition-all cursor-pointer select-none ${isSelected
                    ? "bg-blue-50/70 border-[#0082fe] text-blue-950 shadow-xs ring-1 ring-[#0082fe]/30 font-bold"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 font-semibold"
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${isSelected ? "border-[#0082fe]" : "border-slate-300"
                    }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#0082fe]" />}
                </div>
                <input
                  type="radio"
                  name="airportTripType"
                  value={item.id}
                  checked={isSelected}
                  onChange={() => setAirportTripType(item.id)}
                  className="hidden"
                />
                <span className="text-xs sm:text-sm whitespace-nowrap">
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
      ) : allowsStops ? (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
          {[
            { id: "round-trip", label: t("round_trip") },
            { id: "one-way", label: t("one_way") },
            { id: "multi-city-tour", label: t("multi_city_tour") || "Multi-City Tour" },
          ].map((item) => {
            const isSelected = tripType === item.id;
            return (
              <label
                key={item.id}
                className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border transition-all cursor-pointer select-none ${isSelected
                    ? "bg-blue-50/70 border-[#0082fe] text-blue-950 shadow-xs ring-1 ring-[#0082fe]/30 font-bold"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 font-semibold"
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${isSelected ? "border-[#0082fe]" : "border-slate-300"
                    }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#0082fe]" />}
                </div>
                <input
                  type="radio"
                  name="tripType"
                  value={item.id}
                  checked={isSelected}
                  onChange={(e) => handleTripTypeChange(e.target.value)}
                  className="hidden"
                />
                <span className="text-xs sm:text-sm capitalize whitespace-nowrap">
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
      ) : null}

      {/* ===================== INPUT SECTION ===================== */}
      {/* If stops or round-trip: 2-row multi-column grid like Savaari */}
      {(hasStops || isRoundTrip) && (activeTab === "outstation" || activeTab === "package") ? (
        <div className="space-y-4">
          {/* ROW 1: Locations (FROM -> STOP 1 -> STOP 2 -> TO) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-start">

            {/* FROM: Pickup City */}
            <div className={`w-full relative ${hasStops ? "lg:col-span-4" : "lg:col-span-5"}`}>
              <div className="flex items-center justify-between mb-2 min-h-[18px]">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {t("from_city")}
                </label>
              </div>
              <CityAutocompleteInput
                value={pickupCity}
                onChange={(val, coords, details) => {
                  setPickupCity(val);
                  setPickupCoords(coords || null);
                  if (details) setPickupDetails(details);
                }}
                placeholder="e.g. Bangalore (Bengaluru)"
                iconColor="text-brand-emerald"
                inputClassName="rounded-xl"
              />
              <button
                type="button"
                onClick={() => {
                  setMapTarget("pickup");
                  setIsMapModalOpen(true);
                }}
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0082fe] hover:text-[#006ed6] hover:underline transition-colors cursor-pointer group"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0082fe] group-hover:scale-110 transition-transform" />
                <span>{t("choose_from_location") || "Choose from Location"}</span>
              </button>
            </div>

            {/* Swap Button (between pickup & stops/drop) */}
            <div className="hidden lg:flex items-center justify-center pt-6 lg:col-span-1">
              <button
                type="button"
                onClick={handleSwap}
                title="Swap Pickup & Destination"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-brand-amber hover:border-brand-amber hover:bg-blue-50 transition-all shadow-sm group cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* STOPS: Optional intermediate stops */}
            {stops.map((stop, index) => (
              <div key={index} className="w-full relative lg:col-span-3 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-brand-amber uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-amber inline-block"></span>
                    {t("stop_label") || "STOP"} {index + 1}
                    <span className="text-[10px] font-normal text-slate-400 lowercase">(optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(index)}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>

                <CityAutocompleteInput
                  value={stop}
                  onChange={(val, coords) => handleStopChange(index, val, coords)}
                  placeholder="Type stop city (e.g. Salem)"
                  iconColor="text-brand-amber"
                  inputClassName="bg-blue-50/40 border-blue-200 rounded-xl"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(index)}
                      title="Remove this stop"
                      className="w-7 h-7 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  }
                />

                {/* Map picker */}
                <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setMapTarget(`stop-${index}`);
                      setIsMapModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors cursor-pointer group"
                  >
                    <MapPin className="w-3 h-3 text-purple-500 group-hover:scale-110 transition-transform" />
                    <span>Choose on Map</span>
                  </button>
                </div>
              </div>
            ))}

            {/* TO: Drop Destination */}
            <div className={`w-full relative ${hasStops
                ? stops.length === 1
                  ? "lg:col-span-4"
                  : "lg:col-span-4"
                : "lg:col-span-6"
              }`}>
              <div className="flex items-center justify-between mb-2 min-h-[18px]">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {activeTab === "package" ? "Select Packages" : t("to_city")}
                </label>
                {allowsStops && stops.length < 3 && (
                  <button
                    type="button"
                    onClick={() => handleAddStop()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0082fe] hover:text-[#006ed6] hover:underline transition-colors cursor-pointer group whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0082fe] group-hover:scale-110 transition-transform" />
                    <span>{t("add_stop") || "Add Stop"}</span>
                  </button>
                )}
              </div>
              <CityAutocompleteInput
                value={dropCity}
                onChange={(val, coords, details) => {
                  setDropCity(val);
                  setDropCoords(coords || null);
                  if (details) setDropDetails(details);
                }}
                placeholder="e.g. Coimbatore, Tamil Nadu"
                iconColor="text-brand-orange"
                inputClassName="rounded-xl"
              />

              {/* Action triggers below field */}
              <button
                type="button"
                onClick={() => {
                  setMapTarget("drop");
                  setIsMapModalOpen(true);
                }}
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0082fe] hover:text-[#006ed6] hover:underline transition-colors cursor-pointer group whitespace-nowrap"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0082fe] group-hover:scale-110 transition-transform" />
                <span>{t("choose_to_location") || "Choose to Location"}</span>
              </button>
            </div>

          </div>

          {/* ROW 2: Schedule & Action (Pick Up Date, Return Date, Pick Up Time, Explore CTA) */}
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 items-end pt-4 mt-2 border-t border-slate-100 min-w-0">

            {/* SEPARATE PICKUP DATE */}
            <div className={`col-span-1 min-w-0 ${isRoundTrip ? "lg:col-span-3" : "lg:col-span-4"}`}>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 truncate">
                {t("pickup_date") || "Pickup Date"}
              </label>
              <div className="relative group min-w-0 w-full">
                <Calendar className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 text-[#0082fe] w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none shrink-0" />
                <input
                  type="date"
                  value={pickupDate}
                  min={minDateStr}
                  suppressHydrationWarning
                  onChange={(e) => handlePickupDateChange(e.target.value)}
                  className="w-full min-w-0 max-w-full block pl-8 sm:pl-10 pr-2 sm:pr-3 py-3 sm:py-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-2xs cursor-pointer box-border appearance-none"
                />
              </div>
            </div>

            {/* SEPARATE PICKUP TIME (Custom Controlled Dropdown) */}
            <div className={`col-span-1 min-w-0 ${isRoundTrip ? "lg:col-span-3" : "lg:col-span-4"}`}>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 truncate">
                {t("pickup_time") || "Pickup Time"}
              </label>
              <TimeSelectDropdown
                value={pickupTime}
                onChange={handlePickupTimeChange}
                availableSlots={availableTimeSlots}
              />
            </div>

            {/* DROP / RETURN DATE (for Round Trip) */}
            {isRoundTrip && (
              <div className="col-span-2 sm:col-span-1 lg:col-span-3 min-w-0">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 truncate">
                  {t("return_date")}
                </label>
                <div className="relative group min-w-0 w-full">
                  <Calendar className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 text-[#0082fe] w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none shrink-0" />
                  <input
                    type="date"
                    value={dropDate}
                    min={pickupDate || minDateStr}
                    suppressHydrationWarning
                    onChange={(e) => setDropDate(e.target.value)}
                    className="w-full min-w-0 max-w-full block pl-8 sm:pl-10 pr-2 sm:pr-3 py-3 sm:py-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-2xs cursor-pointer box-border appearance-none"
                  />
                </div>
              </div>
            )}

            {/* CTA Button: EXPLORE / SEARCH CABS */}
            <div className={`col-span-2 sm:col-span-1 ${isRoundTrip ? "lg:col-span-3" : "lg:col-span-4"}`}>
              <Link
                href={buildExploreUrl()}
                onClick={handleExploreClick}
                suppressHydrationWarning
                className="flex items-center justify-center gap-2 w-full bg-[#0082fe] hover:bg-[#006ed6] text-white py-3 sm:py-3.5 px-6 rounded-xl font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-[#0082fe]/25 hover:shadow-lg whitespace-nowrap shrink-0"
              >
                {t("search_cabs")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      ) : (
        /* STANDARD 1-ROW VIEW (When 0 stops and one-way, Local, or Airport) */
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 items-start relative w-full">

          {/* FIELD 1 (LEFT): Pickup City/Address OR Pickup Airport */}
          <div className="flex-1 min-w-0 w-full relative">
            <div className="flex items-center justify-between mb-2 min-h-[18px]">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {activeTab === "airport"
                  ? (airportTripType === "pickup"
                    ? (t("pickup_airport") || "Pickup Airport")
                    : (t("pickup_location") || "Pickup Location"))
                  : t("from_city")}
              </label>
            </div>

            {activeTab === "airport" && airportTripType === "pickup" ? (
              <>
                <AirportSearchDropdown
                  value={selectedAirport}
                  onChange={(val, coords) => {
                    setSelectedAirport(val);
                    if (coords) setAirportCoords(coords);
                  }}
                  onOpenMap={() => {
                    setMapTarget("airport");
                    setIsMapModalOpen(true);
                  }}
                  tripType="pickup"
                  iconColor="text-brand-emerald"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMapTarget("airport");
                    setIsMapModalOpen(true);
                  }}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0082fe] hover:text-[#006ed6] hover:underline transition-colors cursor-pointer group whitespace-nowrap"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#0082fe] group-hover:scale-110 transition-transform" />
                  <span>{t("choose_from_location") || "Choose From Map"}</span>
                </button>
              </>
            ) : (
              <>
                <CityAutocompleteInput
                  value={pickupCity}
                  onChange={(val, coords, details) => {
                    setPickupCity(val);
                    setPickupCoords(coords || null);
                    if (details) setPickupDetails(details);
                  }}
                  onOpenMap={() => {
                    setMapTarget("pickup");
                    setIsMapModalOpen(true);
                  }}
                  placeholder={activeTab === "airport" ? "e.g. Koramangala, Bangalore (Address / Hotel)" : "e.g. Bangalore (Bengaluru)"}
                  iconColor="text-brand-emerald"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMapTarget("pickup");
                    setIsMapModalOpen(true);
                  }}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0082fe] hover:text-[#006ed6] hover:underline transition-colors cursor-pointer group whitespace-nowrap"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#0082fe] group-hover:scale-110 transition-transform" />
                  <span>{t("choose_from_location") || "Choose from Location"}</span>
                </button>
              </>
            )}
          </div>

          {/* Desktop Swap Button */}
          {showSwap && (
            <div className="hidden lg:flex items-center justify-center pt-6 px-1 shrink-0">
              <button
                type="button"
                onClick={handleSwap}
                title={activeTab === "airport" ? "Switch between Drop to Airport & Pickup from Airport" : "Swap Pickup & Destination"}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-brand-amber hover:border-brand-amber hover:bg-blue-50 transition-all shadow-sm group cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}

          {/* Mobile Swap Button */}
          {showSwap && (
            <div className="flex lg:hidden justify-center -my-1 w-full relative z-10 shrink-0">
              <button
                type="button"
                onClick={handleSwap}
                title={activeTab === "airport" ? "Switch between Drop to Airport & Pickup from Airport" : "Swap Pickup & Destination"}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-brand-amber hover:border-brand-amber shadow-sm cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 rotate-90" />
              </button>
            </div>
          )}

          {/* FIELD 2 (RIGHT): Drop City/Address OR Drop Airport OR Package */}
          <div className="flex-1 min-w-0 w-full relative">
            <div className="flex items-center justify-between mb-2 min-h-[18px]">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {activeTab === "airport"
                  ? (airportTripType === "drop"
                    ? (t("drop_airport") || "Drop Airport")
                    : (t("drop_location") || "Drop Location"))
                  : activeTab === "local"
                    ? "Select Hourly Package"
                    : activeTab === "package"
                      ? "Select Packages"
                      : t("to_city")}
              </label>
              {allowsStops && stops.length < 3 && (
                <button
                  type="button"
                  onClick={() => handleAddStop()}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0082fe] hover:text-[#006ed6] hover:underline transition-colors cursor-pointer group whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0082fe] group-hover:scale-110 transition-transform" />
                  <span>{t("add_stop") || "Add Stop"}</span>
                </button>
              )}
            </div>

            {activeTab === "airport" && airportTripType === "drop" ? (
              <>
                <AirportSearchDropdown
                  value={selectedAirport}
                  onChange={(val, coords) => {
                    setSelectedAirport(val);
                    if (coords) setAirportCoords(coords);
                  }}
                  onOpenMap={() => {
                    setMapTarget("airport");
                    setIsMapModalOpen(true);
                  }}
                  tripType="drop"
                  iconColor="text-brand-orange"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMapTarget("airport");
                    setIsMapModalOpen(true);
                  }}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0082fe] hover:text-[#006ed6] hover:underline transition-colors cursor-pointer group whitespace-nowrap"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#0082fe] group-hover:scale-110 transition-transform" />
                  <span>{t("choose_to_location") || "Choose From Map"}</span>
                </button>
              </>
            ) : activeTab === "local" ? (
              <PackageSelectDropdown
                value={selectedPackage.includes("hr") ? selectedPackage : (localPackages[0]?.value || "4hr-40km")}
                onChange={(val) => setSelectedPackage(val)}
                packages={localPackages}
              />
            ) : (
              <CityAutocompleteInput
                value={dropCity}
                onChange={(val, coords, details) => {
                  setDropCity(val);
                  setDropCoords(coords || null);
                  if (details) setDropDetails(details);
                }}
                onOpenMap={() => {
                  setMapTarget("drop");
                  setIsMapModalOpen(true);
                }}
                placeholder={activeTab === "airport" ? "e.g. Koramangala, Bangalore (Address / Hotel)" : "e.g. Coimbatore, Tamil Nadu"}
                iconColor="text-brand-orange"
                inputClassName="rounded-xl"
              />
            )}

            {activeTab !== "local" && activeTab !== "package" && !(activeTab === "airport" && airportTripType === "drop") && (
              <button
                type="button"
                onClick={() => {
                  setMapTarget("drop");
                  setIsMapModalOpen(true);
                }}
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0082fe] hover:text-[#006ed6] hover:underline transition-colors cursor-pointer group whitespace-nowrap"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0082fe] group-hover:scale-110 transition-transform" />
                <span>{t("choose_to_location") || "Choose to Location"}</span>
              </button>
            )}
          </div>

          {/* SEPARATE PICKUP DATE & TIME (Side-by-side in 1 line on mobile) */}
          <div className="grid grid-cols-2 gap-3 w-full lg:flex lg:flex-1 lg:gap-4 min-w-0">
            {/* SEPARATE PICKUP DATE */}
            <div className="col-span-1 w-full lg:flex-1 min-w-0 relative">
              <div className="flex items-center justify-between mb-2 min-h-[18px]">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {t("pickup_date") || "Pickup Date"}
                </label>
              </div>
              <div className="relative group min-w-0 w-full">
                <Calendar className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 text-[#0082fe] w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none shrink-0" />
                <input
                  type="date"
                  value={pickupDate}
                  min={minDateStr}
                  suppressHydrationWarning
                  onChange={(e) => handlePickupDateChange(e.target.value)}
                  className="w-full min-w-0 max-w-full block pl-8 sm:pl-10 pr-2 sm:pr-3 py-3 sm:py-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-2xs cursor-pointer box-border appearance-none"
                />
              </div>
            </div>

            {/* SEPARATE PICKUP TIME (Custom Controlled Dropdown) */}
            <div className="col-span-1 w-full lg:flex-1 min-w-0 relative">
              <div className="flex items-center justify-between mb-2 min-h-[18px]">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {t("pickup_time") || "Pickup Time"}
                </label>
              </div>
              <TimeSelectDropdown
                value={pickupTime}
                onChange={handlePickupTimeChange}
                availableSlots={availableTimeSlots}
              />
            </div>
          </div>

          {/* CTA Button */}
          <div className="w-full lg:w-auto mt-2 sm:mt-4 lg:mt-[23px] shrink-0">
            <Link
              href={buildExploreUrl()}
              onClick={handleExploreClick}
              suppressHydrationWarning
              className="flex items-center justify-center gap-2 w-full lg:w-auto lg:min-w-[130px] px-6 bg-[#0082fe] hover:bg-[#006ed6] text-white py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all shadow-md shadow-[#0082fe]/25 active:scale-95 whitespace-nowrap shrink-0"
            >
              {t("search_cabs")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Automatic Route Distance & Driving Time Detection Banner */}
      {routeEstimate.isDetected && routeEstimate.distanceKm > 0 && activeTab !== "local" && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-blue-50/70 border border-blue-200/80 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {activeTab === "package" ? "Selected Special Tour Circuit:" : t("auto_detected_route") || "Auto-Detected Route:"}
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {routeEstimate.distanceKm} km {activeTab === "package" ? "(Round Trip Circuit)" : ""}
            </span>
            <span className="text-xs font-semibold text-slate-500 capitalize">
              ({activeTab === "airport"
                ? (airportTripType === "drop" ? "Airport Drop" : "Airport Pickup")
                : activeTab === "package"
                  ? (routeEstimate.durationText || "Multi-Day Tour")
                  : tripType === "one-way" ? t("trip_one_way") : tripType === "round-trip" ? t("trip_round_trip") : t("multi_city_tour")})
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-xs font-bold text-blue-900 bg-white/90 px-3 py-1 rounded-lg border border-blue-200/60 flex items-center gap-1.5 shadow-2xs">
              {activeTab === "package" ? (
                <span>🛡️ Fastag Tolls, State Border Permits & Driver Allowance Included</span>
              ) : (
                <>
                  <span>⏱️ {t("estimated_driving_time") || "Estimated Driving Time:"}</span>
                  <span className="text-slate-900 font-extrabold">{routeEstimate.durationText || `~${routeEstimate.durationHours} hrs`}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trust Guarantee & Promo Strip (Orange Banner matching design) */}
      <div className="mt-4 sm:mt-6 p-3 sm:px-5 sm:py-2.5 rounded-xl bg-[#0082fe] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold shadow-sm shadow-[#0082fe]/20">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-6">
          {activeTab === "airport" ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="font-bold text-white tracking-tight">✈️ Live Flight Tracking & Arrival Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="font-bold text-white tracking-tight">⏱️ 60 Mins Complimentary Waiting at Arrivals</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="font-bold text-white tracking-tight">🤝 Chauffeur Meet & Greet with Placard</span>
              </div>
            </>
          ) : activeTab === "package" ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="font-bold text-white tracking-tight">🏖️ Special Multi-Day Roadtrips: Goa, Ladakh & Beyond</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-300 shrink-0"></span>
                <span className="font-bold text-white tracking-tight">Zero Hidden Taxes • Dedicated Chauffeur on Standby</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="font-bold text-white tracking-tight">{t("verified_highway_trips") || "5,00,000+ Verified Highway Trips"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="font-bold text-white tracking-tight">{t("police_cleared_drivers") || "Commercial Badged & Police-Cleared Drivers"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="font-bold text-white tracking-tight">{t("zero_hidden_fares") || "Zero Hidden Night Fares • All-Inclusive Option"}</span>
              </div>
            </>
          )}
        </div>

        {/* Promo Pill on Far Right */}
        <div className="bg-white text-[#0082fe] font-black text-xs px-3.5 py-1.5 rounded-lg shadow-xs whitespace-nowrap w-full sm:w-auto text-center">
          {activeTab === "airport" ? "100% On-Time Guarantee" : (t("flat_discount_promo") || "Flat 10% Off First Outstation Ride")}
        </div>
      </div>

      {/* Interactive Google Maps / Leaflet Location Picker Modal */}
      {isMapModalOpen && (
        <LocationPickerModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          activeTarget={mapTarget}
          pickupValue={pickupCity}
          dropValue={dropCity}
          airportValue={selectedAirport}
          stops={stops}
          allowStops={allowsStops && activeTab !== "airport"}
          initialPickupCoords={pickupCoords}
          initialDropCoords={dropCoords}
          initialAirportCoords={airportCoords}
          initialStopsCoords={stopsCoords}
          tripType={activeTab === "package" ? "round-trip" : tripType}
          onSelect={(selectedLocation, coords, target, allValues, details) => {
            if (allValues) {
              if (allValues.airport) {
                setSelectedAirport(allValues.airport);
                if (allValues.airportCoords) setAirportCoords(allValues.airportCoords);
              }
              if (allValues.pickup) {
                setPickupCity(allValues.pickup);
                if (allValues.pickupCoords) setPickupCoords(allValues.pickupCoords);
                if (allValues.pickupDetails) setPickupDetails(allValues.pickupDetails);
              }
              if (allValues.drop) {
                setDropCity(allValues.drop);
                if (allValues.dropCoords) setDropCoords(allValues.dropCoords);
                if (allValues.dropDetails) setDropDetails(allValues.dropDetails);
              }
              if (Array.isArray(allValues.stops)) {
                setStops(allValues.stops);
                if (allValues.stopsCoords) {
                  const arr = Array.isArray(allValues.stopsCoords)
                    ? allValues.stopsCoords
                    : allValues.stops.map((_, i) => allValues.stopsCoords[i] || null);
                  setStopsCoords(arr);
                }
              }
            } else if (target === "airport") {
              setSelectedAirport(selectedLocation);
              if (coords) {
                setAirportCoords(coords);
                if (airportTripType === "pickup") {
                  setPickupCoords(coords);
                } else {
                  setDropCoords(coords);
                }
              }
            } else if (target === "drop") {
              setDropCity(selectedLocation);
              if (coords) setDropCoords(coords);
              if (details) setDropDetails(details);
            } else if (typeof target === "string" && target.startsWith("stop-")) {
              const idx = parseInt(target.replace("stop-", ""), 10);
              if (idx >= 0) {
                handleStopChange(idx, selectedLocation, coords);
              }
            } else {
              setPickupCity(selectedLocation);
              if (coords) setPickupCoords(coords);
              if (details) setPickupDetails(details);
            }
          }}
          onSelectAirport={(selectedLocation, coords) => {
            setSelectedAirport(selectedLocation);
            if (coords) {
              setAirportCoords(coords);
              if (airportTripType === "pickup") {
                setPickupCoords(coords);
              } else {
                setDropCoords(coords);
              }
            }
          }}
          onSelectPickup={(selectedLocation, coords, details) => {
            setTimeout(() => {
              setPickupCity(selectedLocation);
              if (coords) setPickupCoords(coords);
              if (details) setPickupDetails(details);
            }, 0);
          }}
          onSelectDrop={(selectedLocation, coords, details) => {
            setTimeout(() => {
              setDropCity(selectedLocation);
              if (coords) setDropCoords(coords);
              if (details) setDropDetails(details);
            }, 0);
          }}
          onSelectStops={(newStops) => {
            setTimeout(() => {
              setStops(newStops);
            }, 0);
          }}
        />
      )}

    </div>
  );
}

