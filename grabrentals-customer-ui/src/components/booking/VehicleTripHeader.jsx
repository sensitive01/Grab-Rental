import Link from "next/link";
import { Edit3, MapPin, ArrowRight } from "lucide-react";

export default function VehicleTripHeader({
  from = "Bangalore",
  to = "Coimbatore",
  stops = "",
  tripType = "One way",
  date = "28-09-2026",
  time = "7:00 AM",
  onModifyClick
}) {
  const stopsList = Array.isArray(stops)
    ? stops.filter(Boolean)
    : (typeof stops === "string" && stops.trim() ? stops.split(/[|,]/).map(s => s.trim()).filter(Boolean) : []);

  return (
    <div className="space-y-3 pb-2">
      {/* Breadcrumb */}
      <div className="text-[11px] text-slate-500 font-medium">
        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
        <span className="mx-1.5 text-slate-400">&gt;</span>
        <span className="text-slate-800 font-bold">Select Vehicle</span>
      </div>

      {/* Main Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full inline-block mb-1">
            Confirmed Route
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
            <span>{from}</span>
            {stopsList.map((stop, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg text-sm sm:text-base font-bold border border-amber-200">
                  Via: {stop.split(",")[0].trim()}
                </span>
              </span>
            ))}
            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
            <span>{to}</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-5 sm:gap-8 text-xs sm:text-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Trip Type</span>
            <span className="font-extrabold text-slate-800">{tripType}</span>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pick up</span>
            <span className="font-extrabold text-slate-800">{date}</span>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Time</span>
            <span className="font-extrabold text-slate-800">{time}</span>
          </div>

          <button
            type="button"
            onClick={onModifyClick}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:border-amber-500 hover:bg-amber-50/50 text-slate-800 hover:text-amber-700 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ml-auto sm:ml-0"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-600" /> Modify Trip
          </button>
        </div>
      </div>
    </div>
  );
}
