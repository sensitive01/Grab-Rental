"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Navigation } from "lucide-react";

/**
 * Decode Google's Encoded Polyline Algorithm into array of { lat, lng }
 */
function decodeGooglePolyline(encoded) {
  if (!encoded) return [];
  const points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += ((result & 1) ? ~(result >> 1) : (result >> 1));

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += ((result & 1) ? ~(result >> 1) : (result >> 1));

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

/**
 * Universal Route Map Component.
 * Powered 100% by Google Maps and the New Google Routes API (computeRoutes).
 * No legacy APIs, no third-party OSRM routers.
 */
export default function MapView({
  pickup, // { lat, lng, label }
  drop,   // { lat, lng, label }
  stops = [], // [{ lat, lng, label }]
  className = "h-72 sm:h-80 w-full",
  overrideDistance = null, // string or number, e.g. "346 km" or 346
  overrideDuration = null, // string, e.g. "~6 hr 36 min"
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const activePolylineRef = useRef(null);
  const [engine, setEngine] = useState("loading"); // "google" | "fallback"
  const [routeStats, setRouteStats] = useState(null); // { distance, duration }

  const displayDistance = overrideDistance 
    ? (typeof overrideDistance === "number" ? `${overrideDistance} km` : String(overrideDistance).includes("km") ? overrideDistance : `${overrideDistance} km`)
    : routeStats?.distance;

  const displayDuration = overrideDuration || routeStats?.duration;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const hasGoogleKey = Boolean(apiKey && apiKey.trim().length > 5);

  // Normalize points with sensible South India metro fallbacks if coordinates are missing
  const defaultPickup = { lat: 12.9716, lng: 77.5946, label: "Bengaluru" };
  const defaultDrop = { lat: 11.0168, lng: 76.9558, label: "Coimbatore" };

  const resolvedPickup = {
    lat: pickup?.lat != null ? Number(pickup.lat) : defaultPickup.lat,
    lng: pickup?.lng != null ? Number(pickup.lng) : defaultPickup.lng,
    label: pickup?.label || "Pickup",
    color: "#10b981", // Emerald Green
  };

  const resolvedDrop = {
    lat: drop?.lat != null ? Number(drop.lat) : defaultDrop.lat,
    lng: drop?.lng != null ? Number(drop.lng) : defaultDrop.lng,
    label: drop?.label || "Drop",
    color: "#e11d48", // Rose Red
  };

  const validStops = (stops || [])
    .filter((s) => s && s.lat != null && s.lng != null)
    .map((s, idx) => ({
      lat: Number(s.lat),
      lng: Number(s.lng),
      label: s.label || `Halt #${idx + 1}`,
      color: "#f59e0b", // Amber
    }));

  const allPoints = [resolvedPickup, ...validStops, resolvedDrop];

  // 1. Load Google Maps JavaScript API
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;

    if (window.google?.maps?.Map) {
      if (isMounted) setEngine("google");
      return;
    }

    if (hasGoogleKey) {
      const scriptId = "google-maps-script";
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.addEventListener("load", () => {
        if (window.google?.maps?.Map && isMounted) {
          setEngine("google");
        }
      });
      script.addEventListener("error", () => {
        if (isMounted) setEngine("fallback");
      });

      const timer = setTimeout(() => {
        if (!window.google?.maps?.Map && isMounted) {
          setEngine("fallback");
        }
      }, 3000);

      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    } else {
      setEngine("fallback");
    }
  }, [hasGoogleKey, apiKey]);

  // 2. Render Google Map with NEW GOOGLE ROUTES API (computeRoutes)
  useEffect(() => {
    if (engine !== "google" || !mapContainerRef.current || !window.google?.maps?.Map) return;

    let isDisposed = false;

    try {
      const google = window.google;
      const initialBounds = new google.maps.LatLngBounds();
      allPoints.forEach((p) => initialBounds.extend({ lat: p.lat, lng: p.lng }));

      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: resolvedPickup.lat, lng: resolvedPickup.lng },
        zoom: 8,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          { featureType: "poi.business", stylers: [{ visibility: "off" }] }
        ]
      });

      // Custom Google Maps Pin Markers
      allPoints.forEach((pt) => {
        const pinSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
            <path d="M17 0C7.6 0 0 7.6 0 17c0 12.8 17 25 17 25s17-12.2 17-25C34 7.6 26.4 0 17 0z" fill="${pt.color}" stroke="#ffffff" stroke-width="2"/>
            <circle cx="17" cy="16" r="6" fill="#ffffff"/>
          </svg>
        `)}`;

        new google.maps.Marker({
          position: { lat: pt.lat, lng: pt.lng },
          map,
          title: pt.label,
          icon: {
            url: pinSvg,
            scaledSize: new google.maps.Size(30, 38),
            anchor: new google.maps.Point(15, 38),
          },
        });
      });

      // Fetch Driving Highway Geometry via New Google Routes API (computeRoutes)
      async function fetchGoogleHighwayRoute() {
        try {
          const origin = {
            location: {
              latLng: {
                latitude: resolvedPickup.lat,
                longitude: resolvedPickup.lng
              }
            }
          };

          const destination = {
            location: {
              latLng: {
                latitude: resolvedDrop.lat,
                longitude: resolvedDrop.lng
              }
            }
          };

          const intermediates = validStops.map((s) => ({
            location: {
              latLng: {
                latitude: s.lat,
                longitude: s.lng
              }
            }
          }));

          const reqBody = {
            origin,
            destination,
            travelMode: "DRIVE",
          };
          if (intermediates.length > 0) {
            reqBody.intermediates = intermediates;
          }

          const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": apiKey,
              "X-Goog-FieldMask": "routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration"
            },
            body: JSON.stringify(reqBody)
          });

          if (res.ok) {
            const data = await res.json();
            const encoded = data.routes?.[0]?.polyline?.encodedPolyline;
            if (encoded) {
              const roadPoints = decodeGooglePolyline(encoded);
              if (roadPoints.length > 0) {
                if (isDisposed) return;

                // Frame all markers + entire highway curve
                const roadBounds = new google.maps.LatLngBounds();
                allPoints.forEach((pt) => roadBounds.extend({ lat: pt.lat, lng: pt.lng }));
                roadPoints.forEach((pt) => roadBounds.extend(pt));

                const polyline = new google.maps.Polyline({
                  path: roadPoints,
                  geodesic: true,
                  strokeColor: "#2563eb", // Google Directions Royal Blue
                  strokeOpacity: 0.9,
                  strokeWeight: 6,
                  map,
                });
                activePolylineRef.current = polyline;

                map.fitBounds(roadBounds, { top: 50, right: 50, bottom: 50, left: 50 });

                if (data.routes[0].distanceMeters) {
                  const km = Math.round(data.routes[0].distanceMeters / 1000);
                  const secs = parseInt((data.routes[0].duration || "0s").replace("s", ""), 10) || 0;
                  const hrs = Math.floor(secs / 3600);
                  const mins = Math.round((secs % 3600) / 60);
                  const durationStr = hrs > 0 ? (mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`) : `${mins} min`;

                  setRouteStats({
                    distance: `${km} km`,
                    duration: durationStr,
                  });
                }
                return;
              }
            }
          }
        } catch (err) {
          console.warn("[MapView] Google Routes API fetch:", err);
        }

        // Direct polyline fallback if Routes API is unavailable
        if (!isDisposed) {
          const polyline = new google.maps.Polyline({
            path: allPoints.map((p) => ({ lat: p.lat, lng: p.lng })),
            geodesic: true,
            strokeColor: "#2563eb",
            strokeOpacity: 0.85,
            strokeWeight: 5,
            map,
          });
          activePolylineRef.current = polyline;
          map.fitBounds(initialBounds, { top: 50, right: 50, bottom: 50, left: 50 });
        }
      }

      fetchGoogleHighwayRoute();
      mapInstanceRef.current = map;
    } catch (err) {
      console.warn("[MapView] Google Maps initialization warning:", err);
    }

    return () => {
      isDisposed = true;
      if (activePolylineRef.current) {
        activePolylineRef.current.setMap(null);
        activePolylineRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, [engine, resolvedPickup.lat, resolvedPickup.lng, resolvedDrop.lat, resolvedDrop.lng, JSON.stringify(validStops), apiKey]);

  return (
    <div className="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
      <div 
        ref={mapContainerRef} 
        className={className} 
        style={{ minHeight: "260px", width: "100%", background: "#f8fafc" }} 
      />

      {engine === "loading" && (
        <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-2xs flex items-center justify-center text-xs font-bold text-slate-500 gap-2 z-20">
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          <span>Loading Google Maps Route…</span>
        </div>
      )}

      {/* Floating distance and duration pill in top-left */}
      {(displayDistance || displayDuration) && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <div className="bg-slate-900/90 text-white backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] font-extrabold shadow-md flex items-center gap-1.5 animate-in fade-in">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            {displayDistance && <span>{displayDistance}</span>}
            {displayDistance && displayDuration && <span className="text-slate-400">•</span>}
            {displayDuration && <span className="text-emerald-400">{displayDuration}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
