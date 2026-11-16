"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Plane, Search, Check, X, ChevronDown, Loader2 } from "lucide-react";
import { loadGoogleMaps } from "@/lib/googleMaps";

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

export default function AirportSearchDropdown({
  value = "",
  onChange,
  placeholder = "Select or search airport hub...",
  iconColor = "text-sky-600",
  className = "",
  hasError = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [googleResults, setGoogleResults] = useState([]);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const [googleMapsReady, setGoogleMapsReady] = useState(false);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const sessionTokenRef = useRef(null);

  // Initialize Google Maps Places if available
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setGoogleMapsReady(true))
      .catch(() => setGoogleMapsReady(false));
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter static airports by search query
  const filteredAirports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return AIRPORT_LIST;
    return AIRPORT_LIST.filter((ap) => {
      const matchId = ap.id?.toLowerCase().includes(query);
      const matchName = ap.name?.toLowerCase().includes(query);
      const matchCity = ap.city?.toLowerCase().includes(query);
      return matchId || matchName || matchCity;
    });
  }, [searchQuery]);

  // Google Places search for airports / terminals if user searches
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    const query = searchQuery.trim();
    if (!query || query.length < 2 || !googleMapsReady || !window.google?.maps?.importLibrary) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGoogleResults([]);
      setIsSearchingGoogle(false);
      return;
    }

    setIsSearchingGoogle(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const { AutocompleteSuggestion, AutocompleteSessionToken } = await window.google.maps.importLibrary("places");
        if (AutocompleteSuggestion) {
          if (!sessionTokenRef.current && AutocompleteSessionToken) {
            sessionTokenRef.current = new AutocompleteSessionToken();
          }

          const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query.toLowerCase().includes("airport") ? query : `${query} Airport`,
            sessionToken: sessionTokenRef.current,
            includedRegionCodes: ["in"],
          });

          if (response?.suggestions?.length > 0) {
            const formatted = response.suggestions.map((item, index) => {
              const pred = item.placePrediction;
              return {
                id: pred?.placeId || `gairport-${index}`,
                title: pred?.mainText?.toString() || pred?.text?.toString() || query,
                description: pred?.secondaryText?.toString() || pred?.text?.toString() || "",
                placePrediction: pred,
              };
            });
            setGoogleResults(formatted);
          } else {
            setGoogleResults([]);
          }
        }
      } catch (err) {
        console.warn("Google Places airport search error:", err);
        setGoogleResults([]);
      } finally {
        setIsSearchingGoogle(false);
      }
    }, 250);
  }, [searchQuery, googleMapsReady]);

  // Select airport from static list
  const handleSelectAirport = (airport) => {
    if (onChange) {
      const coords = airport.lat && airport.lng ? { lat: airport.lat, lng: airport.lng } : null;
      onChange(airport.name, coords);
    }
    setIsOpen(false);
  };

  // Select airport from Google Places
  const handleSelectGoogleAirport = async (item) => {
    try {
      if (item.placePrediction?.toPlace) {
        const place = item.placePrediction.toPlace();
        await place.fetchFields({ fields: ["displayName", "formattedAddress", "location"] });
        const name = place.displayName || item.title;
        const fullAddr = place.formattedAddress ? `${name}, ${place.formattedAddress}` : name;
        const coords = place.location ? { lat: place.location.lat(), lng: place.location.lng() } : null;
        if (onChange) onChange(fullAddr, coords);
        setIsOpen(false);
        return;
      }
    } catch (e) {
      console.warn("Failed fetching Google place details:", e);
    }
    if (onChange) onChange(`${item.title}, ${item.description}`.trim(), null);
    setIsOpen(false);
  };

  // Current selected item details
  const currentSelectedAirport = useMemo(() => {
    return AIRPORT_LIST.find((ap) => ap.name === value);
  }, [value]);

  return (
    <div ref={containerRef} className={`relative w-full min-w-0 ${className}`}>
      {/* Trigger Button Field - exactly 44px height, rounded-xl */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => {
            if (!prev) setSearchQuery("");
            return !prev;
          });
        }}
        className={`w-full min-w-0 pl-10 pr-3 h-[44px] py-2 rounded-xl text-xs font-medium text-slate-800 bg-white focus:outline-none transition-all cursor-pointer flex items-center justify-between text-left group overflow-hidden ${
          hasError
            ? "border-2 border-rose-500 bg-rose-50/25 ring-2 ring-rose-200/60"
            : "border border-slate-200 hover:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Plane className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none shrink-0 ${iconColor}`} />

        <div className="truncate min-w-0 flex-1 pr-2">
          {value ? (
            <span className="font-bold text-slate-900 text-xs truncate block" title={value}>
              {value}
            </span>
          ) : (
            <span className="text-slate-400 font-normal truncate block">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {currentSelectedAirport?.id && (
            <span className="text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded shrink-0">
              {currentSelectedAirport.id}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-amber-600" : ""}`} />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 duration-150 max-h-96 flex flex-col">
          {/* Search Header */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search airport code (BLR, MAA) or city..."
                className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of Airports */}
          <div className="overflow-y-auto divide-y divide-slate-50 py-1 max-h-64">
            <div className="px-3 py-1 bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{searchQuery ? "Matching Airports" : "Major Commercial Airports"}</span>
              {isSearchingGoogle && <Loader2 className="w-3 h-3 animate-spin text-sky-600" />}
            </div>

            {/* 1. Google Places results */}
            {googleResults.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectGoogleAirport(item)}
                className="w-full px-3.5 py-2 text-left flex items-start gap-2.5 hover:bg-sky-50/60 transition-colors cursor-pointer"
              >
                <Plane className="w-3.5 h-3.5 shrink-0 text-sky-600 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-slate-900 truncate">{item.title}</p>
                  {item.description && (
                    <p className="text-[10px] text-slate-500 truncate">{item.description}</p>
                  )}
                </div>
                <span className="text-[9px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-1 py-0.5 rounded shrink-0">
                  Google
                </span>
              </button>
            ))}

            {/* 2. Static airport list */}
            {filteredAirports.map((airport) => {
              const isSelected = airport.name === value;
              return (
                <button
                  key={airport.id}
                  type="button"
                  onClick={() => handleSelectAirport(airport)}
                  className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-amber-50/80 font-bold text-amber-950"
                      : "hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{airport.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{airport.city}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded shrink-0">
                    {airport.id}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
