"use client";

import BookingWidget from "@/components/home/BookingWidget";
import { Plane, Star, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AirportTransfersPage() {
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
        <div className="max-w-6xl mx-auto relative z-10 text-center mb-4 sm:mb-8 mt-1 sm:mt-2 md:mt-4">
          <div className="inline-flex items-center gap-2 bg-[#0082fe] border border-blue-400/40 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white mb-3 sm:mb-5 shadow-lg shadow-blue-900/30">
            <Plane className="w-3 h-3 text-white" /> {t("airport_hero_badge") || "100% On-Time Guarantee"}
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-3 sm:mb-5 drop-shadow-2xl">
            {t("airport_hero_title") || "Reliable Airport Transfers"}
          </h1>
          <p className="text-xs sm:text-base md:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto font-medium drop-shadow-md px-2">
            {t("airport_hero_subtitle") || "Pre-book your airport pickup or drop with Grab Rentals. Enjoy flight tracking, 1 hr free waiting time, and meet-and-greet services."}
          </p>
        </div>
      </section>

      {/* Booking Widget */}
      <section className="px-3 sm:px-4 md:px-6 relative z-20 -mt-20 sm:-mt-24 md:-mt-32 lg:-mt-36">
        <BookingWidget />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 sm:mt-28 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">{t("why_book_airport") || "Why Book Our Airport Cabs?"}</h2>
            <ul className="space-y-4 text-slate-600 font-medium text-xs sm:text-sm">
              <li className="flex gap-3 items-start"><Clock className="w-5 h-5 text-brand-amber shrink-0 mt-0.5" /> <span>{t("free_waiting_time") || "Free Waiting Time: We wait for 60 mins for pickups in case your flight is delayed."}</span></li>
              <li className="flex gap-3 items-start"><Plane className="w-5 h-5 text-brand-amber shrink-0 mt-0.5" /> <span>{t("flight_tracking") || "Flight Tracking: Chauffeurs track your flight status to arrive exactly when you land."}</span></li>
              <li className="flex gap-3 items-start"><Star className="w-5 h-5 text-brand-amber shrink-0 mt-0.5" /> <span>{t("meet_and_greet") || "Meet & Greet: Driver will hold a placard with your name at the arrivals gate."}</span></li>
            </ul>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md h-56 sm:h-[300px]">
            <img 
              src="/images/fleet/sedan.jpg" 
              alt="Airport Premium Sedan Transfer" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
