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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
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
