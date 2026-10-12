"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  MapPin, 
  Search, 
  Crosshair, 
  X, 
  Check, 
  Loader2, 
  Navigation, 
  Sparkles, 
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Plus
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { saveCustomCity, findCityCoordinates } from "@/lib/cities";

// Quick shortcut hubs across South India & major metros
const QUICK_HUBS = [
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Kempegowda Airport (BLR)", state: "Bangalore", lat: 13.1986, lng: 77.7066 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Mysore", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
  { name: "Ooty", state: "Tamil Nadu", lat: 11.4102, lng: 76.6950 },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  { name: "Salem", state: "Tamil Nadu", lat: 11.6643, lng: 78.1460 }
];

export default function LocationPickerModal({
  isOpen,
  onClose,
  onSelect,
  initialValue = "",
  title,
  activeTarget = "pickup", // "pickup" | "drop" | "stop-0" | "stop-1"...
  pickupValue = "",
  dropValue = "",
  stops = [],
  onSelectPickup,
  onSelectDrop,
  onSelectStops,
  allowTargetSwitch = true,
  allowStops = true,
  maxStops = 3
}) {
  const { t } = useLanguage();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const hasGoogleMapsKey = Boolean(apiKey && apiKey.trim().length > 5);

  // Active target & multi-stop route states
  const [currentTarget, setCurrentTarget] = useState(activeTarget || "pickup");
  const [pickupCityState, setPickupCityState] = useState(pickupValue || (activeTarget === "pickup" ? initialValue : "") || "Bangalore, Karnataka");
  const [dropCityState, setDropCityState] = useState(dropValue || (activeTarget === "drop" ? initialValue : "") || "Coimbatore, Tamil Nadu");
  const [stopsState, setStopsState] = useState(Array.isArray(stops) ? [...stops] : []);

  const [pickupCoords, setPickupCoords] = useState({ lat: 12.9716, lng: 77.5946 });
  const [dropCoords, setDropCoords] = useState({ lat: 11.0168, lng: 76.9558 });
  const [stopsCoords, setStopsCoords] = useState({});

  // Map & location states
  const [coordinates, setCoordinates] = useState({ lat: 12.9716, lng: 77.5946 });
  const [selectedAddress, setSelectedAddress] = useState(initialValue || "Bangalore, Karnataka");
  const [cityLabel, setCityLabel] = useState(initialValue || "Bangalore, Karnataka");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Google Maps specific states
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(false);

  // Leaflet specific states
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const googleMapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletInstanceRef = useRef(null);
  const leafletMarkerRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const currentTargetRef = useRef(currentTarget);
  const sessionTokenRef = useRef(null);

  useEffect(() => {
    currentTargetRef.current = currentTarget;
  }, [currentTarget]);

  // Sync state when modal opens or target/values change
  useEffect(() => {
    if (!isOpen) return;

    const target = activeTarget || "pickup";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentTarget(target);

    const activePick = pickupValue || (target === "pickup" && initialValue ? initialValue : "") || pickupCityState;
    const activeDrop = dropValue || (target === "drop" && initialValue ? initialValue : "") || dropCityState;

    if (pickupValue) {
      setPickupCityState(pickupValue);
      const pc = findCityCoordinates(pickupValue);
      if (pc) setPickupCoords({ lat: pc.lat, lng: pc.lng });
    }
    if (dropValue) {
      setDropCityState(dropValue);
      const dc = findCityCoordinates(dropValue);
      if (dc) setDropCoords({ lat: dc.lat, lng: dc.lng });
    }

    if (Array.isArray(stops)) {
      setStopsState([...stops]);
      const initialStopsCoords = {};
      stops.forEach((s, idx) => {
        if (s) {
          const sc = findCityCoordinates(s);
          if (sc) initialStopsCoords[idx] = { lat: sc.lat, lng: sc.lng };
        }
      });
      setStopsCoords(initialStopsCoords);
    }

    let currentCityVal = activePick;
    let newCoords = pickupCoords;

    if (target === "drop") {
      currentCityVal = activeDrop;
      const matchedCoords = findCityCoordinates(activeDrop);
      newCoords = matchedCoords ? { lat: matchedCoords.lat, lng: matchedCoords.lng } : dropCoords;
    } else if (typeof target === "string" && target.startsWith("stop-")) {
      const sIdx = parseInt(target.replace("stop-", ""), 10);
      currentCityVal = stops[sIdx] || "";
      const matchedCoords = findCityCoordinates(currentCityVal);
      newCoords = matchedCoords ? { lat: matchedCoords.lat, lng: matchedCoords.lng } : pickupCoords;
    } else {
      currentCityVal = activePick;
      const matchedCoords = findCityCoordinates(activePick);
      newCoords = matchedCoords ? { lat: matchedCoords.lat, lng: matchedCoords.lng } : pickupCoords;
    }

    setSelectedAddress(currentCityVal || "");
    setCityLabel(currentCityVal || "");
    setCoordinates(newCoords);
  }, [isOpen, activeTarget, pickupValue, dropValue, stops, initialValue]);

  // Load Google Maps Script if API key is provided
  useEffect(() => {
    if (!isOpen || !hasGoogleMapsKey) return;

    if (window.google && window.google.maps) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGoogleMapsLoaded(true);
      return;
    }

    const scriptId = "google-maps-script";
    if (document.getElementById(scriptId)) {
      setGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleMapsLoaded(true);
    script.onerror = () => setGoogleMapsError(true);
    document.head.appendChild(script);
  }, [isOpen, hasGoogleMapsKey, apiKey]);

  // Load Leaflet Script and Styles if Google Maps is not active
  useEffect(() => {
    if (!isOpen || (hasGoogleMapsKey && !googleMapsError)) return;

    if (typeof window !== "undefined" && window.L) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLeafletLoaded(true);
      return;
    }

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.head.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, [isOpen, hasGoogleMapsKey, googleMapsError]);

  // Helper to re-center both Google Maps and Leaflet map instances
  const panToLocation = useCallback((lat, lng, zoom = 15) => {
    setCoordinates({ lat, lng });

    if (hasGoogleMapsKey && !googleMapsError && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat, lng });
      if (zoom) mapInstanceRef.current.setZoom(zoom);
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setPosition({ lat, lng });
      }
    } else if (leafletInstanceRef.current) {
      leafletInstanceRef.current.setView([lat, lng], zoom || 15);
      if (leafletMarkerRef.current) {
        leafletMarkerRef.current.setLatLng([lat, lng]);
      }
    }
  }, [hasGoogleMapsKey, googleMapsError]);

  // Central handler to apply chosen address and coordinates to whichever target is active
  const applyLocationToActiveTarget = useCallback((label, coords) => {
    const target = currentTargetRef.current;
    setSelectedAddress(label);
    setCityLabel(label);

    if (target === "drop") {
      setDropCityState(label);
      if (coords) setDropCoords(coords);
      if (onSelectDrop) onSelectDrop(label, coords);
    } else if (typeof target === "string" && target.startsWith("stop-")) {
      const sIdx = parseInt(target.replace("stop-", ""), 10);
      if (sIdx >= 0) {
        setStopsState((prev) => {
          const next = [...prev];
          next[sIdx] = label;
          if (onSelectStops) onSelectStops(next);
          return next;
        });
        if (coords) {
          setStopsCoords((prev) => ({ ...prev, [sIdx]: coords }));
        }
      }
    } else {
      setPickupCityState(label);
      if (coords) setPickupCoords(coords);
      if (onSelectPickup) onSelectPickup(label, coords);
    }
  }, [onSelectDrop, onSelectPickup, onSelectStops]);

  // Reverse Geocode using Google Maps Geocoder
  const reverseGeocodeGoogle = useCallback((lat, lng) => {
    if (!window.google?.maps?.Geocoder) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const fullAddr = results[0].formatted_address;
        let locality = "";
        let adminArea = "";
        for (const comp of results[0].address_components) {
          if (comp.types.includes("locality")) locality = comp.long_name;
          if (comp.types.includes("administrative_area_level_1")) adminArea = comp.long_name;
        }

        const cleanCity = locality ? `${locality}, ${adminArea || "India"}` : fullAddr.split(",").slice(0, 2).join(",").trim();
        applyLocationToActiveTarget(cleanCity || fullAddr, { lat, lng });
      }
    });
  }, [applyLocationToActiveTarget]);

  // Reverse Geocode using OpenStreetMap Nominatim
  const reverseGeocodeOsm = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(",");
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.suburb || parts[0].trim();
          const state = addr.state || "India";
          const formatted = `${city}, ${state}`;
          applyLocationToActiveTarget(formatted, { lat, lng });
          return;
        }
      }
    } catch (err) {
      console.warn("OSM reverse geocode error:", err);
    }

    const fallback = `Location at ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    applyLocationToActiveTarget(fallback, { lat, lng });
  }, [applyLocationToActiveTarget]);

  // Initialize or update Google Map instance
  useEffect(() => {
    if (!isOpen || !googleMapsLoaded || !hasGoogleMapsKey || !googleMapRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        const map = new window.google.maps.Map(googleMapRef.current, {
          center: coordinates,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: "poi.business",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        const marker = new window.google.maps.Marker({
          position: coordinates,
          map: map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
          title: "Drag to pin exact pickup spot"
        });

        // Click on map to place pin
        map.addListener("click", (e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          marker.setPosition({ lat, lng });
          setCoordinates({ lat, lng });
          reverseGeocodeGoogle(lat, lng);
        });

        // Drag marker
        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          const lat = pos.lat();
          const lng = pos.lng();
          setCoordinates({ lat, lng });
          reverseGeocodeGoogle(lat, lng);
        });

        // Marker instance
        mapInstanceRef.current = map;
        markerInstanceRef.current = marker;
      } else {
        mapInstanceRef.current.setCenter(coordinates);
        if (markerInstanceRef.current) {
          markerInstanceRef.current.setPosition(coordinates);
        }
      }
    } catch (err) {
      console.warn("Google Maps initialization warning:", err);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGoogleMapsError(true);
    }
  }, [isOpen, googleMapsLoaded, hasGoogleMapsKey, coordinates, reverseGeocodeGoogle]);

  // Initialize or update Leaflet Map (Free interactive OpenStreetMap with draggable pin)
  useEffect(() => {
    if (!isOpen) return;
    if (hasGoogleMapsKey && !googleMapsError) return;
    if (!leafletLoaded || !leafletMapRef.current || typeof window === "undefined" || !window.L) return;

    const L = window.L;

    const createCustomIcon = () => {
      return L.divIcon({
        className: "custom-grab-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: grab;">
            <div style="background: #0f172a; color: #f8fafc; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 999px; border: 1.5px solid #f59e0b; box-shadow: 0 4px 10px rgba(0,0,0,0.35); white-space: nowrap; margin-bottom: 2px; pointer-events: none;">
              📍 Pin Location
            </div>
            <div style="width: 32px; height: 32px; background: #e11d48; border: 2.5px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 14px rgba(225,29,72,0.45);">
              <div style="width: 10px; height: 10px; background: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
            </div>
            <div style="width: 8px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(1px); margin-top: 1px;"></div>
          </div>
        `,
        iconSize: [32, 48],
        iconAnchor: [16, 48]
      });
    };

    if (!leafletInstanceRef.current) {
      try {
        const map = L.map(leafletMapRef.current, {
          center: [coordinates.lat, coordinates.lng],
          zoom: 14,
          zoomControl: true,
          attributionControl: true
        });

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        const marker = L.marker([coordinates.lat, coordinates.lng], {
          draggable: true,
          icon: createCustomIcon(),
          autoPan: true
        }).addTo(map);

        // Click anywhere on map to move the pin and reverse geocode
        map.on("click", (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setCoordinates({ lat, lng });
          reverseGeocodeOsm(lat, lng);
        });

        // Drag marker to exact spot
        marker.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          setCoordinates({ lat: pos.lat, lng: pos.lng });
          reverseGeocodeOsm(pos.lat, pos.lng);
        });

        leafletInstanceRef.current = map;
        leafletMarkerRef.current = marker;

        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 200);
      } catch (err) {
        console.warn("Leaflet initialization error:", err);
      }
    } else {
      leafletInstanceRef.current.setView([coordinates.lat, coordinates.lng]);
      if (leafletMarkerRef.current) {
        leafletMarkerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
      }
      setTimeout(() => {
        leafletInstanceRef.current?.invalidateSize();
      }, 100);
    }

    return () => {
      if (leafletInstanceRef.current) {
        leafletInstanceRef.current.remove();
        leafletInstanceRef.current = null;
        leafletMarkerRef.current = null;
      }
    };
  }, [isOpen, leafletLoaded, hasGoogleMapsKey, googleMapsError, reverseGeocodeOsm]);

  // Handle GPS Locate Me
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        panToLocation(lat, lng, 16);

        if (hasGoogleMapsKey && !googleMapsError && mapInstanceRef.current) {
          reverseGeocodeGoogle(lat, lng);
        } else {
          reverseGeocodeOsm(lat, lng);
        }
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err);
        alert("Unable to retrieve your location. Please check your browser location permissions.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Select Quick Hub
  const handleSelectHub = (hub) => {
    const formatted = `${hub.name}, ${hub.state}`;
    applyLocationToActiveTarget(formatted, { lat: hub.lat, lng: hub.lng });
    panToLocation(hub.lat, hub.lng, 14);
  };

  // Switch between From (Pickup), Stops, and To (Drop) targets
  const handleSwitchTarget = (target) => {
    if (target === currentTarget) return;
    setCurrentTarget(target);
    setSearchQuery("");
    setShowSearchResults(false);

    let targetVal = "";
    let targetCoords = pickupCoords;

    if (target === "drop") {
      targetVal = dropCityState;
      targetCoords = dropCoords;
    } else if (typeof target === "string" && target.startsWith("stop-")) {
      const sIdx = parseInt(target.replace("stop-", ""), 10);
      targetVal = stopsState[sIdx] || "";
      targetCoords = stopsCoords[sIdx] || findCityCoordinates(targetVal) || pickupCoords;
    } else {
      targetVal = pickupCityState;
      targetCoords = pickupCoords;
    }

    setSelectedAddress(targetVal);
    setCityLabel(targetVal);
    setCoordinates(targetCoords);
    if (targetCoords?.lat && targetCoords?.lng) {
      panToLocation(targetCoords.lat, targetCoords.lng, 14);
    }
  };

  // Add an intermediate stop dynamically
  const handleAddStop = () => {
    if (stopsState.length >= maxStops) return;
    const newIdx = stopsState.length;
    const updated = [...stopsState, ""];
    setStopsState(updated);
    if (onSelectStops) onSelectStops(updated);

    const targetKey = `stop-${newIdx}`;
    setCurrentTarget(targetKey);
    setSelectedAddress("");
    setCityLabel("");
    setSearchQuery("");
    setShowSearchResults(false);
    setTimeout(() => searchInputRef.current?.focus(), 150);
  };

  // Remove an intermediate stop
  const handleRemoveStop = (index, e) => {
    if (e) e.stopPropagation();
    const updated = stopsState.filter((_, i) => i !== index);
    setStopsState(updated);
    if (onSelectStops) onSelectStops(updated);

    setStopsCoords((prev) => {
      const next = {};
      let cur = 0;
      stopsState.forEach((_, oldIdx) => {
        if (oldIdx !== index) {
          if (prev[oldIdx]) next[cur] = prev[oldIdx];
          cur++;
        }
      });
      return next;
    });

    if (currentTarget === `stop-${index}`) {
      handleSwitchTarget("pickup");
    } else if (typeof currentTarget === "string" && currentTarget.startsWith("stop-")) {
      const curIdx = parseInt(currentTarget.replace("stop-", ""), 10);
      if (curIdx > index) {
        setCurrentTarget(`stop-${curIdx - 1}`);
      }
    }
  };

  // Unified Search supporting Google Places API (New) with OSM fallback
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      // 1. Try Google Places API (New) if Google Maps is loaded
      if (hasGoogleMapsKey && !googleMapsError && window.google?.maps?.importLibrary) {
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
              const formattedResults = response.suggestions.map((item, index) => {
                const pred = item.placePrediction;
                return {
                  id: pred?.placeId || `gplace-${index}`,
                  title: pred?.mainText?.toString() || pred?.text?.toString() || query,
                  description: pred?.secondaryText?.toString() || pred?.text?.toString() || "",
                  isGoogleNew: true,
                  placePrediction: pred
                };
              });
              setSearchResults(formattedResults);
              setShowSearchResults(true);
              setIsSearching(false);
              return;
            }
          }
        } catch (err) {
          console.warn("Places API (New) autocomplete error, falling back to OSM:", err);
        }
      }

      // 2. OpenStreetMap Nominatim Fallback
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&countrycodes=in`,
          { headers: { "Accept-Language": "en" } }
        );
        if (res.ok) {
          const data = await res.json();
          const formattedResults = (data || []).map((item) => {
            const parts = item.display_name.split(",");
            return {
              id: item.place_id || Math.random().toString(),
              title: parts[0]?.trim(),
              description: parts.slice(1, 4).join(",").trim() || item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              isGoogleNew: false
            };
          });
          setSearchResults(formattedResults);
          setShowSearchResults(true);
        }
      } catch (e) {
        console.warn("OSM Search query failed:", e);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSelectSearchResult = async (result) => {
    setShowSearchResults(false);
    setSearchQuery(result.title);
    sessionTokenRef.current = null; // Reset billing session token

    let lat = null;
    let lng = null;
    let fullAddr = "";
    let cleanCity = "";

    if (result.isGoogleNew && result.placePrediction) {
      try {
        const place = result.placePrediction.toPlace();
        await place.fetchFields({
          fields: ["displayName", "formattedAddress", "location", "addressComponents"]
        });

        if (place.location) {
          lat = typeof place.location.lat === "function" ? place.location.lat() : place.location.lat;
          lng = typeof place.location.lng === "function" ? place.location.lng() : place.location.lng;
        }

        fullAddr = place.formattedAddress || place.displayName || result.title;

        let locality = "";
        let adminArea = "";
        if (place.addressComponents) {
          for (const comp of place.addressComponents) {
            if (comp.types?.includes("locality")) locality = comp.longText || comp.name;
            if (comp.types?.includes("administrative_area_level_1")) adminArea = comp.longText || comp.name;
          }
        }
        cleanCity = locality ? `${locality}, ${adminArea || "India"}` : fullAddr.split(",").slice(0, 2).join(",").trim();
      } catch (err) {
        console.warn("Failed to fetch Google Place details:", err);
      }
    } else {
      lat = result.lat;
      lng = result.lng;
      fullAddr = result.description ? `${result.title}, ${result.description}` : result.title;
      cleanCity = result.title;
    }

    if (lat && lng) {
      const finalLabel = cleanCity || result.title;
      applyLocationToActiveTarget(finalLabel, { lat, lng });
      panToLocation(lat, lng, 16);
    }
  };

  // Confirm selection and propagate back to parent
  const handleConfirm = () => {
    saveCustomCity(pickupCityState);
    saveCustomCity(dropCityState);
    stopsState.forEach((s) => {
      if (s && s.trim()) saveCustomCity(s.trim());
    });

    if (onSelectPickup) onSelectPickup(pickupCityState, pickupCoords);
    if (onSelectDrop) onSelectDrop(dropCityState, dropCoords);
    const validStops = stopsState.filter((s) => s && s.trim());
    if (onSelectStops) onSelectStops(validStops);

    if (onSelect) {
      let activeVal = pickupCityState;
      let activeCoords = pickupCoords;

      if (currentTarget === "drop") {
        activeVal = dropCityState;
        activeCoords = dropCoords;
      } else if (typeof currentTarget === "string" && currentTarget.startsWith("stop-")) {
        const sIdx = parseInt(currentTarget.replace("stop-", ""), 10);
        activeVal = stopsState[sIdx] || "";
        activeCoords = stopsCoords[sIdx] || pickupCoords;
      }

      onSelect(activeVal, activeCoords, currentTarget, {
        pickup: pickupCityState,
        pickupCoords,
        drop: dropCityState,
        dropCoords,
        stops: validStops,
        stopsCoords
      });
    }

    onClose();
  };

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              typeof currentTarget === "string" && currentTarget.startsWith("stop-")
                ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                : currentTarget === "drop" 
                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                  : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                {typeof currentTarget === "string" && currentTarget.startsWith("stop-")
                  ? `Choose Stop ${parseInt(currentTarget.replace("stop-", ""), 10) + 1} Location`
                  : allowTargetSwitch
                    ? (currentTarget === "drop"
                        ? (t("choose_to_location") || "Choose Drop Location")
                        : (t("choose_from_location") || "Choose Pickup Location")
                      )
                    : (title || (
                        currentTarget === "drop"
                          ? (t("choose_to_location") || "Choose Drop Location")
                          : (t("choose_from_location") || t("select_location_on_map") || "Choose Pickup Location")
                      ))
                }
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {typeof currentTarget === "string" && currentTarget.startsWith("stop-")
                  ? `Stop ${parseInt(currentTarget.replace("stop-", ""), 10) + 1} — Search place, pin on map, or use GPS`
                  : currentTarget === "drop"
                    ? `${t("to_city") || "Drop Destination"} — Search place, pin on map, or use GPS`
                    : `${t("from_city") || "Pickup City"} — Search place, pin on map, or use GPS`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Segmented Target Switcher: From Location, Intermediate Stops & To Location */}
          {allowTargetSwitch && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span>Trip Route Waypoints</span>
                  {stopsState.length > 0 && (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                      {stopsState.length} {stopsState.length === 1 ? "Stop" : "Stops"}
                    </span>
                  )}
                </span>
                {allowStops && stopsState.length < maxStops && (
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 hover:border-amber-400 px-2.5 py-1 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t("add_stop") || "+ Add Stop"}</span>
                  </button>
                )}
              </div>

              <div className={`grid gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 ${
                stopsState.length === 0 ? "grid-cols-2" :
                stopsState.length === 1 ? "grid-cols-1 sm:grid-cols-3" :
                stopsState.length === 2 ? "grid-cols-2 sm:grid-cols-4" :
                "grid-cols-2 sm:grid-cols-5"
              }`}>
                {/* 1. Pickup Tab */}
                <button
                  type="button"
                  onClick={() => handleSwitchTarget("pickup")}
                  className={`p-2 sm:p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    currentTarget === "pickup"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200 ring-2 ring-emerald-500/30"
                      : "hover:bg-slate-200/60 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {t("choose_from_location") || "Choose from Location"}
                    </span>
                    {currentTarget === "pickup" && (
                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded ml-auto hidden sm:inline">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                    {pickupCityState || "Set on map"}
                  </p>
                </button>

                {/* 2. Stops Tabs */}
                {stopsState.map((stop, sIdx) => {
                  const isThisStopActive = currentTarget === `stop-${sIdx}`;
                  return (
                    <div
                      key={`stop-tab-${sIdx}`}
                      onClick={() => handleSwitchTarget(`stop-${sIdx}`)}
                      className={`p-2 sm:p-2.5 rounded-xl text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                        isThisStopActive
                          ? "bg-white text-slate-900 shadow-xs border border-slate-200 ring-2 ring-purple-500/30"
                          : "bg-purple-50/50 hover:bg-purple-100/60 text-slate-600 border border-purple-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">
                          Stop {sIdx + 1}
                        </span>
                        {isThisStopActive && (
                          <span className="text-[9px] font-black bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded ml-auto hidden sm:inline">
                            Active
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleRemoveStop(sIdx, e)}
                          title="Remove Stop"
                          className="w-4 h-4 rounded-full bg-slate-200/80 hover:bg-rose-100 hover:text-rose-600 text-slate-500 flex items-center justify-center transition-colors ml-auto cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                        {stop || "Set on map"}
                      </p>
                    </div>
                  );
                })}

                {/* 3. Drop Tab */}
                <button
                  type="button"
                  onClick={() => handleSwitchTarget("drop")}
                  className={`p-2 sm:p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    currentTarget === "drop"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200 ring-2 ring-amber-500/30"
                      : "hover:bg-slate-200/60 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {t("choose_to_location") || "Choose to Location"}
                    </span>
                    {currentTarget === "drop" && (
                      <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded ml-auto hidden sm:inline">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                    {dropCityState || "Set on map"}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Top Search & Locate Bar */}
          <div className="flex gap-2 relative z-20">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={hasGoogleMapsKey && !googleMapsError ? "Search landmark, street, city or airport with Google..." : "Search landmark, station or city..."}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-xs"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-amber-600" />
              )}

              {/* Autocomplete Results (Places API New / OSM) */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-40 max-h-52 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSearchResult(item)}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-950 flex items-start gap-2.5 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate">{item.title}</p>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                        )}
                      </div>
                      {item.isGoogleNew && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                          Google
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* GPS Current Location Button */}
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              title="Pin Current GPS Location"
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-amber-400 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Crosshair className={`w-4 h-4 ${isLocating ? "animate-spin text-amber-600" : "text-amber-500"}`} />
              <span className="hidden sm:inline">Use My GPS</span>
            </button>
          </div>

          {/* Quick Hub Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Popular:
            </span>
            {QUICK_HUBS.map((hub) => (
              <button
                key={hub.name}
                type="button"
                onClick={() => handleSelectHub(hub)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-600 text-[11px] font-semibold whitespace-nowrap transition-colors border border-transparent hover:border-amber-200 shrink-0 cursor-pointer"
              >
                {hub.name}
              </button>
            ))}
          </div>

          {/* Interactive Map Canvas Container */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 relative h-72 sm:h-80 shadow-inner z-10">
            {hasGoogleMapsKey && !googleMapsError ? (
              // Google Maps Canvas
              <div ref={googleMapRef} className="w-full h-full" />
            ) : (
              // Live Interactive Leaflet Map Canvas (OSM)
              <div className="w-full h-full relative">
                <div ref={leafletMapRef} className="w-full h-full" />
                {!leafletLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-500 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                    <span className="text-xs font-semibold">Loading interactive map...</span>
                  </div>
                )}
              </div>
            )}

            {/* Floating Quick Helper Banner */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
              <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white text-[11px] sm:text-xs font-bold shadow-xl border border-amber-400/70 backdrop-blur-xs flex items-center gap-2 whitespace-nowrap">
                <span className={`w-2 h-2 rounded-full animate-ping shrink-0 ${
                  typeof currentTarget === "string" && currentTarget.startsWith("stop-")
                    ? "bg-purple-400"
                    : currentTarget === "drop"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                }`} />
                <span>
                  📍 Click anywhere on map to pin {
                    typeof currentTarget === "string" && currentTarget.startsWith("stop-")
                      ? `Stop ${parseInt(currentTarget.replace("stop-", ""), 10) + 1}`
                      : currentTarget === "drop"
                        ? (t("to_city") || "Drop")
                        : (t("from_city") || "Pickup")
                  }
                </span>
              </div>
            </div>
          </div>


          {/* Dual Location Summary & Confirmation Box */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            {/* Location Cards */}
            <div className={`grid gap-2.5 ${
              stopsState.length === 0 ? "grid-cols-1 sm:grid-cols-2" :
              stopsState.length === 1 ? "grid-cols-1 sm:grid-cols-3" :
              "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
            }`}>
              {/* Pickup / From Location Preview */}
              <button
                type="button"
                onClick={() => allowTargetSwitch && handleSwitchTarget("pickup")}
                disabled={!allowTargetSwitch}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  allowTargetSwitch ? "cursor-pointer" : "cursor-default"
                } ${
                  currentTarget === "pickup"
                    ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/40"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      {t("from_city") || "From Location"}
                    </span>
                  </div>
                  {currentTarget === "pickup" && (
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      Editing
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {pickupCityState || "Set on map"}
                </p>
              </button>

              {/* Intermediate Stops Previews */}
              {stopsState.map((stop, sIdx) => {
                const isThisStopActive = currentTarget === `stop-${sIdx}`;
                return (
                  <button
                    key={`summary-stop-${sIdx}`}
                    type="button"
                    onClick={() => allowTargetSwitch && handleSwitchTarget(`stop-${sIdx}`)}
                    disabled={!allowTargetSwitch}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      allowTargetSwitch ? "cursor-pointer" : "cursor-default"
                    } ${
                      isThisStopActive
                        ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/40"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                        <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700">
                          Stop {sIdx + 1}
                        </span>
                      </div>
                      {isThisStopActive && (
                        <span className="text-[9px] font-black text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                          Editing
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {stop || "Set on map"}
                    </p>
                  </button>
                );
              })}

              {/* Drop / To Location Preview */}
              <button
                type="button"
                onClick={() => allowTargetSwitch && handleSwitchTarget("drop")}
                disabled={!allowTargetSwitch}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  allowTargetSwitch ? "cursor-pointer" : "cursor-default"
                } ${
                  currentTarget === "drop"
                    ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/40"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      {t("to_city") || "To Location"}
                    </span>
                  </div>
                  {currentTarget === "drop" && (
                    <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                      Editing
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {dropCityState || "Set on map"}
                </p>
              </button>
            </div>

            {/* Action Buttons: Switch target & Confirm */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1 border-t border-slate-200/80">
              {allowTargetSwitch && (
                currentTarget === "pickup" ? (
                  <button
                    type="button"
                    onClick={() => handleSwitchTarget(stopsState.length > 0 ? "stop-0" : "drop")}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <span>{stopsState.length > 0 ? "Next: Choose Stop 1" : (t("choose_to_location") || "Choose to Location")}</span>
                    <ChevronRight className="w-4 h-4 text-amber-500" />
                  </button>
                ) : typeof currentTarget === "string" && currentTarget.startsWith("stop-") ? (
                  (() => {
                    const sIdx = parseInt(currentTarget.replace("stop-", ""), 10);
                    const nextTarget = sIdx + 1 < stopsState.length ? `stop-${sIdx + 1}` : "drop";
                    const nextLabel = sIdx + 1 < stopsState.length ? `Next: Stop ${sIdx + 2}` : (t("choose_to_location") || "Next: Drop Location");
                    return (
                      <button
                        type="button"
                        onClick={() => handleSwitchTarget(nextTarget)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <span>{nextLabel}</span>
                        <ChevronRight className="w-4 h-4 text-amber-500" />
                      </button>
                    );
                  })()
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSwitchTarget(stopsState.length > 0 ? `stop-${stopsState.length - 1}` : "pickup")}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4 text-emerald-500" />
                    <span>{stopsState.length > 0 ? `Back: Stop ${stopsState.length}` : (t("choose_from_location") || "Choose from Location")}</span>
                  </button>
                )
              )}

              <button
                type="button"
                onClick={handleConfirm}
                className="w-full sm:w-auto sm:ml-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>{t("confirm_location") || "Confirm & Set Location"}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
