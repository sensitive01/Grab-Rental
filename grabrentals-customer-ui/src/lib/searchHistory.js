import axiosClient from "@/lib/axiosClient";
import { getCurrentUser } from "@/lib/auth";

export function logSearchHistory(tripData, userOverride = null) {
  try {
    if (!tripData) return;
    const user = userOverride || getCurrentUser();
    let sessionId = null;
    if (typeof window !== "undefined") {
      sessionId = localStorage.getItem("grab_search_session_id");
      if (!sessionId) {
        sessionId = "sess_" + Math.random().toString(36).substring(2, 12);
        localStorage.setItem("grab_search_session_id", sessionId);
      }
    }

    const payload = {
      serviceType: tripData.serviceType || "OUTSTATION",
      tripType: tripData.tripType || tripData.type || "one-way",
      cabType: tripData.cabType || null,
      pickupLocation: tripData.from || tripData.pickupLocation || "Unknown",
      dropLocation: tripData.to || tripData.dropLocation || null,
      pickupCity: tripData.fromCity || tripData.pickupDetails?.city || null,
      pickupState: tripData.fromState || tripData.pickupDetails?.state || null,
      dropCity: tripData.toCity || tripData.dropDetails?.city || null,
      stops: Array.isArray(tripData.stops) ? tripData.stops.join("|") : tripData.stops || null,
      pickupCoords: tripData.pickupCoords 
        ? (typeof tripData.pickupCoords === "string" ? tripData.pickupCoords : `${tripData.pickupCoords.lat},${tripData.pickupCoords.lng}`) 
        : null,
      dropCoords: tripData.dropCoords 
        ? (typeof tripData.dropCoords === "string" ? tripData.dropCoords : `${tripData.dropCoords.lat},${tripData.dropCoords.lng}`) 
        : null,
      pickupDate: tripData.date || tripData.pickupDate || null,
      pickupTime: tripData.time || tripData.pickupTime || null,
      returnDate: tripData.dropDate || tripData.returnDate || null,
      packageHoursKm: tripData.package || tripData.packageHoursKm || null,
      distanceKm: tripData.distanceKm ? Number(tripData.distanceKm) : null,
      durationText: tripData.durationText || tripData.duration || null,
      tollPrice: tripData.tollPrice ? Number(tripData.tollPrice) : null,
      userId: user?.id ? String(user.id) : null,
      userName: user?.name || null,
      userEmail: user?.email || null,
      userPhone: user?.phone || null,
      userRole: user ? "CUSTOMER" : "GUEST",
      sessionId,
      sourcePage: tripData.sourcePage || (tripData.isPetFriendly ? "/pet-friendly-cabs" : (typeof window !== "undefined" ? window.location.pathname : "/")),
    };

    axiosClient.post("/api/search-history", payload).catch((err) => {
      console.warn("Non-blocking search logging error:", err);
    });
  } catch (err) {
    console.warn("Failed to dispatch search logging:", err);
  }
}
