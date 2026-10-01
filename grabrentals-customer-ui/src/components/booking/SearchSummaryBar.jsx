"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { ChevronRight, Edit2, ShieldCheck, MapPin } from "lucide-react";
import Link from "next/link";

function SearchSummaryContent({ activeStep = 1 }) {
  const searchParams = useSearchParams();
  const [tripInfo, setTripInfo] = useState({
    from: searchParams?.get("from") || "Bangalore",
    to: searchParams?.get("to") || "Coimbatore",
    stops: searchParams?.get("stops") || "",
    tripType: searchParams?.get("tripType") || "One way",
    date: searchParams?.get("pickupDate") || "28-09-2026",
    time: searchParams?.get("pickupTime") || "07:00 AM",
    distanceKm: 365,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedBooking = sessionStorage.getItem("grab_selected_booking");
        if (storedBooking) {
          const parsed = JSON.parse(storedBooking);
          if (parsed.trip) {
            setTripInfo({
              from: parsed.trip.from || "Bangalore",
              to: parsed.trip.to || "Coimbatore",
              stops: parsed.trip.stops || "",
              tripType: parsed.trip.tripType || "One way",
              date: parsed.trip.date || "28-09-2026",
              time: parsed.trip.time || "07:00 AM",
              distanceKm: parsed.distanceKm || 365,
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
            distanceKm: parsed.distanceKm || 365,
          });
        }
      } catch (err) {
        console.warn("Could not parse session trip in SearchSummaryBar", err);
      }
    }
  }, []);

  const cleanCity = (str) => (str ? str.split(",")[0].trim() : "");

  return (
    <div className="bg-white border-b border-slate-200 sticky top-20 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex flex-col gap-1.5">
          {/* Trip Summary Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-slate-900 text-base sm:text-lg">{cleanCity(tripInfo.from)}</span>
            {tripInfo.stops && (
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Via {tripInfo.stops.replace(/\|/g, ", ")}
              </span>
            )}
            <span className="text-slate-400 font-bold">→</span>
            <span className="font-black text-slate-900 text-base sm:text-lg">{cleanCity(tripInfo.to)}</span>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md ml-1 capitalize">
              {tripInfo.tripType} • {tripInfo.distanceKm} km
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span>{tripInfo.date} • {tripInfo.time}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Chauffeur-Driven Outstation</span>
            <Link 
              href={`/outstation/select-vehicle?from=${encodeURIComponent(tripInfo.from)}&to=${encodeURIComponent(tripInfo.to)}${tripInfo.stops ? `&stops=${encodeURIComponent(tripInfo.stops)}` : ''}&tripType=${encodeURIComponent(tripInfo.tripType)}`} 
              className="text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1 font-bold ml-2"
            >
              <Edit2 className="w-3.5 h-3.5" /> Modify
            </Link>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-black uppercase tracking-wider">
          <Link href="/outstation/select-vehicle" className={`hover:text-amber-600 transition-colors ${activeStep === 1 ? 'text-amber-600 border-b-2 border-amber-600 pb-1' : 'text-slate-400'}`}>
            1. Select Vehicle
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          
          <span className={`${activeStep === 2 ? 'text-amber-600 border-b-2 border-amber-600 pb-1' : 'text-slate-400'}`}>
            2. Review & Pay
          </span>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          
          <span className={`${activeStep === 3 ? 'text-amber-600 border-b-2 border-amber-600 pb-1' : 'text-slate-400'}`}>
            3. Confirmation
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SearchSummaryBar({ activeStep = 1 }) {
  return (
    <>
      <Suspense fallback={
        <div className="bg-white border-b border-slate-200 py-6 px-6 text-sm text-slate-400 font-bold">
          Loading trip summary...
        </div>
      }>
        <SearchSummaryContent activeStep={activeStep} />
      </Suspense>

      {/* Dynamic Highway Guarantee Banner */}
      <div className="bg-slate-900 text-slate-300 text-[11px] font-bold py-2 px-6 flex justify-between items-center tracking-wide uppercase border-b-2 border-amber-500">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guaranteed AC Cab • 24x7 Breakdown Coverage • Verified Commercial Chauffeur</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Zero Cancellation Guarantee</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Live Telemetry Tracking</span>
          </div>
        </div>
      </div>
    </>
  );
}
