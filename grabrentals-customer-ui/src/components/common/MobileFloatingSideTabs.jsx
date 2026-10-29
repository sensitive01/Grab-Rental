"use client";

import Link from "next/link";
import { PawPrint, CarFront, PhoneCall, ArrowRight } from "lucide-react";

export default function MobileFloatingSideTabs() {
  const vendorUrl = process.env.NEXT_PUBLIC_VENDOR_PORTAL_URL || "https://vendor.grabrentals.in/";

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 md:hidden flex flex-col items-end gap-2.5 pointer-events-auto select-none">
      
      {/* 1. Attach My Cabs Tab (Leads to Vendor Portal) */}
      <a
        href={vendorUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col items-center bg-gradient-to-b from-[#0082fe] via-blue-700 to-blue-900 text-white rounded-l-2xl py-3 px-2 shadow-2xl border-y border-l border-white/25 active:scale-95 transition-all duration-200"
        aria-label="Attach My Cabs - Partner with Grab Rentals"
      >
        <span className="w-5 h-5 rounded-full bg-black/35 flex items-center justify-center mb-1 group-hover:bg-black/50 transition-colors">
          <ArrowRight className="w-3 h-3 text-white -rotate-90" />
        </span>
        <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider whitespace-nowrap my-1">
          Attach Cabs
        </span>
        <div className="mt-1 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <CarFront className="w-3.5 h-3.5 text-white" />
        </div>
      </a>

      {/* 2. Pet Friendly Cabs Tab (Leads to /pet-friendly-cabs) */}
      <Link
        href="/pet-friendly-cabs"
        className="group flex flex-col items-center bg-gradient-to-b from-red-600 via-rose-600 to-orange-600 text-white rounded-l-2xl py-3 px-2 shadow-2xl border-y border-l border-white/25 active:scale-95 transition-all duration-200"
        aria-label="Pet Friendly Cabs"
      >
        <span className="w-5 h-5 rounded-full bg-black/35 flex items-center justify-center mb-1 group-hover:bg-black/50 transition-colors">
          <ArrowRight className="w-3 h-3 text-white -rotate-90" />
        </span>
        <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider whitespace-nowrap my-1">
          Pet Friendly
        </span>
        <div className="mt-1 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <PawPrint className="w-3.5 h-3.5 text-white" />
        </div>
      </Link>

      {/* Quick Action Contact Pills */}
      <div className="flex flex-col gap-1.5 items-end">
        {/* 3. WhatsApp Quick Chat Button */}
        <a
          href="https://wa.me/919071100200?text=Hi%20Grab%20Rentals,%20I%20have%20an%20enquiry%20regarding%20booking%20a%20cab%20or%20bus."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 rounded-l-xl bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl active:scale-90 transition-transform border-y border-l border-emerald-400/40"
          aria-label="Chat on WhatsApp with Grab Rentals"
        >
          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>

        {/* 4. Instant Phone Call Button */}
        <a
          href="tel:+919071100200"
          className="flex items-center justify-center w-10 h-10 rounded-l-xl bg-slate-900 hover:bg-black text-white shadow-xl active:scale-90 transition-transform border-y border-l border-slate-700"
          aria-label="Call 24/7 Helpline"
        >
          <PhoneCall className="w-4.5 h-4.5 text-amber-400" />
        </a>
      </div>

    </div>
  );
}
