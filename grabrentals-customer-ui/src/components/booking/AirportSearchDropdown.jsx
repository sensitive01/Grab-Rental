"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Plane, Search, Check, X, ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { AIRPORT_LIST } from "@/components/home/BookingWidget";
import { loadGoogleMaps } from "@/lib/googleMaps";

export default function AirportSearchDropdown({
  value = "",
  onChange,
  onOpenMap,
  placeholder = "Select or search airport...",
  iconColor = "text-brand-emerald",
  tripType = "pickup", // "pickup" | "drop"
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [googleResults, setGoogleResults] = useState([]);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const [googleMapsReady, setGoogleMapsReady] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

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
      setSearchQuery("");
      setHighlightedIndex(-1);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
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
            includedRegionCodes: ["in"]
          });

          if (response?.suggestions?.length > 0) {
            const formatted = response.suggestions.map((item, index) => {
              const pred = item.placePrediction;
              return {
                id: pred?.placeId || `gairport-${index}`,
                title: pred?.mainText?.toString() || pred?.text?.toString() || query,
                description: pred?.secondaryText?.toString() || pred?.text?.toString() || "",
                placePrediction: pred
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

  // Select airport from list
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

  // Custom airport name
  const handleSelectCustom = () => {
    const clean = searchQuery.trim();
    if (!clean) return;
    if (onChange) onChange(clean, null);
    setIsOpen(false);
  };

  // Current selected item details
  const currentSelectedAirport = useMemo(() => {
    return AIRPORT_LIST.find((ap) => ap.name === value);
  }, [value]);

  return (
    <div ref={containerRef} className={`relative w-full min-w-0 ${className}`}>
      {/* Trigger Button Field */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full min-w-0 pl-10 sm:pl-11 pr-3 py-3 sm:py-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm cursor-pointer flex items-center justify-between text-left group overflow-hidden"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Plane className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none transition-transform group-hover:scale-105 shrink-0 ${iconColor}`} />
        
        <div className="truncate min-w-0 flex-1 pr-2">
          {value ? (
            <span className="font-semibold text-slate-900 text-xs sm:text-sm truncate block" title={value}>
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
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded hidden sm:inline shrink-0">
              {currentSelectedAirport.id}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-amber-600" : ""}`} />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 max-h-96 flex flex-col">
          {/* Search Header */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search airport, city, or IATA code (BLR, MAA)..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-2xs"
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
            {/* Filtered static airports */}
            <div className="px-3 py-1 bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{searchQuery ? "Matching Airports" : "Major Commercial Airports"}</span>
              <span className="text-[9px] text-slate-400 lowercase">{filteredAirports.length} available</span>
            </div>

            {filteredAirports.map((airport) => {
              const isSelected = airport.name === value;
              return (
                <button
                  key={airport.id}
                  type="button"
                  onClick={() => handleSelectAirport(airport)}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-amber-50/80 font-bold text-amber-950"
                      : "hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                      isSelected
                        ? "bg-amber-500 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}>
                      {airport.id}
                    </span>
                    <div className="truncate">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {airport.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {airport.city}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {["BLR", "MAA", "CJB", "COK", "HYD", "BOM", "DEL"].includes(airport.id) && (
                      <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                        <Sparkles className="w-2.5 h-2.5" /> Popular
                      </span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                </button>
              );
            })}

            {/* Google Places Results */}
            {googleResults.length > 0 && (
              <>
                <div className="px-3 py-1.5 bg-slate-50/80 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Google Places / Terminals</span>
                  {isSearchingGoogle && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
                </div>
                {googleResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectGoogleAirport(item)}
                    className="w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 hover:bg-amber-50/50 transition-colors cursor-pointer text-slate-800"
                  >
                    <Plane className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                      Google
                    </span>
                  </button>
                ))}
              </>
            )}

            {/* Custom typed fallback */}
            {searchQuery.trim() && filteredAirports.length === 0 && googleResults.length === 0 && (
              <button
                type="button"
                onClick={handleSelectCustom}
                className="w-full px-3.5 py-3 text-left flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors cursor-pointer"
              >
                <Plane className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="text-xs font-semibold truncate">
                  Use custom location: <strong className="text-amber-950">&ldquo;{searchQuery.trim()}&rdquo;</strong>
                </div>
              </button>
            )}

            {filteredAirports.length === 0 && !searchQuery.trim() && (
              <div className="p-4 text-center text-xs text-slate-400">
                No airports available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
