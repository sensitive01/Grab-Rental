"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { ChevronRight, Edit2, ShieldCheck, MapPin } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

function SearchSummaryContent({ 
  activeStep = 1,
  overrideDistanceKm = null,
  overrideDuration = null,
  overrideFrom = null,
  overrideTo = null
}) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [tripInfo, setTripInfo] = useState({
    from: searchParams?.get("from") || "Bangalore",
    to: searchParams?.get("to") || "Coimbatore",
    stops: searchParams?.get("stops") || "",
    tripType: searchParams?.get("tripType") || "One way",
    date: searchParams?.get("pickupDate") || "28-09-2026",
    time: searchParams?.get("pickupTime") || "07:00 AM",
    dropDate: searchParams?.get("dropDate") || searchParams?.get("returnDate") || null,
    distanceKm: 0,
    duration: null,
    tollPrice: 0,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedBooking = sessionStorage.getItem("grab_selected_booking");
        if (storedBooking) {
          const parsed = JSON.parse(storedBooking);
          if (parsed.trip) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTripInfo({
              from: parsed.trip.from || "Bangalore",
              to: parsed.trip.to || "Coimbatore",
              stops: parsed.trip.stops || "",
              tripType: parsed.trip.tripType || "One way",
              date: parsed.trip.date || "28-09-2026",
              time: parsed.trip.time || "07:00 AM",
              dropDate: parsed.trip.dropDate || parsed.trip.returnDate || parsed.dropDate || null,
              serviceType: parsed.trip.serviceType || "OUTSTATION",
              distanceKm: parsed.distanceKm || 0,
              duration: parsed.duration || null,
              tollPrice: parsed.tollPrice || 0,
            });
            return;
          }
        }

        const pendingTrip = sessionStorage.getItem("grab_pending_trip");
        if (pendingTrip) {
          const parsed = JSON.parse(pendingTrip);
          setTripInfo({
            from: parsed.from || "Bangalore",
            to: parsed.to || "Coimbatore",
            stops: parsed.stops || "",
            tripType: parsed.tripType || "One way",
            date: parsed.date || "28-09-2026",
            time: parsed.time || "07:00 AM",
            dropDate: parsed.dropDate || parsed.returnDate || null,
            serviceType: parsed.serviceType || "OUTSTATION",
            distanceKm: parsed.distanceKm || 0,
            duration: parsed.duration || null,
            tollPrice: parsed.tollPrice || 0,
          });
        }
      } catch (err) {
        console.warn("Could not parse session trip in SearchSummaryBar", err);
      }
    }
  }, []);

  const isLocal = tripInfo.serviceType === "LOCAL" || (tripInfo.to && tripInfo.to.toLowerCase().includes("hr"));

  const formatPackageLabel = (pkgStr) => {
    if (!pkgStr) return "8 Hours / 80 Kms";
    const lower = pkgStr.toLowerCase();
    if (lower.includes("4hr") || lower.includes("40")) return "4 Hours / 40 Kms";
    if (lower.includes("12hr") || lower.includes("120")) return "12 Hours / 120 Kms";
    if (lower.includes("8hr") || lower.includes("80")) return "8 Hours / 80 Kms";
    return pkgStr;
  };

  const formatDateDisplay = (dStr) => {
    if (!dStr) return "";
    try {
      const parts = String(dStr).split("-");
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          const [yyyy, mm, dd] = parts;
          return `${dd}/${mm}/${yyyy}`;
        }
        return dStr;
      }
      return dStr;
    } catch {
      return dStr;
    }
  };

  const isRoundTrip = !isLocal && (tripInfo.tripType || "").toLowerCase().includes("round");
  const packageLabel = formatPackageLabel(tripInfo.to);
  const cleanCity = (str) => (str ? str.split(",")[0].trim() : "");

  const displayDistanceKm = (overrideDistanceKm != null && Number(overrideDistanceKm) > 0)
    ? Number(overrideDistanceKm)
    : tripInfo.distanceKm;
  const displayDuration = overrideDuration || tripInfo.duration;
  const displayFrom = overrideFrom || tripInfo.from;
  const displayTo = overrideTo || tripInfo.to;

  return (
    <div className="bg-[#0082fe] text-white border-b border-blue-600 sticky top-20 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        <div className="flex flex-col gap-1">
          {/* Trip Summary Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-white text-base sm:text-lg">{cleanCity(displayFrom)}</span>
            {isLocal ? (
              <span className="text-xs font-bold text-white bg-white/20 px-2.5 py-0.5 rounded border border-white/25">
                Package: {packageLabel}
              </span>
            ) : (
              <>
                {tripInfo.stops && (
                  <span className="text-xs font-bold text-white bg-white/20 px-2 py-0.5 rounded border border-white/25">
                    Via {tripInfo.stops.split("|").map(s => s.split(",")[0].trim()).join(", ")}
                  </span>
                )}
                <span className="text-blue-200 font-bold">→</span>
                <span className="font-black text-white text-base sm:text-lg">{cleanCity(displayTo)}</span>
                {isRoundTrip && (
                  <>
                    <span className="text-blue-200 font-bold">→</span>
                    <span className="font-black text-white text-base sm:text-lg">{cleanCity(displayFrom)}</span>
                  </>
                )}
                <span className="text-xs font-bold text-white bg-white/15 px-2.5 py-1 rounded-md ml-1 capitalize flex items-center gap-1.5 flex-wrap border border-white/20">
                  <span>{tripInfo.tripType}{displayDistanceKm > 0 ? ` • ${displayDistanceKm} km` : ""}</span>
                  {displayDuration && (
                    <span className="text-blue-100 font-medium">
                      • ~{String(displayDuration).replace(/^~/, "").trim()}
                    </span>
                  )}
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium text-blue-100 flex-wrap">
            <span>Pickup: {formatDateDisplay(tripInfo.date)} • {tripInfo.time}</span>
            {isRoundTrip && tripInfo.dropDate && (
              <>
                <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                <span className="text-white bg-white/20 px-2 py-0.5 rounded border border-white/30 font-bold">
                  Return: {formatDateDisplay(tripInfo.dropDate)}
                </span>
              </>
            )}
            <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
            <span>{isLocal ? "Chauffeur-Driven Local Hourly Rental" : "Chauffeur-Driven Outstation"}</span>
            <Link 
              href={`/outstation/select-vehicle?from=${encodeURIComponent(displayFrom)}&to=${encodeURIComponent(displayTo)}${tripInfo.stops ? `&stops=${encodeURIComponent(tripInfo.stops)}` : ''}&tripType=${encodeURIComponent(tripInfo.tripType)}&serviceType=${encodeURIComponent(tripInfo.serviceType || 'OUTSTATION')}&pickupDate=${encodeURIComponent(tripInfo.date || '')}&pickupTime=${encodeURIComponent(tripInfo.time || '')}${tripInfo.dropDate ? `&dropDate=${encodeURIComponent(tripInfo.dropDate)}` : ''}`} 
              className="text-white hover:text-blue-100 hover:underline flex items-center gap-1 font-bold ml-2 bg-white/15 px-2 py-0.5 rounded border border-white/25 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> {t("modify_trip")}
            </Link>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <Link href="/outstation/select-vehicle" className={`hover:text-white transition-colors ${activeStep === 1 ? 'text-white border-b-2 border-white pb-0.5 font-black' : 'text-blue-200'}`}>
            1. {t("select_vehicle")}
          </Link>
          <ChevronRight className="w-4 h-4 text-blue-300" />
          
          <span className={`${activeStep === 2 ? 'text-white border-b-2 border-white pb-0.5 font-black' : 'text-blue-200'}`}>
            2. {t("review_and_pay")}
          </span>
          <ChevronRight className="w-4 h-4 text-blue-300" />
          
          <span className={`${activeStep === 3 ? 'text-white border-b-2 border-white pb-0.5 font-black' : 'text-blue-200'}`}>
            3. {t("my_bookings")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SearchSummaryBar({ 
  activeStep = 1,
  overrideDistanceKm = null,
  overrideDuration = null,
  overrideFrom = null,
  overrideTo = null
}) {
  return (
    <Suspense fallback={
      <div className="bg-[#0082fe] text-white py-6 px-6 text-sm font-bold">
        Loading trip summary...
      </div>
    }>
      <SearchSummaryContent 
        activeStep={activeStep} 
        overrideDistanceKm={overrideDistanceKm}
        overrideDuration={overrideDuration}
        overrideFrom={overrideFrom}
        overrideTo={overrideTo}
      />
    </Suspense>
  );
}
