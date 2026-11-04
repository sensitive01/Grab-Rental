let googleMapsPromise = null;

/**
 * Loads the Google Maps JavaScript API with the Places library.
 * Reuses existing script tag if already in the DOM.
 */
export function loadGoogleMaps() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in the browser"));
  }

  if (window.google?.maps?.importLibrary) {
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
    const existing = document.getElementById("google-maps-script");
    if (existing) {
      if (window.google?.maps?.importLibrary) {
        resolve(window.google);
        return;
      }
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly&loading=async`;
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
 * Reverse geocode latitude and longitude into a localized Indian city/area name.
 * Attempts Google Maps Geocoder first, falling back to OpenStreetMap Nominatim.
 */
export async function reverseGeocodeCoordinates(lat, lng) {
  if (typeof window === "undefined" || !lat || !lng) {
    return null;
  }

  // 1. Try Google Maps Geocoder if Google Maps API is loaded or can be loaded
  try {
    const google = await loadGoogleMaps().catch(() => null);
    if (google?.maps?.Geocoder) {
      const geocoder = new google.maps.Geocoder();
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            resolve(results[0]);
          } else {
            reject(new Error(`Geocoder failed with status: ${status}`));
          }
        });
      });

      if (result) {
        let area = "";
        let locality = "";
        let adminArea = "";
        let pincode = "";

        for (const comp of result.address_components || []) {
          const types = comp.types || [];
          if (
            types.includes("sublocality") ||
            types.includes("sublocality_level_1") ||
            types.includes("neighborhood")
          ) {
            if (!area) area = comp.long_name;
          }
          if (types.includes("locality")) locality = comp.long_name;
          if (!locality && types.includes("administrative_area_level_2")) {
            locality = comp.long_name;
          }
          if (types.includes("administrative_area_level_1")) {
            adminArea = comp.long_name;
          }
          if (types.includes("postal_code")) pincode = comp.long_name;
        }

        const city = locality || area || "Current Location";
        const state = adminArea || "";
        const label = city && state ? `${city}, ${state}` : result.formatted_address || city;

        return {
          label,
          coords: { lat, lng },
          details: {
            area: area || "",
            city: locality || "",
            state: adminArea || "",
            pincode: pincode || "",
            fullAddress: result.formatted_address || label,
            lat,
            lng
          }
        };
      }
    }
  } catch (err) {
    console.warn("Google Maps reverse geocode fallback to OSM:", err);
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
      const state = addr.state || "";
      const suburb = addr.suburb || addr.neighbourhood || "";
      const label = city && state ? `${city}, ${state}` : data.display_name?.split(",").slice(0, 2).join(", ").trim() || "Current Location";

      return {
        label,
        coords: { lat, lng },
        details: {
          area: suburb,
          city,
          state,
          pincode: addr.postcode || "",
          fullAddress: data.display_name || label,
          lat,
          lng
        }
      };
    }
  } catch (osmErr) {
    console.warn("OSM reverse geocode error:", osmErr);
  }

  return {
    label: "Current Location",
    coords: { lat, lng },
    details: { city: "", state: "", lat, lng }
  };
}
