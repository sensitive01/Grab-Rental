"use client";

import Image from "next/image";
import Link from "next/link";
import { FLEET_CATEGORIES } from "@/lib/fleetData";
import { 
  Users, 
  Briefcase, 
  Fuel, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Car
} from "lucide-react";

export default function FleetIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero Header with Image */}
      <section className="relative bg-slate-900 text-white py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image 
            src="/images/hero-bg.jpg" 
            alt="Grab Rentals Premium Fleet" 
            fill 
            priority
            className="object-cover" 
          />
        </div>
        <div className="relative max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            Certified Commercial Fleet 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Our Premium Chauffeur Fleet</h1>
          <p className="text-slate-300 font-medium max-w-2xl mx-auto text-base">
            From executive business sedans to 55-seater Volvo luxury coaches. Every vehicle is GPS monitored, commercially licensed (Yellow Board), and sanitized before dispatch.
          </p>
        </div>
      </section>

      {/* 2. Fleet Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FLEET_CATEGORIES.map((fleet) => (
            <div 
              key={fleet.slug}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all group"
            >
              {/* Fleet Image with Badge */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <Image 
                  src={fleet.image} 
                  alt={fleet.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                {fleet.badge && (
                  <div className="absolute top-4 left-4 bg-brand-orange text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    {fleet.badge}
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-xl border border-white/20">
                  {fleet.price}
                </div>
              </div>

              {/* Fleet Content */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-900">{fleet.name}</h3>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{fleet.popularName}</p>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{fleet.desc}</p>
                </div>

                {/* Key Specs Pills */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Users className="w-4 h-4 text-brand-amber" />
                    <span>{fleet.seatingCapacity} Seats</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Briefcase className="w-4 h-4 text-brand-amber" />
                    <span>Luggage Boot</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Fuel className="w-4 h-4 text-brand-amber" />
                    <span>{fleet.alternateFuel}</span>
                  </div>
                </div>

                {/* Features Highlights Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {fleet.features.slice(0, 4).map((f, i) => (
                    <span key={i} className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                      {f}
                    </span>
                  ))}
                  <span className="text-[11px] font-bold text-brand-amber bg-amber-50 px-2.5 py-1 rounded-lg">
                    +{fleet.features.length - 4} more features
                  </span>
                </div>

                {/* CTA Bar */}
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href={`/fleet/${fleet.slug}`}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-black text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View Specifications</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/?fleet=${fleet.slug}`}
                    className="flex-1 py-3 px-4 rounded-xl bg-brand-navy hover:bg-slate-800 text-white text-xs font-black text-center transition-all flex items-center justify-center gap-1 shadow-md"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
