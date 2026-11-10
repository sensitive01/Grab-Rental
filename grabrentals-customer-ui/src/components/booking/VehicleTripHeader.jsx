"use client";

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

  const getTripBadgeLabel = () => {
    if (isLocal) return "Local";
    if (isAirport) return "Airport";
    const lowerType = (tripType || "").toLowerCase();
    if (lowerType.includes("round")) return "Round Trip";
    if (lowerType.includes("multi")) return "MultiCity";
    return "One Way";
  };

  const formatPackageLabel = (pkgStr) => {
    if (!pkgStr) return "8 Hours / 80 Kms";
    const lower = pkgStr.toLowerCase();
    if (lower.includes("4hr") || lower.includes("40")) return "4 Hours / 40 Kms";
    if (lower.includes("12hr") || lower.includes("120")) return "12 Hours / 120 Kms";
    if (lower.includes("8hr") || lower.includes("80")) return "8 Hours / 80 Kms";
    return pkgStr;
  };

  const packageLabel = formatPackageLabel(to);

  return (
    <>
      {/* Breadcrumb - desktop only */}
      <div className="hidden sm:block text-[11px] text-slate-500 font-medium px-0.5 mb-2">
        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
        <span className="mx-1.5 text-slate-400">&gt;</span>
        <span className="text-slate-800 font-bold">{t("select_vehicle")}</span>
      </div>

      {/* Confirmed Route Section: Fixed/Sticky on both Mobile & Desktop while scrolling */}
      <div
        className="sticky left-0 right-0 z-30 pt-0 sm:pt-1 pb-1.5 sm:pb-2 -mx-2 sm:mx-0 px-2 sm:px-0 bg-slate-50/95 backdrop-blur-md transform-gpu transition-all"
        style={{ top: "var(--app-header-height, 93px)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0082fe] rounded-b-2xl rounded-t-none sm:rounded-2xl p-2.5 sm:p-4 lg:p-5 shadow-md text-white flex flex-col lg:flex-row lg:items-center justify-between gap-1 sm:gap-2 lg:gap-4">
          
          {/* Top Row / Left Column: Route Title & Modify Button on Mobile/Tablet */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-900 bg-white/25 border border-white/30 px-2.5 py-0.5 rounded-full inline-block">
                {getTripBadgeLabel()}
              </span>

              {/* Mobile/Tablet Modify Trip Button */}
              <button
                type="button"
                onClick={onModifyClick}
                className="lg:hidden px-2.5 py-1 rounded-xl bg-white hover:bg-blue-50 text-[#0082fe] font-extrabold text-[11px] sm:text-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs active:scale-95"
              >
                <Edit3 className="w-3 h-3 text-[#0082fe]" />
                <span>{t("modify_trip")}</span>
              </button>
            </div>

            <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black text-white tracking-tight flex items-center gap-1.5 sm:gap-2 leading-snug min-w-0 flex-nowrap overflow-hidden">
              <span className="truncate min-w-0 shrink">{from}</span>
              {isLocal ? (
                <span className="text-white bg-white/20 px-2 py-0.5 rounded-lg text-xs sm:text-base font-bold border border-white/30 shrink-0">
                  Package: {packageLabel}
                </span>
              ) : (
                <>
                  {stopsList.map((stop, idx) => (
                    <span key={idx} className="flex items-center gap-1 shrink min-w-0">
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 shrink-0" />
                      <span className="text-white bg-white/20 px-1.5 py-0.5 rounded-lg text-xs sm:text-base font-bold border border-white/30 truncate max-w-[100px] sm:max-w-[120px]">
                        {stop.split(",")[0].trim()}
                      </span>
                    </span>
                  ))}
                  {isAirport ? (
                    <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 shrink-0" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80 shrink-0" />
                  )}
                  <span className="truncate min-w-0 shrink">{to}</span>
                  {!isAirport && (tripType || "").toLowerCase().includes("round") && (
                    <>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80 shrink-0" />
                      <span className="truncate min-w-0 shrink">{from}</span>
                    </>
                  )}
                </>
              )}
            </h1>
          </div>

          {/* Bottom Row / Right Column: Single-Line Trip Schedule + Desktop Modify Button */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm w-full lg:w-auto shrink-0">
            <div className="notranslate flex items-center flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs lg:text-sm font-extrabold text-white whitespace-nowrap" translate="no" suppressHydrationWarning>
              <span>
                {!isLocal && tripType.toLowerCase().includes("round") && returnDate
                  ? `${date} ${time} at ${returnDate}`
                  : `${date} At ${time}`}
              </span>

              {isLocal ? (
                <>
                  <span className="text-white/40">•</span>
                  <span>{packageLabel}</span>
                </>
              ) : isAirport ? (
                <>
                  <span className="text-white/40">•</span>
                  <span>Flight Tracking</span>
                </>
              ) : distanceKm > 0 ? (
                <>
                  <span className="text-white/40">•</span>
                  <span>{distanceKm} km</span>
                </>
              ) : null}
            </div>

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
    </>
  );
}
