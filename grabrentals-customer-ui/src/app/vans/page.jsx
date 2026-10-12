"use client";

import BookingWidget from "@/components/home/BookingWidget";
import { Users, CheckCircle, Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function VansPage() {
  const { t } = useLanguage();

  return (
    <main className="flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-14 px-6 relative">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand-navy-dark border border-slate-700 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-brand-amber mb-6">
            <Users className="w-3 h-3 text-brand-amber" /> {t("vans_hero_badge") || "9 to 26 Seater Vehicles"}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            {t("vans_hero_title") || "Tempo Traveller & Van Rentals"}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-medium">
            {t("vans_hero_subtitle") || "Travel together. Rent premium Force Urbania and luxury Tempo Travellers for outstation family trips and group tours."}
          </p>
        </div>
      </section>

      {/* Booking Widget */}
      <section className="px-3 sm:px-4 md:px-6 relative z-20 -mt-8 sm:-mt-12">
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
              src="/images/fleet/tempo.jpg"
              alt="12-Seater Maharaja Tempo"
              className="w-full sm:w-1/3 aspect-square object-cover rounded-xl shadow-xs"
            />
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">12-Seater Maharaja Tempo</h3>
              <ul className="space-y-2 mb-6 text-slate-600 text-xs sm:text-sm font-semibold">
                <li className="flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-brand-emerald" /> 1x1 Maharaja Recliner Seats</li>
                <li className="flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-brand-emerald" /> Individual AC Vents</li>
                <li className="flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-brand-emerald" /> Premium AV System</li>
              </ul>
              <div className="text-brand-amber font-black text-lg sm:text-xl">{t("price_starts") || "Starts"} ₹24/km</div>
            </div>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 items-center">
            <img
              src="/images/vendor/tempo.jpg"
              alt="Force Urbania 17-Seater"
              className="w-full sm:w-1/3 aspect-square object-cover rounded-xl shadow-xs"
            />
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">Force Urbania (17-Seater)</h3>
              <ul className="space-y-2 mb-6 text-slate-600 text-xs sm:text-sm font-semibold">
                <li className="flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-brand-emerald" /> Airline-style seating</li>
                <li className="flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-brand-emerald" /> Standing Height Cabin</li>
                <li className="flex gap-2 items-center"><CheckCircle className="w-4 h-4 text-brand-emerald" /> Advanced Suspension</li>
              </ul>
              <div className="text-brand-amber font-black text-lg sm:text-xl">{t("price_starts") || "Starts"} ₹28/km</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
