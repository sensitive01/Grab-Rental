"use client";

import Link from "next/link";
import { PawPrint, CarFront, ArrowRight } from "lucide-react";

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

    </div>
  );
}
