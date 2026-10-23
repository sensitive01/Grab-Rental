"use client";

import BookingWidget from "@/components/home/BookingWidget";
import { Star, Clock, MapPin, CheckCircle, CarFront } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LocalRentalsPage() {
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
            <Clock className="w-3 h-3 text-white" /> {t("local_hero_badge") || "Flexible Hourly Packages"}
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-3 sm:mb-5 drop-shadow-2xl">
            {t("local_hero_title") || "Local Hourly Premium Car Rentals"}
          </h1>
          <p className="text-xs sm:text-base md:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto font-medium drop-shadow-md px-2">
            {t("local_hero_subtitle") || "Book a chauffeur-driven car for 4 hrs, 8 hrs, or 12 hrs. Perfect for city tours, shopping, and back-to-back meetings."}
          </p>
        </div>
      </section>

      {/* Booking Widget */}
      <section className="px-3 sm:px-4 md:px-6 relative z-20 -mt-20 sm:-mt-24 md:-mt-32 lg:-mt-36">
        <BookingWidget />
      </section>

      {/* Packages Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20 sm:mt-28 mb-20 w-full">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 sm:mb-4">{t("popular_local_packages") || "Popular Local Packages"}</h2>
          <p className="text-xs sm:text-base text-slate-600 font-medium max-w-2xl mx-auto">{t("local_packages_sub") || "Choose a package that fits your day perfectly. Extra kilometers and hours are billed transparently."}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { hours: t("pkg_4_hours") || "4 Hours", km: t("pkg_40_km") || "Includes 40 km", desc: t("pkg_4_desc") || "Ideal for quick errands or short business meetings within city limits.", price: "₹1,200" },
            { hours: t("pkg_8_hours") || "8 Hours", km: t("pkg_80_km") || "Includes 80 km", desc: t("pkg_8_desc") || "Perfect for a full day of shopping, visiting relatives, or city sightseeing.", price: "₹2,100", popular: true },
            { hours: t("pkg_12_hours") || "12 Hours", km: t("pkg_120_km") || "Includes 120 km", desc: t("pkg_12_desc") || "Extended package for all-day events, weddings, or long corporate trips.", price: "₹2,900" },
          ].map((pkg, idx) => (
            <div key={idx} className={`bg-white p-5 sm:p-6 rounded-2xl shadow-sm border ${pkg.popular ? 'border-brand-amber shadow-md' : 'border-slate-200'} flex flex-col relative`}>
              {pkg.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">{t("most_selected") || "Most Selected"}</div>}
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1 mt-2">{pkg.hours}</h3>
              <p className="text-brand-emerald-dark font-bold text-xs sm:text-sm mb-3 sm:mb-4">{pkg.km}</p>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 flex-1">{pkg.desc}</p>
              <div className="text-lg sm:text-xl font-black text-slate-900 border-t border-slate-100 pt-4">Starts at {pkg.price}</div>
            </div>
          ))}
        </div>

        {/* Visual Fleet Showcase */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-3">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              {t("city_chauffeur_advantage") || "City Chauffeur Advantage"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950">{t("ac_comfort_title") || "Travel in Complete Air-Conditioned Comfort"}</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {t("ac_comfort_desc") || "Zero surging prices, professional drivers with deep city route knowledge, and sanitized executive sedans & premium MPVs ready at your doorstep."}
            </p>
          </div>
          <div className="h-48 sm:h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
            <img
              src="/images/cars/innova.jpg"
              alt="Local City Car Rental"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
