"use client";

import BookingWidget from "@/components/home/BookingWidget";
import { CheckCircle, ShieldCheck, MapPin, Star, CarFront, FileText, UserCheck, ShieldAlert, BadgeCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="flex flex-col bg-slate-50">
      
      {/* 1. Hero Section */}
      <section className="text-white pt-6 sm:pt-8 md:pt-12 pb-28 sm:pb-36 md:pb-44 px-3 sm:px-4 lg:px-8 relative overflow-hidden flex flex-col items-center bg-slate-900">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/images/customer-hero-banner.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/30 to-slate-950/80"></div>
        
        <div className="max-w-7xl w-full relative z-10 flex flex-col items-center text-center mt-1 sm:mt-2 md:mt-4">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-brand-navy-dark/80 backdrop-blur-md border border-slate-700/50 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-brand-amber mb-3 sm:mb-5 shadow-xl">
            <Star className="w-3 h-3 text-brand-amber" /> {t("hero_badge") || "India's Premier Chauffeur Network"}
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-3 sm:mb-5 drop-shadow-2xl">
            {t("hero_title_1") || "India's Trusted Chauffeur-Driven"} <br/>
            <span className="text-brand-orange drop-shadow-lg">{t("hero_title_2") || "Car, Van & Bus Rentals"}</span>
          </h1>
          
          <p className="text-xs sm:text-base md:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto font-medium drop-shadow-md px-2">
            {t("hero_subtitle") || "Transparent billing, expert verified drivers, and pristine AC vehicles for Outstation, Local & Airport transit across 2,000+ Indian cities."}
          </p>
        </div>
      </section>

      {/* Floating Booking Widget (Pulled top above the banner) */}
      <section className="px-3 sm:px-4 md:px-6 relative z-20 -mt-20 sm:-mt-24 md:-mt-32 lg:-mt-36">
        <BookingWidget />
      </section>

      {/* 2. Key Metric Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24 md:mt-28 mb-12 sm:mb-20 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { stat: "2,000+", label: t("stat_cities_served") || "Cities & Towns Served", icon: <MapPin className="text-brand-sky w-5 h-5 sm:w-6 sm:h-6" /> },
            { stat: "98.9%", label: t("stat_on_time_departure") || "On-Time Departure Rate", icon: <CheckCircle className="text-brand-emerald w-5 h-5 sm:w-6 sm:h-6" /> },
            { stat: "4.8 / 5.0", label: t("stat_reviews") || "(120,000+ Reviews)", icon: <Star className="text-brand-amber w-5 h-5 sm:w-6 sm:h-6" /> },
            { stat: "32-Point", label: t("stat_sanitized_inspection") || "Sanitized Fleet Inspection", icon: <ShieldCheck className="text-brand-emerald w-5 h-5 sm:w-6 sm:h-6" /> },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-3.5 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 flex flex-col items-center text-center gap-2 sm:gap-3">
              <div className="bg-slate-50 p-2 sm:p-3 rounded-full">{item.icon}</div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{item.stat}</h3>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Choose Your Travel Class (Vehicle Cards Grid) */}
      <section className="bg-white py-12 sm:py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 sm:mb-4">{t("choose_travel_class") || "Choose Your Travel Class"}</h2>
            <p className="text-xs sm:text-base text-slate-600 font-medium max-w-2xl mx-auto">{t("choose_travel_class_sub") || "Experience our premium fleet tailored for every need—from executive sedans to luxury coaches."}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { slug: "sedan", name: t("fleet_sedan_name") || "Executive Sedan", price: `${t("price_starts") || "Starts"} ₹11/km`, desc: "Dzire, Etios, Aura", tags: ["4 Seats", "2 Bags", "AC"], badge: null, image: "/images/fleet/sedan.jpg" },
              { slug: "suv", name: t("fleet_suv_name") || "Innova Crysta / SUV", price: `${t("price_starts") || "Starts"} ₹16/km`, desc: "Innova Crysta, Hycross", tags: ["6-7 Seats", "4 Bags", "Captain Seats"], badge: t("most_popular") || "MOST POPULAR", image: "/images/fleet/suv.jpg" },
              { slug: "tempo", name: t("fleet_tempo_name") || "Luxury Tempo Traveller", price: `${t("price_starts") || "Starts"} ₹24/km`, desc: "12 to 26 Seater Force Urbania", tags: ["Maharaja Recliner", "AC", "AV System"], badge: null, image: "/images/fleet/tempo.jpg" },
              { slug: "bus", name: t("fleet_bus_name") || "Luxury Coaches & Buses", price: `${t("price_starts") || "Starts"} ₹45/km`, desc: "35 to 55 Seater Volvo, Scania", tags: ["Washroom", "Mic", "Air Suspension"], badge: null, image: "/images/fleet/bus.jpg" },
            ].map((fleet, idx) => (
              <Link 
                key={idx} 
                href={`/fleet/${fleet.slug}`}
                className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200/80 flex flex-col items-center text-center relative hover:shadow-xl hover:border-amber-400 hover:bg-white transition-all cursor-pointer group"
              >
                {fleet.badge && (
                  <div className="absolute -top-3 bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10">
                    {fleet.badge}
                  </div>
                )}
                <div className="w-full aspect-[16/9] relative mb-4 sm:mb-6 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100">
                  <Image src={fleet.image} alt={fleet.name} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">{fleet.name}</h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-3 sm:mb-4">{fleet.desc}</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mb-4 sm:mb-6">
                  {fleet.tags.map(tag => (
                    <span key={tag} className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 px-2 py-0.5 sm:py-1 rounded-md text-slate-600">{tag}</span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between w-full pt-3 sm:pt-4 border-t border-slate-200">
                  <span className="text-base sm:text-lg font-black text-brand-emerald-dark">{fleet.price}</span>
                  <span className="text-xs font-black text-amber-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    {t("view_details") || "Details →"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Value Proposition Section */}
      <section className="py-12 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 sm:mb-4">{t("standard_of_excellence") || "The Standard of Excellence"}</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[
              { title: t("vp_billing_title") || "Transparent Billing", desc: t("vp_billing_desc") || "Automated GST Invoicing with zero hidden fees.", icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" /> },
              { title: t("vp_chauffeurs_title") || "Expert Chauffeurs", desc: t("vp_chauffeurs_desc") || "8+ years highway experience & police verified.", icon: <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" /> },
              { title: t("vp_sanitization_title") || "32-Point Sanitization", desc: t("vp_sanitization_desc") || "Complimentary Water & Tissue inside pristine cabs.", icon: <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" /> },
              { title: t("vp_cancellation_title") || "Zero Cancellation Stress", desc: t("vp_cancellation_desc") || "Instant UPI/Card Reversal on early cancellations.", icon: <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6" /> },
            ].map((prop, i) => (
              <div key={i} className="flex flex-col items-center text-center p-2 sm:p-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center text-brand-amber mb-3 sm:mb-4">
                  {prop.icon}
                </div>
                <h4 className="font-bold text-xs sm:text-base text-slate-900 mb-1 sm:mb-2">{prop.title}</h4>
                <p className="text-[11px] sm:text-sm font-medium text-slate-600 leading-relaxed">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Popular Outstation Corridors */}
      <section className="py-12 sm:py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-6 sm:mb-8">{t("popular_outstation_corridors") || "Popular Outstation Corridors"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
            {[
              { route: "Bangalore → Mysore", price: "₹1,850", dist: "145 km" },
              { route: "Delhi NCR → Agra", price: "₹2,299", dist: "230 km" },
              { route: "Mumbai → Pune", price: "₹1,999", dist: "150 km" },
              { route: "Delhi → Jaipur", price: "₹2,750", dist: "280 km" },
              { route: "Chennai → Pondy", price: "₹2,100", dist: "155 km" },
              { route: "Bangalore → Ooty", price: "₹4,100", dist: "275 km" },
            ].map((corridor, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 hover:border-brand-amber hover:bg-orange-50 transition-colors cursor-pointer group">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-brand-amber mb-1.5 sm:mb-2 leading-snug">{corridor.route}</h4>
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold">
                  <span className="text-slate-500">{corridor.dist}</span>
                  <span className="text-brand-emerald-dark bg-emerald-50 px-1.5 py-0.5 rounded">{corridor.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
