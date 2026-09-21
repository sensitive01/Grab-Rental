"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight, Edit2, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";

function SearchSummaryContent({ activeStep = 1 }) {
  const searchParams = useSearchParams();
  const fromCity = searchParams?.get("from") || "Bangalore";
  const toCity = searchParams?.get("to") || "Ooty";
  const stopsParam = searchParams?.get("stops");
  const stops = stopsParam ? stopsParam.split("|").filter(Boolean) : [];
  const tripType = searchParams?.get("tripType") || "one-way";
  const date = searchParams?.get("date") || "Wed, 15 Oct";
  const time = searchParams?.get("time") || "06:00 AM";

  return (
    <div className="bg-white border-b border-slate-200 sticky top-20 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex flex-col gap-1.5">
          {/* Trip Summary Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-slate-900 text-lg">{fromCity}</span>
            {stops.map((stop, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">→</span>
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-xs">
                  Via {stop}
                </span>
              </span>
            ))}
            <span className="text-slate-400 font-bold">→</span>
            <span className="font-extrabold text-slate-900 text-lg">{toCity}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded ml-1 capitalize">
              {tripType.replace(/-/g, " ")} • 275 Km included
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <span>{date} • {time}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>4 Travelers</span>
            <Link href="/" className="text-brand-sky-dark hover:text-brand-navy-dark hover:underline flex items-center gap-1 transition-colors ml-2">
              <Edit2 className="w-3.5 h-3.5" /> Modify
            </Link>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-black uppercase tracking-wider">
          <Link href="/outstation/select-vehicle" className={`hover:text-brand-amber transition-colors ${activeStep === 1 ? 'text-brand-amber border-b-2 border-brand-amber pb-1' : 'text-slate-400'}`}>
            1. Select Vehicle
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          
          <Link href="/outstation/trip-details" className={`hover:text-brand-amber transition-colors ${activeStep === 2 ? 'text-brand-amber border-b-2 border-brand-amber pb-1' : 'text-slate-400'}`}>
            2. Trip Details & Add-ons
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          
          <Link href="/outstation/review-pay" className={`hover:text-brand-amber transition-colors ${activeStep === 3 ? 'text-brand-amber border-b-2 border-brand-amber pb-1' : 'text-slate-400'}`}>
            3. Review & Pay
          </Link>
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

      {/* Highway Advisory Banner */}
      <div className="bg-brand-navy-dark text-slate-300 text-[11px] font-bold py-2 px-6 flex justify-between items-center tracking-wide uppercase border-b-2 border-brand-amber">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-brand-amber" />
            <span>Route: Mysore Expressway <ChevronRight className="w-3 h-3 inline mx-0.5 opacity-50" /> Bandipur Tiger Reserve <ChevronRight className="w-3 h-3 inline mx-0.5 opacity-50" /> Nilgiri Ghats (36 Hairpin Bends)</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" /> Tolls Pre-Included</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" /> Ghat-Certified Chauffeurs</span>
          </div>
        </div>
      </div>
    </>
  );
}

