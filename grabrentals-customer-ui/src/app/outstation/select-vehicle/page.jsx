"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VehicleTripHeader from "@/components/booking/VehicleTripHeader";
import BookingTrustBanner from "@/components/booking/BookingTrustBanner";
import RentalCarCard from "@/components/booking/RentalCarCard";
import ModifyBookingModal from "@/components/booking/ModifyBookingModal";
import { FLEET_MODELS } from "@/lib/vendorData";
import { customerApi } from "@/lib/customerApi";
import { ShieldCheck, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";

function estimateRouteDistance(from, to, stops, tripType) {
  const points = [from || ""];
  if (stops) {
    const list = Array.isArray(stops) ? stops : stops.split(/[|,]/);
    list.forEach((s) => { if (s && s.trim()) points.push(s.trim()); });
  }
  points.push(to || "");

  const getLegKm = (src, dst) => {
    const f = (src || "").toLowerCase();
    const t = (dst || "").toLowerCase();
    const match = (c1, c2) => (f.includes(c1) && t.includes(c2)) || (f.includes(c2) && t.includes(c1));

    if (match("bangalore", "coimbatore") || match("bengaluru", "coimbatore")) return 365;
    if (match("bangalore", "chennai") || match("bengaluru", "chennai")) return 347;
    if (match("bangalore", "mysore") || match("bengaluru", "mysore")) return 145;
    if (match("bangalore", "hyderabad") || match("bengaluru", "hyderabad")) return 575;
    if (match("bangalore", "ooty") || match("bengaluru", "ooty")) return 275;
    if (match("bangalore", "pondicherry") || match("bengaluru", "pondicherry")) return 315;
    if (match("bangalore", "salem") || match("bengaluru", "salem")) return 200;
    if (match("bangalore", "madurai") || match("bengaluru", "madurai")) return 435;
    if (match("salem", "coimbatore")) return 165;
    if (match("chennai", "coimbatore")) return 505;
    if (match("chennai", "madurai")) return 460;
    if (match("mumbai", "pune")) return 155;
    if (match("delhi", "jaipur")) return 280;
    if (match("delhi", "agra")) return 235;
    return 180;
  };

  let oneWayKm = 0;
  if (points.length <= 2) {
    oneWayKm = getLegKm(points[0], points[1]);
    if (oneWayKm === 180) oneWayKm = 320;
  } else {
    for (let i = 0; i < points.length - 1; i++) {
      oneWayKm += getLegKm(points[i], points[i + 1]);
    }
  }

  const isRound = (tripType || "").toLowerCase().includes("round");
  return isRound ? oneWayKm * 2 : oneWayKm;
}

function formatDateDisplay(rawDate) {
  if (!rawDate) return "28-09-2026";
  try {
    const parts = rawDate.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return rawDate;
  } catch {
    return rawDate;
  }
}

function formatTimeDisplay(rawTime) {
  if (!rawTime) return "7:00 AM";
  try {
    const [hh, mm] = rawTime.split(":");
    let h = parseInt(hh, 10);
    const m = mm || "00";
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  } catch {
    return rawTime;
  }
}

function cleanCityName(fullString) {
  if (!fullString) return "";
  return fullString.split(",")[0].trim();
}

function SelectVehicleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse dynamic query parameters from BookingWidget or URL
  const queryFrom = searchParams.get("from") || "Bangalore, Karnataka";
  const queryTo = searchParams.get("to") || "Coimbatore, Tamil Nadu";
  const queryStops = searchParams.get("stops") || "";
  const queryTripType = searchParams.get("tripType") || "one-way";
  const queryDate = searchParams.get("pickupDate") || "2026-09-28";
  const queryTime = searchParams.get("pickupTime") || "07:00";

  const [trip, setTrip] = useState({
    from: queryFrom,
    to: queryTo,
    stops: queryStops,
    tripType: queryTripType.toLowerCase().includes("round") ? "Round trip" : "One way",
    date: queryDate,
    time: queryTime
  });

  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [backendVehicles, setBackendVehicles] = useState(null);
  const [backendDistance, setBackendDistance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Sync state if query parameters or session storage change
  useEffect(() => {
    if (searchParams.get("from")) {
      setTrip({
        from: searchParams.get("from"),
        to: searchParams.get("to") || "Coimbatore, Tamil Nadu",
        stops: searchParams.get("stops") || "",
        tripType: (searchParams.get("tripType") || "one-way").toLowerCase().includes("round") ? "Round trip" : "One way",
        date: searchParams.get("pickupDate") || "2026-09-28",
        time: searchParams.get("pickupTime") || "07:00"
      });
    } else if (typeof window !== "undefined") {
      try {
        const pending = sessionStorage.getItem("grab_pending_trip");
        if (pending) {
          const parsed = JSON.parse(pending);
          setTrip(parsed);
        }
      } catch (err) {
        console.warn("Could not read pending trip from session", err);
      }
    }
  }, [searchParams]);

  // Compute fallback route distance dynamically
  const fallbackDistance = useMemo(() => {
    return estimateRouteDistance(trip.from, trip.to, trip.stops, trip.tripType);
  }, [trip.from, trip.to, trip.stops, trip.tripType]);

  const activeDistance = backendDistance || fallbackDistance;

  // Compute fallback client fleet
  const fallbackFleet = useMemo(() => {
    return FLEET_MODELS.map((car) => {
      let ratePerKm = 11.7;
      if (car.category === "SEDAN") ratePerKm = 12.0;
      else if (car.category === "SUV_6") ratePerKm = 15.6;
      else if (car.category === "SUV_7") ratePerKm = 19.5;

      const discountedPrice = Math.round(activeDistance * ratePerKm);
      const originalPrice = Math.round(discountedPrice * 1.14);
      const chargesAndTaxes = Math.round(discountedPrice * 0.36);

      return {
        ...car,
        includedKms: activeDistance,
        pricing: {
          ...car.pricing,
          originalPrice,
          discountedPrice,
          chargesAndTaxes,
          advanceAmount: Math.round((discountedPrice + chargesAndTaxes) * 0.20)
        }
      };
    });
  }, [activeDistance]);

  // Fetch live vehicles from backend API
  useEffect(() => {
    let isCancelled = false;

    async function loadVehiclesFromBackend() {
      setIsLoading(true);
      try {
        const response = await customerApi.searchVehicles({
          from: trip.from,
          to: trip.to,
          stops: trip.stops,
          tripType: trip.tripType.toLowerCase().includes("round") ? "ROUND_TRIP" : "ONE_WAY",
          pickupDate: trip.date,
          pickupTime: trip.time
        });

        if (!isCancelled && response?.data) {
          if (response.data.vehicles && response.data.vehicles.length > 0) {
            setBackendVehicles(response.data.vehicles);
            if (response.data.distanceKm) {
              setBackendDistance(response.data.distanceKm);
            }
            setIsLiveConnected(true);
          }
        }
      } catch (err) {
        console.warn("[SelectVehicle] Backend search API call unavailable, active with client calculation fallback.", err);
        setIsLiveConnected(false);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadVehiclesFromBackend();

    return () => {
      isCancelled = true;
    };
  }, [trip.from, trip.to, trip.stops, trip.tripType, trip.date, trip.time]);

  // Active fleet list
  const activeFleet = (backendVehicles && backendVehicles.length > 0) ? backendVehicles : fallbackFleet;

function resolveCarImage(car) {
  if (!car) return "/images/cars/dzire.jpg";
  const title = (car.title || "").toLowerCase();
  const category = (car.category || "").toLowerCase();
  
  if (title.includes("innova") || title.includes("crysta") || title.includes("hycross") || title.includes("fortuner")) {
    return "/images/cars/innova.jpg";
  }
  if (title.includes("s-presso") || title.includes("spresso")) {
    return "/images/cars/spresso.jpg";
  }
  if (title.includes("wagon") || title.includes("celerio") || title.includes("tiago") || title.includes("alto")) {
    return "/images/cars/wagon_r.jpg";
  }
  if (title.includes("ertiga") || title.includes("carens") || title.includes("triber") || title.includes("rumion")) {
    return "/images/cars/ertiga.jpg";
  }
  if (title.includes("dzire") || title.includes("etios") || title.includes("amaze") || title.includes("verna") || title.includes("aura") || title.includes("city")) {
    return "/images/cars/dzire.jpg";
  }

  if (car.image && typeof car.image === "string" && !car.image.includes("unsplash.com") && !car.image.includes("blob:")) {
    return car.image;
  }

  if (category.includes("hatchback")) return "/images/cars/wagon_r.jpg";
  if (category.includes("suv_6")) return "/images/cars/ertiga.jpg";
  if (category.includes("suv_7")) return "/images/cars/innova.jpg";
  return "/images/cars/dzire.jpg";
}

  const handleCarSelect = (configuredCar) => {
    if (typeof window !== "undefined") {
      const selectedData = {
        trip,
        distanceKm: activeDistance,
        car: {
          id: configuredCar.id,
          title: configuredCar.title,
          category: configuredCar.category,
          fuel: configuredCar.selectedFuel,
          withLuggageCarrier: configuredCar.withLuggageCarrier,
          seating: configuredCar.seating,
          fare: configuredCar.finalPrice,
          taxes: configuredCar.pricing?.chargesAndTaxes || Math.round(configuredCar.finalPrice * 0.35),
          totalFare: configuredCar.totalCharges,
          advancePaid: Math.round(configuredCar.totalCharges * 0.20),
          image: resolveCarImage(configuredCar)
        }
      };
      sessionStorage.setItem("grab_selected_booking", JSON.stringify(selectedData));
    }

    router.push("/outstation/review-pay");
  };

  const handleSaveTrip = (newTrip) => {
    setTrip(newTrip);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("grab_pending_trip", JSON.stringify(newTrip));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Dynamic Route Header */}
        <VehicleTripHeader
          from={cleanCityName(trip.from)}
          to={cleanCityName(trip.to)}
          stops={trip.stops}
          tripType={trip.tripType}
          date={formatDateDisplay(trip.date)}
          time={formatTimeDisplay(trip.time)}
          onModifyClick={() => setIsModifyOpen(true)}
        />

        {/* Brand Theme Trust Banner */}
        <BookingTrustBanner />

        {/* Route Distance Banner */}
        <div className="flex items-center justify-end text-xs px-2 py-0.5 text-slate-500 font-medium">
          <span className="font-semibold text-slate-700">
            Route Distance: <strong className="text-slate-900">{activeDistance} km</strong>
          </span>
        </div>

        {/* Dynamic Car Listing Cards */}
        {isLoading ? (
          <div className="space-y-4 pt-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-48 h-28 bg-slate-200 rounded-xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  </div>
                  <div className="w-32 h-10 bg-slate-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {activeFleet.map((car) => (
              <RentalCarCard
                key={car.id}
                car={car}
                onSelect={handleCarSelect}
              />
            ))}
          </div>
        )}

        {/* Assurance Note */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 text-center text-xs text-slate-500 font-semibold mt-6 shadow-2xs">
          <p className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            All outstation trips are covered with 24x7 On-Road Breakdown Assistance and verified GPS tracking.
          </p>
        </div>

      </div>

      {/* Modify Booking Modal */}
      <ModifyBookingModal
        isOpen={isModifyOpen}
        onClose={() => setIsModifyOpen(false)}
        currentTrip={trip}
        onSave={handleSaveTrip}
      />
    </main>
  );
}

export default function SelectVehiclePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-slate-500 font-bold text-sm animate-pulse">Loading available vehicles...</div>
      </div>
    }>
      <SelectVehicleContent />
    </Suspense>
  );
}
