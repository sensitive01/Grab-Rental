"use client";

import BookingWidget from "@/components/home/BookingWidget";
import { Star, Shield, Bus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function BusesPage() {
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
          <div className="inline-flex items-center gap-2 bg-brand-navy-dark/80 backdrop-blur-md border border-slate-700/50 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-brand-amber mb-3 sm:mb-5 shadow-xl">
            <Bus className="w-3 h-3 text-brand-amber" /> {t("buses_hero_badge") || "35 to 55 Seater Luxury Coaches"}
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-3 sm:mb-5 drop-shadow-2xl">
            {t("buses_hero_title") || "Luxury Bus Rentals"}
          </h1>
          <p className="text-xs sm:text-base md:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto font-medium drop-shadow-md px-2">
            {t("buses_hero_subtitle") || "Volvo, Scania, and Mercedes coaches for weddings, corporate offsites, and large group travel across India."}
          </p>
        </div>
      </section>

      {/* Booking Widget */}
      <section className="px-3 sm:px-4 md:px-6 relative z-20 -mt-20 sm:-mt-24 md:-mt-32 lg:-mt-36">
        <BookingWidget />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 sm:mt-28 mb-20 text-center">
         <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 sm:mb-6">{t("book_large_transport") || "Book Large Scale Transport Easily"}</h2>
         <p className="text-xs sm:text-base text-slate-600 font-medium max-w-2xl mx-auto mb-8 sm:mb-10">{t("book_large_sub") || "Our fleet of luxury buses ensures safety, comfort, and reliability for large events. All buses come with an experienced driver and an attendant."}</p>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">45-Seater Volvo</h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-4">Air Suspension, Washroom Option</p>
                <div className="text-brand-emerald-dark font-black text-base sm:text-lg">{t("price_starts") || "Starts"} ₹55/km</div>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-brand-amber shadow-md">
                <div className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-2">{t("most_popular") || "Most Popular"}</div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">35-Seater Luxury AC</h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-4">Pushback Seats, Video Coach</p>
                <div className="text-brand-amber font-black text-base sm:text-lg">{t("price_starts") || "Starts"} ₹45/km</div>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">55-Seater Semi-Sleeper</h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-4">Long Distance Comfort</p>
                <div className="text-brand-emerald-dark font-black text-base sm:text-lg">{t("price_starts") || "Starts"} ₹65/km</div>
            </div>
         </div>

         <div className="mt-8 sm:mt-12 rounded-3xl overflow-hidden border border-slate-200 shadow-lg h-56 sm:h-72">
            <img
              src="/images/fleet/bus.jpg"
              alt="Luxury Volvo & BharatBenz Bus Fleet"
              className="w-full h-full object-cover"
            />
         </div>
      </section>
    </main>
  );
}
