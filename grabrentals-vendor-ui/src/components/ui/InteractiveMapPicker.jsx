"use client";

import { useState, useEffect, useRef } from "react";
import { 
  MapPin, 
  Navigation, 
  Search, 
  Check, 
  Crosshair, 
  Sparkles, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  Maximize2,
  Minimize2,
  X,
  Compass,
  Edit3,
  Copy,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InteractiveMapPicker({
  value = "",
  onChange,
  className = "",
  placeholder = "Search or pin exact parking location...",
  required = false
}) {
  const [coordinates, setCoordinates] = useState({ lat: 12.9815, lng: 80.1636 });
  const [address, setAddress] = useState(value || "Airport Hub - Terminal 2 Parking, Bay 4B");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showManualPin, setShowManualPin] = useState(false);
  const [manualLat, setManualLat] = useState("12.9815");
  const [manualLng, setManualLng] = useState("80.1636");
  const [isUpdatingManual, setIsUpdatingManual] = useState(false);
  const [manualSuccessMsg, setManualSuccessMsg] = useState("");
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [delta, setDelta] = useState(0.008);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (value && value !== address) {
      setAddress(value);
    }
  }, [value]);

  // Sync manual lat/lng inputs with coordinates
  useEffect(() => {
    if (coordinates?.lat !== undefined && coordinates?.lng !== undefined) {
      setManualLat(coordinates.lat.toFixed(6));
      setManualLng(coordinates.lng.toFixed(6));
    }
  }, [coordinates]);

  // Handle ESC key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  // Reverse geocode coordinates to human-readable address using OSM Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(",");
          const cleanName = parts.slice(0, 3).join(",").trim();
          const finalAddress = `${cleanName} (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
          setAddress(finalAddress);
          if (onChange) onChange(finalAddress, { lat, lng });
          return;
        }
      }
    } catch (e) {
      console.warn("Reverse geocode failed, using coordinates:", e);
    }
    const fallbackAddress = `Parking Hub at ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    setAddress(fallbackAddress);
    if (onChange) onChange(fallbackAddress, { lat, lng });
  };

  // Handle Manual Pin & Update Location
  const handleUpdateManualLocation = async (e) => {
    if (e) e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert("Please enter a valid Latitude between -90 and 90");
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      alert("Please enter a valid Longitude between -180 and 180");
      return;
    }

    setIsUpdatingManual(true);
    setCoordinates({ lat, lng });
    await reverseGeocode(lat, lng);
    setIsUpdatingManual(false);
    setManualSuccessMsg("Location pin updated successfully!");
    setTimeout(() => setManualSuccessMsg(""), 3500);
  };

  // Auto split "lat, lng" if pasted into either box
  const handleLatChange = (val) => {
    if (val.includes(",")) {
      const [pLat, pLng] = val.split(",");
      if (pLat && pLng) {
        setManualLat(pLat.trim());
        setManualLng(pLng.trim());
        return;
      }
    }
    setManualLat(val);
  };

  const handleLngChange = (val) => {
    if (val.includes(",")) {
      const [pLat, pLng] = val.split(",");
      if (pLat && pLng) {
        setManualLat(pLat.trim());
        setManualLng(pLng.trim());
        return;
      }
    }
    setManualLng(val);
  };

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Search places / addresses using OSM Nominatim forward search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`,
          { headers: { "Accept-Language": "en" } }
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data || []);
          setShowResults(true);
        }
      } catch (err) {
        console.warn("Search geocode failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const selectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setCoordinates({ lat, lng });
    const cleanName = item.display_name.split(",").slice(0, 3).join(",").trim();
    setAddress(cleanName);
    setSearchQuery("");
    setShowResults(false);
    if (onChange) onChange(cleanName, { lat, lng });
  };

  // GPS Locate Device
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoordinates({ lat, lng });
        await reverseGeocode(lat, lng);
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation permission denied or error:", err);
        setIsLocating(false);
        alert("Could not access your location. Please check browser GPS permissions.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Nudge / pan pin by small offset
  const movePin = (dLat, dLng) => {
    const newLat = coordinates.lat + dLat;
    const newLng = coordinates.lng + dLng;
    setCoordinates({ lat: newLat, lng: newLng });
    reverseGeocode(newLat, newLng);
  };

  // Compute bounding box for OpenStreetMap embed
  const bbox = `${coordinates.lng - delta}%2C${coordinates.lat - delta}%2C${coordinates.lng + delta}%2C${coordinates.lat + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header Info & Input */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-rose-500 fill-rose-500/20" />
          <span>Parking Location (Interactive Map Pin)</span>
          {required && <span className="text-rose-500">*</span>}
        </label>
        
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" /> GPS Pin Locked
          </span>

          {/* Manual Pin Toggle Button */}
          <button
            type="button"
            onClick={() => setShowManualPin(!showManualPin)}
            className={cn(
              "text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-2xs",
              showManualPin
                ? "bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-400/20"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            )}
            title="Manually enter latitude and longitude coordinates"
          >
            <Edit3 className="w-3.5 h-3.5 text-rose-500" />
            <span>Manual Pin</span>
          </button>

          {/* Full Screen Button */}
          <button
            type="button"
            onClick={() => setIsFullScreen(true)}
            className="text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-300 transition-all cursor-pointer shadow-2xs"
            title="Open Large Full Screen Map for precise pin marking"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-800" />
            <span>Full Screen Map</span>
          </button>

          {/* Collapse / Expand Map */}
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {showMap ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showMap ? "Hide Map" : "Show Map"}
          </button>
        </div>
      </div>

      {/* Manual Pin Coordinate Input Drawer */}
      {showManualPin && (
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Manual GPS Coordinates & Pin Drop</span>
            </div>
            {manualSuccessMsg && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {manualSuccessMsg}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-end">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Latitude (°N / °S)
              </label>
              <input
                type="text"
                value={manualLat}
                onChange={(e) => handleLatChange(e.target.value)}
                placeholder="e.g. 12.910600"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Longitude (°E / °W)
              </label>
              <input
                type="text"
                value={manualLng}
                onChange={(e) => handleLngChange(e.target.value)}
                placeholder="e.g. 77.574000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-2xs"
              />
            </div>

            <button
              type="button"
              onClick={handleUpdateManualLocation}
              disabled={isUpdatingManual}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isUpdatingManual ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5 fill-slate-950" />}
              <span>{isUpdatingManual ? "Updating..." : "Update Location Pin"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCoords}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copiedCoords ? "Copied!" : "Copy Coords"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Location Input with Search & Locate Buttons */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none">
          <MapPin className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (onChange) onChange(e.target.value, coordinates);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-28 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-2xs"
          required
        />
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          title="Detect Current GPS Location"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs"
        >
          {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3 fill-amber-900" />}
          <span>{isLocating ? "Locating..." : "Locate Me"}</span>
        </button>
      </div>

      {/* Embedded Interactive Map Canvas */}
      {showMap && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-sm relative">
          
          {/* Top Search Overlay inside map */}
          <div className="absolute top-3 left-3 right-3 z-10 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search landmark, airport, metro station..."
                className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-xs font-medium text-slate-900 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {isSearching && (
                <Loader2 className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-amber-600" />
              )}

              {/* Autocomplete Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectSearchResult(item)}
                      className="w-full text-left px-3 py-2 text-[11px] text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{item.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLocateMe}
              title="Pin Current GPS"
              className="p-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-md transition-colors cursor-pointer shrink-0"
            >
              <Crosshair className={`w-4 h-4 ${isLocating ? "animate-spin text-amber-600" : "text-slate-600"}`} />
            </button>
          </div>

          {/* Interactive OSM Map Frame */}
          <div className="relative h-60 w-full bg-slate-100">
            <iframe
              title="Interactive Parking Map"
              src={embedUrl}
              className="w-full h-full border-0 pointer-events-auto"
              loading="lazy"
            />

            {/* Custom Glowing Center Pin Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="relative -translate-y-4 flex flex-col items-center animate-bounce">
                <div className="px-2.5 py-1 rounded-full bg-slate-950/90 text-white text-[10px] font-mono font-bold shadow-lg border border-amber-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{coordinates.lat.toFixed(4)}°, {coordinates.lng.toFixed(4)}°</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-2xl border-2 border-white mt-0.5">
                  <MapPin className="w-4 h-4 fill-white" />
                </div>
                <div className="w-2 h-2 bg-slate-900/60 rounded-full blur-[1px] -mt-0.5" />
              </div>
            </div>

            {/* Micro Navigation Controls (Nudge Map) */}
            <div className="absolute bottom-3 right-3 z-10 flex flex-col items-center bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md p-1 gap-1">
              <button
                type="button"
                onClick={() => movePin(0.001, 0)}
                title="Pan North"
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 text-xs font-black text-slate-700 cursor-pointer"
              >
                ▲
              </button>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => movePin(0, -0.001)}
                  title="Pan West"
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 text-xs font-black text-slate-700 cursor-pointer"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={() => movePin(0, 0.001)}
                  title="Pan East"
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 text-xs font-black text-slate-700 cursor-pointer"
                >
                  ▶
                </button>
              </div>
              <button
                type="button"
                onClick={() => movePin(-0.001, 0)}
                title="Pan South"
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 text-xs font-black text-slate-700 cursor-pointer"
              >
                ▼
              </button>
            </div>

            {/* Bottom Left GPS Coordinates Strip */}
            <div className="absolute bottom-3 left-3 z-10 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-white text-[10px] flex items-center gap-2 shadow-md">
              <span className="font-mono font-bold text-amber-400">
                LAT: {coordinates.lat.toFixed(4)}° | LNG: {coordinates.lng.toFixed(4)}°
              </span>
              <button
                type="button"
                onClick={() => setShowManualPin(true)}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 underline text-[9px] cursor-pointer"
                title="Open Manual Pin Editor"
              >
                <Edit3 className="w-2.5 h-2.5" /> Edit Pin
              </button>
              <a
                href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-300 hover:text-white flex items-center gap-0.5 underline text-[9px]"
              >
                Google Maps <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* FULL SCREEN IMMERSIVE MAP MODAL */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex flex-col p-3 sm:p-6 animate-in fade-in duration-200">
          
          {/* Fullscreen Header & Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 mb-3 sm:mb-4 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  Full Screen Pin Drop
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {coordinates.lat.toFixed(5)}° N, {coordinates.lng.toFixed(5)}° E
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Mark Parking Hub Location</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-xl truncate">
                {address}
              </p>
            </div>

            {/* Center Search Bar in Full Screen */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search street, airport, depot, area across India..."
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-slate-850"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-amber-400" />
              )}

              {/* Fullscreen Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-40 max-h-60 overflow-y-auto divide-y divide-slate-800">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectSearchResult(item)}
                      className="w-full text-left px-4 py-3 text-xs text-slate-200 hover:bg-amber-500/20 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="truncate">{item.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons: Locate Me, Manual Pin, Confirm & Pin, Close */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Crosshair className={`w-4 h-4 ${isLocating ? "animate-spin text-amber-400" : "text-amber-400"}`} />
                <span className="hidden sm:inline">GPS Me</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsFullScreen(false);
                  setShowManualPin(true);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Open Manual Pin Input"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Manual Pin</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirm & Lock Pin</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                title="Close Full Screen (Esc)"
                className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Fullscreen Map Canvas */}
          <div className="flex-1 w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 relative shadow-2xl">
            <iframe
              title="Full Screen Interactive Parking Map"
              src={embedUrl}
              className="w-full h-full border-0 pointer-events-auto"
              loading="lazy"
            />

            {/* Glowing Big Center Pin Marker */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="relative -translate-y-6 flex flex-col items-center animate-bounce">
                <div className="px-3.5 py-1.5 rounded-full bg-slate-950/95 text-white text-xs font-mono font-bold shadow-2xl border-2 border-amber-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{coordinates.lat.toFixed(5)}° N, {coordinates.lng.toFixed(5)}° E</span>
                </div>
                <div className="w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-2xl border-3 border-white mt-1">
                  <MapPin className="w-6 h-6 fill-white" />
                </div>
                <div className="w-4 h-3 bg-slate-950/70 rounded-full blur-[2px] -mt-1" />
              </div>
            </div>

            {/* Micro Navigation D-Pad Controls */}
            <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl p-2 gap-1.5 text-white">
              <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider">Pan Pin</span>
              <button
                type="button"
                onClick={() => movePin(0.001, 0)}
                title="Pan North"
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black cursor-pointer transition-colors"
              >
                ▲
              </button>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => movePin(0, -0.001)}
                  title="Pan West"
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black cursor-pointer transition-colors"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={() => movePin(0, 0.001)}
                  title="Pan East"
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black cursor-pointer transition-colors"
                >
                  ▶
                </button>
              </div>
              <button
                type="button"
                onClick={() => movePin(-0.001, 0)}
                title="Pan South"
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black cursor-pointer transition-colors"
              >
                ▼
              </button>
            </div>

            {/* Bottom Floating Bar in Full Screen */}
            <div className="absolute bottom-6 left-6 z-20 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700 text-white text-xs flex items-center gap-3 shadow-2xl">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                <span className="font-mono font-bold text-amber-400">
                  LAT: {coordinates.lat.toFixed(5)}° | LNG: {coordinates.lng.toFixed(5)}°
                </span>
              </div>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300 font-medium truncate max-w-sm">
                {address}
              </span>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={() => {
                  setIsFullScreen(false);
                  setShowManualPin(true);
                }}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold underline text-[11px] cursor-pointer"
              >
                <Edit3 className="w-3 h-3" /> Edit Coords
              </button>
              <span className="text-slate-600">|</span>
              <a
                href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold underline text-[11px]"
              >
                Open in Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
