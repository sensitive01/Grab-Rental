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
    <div className="space-y-3 pb-2">
      {/* Breadcrumb */}
      <div className="text-[11px] text-slate-500 font-medium">
        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
        <span className="mx-1.5 text-slate-400">&gt;</span>
        <span className="text-slate-800 font-bold">{t("select_vehicle")}</span>
      </div>

      {/* Main Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full inline-block mb-1">
            {isLocal ? "Local Hourly Rental" : isAirport ? "Airport Transfer" : t("confirmed_route")}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
            <span>{from}</span>
            {isLocal ? (
              <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg text-sm sm:text-base font-bold border border-amber-200">
                Package: {packageLabel}
              </span>
            ) : (
              <>
                {stopsList.map((stop, idx) => (
                  <span key={idx} className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg text-sm sm:text-base font-bold border border-amber-200">
                      Via: {stop.split(",")[0].trim()}
                    </span>
                  </span>
                ))}
                {isAirport ? (
                  <Plane className="w-5 h-5 text-amber-600 shrink-0" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <span>{to}</span>
              </>
            )}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-5 sm:gap-8 text-xs sm:text-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              {isLocal ? "Service" : isAirport ? "Airport Trip" : (tripType.toLowerCase().includes("round") ? t("round_trip") : t("one_way"))}
            </span>
            <span className="font-extrabold text-slate-800">
              {isLocal ? "Hourly Package" : isAirport ? (tripType || "Airport Transfer") : tripType}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("pickup_date")}</span>
            <span className="font-extrabold text-slate-800">{date}</span>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("pickup_time")}</span>
            <span className="font-extrabold text-slate-800">{time}</span>
          </div>

          {!isLocal && tripType.toLowerCase().includes("round") && returnDate ? (
            <>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 block">{t("return_date") || "Return Date"}</span>
                <span className="font-extrabold text-slate-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md inline-block">
                  {returnDate}
                </span>
              </div>
            </>
          ) : null}

          {isLocal ? (
            <>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Included Coverage</span>
                <span className="font-extrabold text-slate-800">{packageLabel}</span>
              </div>
            </>
          ) : isAirport ? (
            <>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Flight Support</span>
                <span className="font-extrabold text-slate-800">Tracking Included</span>
              </div>
            </>
          ) : distanceKm > 0 ? (
            <>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Distance</span>
                <span className="font-extrabold text-slate-800">{distanceKm} km</span>
              </div>
            </>
          ) : null}

          <button
            type="button"
            onClick={onModifyClick}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:border-amber-500 hover:bg-amber-50/50 text-slate-800 hover:text-amber-700 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ml-auto sm:ml-0"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-600" /> {t("modify_trip")}
          </button>
        </div>
      </div>
    </div>
  );
}
