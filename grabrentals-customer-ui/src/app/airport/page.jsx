"use client";

import BookingWidget from "@/components/home/BookingWidget";
import PageHeroSection from "@/components/common/PageHeroSection";
import { Plane, Star, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AirportTransfersPage() {
  const { t } = useLanguage();

  return (
    <main className="flex flex-col bg-slate-50">
      {/* Dynamic Hero Section */}
      <PageHeroSection
        pageKey="AIRPORT"
        hasFloatingWidget
        defaultBadge={t("airport_hero_badge") || "100% On-Time Guarantee"}
        defaultTitle1={t("airport_hero_title") || "Reliable Airport Transfers"}
        defaultSubtitle={t("airport_hero_subtitle") || "Pre-book your airport pickup or drop with Grab Rentals. Enjoy flight tracking, 1 hr free waiting time, and meet-and-greet services."}
        badgeIcon={<Plane className="w-3 h-3 text-white" />}
      />

      {/* Booking Widget */}
      <section className="px-3 sm:px-4 md:px-6 relative z-20 -mt-[110px] sm:-mt-[158px] md:-mt-[208px] lg:-mt-[278px]">
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
