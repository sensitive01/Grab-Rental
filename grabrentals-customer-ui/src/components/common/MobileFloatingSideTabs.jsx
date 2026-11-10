"use client";

import Link from "next/link";
import { PawPrint, CarFront, Zap } from "lucide-react";

export default function MobileFloatingSideTabs() {
  const vendorUrl = process.env.NEXT_PUBLIC_VENDOR_PORTAL_URL || "https://vendor.grabrentals.in/";

  return (
    <div className="notranslate fixed right-0 top-1/2 -translate-y-1/2 z-40 md:hidden flex flex-col items-end gap-2.5 pointer-events-auto select-none" translate="no">
      
      {/* 1. Attach My Cabs Tab (Leads to Vendor Portal) */}
      <a
        href={vendorUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col items-center bg-gradient-to-b from-[#0082fe] via-blue-700 to-blue-900 text-white rounded-l-2xl py-3 pl-2.5 pr-1 shadow-2xl border-y border-l border-white/30 active:scale-95 transition-all duration-200"
        aria-label="Attach My Cabs - Partner with Grab Rentals"
      >
        <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider whitespace-nowrap my-1">
          Attach Cabs
        </span>
        <div className="mt-1 w-5.5 h-5.5 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <CarFront className="w-3 h-3 text-white" />
        </div>
      </a>

      {/* 2. EV Cabs Tab (Leads to /ev-cabs) */}
      <Link
        href="/ev-cabs"
        className="group flex flex-col items-center bg-gradient-to-b from-yellow-400 via-lime-500 to-emerald-600 text-white rounded-l-2xl py-3 pl-2.5 pr-1 shadow-2xl border-y border-l border-white/35 active:scale-95 transition-all duration-200"
        aria-label="EV Cabs - Zero Emission Electric Mobility"
      >
        <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider whitespace-nowrap my-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
          EV Cabs
        </span>
        <div className="mt-1 w-5.5 h-5.5 rounded-full bg-black/25 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Zap className="w-3 h-3 text-yellow-200 fill-yellow-200" />
        </div>
      </Link>

      {/* 3. Pet Friendly Cabs Tab (Leads to /pet-friendly-cabs) */}
      <Link
        href="/pet-friendly-cabs"
        className="group flex flex-col items-center bg-gradient-to-b from-red-600 via-rose-600 to-orange-600 text-white rounded-l-2xl py-3 pl-2.5 pr-1 shadow-2xl border-y border-l border-white/30 active:scale-95 transition-all duration-200"
        aria-label="Pet Friendly Cabs"
      >
        <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider whitespace-nowrap my-1">
          Pet Friendly
        </span>
        <div className="mt-1 w-5.5 h-5.5 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <PawPrint className="w-3 h-3 text-white" />
        </div>
      </Link>

    </div>
  );
}
