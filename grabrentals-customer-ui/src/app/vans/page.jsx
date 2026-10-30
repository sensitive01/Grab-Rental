"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BookingWidget from "@/components/home/BookingWidget";
import { Users, CheckCircle, Shield, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function VansHeroContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const cab = searchParams?.get("cab");
  const isUrbania = cab === "urbania";
  const isTempo = cab === "tempo";

  return (
    <div className="max-w-6xl mx-auto relative z-10 text-center mb-4 sm:mb-8 mt-1 sm:mt-2 md:mt-4">
      <div className="inline-flex items-center gap-2 bg-[#0082fe] border border-blue-400/40 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white mb-3 sm:mb-5 shadow-lg shadow-blue-900/30">
        <Users className="w-3 h-3 text-white" />{" "}
        {isUrbania
          ? "Luxury 9 to 16 Seater Van"
          : isTempo
            ? "12 to 26 Seater Group Van"
            : (t("vans_hero_badge") || "9 to 26 Seater Vehicles")}
      </div>
      <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-3 sm:mb-5 drop-shadow-2xl">
        {isUrbania
          ? "Force Urbania Rentals"
          : isTempo
            ? "Tempo Traveller Rentals"
            : (t("vans_hero_title") || "Tempo Traveller & Van Rentals")}
      </h1>
      <p className="text-xs sm:text-base md:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto font-medium drop-shadow-md px-2">
        {isUrbania
          ? "Experience executive luxury with individual pushback recliners, standing-height cabin, and panoramic windows for outstation trips."
          : (t("vans_hero_subtitle") || "Travel together. Rent premium Force Urbania and luxury Tempo Travellers for outstation family trips and group tours.")}
      </p>
    </div>
  );
}

export default function VansPage() {
  const { t } = useLanguage();

  return (
    <main className="flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="text-white pt-6 sm:pt-8 md:pt-12 pb-28 sm:pb-36 md:pb-44 px-3 sm:px-4 lg:px-8 relative overflow-hidden flex flex-col items-center bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/images/customer-hero-banner.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/30 to-slate-950/80"></div>
        <Suspense fallback={
          <div className="max-w-6xl mx-auto relative z-10 text-center mb-4 sm:mb-8 mt-1 sm:mt-2 md:mt-4 text-white">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold">Tempo Traveller & Van Rentals</h1>
          </div>
        }>
          <VansHeroContent />
        </Suspense>
      </section>

      {/* Booking Widget */}
      <section className="px-3 sm:px-4 md:px-6 relative z-20 -mt-20 sm:-mt-24 md:-mt-32 lg:-mt-36">
        <BookingWidget />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 sm:mt-28 mb-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 sm:mb-4">{t("our_van_fleet") || "Our Van Fleet"}</h2>
          <p className="text-xs sm:text-base text-slate-600 font-medium max-w-2xl mx-auto">{t("van_fleet_sub") || "Luxury pushback seats, ample luggage space, and dual AC vents for the ultimate group travel experience."}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 items-center">
            <img
              src="/images/fleet/tempo_traveller.jpg"
              alt="12-Seater Maharaja Tempo"
              className="w-full sm:w-1/3 aspect-square object-cover rounded-xl shadow-xs"
            />
            <div className="flex-1 w-full">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">12-21 Seater Tempo Traveller</h3>
              <ul className="space-y-2 mb-4 text-slate-600 text-xs sm:text-sm font-semibold">
                <li className="flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-brand-emerald" /> 1x1 Maharaja Recliner Seats</li>
                <li className="flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-brand-emerald" /> Individual AC Vents</li>
                <li className="flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-brand-emerald" /> Premium AV System</li>
              </ul>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-brand-amber font-black text-lg sm:text-xl">{t("price_starts") || "Starts"} ₹24/km</div>
                <Link
                  href="/fleet/tempo"
                  className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  View Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 items-center">
            <img
              src="/images/fleet/urbania.jpg"
              alt="Force Urbania 9-16 Seater"
              className="w-full sm:w-1/3 aspect-square object-cover rounded-xl shadow-xs"
            />
            <div className="flex-1 w-full">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">Force Urbania (9-16 Seater)</h3>
              <ul className="space-y-2 mb-4 text-slate-600 text-xs sm:text-sm font-semibold">
                <li className="flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-brand-emerald" /> Airline-style seating</li>
                <li className="flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-brand-emerald" /> Standing Height Cabin</li>
                <li className="flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-brand-emerald" /> Advanced Suspension</li>
              </ul>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-brand-amber font-black text-lg sm:text-xl">{t("price_starts") || "Starts"} ₹26/km</div>
                <Link
                  href="/fleet/urbania"
                  className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  View Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
