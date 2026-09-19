import { ChevronRight, Edit2, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function SearchSummaryBar({ activeStep = 1 }: { activeStep?: number }) {
  return (
    <>
      <div className="bg-white border-b border-slate-200 sticky top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex flex-col gap-1.5">
            {/* Trip Summary Bar */}
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-slate-900 text-lg">Bangalore → Ooty</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">
                One Way • 275 Km included
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
              <span>Wed, 15 Oct • 06:00 AM</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>4 Travelers</span>
              <button className="text-brand-sky-dark hover:text-brand-navy-dark hover:underline flex items-center gap-1 transition-colors ml-2">
                <Edit2 className="w-3.5 h-3.5" /> Modify
              </button>
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
