"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MapPin, Check, Plus, X, Sparkles, Loader2 } from "lucide-react";
import { searchCities, saveCustomCity, formatCityLabel } from "@/lib/cities";
import { loadGoogleMaps } from "@/lib/googleMaps";

export default function CityAutocompleteInput({
  value = "",
  onChange,
  placeholder = "Enter city name...",
  icon: Icon = MapPin,
  iconColor = "text-brand-emerald",
  inputClassName = "",
  containerClassName = "",
  rightElement = null,
  disabled = false,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [googleResults, setGoogleResults] = useState([]);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const [googleMapsReady, setGoogleMapsReady] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const sessionTokenRef = useRef(null);

  // Load Google Maps Places library once on mount
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setGoogleMapsReady(true))
      .catch(() => setGoogleMapsReady(false));
  }, []);

  // Sync internal input value with incoming prop value
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(value || "");
  }, [value]);

  // Offline / Static suggestions
  const staticSuggestions = useMemo(() => {
    return searchCities(inputValue);
  }, [inputValue]);

  // Live Google Places (New) Autocomplete search debounced
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    const query = inputValue.trim();
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
            input: query,
            sessionToken: sessionTokenRef.current,
            includedRegionCodes: ["in"]
          });

          if (response?.suggestions?.length > 0) {
            const formatted = response.suggestions.map((item, index) => {
              const pred = item.placePrediction;
              return {
                id: pred?.placeId || `gplace-${index}`,
                title: pred?.mainText?.toString() || pred?.text?.toString() || query,
                description: pred?.secondaryText?.toString() || pred?.text?.toString() || "",
                isGoogleNew: true,
                placePrediction: pred
              };
            });
            setGoogleResults(formatted);
          } else {
            setGoogleResults([]);
          }
        }
      } catch (err) {
        console.warn("Google Places Autocomplete error in CityAutocompleteInput:", err);
        setGoogleResults([]);
      } finally {
        setIsSearchingGoogle(false);
      }
    }, 250);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [inputValue, googleMapsReady]);

  // Combined suggestions list for keyboard navigation
  const allSuggestions = useMemo(() => {
    const list = [];
    googleResults.forEach((g) => list.push({ type: "google", data: g }));
    staticSuggestions.forEach((s) => list.push({ type: "static", data: s }));
    return list;
  }, [googleResults, staticSuggestions]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (onChange) onChange(val, null);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectGooglePlace = async (result) => {
    sessionTokenRef.current = null;
    let lat = null;
    let lng = null;
    let specificLabel = result.title;

    if (result.placePrediction) {
      try {
        const place = result.placePrediction.toPlace();
        await place.fetchFields({
          fields: ["displayName", "formattedAddress", "location", "addressComponents"]
        });

        if (place.location) {
          lat = typeof place.location.lat === "function" ? place.location.lat() : place.location.lat;
          lng = typeof place.location.lng === "function" ? place.location.lng() : place.location.lng;
        }

        const placeName = (place.displayName || result.title || "").trim();
        let locality = "";
        let adminArea = "";
        if (place.addressComponents) {
          for (const comp of place.addressComponents) {
            if (comp.types?.includes("locality")) locality = comp.longText || comp.name;
            if (comp.types?.includes("administrative_area_level_1")) adminArea = comp.longText || comp.name;
          }
        }

        // Build specific label keeping the exact place name (e.g. "Theni Old Bus Stand, Theni, Tamil Nadu")
        specificLabel = placeName;
        const extraParts = [];
        if (locality && !placeName.toLowerCase().includes(locality.toLowerCase())) {
          extraParts.push(locality);
        }
        if (adminArea && !placeName.toLowerCase().includes(adminArea.toLowerCase())) {
          extraParts.push(adminArea);
        }
        if (extraParts.length > 0) {
          specificLabel = `${placeName}, ${extraParts.join(", ")}`;
        }
      } catch (e) {
        console.warn("Failed fetching place details:", e);
        specificLabel = result.description ? `${result.title}, ${result.description.split(",")[0].trim()}` : result.title;
      }
    }

    saveCustomCity(specificLabel);
    setInputValue(specificLabel);
    if (onChange) {
      onChange(specificLabel, lat && lng ? { lat, lng } : null);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSelectStaticCity = (city) => {
    const formatted = formatCityLabel(city);
    setInputValue(formatted);
    const coords = (city.lat && city.lng) ? { lat: city.lat, lng: city.lng } : null;
    if (onChange) onChange(formatted, coords);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleAddCustom = () => {
    const clean = inputValue.trim();
    if (!clean) return;
    saveCustomCity(clean);
    const formatted = clean.includes(",") ? clean : `${clean}, India`;
    setInputValue(formatted);
    if (onChange) onChange(formatted, null);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    if (onChange) onChange("", null);
    inputRef.current?.focus();
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev < allSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev > 0 ? prev - 1 : allSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && allSuggestions[highlightedIndex]) {
        const item = allSuggestions[highlightedIndex];
        if (item.type === "google") {
          handleSelectGooglePlace(item.data);
        } else {
          handleSelectStaticCity(item.data);
        }
      } else if (inputValue.trim()) {
        handleAddCustom();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Check if current typed string is an exact match in suggestions
  const isExactMatch = staticSuggestions.some(
    (s) => s.name.toLowerCase() === inputValue.trim().toLowerCase() ||
           formatCityLabel(s).toLowerCase() === inputValue.trim().toLowerCase()
  );

  return (
    <div ref={containerRef} className={`relative w-full ${containerClassName}`}>
      <div className="relative flex items-center">
        {Icon && (
          <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${iconColor}`} />
        )}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={`w-full pl-11 ${rightElement ? "pr-14" : "pr-8"} py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm ${inputClassName}`}
        />

        {/* Clear content button */}
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute ${rightElement ? "right-10" : "right-3"} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors`}
            title="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Optional Right Element (e.g. + stop button) */}
        {rightElement && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 duration-150 max-h-80 flex flex-col">
          
          {/* Header Title */}
          <div className="px-3.5 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span>{googleResults.length > 0 ? "Google Places & Landmarks" : inputValue ? "Matching Locations" : "Popular Outstation Hubs"}</span>
              {isSearchingGoogle && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
            </span>
            <span className="text-[10px] lowercase font-normal text-slate-400">Click to select</span>
          </div>

          {/* List of Suggestions */}
          <div className="overflow-y-auto divide-y divide-slate-50 py-1">
            {/* 1. Google Places results */}
            {googleResults.map((item, gIdx) => {
              const isHighlighted = highlightedIndex === gIdx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectGooglePlace(item)}
                  onMouseEnter={() => setHighlightedIndex(gIdx)}
                  className={`w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    isHighlighted ? "bg-amber-50/80 text-amber-950" : "hover:bg-amber-50/50 text-slate-800"
                  }`}
                >
                  <MapPin className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 truncate">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-slate-500 truncate">{item.description}</p>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                    Google
                  </span>
                </button>
              );
            })}

            {/* Section Divider if both Google and Static are present */}
            {googleResults.length > 0 && staticSuggestions.length > 0 && (
              <div className="px-3.5 py-1.5 bg-slate-50/60 border-t border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                City Centers & Hubs
              </div>
            )}

            {/* 2. Static / Offline City Suggestions */}
            {staticSuggestions.map((city, idx) => {
              const itemIndex = googleResults.length + idx;
              const isSelected = formatCityLabel(city).toLowerCase() === inputValue.trim().toLowerCase();
              const isHighlighted = highlightedIndex === itemIndex;

              return (
                <button
                  key={`${city.name}-${city.state}-${idx}`}
                  type="button"
                  onClick={() => handleSelectStaticCity(city)}
                  onMouseEnter={() => setHighlightedIndex(itemIndex)}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isHighlighted ? "bg-amber-50/70 text-amber-900" : isSelected ? "bg-slate-50 font-bold" : "hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className={`w-4 h-4 shrink-0 ${city.popular ? "text-amber-500" : "text-slate-400"}`} />
                    <div className="truncate">
                      <span className="font-bold text-sm text-slate-900">
                        {city.name}
                      </span>
                      {city.aliases && city.aliases.length > 0 && (
                        <span className="text-xs text-slate-400 ml-1.5 font-normal">
                          ({city.aliases[0]})
                        </span>
                      )}
                      <span className="text-xs text-slate-500 ml-1.5 font-normal">
                        • {city.state}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {city.popular && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                        <Sparkles className="w-2.5 h-2.5" /> Hub
                      </span>
                    )}
                    {city.custom && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                        Custom
                      </span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                </button>
              );
            })}

            {/* Custom Add Option if user typed something new */}
            {inputValue.trim() && !isExactMatch && googleResults.length === 0 && (
              <button
                type="button"
                onClick={handleAddCustom}
                className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 bg-amber-50/60 hover:bg-amber-100/80 text-amber-700 transition-colors border-t border-amber-100 cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0 text-amber-600" />
                <div className="text-xs font-semibold truncate">
                  Use custom location: <strong className="text-amber-950">&ldquo;{inputValue.trim()}&rdquo;</strong>
                </div>
              </button>
            )}

            {allSuggestions.length === 0 && !inputValue.trim() && (
              <div className="p-4 text-center text-xs text-slate-400">
                Type any landmark, station, or city name to search
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
