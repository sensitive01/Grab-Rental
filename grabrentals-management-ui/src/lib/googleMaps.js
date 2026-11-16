let googleMapsPromise = null;

/**
 * Loads the Google Maps JavaScript API with the Places library.
 * Reuses existing script tag if already in the DOM.
 */
export function loadGoogleMaps() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in the browser"));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured"));
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existing =
      document.getElementById("google-maps-script") ||
      document.getElementById("google-maps-script-location-picker") ||
      document.querySelector('script[src*="maps.googleapis.com"]');

    if (existing) {
      if (window.google?.maps) {
        resolve(window.google);
        return;
      }
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = (err) => {
      googleMapsPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

/**
 * Reverse geocode latitude and longitude into a localized Indian city/area name using Google Maps Geocoder.
 */
export async function reverseGeocodeCoordinates(lat, lng) {
  if (typeof window === "undefined" || !lat || !lng) {
    return null;
  }

  // 1. Google Maps Geocoder (Primary)
  try {
    const google = await loadGoogleMaps();
    if (!google?.maps) {
      throw new Error("Google Maps API not available");
    }

    let GeocoderClass = google.maps.Geocoder;
    if (!GeocoderClass && typeof google.maps.importLibrary === "function") {
      const geocodingLib = await google.maps.importLibrary("geocoding");
      GeocoderClass = geocodingLib?.Geocoder;
    }

    if (!GeocoderClass) {
      throw new Error("Google Maps Geocoder not available");
    }

    const geocoder = new GeocoderClass();
    const results = await new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (res, status) => {
        if (status === "OK" && res && res.length > 0) {
          resolve(res);
        } else {
          reject(new Error(`Google Maps Geocoder failed with status: ${status}`));
        }
      });
    });

    if (results && results.length > 0) {
      let area = "";
      let locality = "";
      let subdistrict = "";
      let district = "";
      let adminState = "";
      let pincode = "";
      const fullAddress = results[0]?.formatted_address || "";

      // Scan through all geocode results from most specific to broader
      for (const r of results) {
        for (const comp of r.address_components || []) {
          const types = comp.types || [];

          // Area / Sublocality
          if (!area) {
            if (
              types.includes("sublocality_level_1") ||
              types.includes("sublocality") ||
              types.includes("sublocality_level_2") ||
              types.includes("neighborhood") ||
              types.includes("suburb") ||
              types.includes("sublocality_level_3")
            ) {
              area = comp.long_name;
            }
          }

          // Locality / City
          if (!locality && types.includes("locality")) {
            locality = comp.long_name;
          }

          // Subdistrict / Taluk / Tehsil
          if (!subdistrict && types.includes("administrative_area_level_3")) {
            subdistrict = comp.long_name;
          }

          // District
          if (!district && types.includes("administrative_area_level_2")) {
            district = comp.long_name;
          }

          // State
          if (!adminState && types.includes("administrative_area_level_1")) {
            adminState = comp.long_name;
          }

          // Postal Code
          if (!pincode && types.includes("postal_code")) {
            pincode = comp.long_name;
          }
        }
      }

      // Fallback for Area if still empty: check route or point of interest
      if (!area && results[0]?.address_components) {
        for (const comp of results[0].address_components) {
          const types = comp.types || [];
          if (
            types.includes("route") ||
            types.includes("point_of_interest") ||
            types.includes("premise") ||
            types.includes("establishment")
          ) {
            area = comp.long_name;
            break;
          }
        }
      }

      // If area is still not extracted, take the first segment from formatted_address
      if (!area && fullAddress) {
        const segments = fullAddress.split(",").map((s) => s.trim());
        if (segments.length > 1 && segments[0] !== locality && segments[0] !== adminState) {
          area = segments[0];
        }
      }

      const city = locality || subdistrict || district || area || "Current Location";
      const state = adminState || "";
      const label = city && state ? `${city}, ${state}` : fullAddress || city;

      return {
        label,
        coords: { lat, lng },
        details: {
          area: area || "",
          city: city || "",
          state: state || "",
          pincode: pincode || "",
          fullAddress: fullAddress || label,
          lat,
          lng,
        },
      };
    }
  } catch (err) {
    console.warn("[GoogleMaps] Reverse geocode error:", err);
  }

  // 2. Fallback to OpenStreetMap only if Google Maps network/key fails
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
      const state = addr.state || "";
      const area =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.quarter ||
        addr.subdistrict ||
        addr.village ||
        addr.road ||
        "";
      const label = city && state ? `${city}, ${state}` : data.display_name?.split(",").slice(0, 2).join(", ").trim() || "Current Location";

      return {
        label,
        coords: { lat, lng },
        details: {
          area,
          city,
          state,
          pincode: addr.postcode || "",
          fullAddress: data.display_name || label,
          lat,
          lng,
        },
      };
    }
  } catch (osmErr) {
    console.warn("OSM reverse geocode fallback error:", osmErr);
  }

  return {
    label: "Current Location",
    coords: { lat, lng },
    details: { area: "", city: "", state: "", pincode: "", lat, lng },
  };
}
