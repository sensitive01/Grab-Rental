"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BookingWidget from "@/components/home/BookingWidget";
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Navigation,
  Compass,
  ArrowRight,
  ChevronRight,
  Car,
  X,
  Phone,
  MessageCircle,
  Flame,
  Award,
  Layers,
  Fuel,
  Info
} from "lucide-react";
import { SPECIAL_TOUR_PACKAGES, PACKAGE_CATEGORIES } from "@/lib/specialPackages";
import { useLanguage } from "@/context/LanguageContext";

export default function PackagesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("All Packages");
  const [activeModalPackage, setActiveModalPackage] = useState(null);

  const filteredPackages =
    selectedCategory === "All Packages"
      ? SPECIAL_TOUR_PACKAGES
      : SPECIAL_TOUR_PACKAGES.filter((p) => p.category === selectedCategory);

  const handleBookPackage = (pkg) => {
    if (typeof window !== "undefined") {
      const today = new Date().toISOString().split("T")[0];
      sessionStorage.setItem(
        "grab_pending_trip",
        JSON.stringify({
          from: pkg.from,
          to: pkg.to,
          package: pkg.id,
          packageName: pkg.name,
          tripType: "round-trip",
          serviceType: "OUTSTATION",
          distanceKm: pkg.distanceKm,
          durationText: pkg.duration,
          date: today,
          time: "07:00",
        })
      );
    }

    const params = new URLSearchParams({
      serviceType: "OUTSTATION",
      from: pkg.from,
      to: pkg.to,
      package: pkg.id,
      packageName: pkg.name,
      tripType: "round-trip",
    });
    router.push(`/outstation/select-vehicle?${params.toString()}`);
  };

  return (
    <main className="flex flex-col bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="text-white pt-6 sm:pt-8 md:pt-12 pb-28 sm:pb-36 md:pb-44 px-3 sm:px-4 lg:px-8 relative overflow-hidden flex flex-col items-center bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/images/customer-hero-banner.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/50 to-slate-950/90"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center mb-4 sm:mb-8 mt-1 sm:mt-2 md:mt-4">
          <div className="inline-flex items-center gap-2 bg-brand-navy-dark/80 backdrop-blur-md border border-amber-500/30 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-brand-amber mb-3 sm:mb-5 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-brand-amber" /> Special Roadtrip & Tour Packages
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-3 sm:mb-5 drop-shadow-2xl">
            Curated Special Tour & Travel Packages
          </h1>
          <p className="text-xs sm:text-base md:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto font-medium drop-shadow-md px-2">
            Multi-day scenic highway expeditions and curated roadtrips — Goa, Ladakh, Ooty, Coorg, and beyond. Fixed all-inclusive fares with seasoned highway chauffeurs and premium SUVs.
          </p>
        </div>
      </section>

      {/* Booking Widget (Pre-selected with Packages Tab) */}
      <section className="px-3 sm:px-4 md:px-6 relative z-20 -mt-20 sm:-mt-24 md:-mt-32 lg:-mt-36">
        <BookingWidget />
      </section>

      {/* Special Packages Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24 mb-20 w-full">
        {/* Section Title */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-100/80 mb-3 border border-amber-200">
            <Compass className="w-3.5 h-3.5 text-amber-600" /> Multi-Day Special Highway Circuits
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-2 sm:mb-3">
            Handcrafted Roadtrip & Holiday Packages
          </h2>
          <p className="text-xs sm:text-base text-slate-600 font-medium max-w-2xl mx-auto">
            All-inclusive transparent pricing. Every package covers your dedicated vehicle, expert chauffeur, all state border permits, Fastag tolls, and driver night allowances.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 sm:mb-12 no-scrollbar">
          {PACKAGE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-3xl border flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl group ${
                pkg.popular
                  ? "border-amber-400 ring-2 ring-amber-400/20 shadow-md"
                  : "border-slate-200 shadow-sm"
              }`}
            >
              {/* Card Image Banner */}
              <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-900">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {pkg.tag}
                  </span>
                  <span className="bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                    {pkg.category}
                  </span>
                </div>

                {/* Bottom Route & Duration */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    {pkg.heroBadge}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    {pkg.shortTitle}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                {/* Duration & Distance Stats Strip */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Navigation className="w-3.5 h-3.5 text-slate-500" />
                    <span>~{pkg.distanceKm} km (Circuit)</span>
                  </div>
                </div>

                {/* Route Waypoints */}
                <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-500" /> Route Waypoints
                  </div>
                  <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2">
                    {pkg.route}
                  </p>
                </div>

                {/* Key Highlights */}
                <div className="space-y-2 mb-5 flex-1">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Tour Highlights
                  </div>
                  {pkg.highlights.slice(0, 3).map((hl, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{hl}</span>
                    </div>
                  ))}
                </div>

                {/* All-Inclusive Guarantee Pills */}
                <div className="mb-5 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                    ✓ All State Taxes Paid
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                    ✓ Fastag Tolls Covered
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                    ✓ Driver Batta Included
                  </span>
                </div>

                {/* Price & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      All-Inclusive Package
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-amber-600">
                      {pkg.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModalPackage(pkg)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Itinerary
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBookPackage(pkg)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer hover:shadow-md"
                    >
                      <span>Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Guarantees Grid */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex gap-4 items-start">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Zero Hidden Taxes</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Interstate road permits, Fastag tolls, and driver night allowances are 100% covered upfront in your fare.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Highway & Ghat Tested</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Spacious Innova Crysta, Fortuner, and Ertiga fleets with heavy-duty AC, verified safety tires, and ample luggage space.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Flexible Sightseeing</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pause anytime for photography, authentic roadside dhaba meals, and scenic viewpoints without meter anxieties.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Top-Rated Chauffeurs</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verified commercial drivers with 8+ years of highway experience, polite conduct, and deep route expertise.
              </p>
            </div>
          </div>
        </div>

        {/* Custom Package Helpline CTA Banner */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              Need a Custom Tour Itinerary?
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Want a tailor-made roadtrip from your city?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Talk directly to our Tour Desk specialists for multi-state circuits, family functions, corporate retreats, or custom luxury tempo traveller packages.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
            <a
              href="tel:+919876543210"
              className="px-5 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4 text-amber-600" />
              <span>Call Tour Desk</span>
            </a>
            <a
              href="https://wa.me/919876543210?text=Hi%20GrabRentals,%20I%20am%20interested%20in%20a%20custom%20tour%20package"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Itinerary & Details Modal */}
      {activeModalPackage && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col my-auto">
            {/* Modal Header Banner */}
            <div className="relative h-44 sm:h-52 bg-slate-900 shrink-0">
              <img
                src={activeModalPackage.image}
                alt={activeModalPackage.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent"></div>
              
              <button
                type="button"
                onClick={() => setActiveModalPackage(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                  {activeModalPackage.heroBadge} • {activeModalPackage.duration}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {activeModalPackage.name}
                </h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Route Summary */}
              <div className="bg-amber-50/60 border border-amber-200/70 p-4 rounded-2xl flex items-start gap-3">
                <Navigation className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                    Complete Highway Circuit
                  </h4>
                  <p className="text-xs font-semibold text-slate-700 mt-1">
                    {activeModalPackage.route}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Estimated round-trip distance: ~{activeModalPackage.distanceKm} km
                  </p>
                </div>
              </div>

              {/* Day-by-Day Itinerary */}
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" /> Day-by-Day Tour Itinerary
                </h4>
                <div className="space-y-4">
                  {activeModalPackage.itinerary.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                          {item.day}
                        </span>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                          {item.title}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
                  <h5 className="text-xs font-black text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> What&apos;s Included
                  </h5>
                  <ul className="space-y-1.5">
                    {activeModalPackage.inclusions.map((inc, iIdx) => (
                      <li key={iIdx} className="text-[11px] text-emerald-950 font-medium flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span> {inc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-slate-500" /> Exclusions
                  </h5>
                  <ul className="space-y-1.5">
                    {activeModalPackage.exclusions.map((exc, eIdx) => (
                      <li key={eIdx} className="text-[11px] text-slate-600 font-medium flex items-start gap-1.5">
                        <span className="text-slate-400 font-bold">•</span> {exc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Fleet */}
              <div>
                <h5 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Recommended Vehicles for this Circuit
                </h5>
                <div className="flex flex-wrap gap-2">
                  {activeModalPackage.recommendedVehicles.map((veh, vIdx) => (
                    <span
                      key={vIdx}
                      className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1.5"
                    >
                      <Car className="w-3.5 h-3.5 text-amber-600" /> {veh}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  All-Inclusive Package Price
                </span>
                <span className="text-2xl font-black text-amber-600">
                  {activeModalPackage.price}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalPackage(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const pkg = activeModalPackage;
                    setActiveModalPackage(null);
                    handleBookPackage(pkg);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md"
                >
                  <span>Book This Package</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
