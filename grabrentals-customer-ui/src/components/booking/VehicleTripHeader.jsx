"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Edit3, MapPin, ArrowRight, Plane } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function VehicleTripHeader({
  from = "Bangalore",
  to = "Coimbatore",
  stops = "",
  tripType = "One way",
  date = "28-09-2026",
  time = "7:00 AM",
  returnDate = null,
  distanceKm,
  tollPrice,
  duration,
  serviceType = "OUTSTATION",
  onModifyClick
}) {
  const { t } = useLanguage();
  const stopsList = Array.isArray(stops)
    ? stops.filter(Boolean)
    : (typeof stops === "string" && stops.trim() ? stops.split("|").map(s => s.trim()).filter(Boolean) : []);

  const isLocal = serviceType === "LOCAL" || to.toLowerCase().includes("hr") || tripType.toLowerCase().includes("local");
  const isAirport = serviceType === "AIRPORT" || tripType.toLowerCase().includes("airport") || from.toLowerCase().includes("airport") || to.toLowerCase().includes("airport");

  const formatPackageLabel = (pkgStr) => {
    if (!pkgStr) return "8 Hours / 80 Kms";
    const lower = pkgStr.toLowerCase();
    if (lower.includes("4hr") || lower.includes("40")) return "4 Hours / 40 Kms";
    if (lower.includes("12hr") || lower.includes("120")) return "12 Hours / 120 Kms";
    if (lower.includes("8hr") || lower.includes("80")) return "8 Hours / 80 Kms";
    return pkgStr;
  };

  const packageLabel = formatPackageLabel(to);

  const [headerHeight, setHeaderHeight] = useState(140);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const updateHeight = () => {
      if (cardRef.current) {
        setHeaderHeight(cardRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [from, to, stops, tripType, date, time]);

  return (
    <div className="space-y-0 sm:space-y-2">
      {/* Breadcrumb - desktop only */}
      <div className="hidden sm:block text-[11px] text-slate-500 font-medium px-0.5 mb-2">
        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
        <span className="mx-1.5 text-slate-400">&gt;</span>
        <span className="text-slate-800 font-bold">{t("select_vehicle")}</span>
      </div>

      {/* Mobile Spacer so vehicle cards start directly below the fixed route header */}
      <div
        className="block sm:hidden w-full shrink-0"
        style={{ height: `${headerHeight}px` }}
        aria-hidden="true"
      />

      {/* Confirmed Route Section: Fixed on Mobile under navbar, Static on Desktop */}
      <div
        ref={cardRef}
        className="fixed left-0 right-0 z-30 pt-0 px-2 sm:px-0 pb-1 sm:pb-0 bg-transparent sm:static sm:z-auto transform-gpu"
        style={{ top: "var(--app-header-height, 93px)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0082fe] rounded-b-2xl rounded-t-none sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-md sm:shadow-sm text-white space-y-2.5 lg:space-y-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
          
          {/* Top Row / Left Column: Route Title & Modify Button on Mobile/Tablet */}
          <div className="flex items-start justify-between gap-2.5 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-900 bg-white/25 border border-white/30 px-2.5 py-0.5 rounded-full inline-block mb-1">
                {isLocal ? "Local Hourly Rental" : isAirport ? "Airport Transfer" : t("confirmed_route")}
              </span>
              <h1 className="text-base sm:text-2xl font-black text-white tracking-tight flex flex-wrap items-center gap-1.5 sm:gap-2 leading-snug">
                <span className="truncate">{from}</span>
                {isLocal ? (
                  <span className="text-white bg-white/20 px-2 py-0.5 rounded-lg text-xs sm:text-base font-bold border border-white/30">
                    Package: {packageLabel}
                  </span>
                ) : (
                  <>
                    {stopsList.map((stop, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 shrink-0" />
                        <span className="text-white bg-white/20 px-1.5 py-0.5 rounded-lg text-xs sm:text-base font-bold border border-white/30 truncate max-w-[120px]">
                          {stop.split(",")[0].trim()}
                        </span>
                      </span>
                    ))}
                    {isAirport ? (
                      <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 shrink-0" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80 shrink-0" />
                    )}
                    <span className="truncate">{to}</span>
                    {!isAirport && (tripType || "").toLowerCase().includes("round") && (
                      <>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80 shrink-0" />
                        <span className="truncate">{from}</span>
                      </>
                    )}
                  </>
                )}
              </h1>
            </div>

            {/* Mobile/Tablet Modify Trip Button */}
            <button
              type="button"
              onClick={onModifyClick}
              className="lg:hidden px-2.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#0082fe] font-extrabold text-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              <Edit3 className="w-3 h-3 text-[#0082fe]" />
              <span>{t("modify_trip")}</span>
            </button>
          </div>

          {/* Bottom Row / Right Column: Trip Badges + Desktop Modify Button */}
          <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2.5 md:gap-3.5 lg:gap-3 xl:gap-4 text-xs sm:text-sm w-full lg:w-auto py-0.5 pr-9 sm:pr-0 shrink-0">
            <div className="flex-1 sm:flex-none min-w-0 bg-white/15 sm:bg-transparent px-1.5 sm:px-0 py-1 sm:py-0 rounded-lg sm:rounded-none text-center sm:text-left">
              <span className="text-[8.5px] sm:text-[9.5px] lg:text-[10px] uppercase font-bold text-white/80 block leading-tight truncate">
                {isLocal ? "Service" : isAirport ? "Airport Trip" : (tripType.toLowerCase().includes("round") ? t("round_trip") : t("one_way"))}
              </span>
              <span className="font-extrabold text-white text-[11px] sm:text-xs lg:text-sm block truncate">
                {isLocal ? "Hourly" : isAirport ? (tripType || "Transfer") : (tripType.toLowerCase().includes("round") ? "RoundTrip" : "OneWay")}
              </span>
            </div>

            <div className="hidden sm:block h-6 sm:h-7 w-px bg-white/25 shrink-0"></div>

            <div className="flex-1 sm:flex-none min-w-0 bg-white/15 sm:bg-transparent px-1.5 sm:px-0 py-1 sm:py-0 rounded-lg sm:rounded-none text-center sm:text-left">
              <span className="text-[8.5px] sm:text-[9.5px] lg:text-[10px] uppercase font-bold text-white/80 block leading-tight truncate">{t("pickup_date")}</span>
              <span className="font-extrabold text-white text-[11px] sm:text-xs lg:text-sm block truncate" suppressHydrationWarning>{date}</span>
            </div>

            <div className="hidden sm:block h-6 sm:h-7 w-px bg-white/25 shrink-0"></div>

            <div className="flex-1 sm:flex-none min-w-0 bg-white/15 sm:bg-transparent px-1.5 sm:px-0 py-1 sm:py-0 rounded-lg sm:rounded-none text-center sm:text-left">
              <span className="text-[8.5px] sm:text-[9.5px] lg:text-[10px] uppercase font-bold text-white/80 block leading-tight truncate">{t("pickup_time")}</span>
              <span className="font-extrabold text-white text-[11px] sm:text-xs lg:text-sm block truncate" suppressHydrationWarning>{time}</span>
            </div>

            {!isLocal && tripType.toLowerCase().includes("round") && returnDate ? (
              <>
                <div className="hidden sm:block h-6 sm:h-7 w-px bg-white/25 shrink-0"></div>
                <div className="flex-1 sm:flex-none min-w-0 bg-white/15 sm:bg-transparent px-1.5 sm:px-0 py-1 sm:py-0 rounded-lg sm:rounded-none text-center sm:text-left">
                  <span className="text-[8.5px] sm:text-[9.5px] lg:text-[10px] uppercase font-bold text-white/80 block leading-tight truncate">{t("return_date") || "Return Date"}</span>
                  <span className="font-extrabold text-white text-[11px] sm:text-xs lg:text-sm block truncate" suppressHydrationWarning>
                    {returnDate}
                  </span>
                </div>
              </>
            ) : null}

            {isLocal ? (
              <>
                <div className="hidden sm:block h-6 sm:h-7 w-px bg-white/25 shrink-0"></div>
                <div className="flex-1 sm:flex-none min-w-0 bg-white/15 sm:bg-transparent px-1.5 sm:px-0 py-1 sm:py-0 rounded-lg sm:rounded-none text-center sm:text-left">
                  <span className="text-[8.5px] sm:text-[9.5px] lg:text-[10px] uppercase font-bold text-white/80 block leading-tight truncate">Coverage</span>
                  <span className="font-extrabold text-white text-[11px] sm:text-xs lg:text-sm block truncate">{packageLabel}</span>
                </div>
              </>
            ) : isAirport ? (
              <>
                <div className="hidden sm:block h-6 sm:h-7 w-px bg-white/25 shrink-0"></div>
                <div className="flex-1 sm:flex-none min-w-0 bg-white/15 sm:bg-transparent px-1.5 sm:px-0 py-1 sm:py-0 rounded-lg sm:rounded-none text-center sm:text-left">
                  <span className="text-[8.5px] sm:text-[9.5px] lg:text-[10px] uppercase font-bold text-white/80 block leading-tight truncate">Flight</span>
                  <span className="font-extrabold text-white text-[11px] sm:text-xs lg:text-sm block truncate">Tracking</span>
                </div>
              </>
            ) : distanceKm > 0 ? (
              <>
                <div className="hidden sm:block h-6 sm:h-7 w-px bg-white/25 shrink-0"></div>
                <div className="flex-1 sm:flex-none min-w-0 bg-white/15 sm:bg-transparent px-1.5 sm:px-0 py-1 sm:py-0 rounded-lg sm:rounded-none text-center sm:text-left">
                  <span className="text-[8.5px] sm:text-[9.5px] lg:text-[10px] uppercase font-bold text-white/80 block leading-tight truncate">Distance</span>
                  <span className="font-extrabold text-white text-[11px] sm:text-xs lg:text-sm block truncate">{distanceKm} km</span>
                </div>
              </>
            ) : null}

            {/* Desktop Modify Trip Button */}
            <button
              type="button"
              onClick={onModifyClick}
              className="hidden lg:flex px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-[#0082fe] font-extrabold text-xs transition-all items-center gap-1.5 cursor-pointer shadow-sm ml-2 xl:ml-3 shrink-0 active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#0082fe]" /> {t("modify_trip")}
            </button>
          </div>

        </div>
        </div>
      </div>
    </div>
  );
}
