import { IndianRupee, Ban, Headphones, ShieldCheck } from "lucide-react";

export default function BookingTrustBanner() {
  return (
    <div className="bg-[#0F172A] text-white rounded-xl px-5 py-3.5 shadow-md border border-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-4 text-xs md:text-sm font-semibold">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-white">Book Now</span>
            <span className="block text-[11px] text-slate-300 font-normal">at Zero Upfront Cost</span>
          </div>
        </div>

        <div className="hidden sm:block h-7 w-px bg-slate-700/60"></div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Ban className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-white">Free Cancellations</span>
            <span className="block text-[11px] text-slate-300 font-normal">Upto 1 Hour before pickup</span>
          </div>
        </div>

        <div className="hidden sm:block h-7 w-px bg-slate-700/60"></div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4 text-sky-400" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-white">24x7 Chauffeur Helpline</span>
            <span className="block text-[11px] text-slate-300 font-normal">Dedicated On-Road Support</span>
          </div>
        </div>

      </div>
    </div>
  );
}
