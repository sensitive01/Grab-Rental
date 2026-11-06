"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Leaf,
  ShieldCheck,
  Clock,
  Sparkles,
  BatteryCharging,
  CheckCircle2,
  ChevronDown,
  Phone,
  Wind,
  MessageCircle,
  Award
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import BookingWidget from "@/components/home/BookingWidget";
import PageHeroSection from "@/components/common/PageHeroSection";

export default function EvCabsPage() {
  const { t } = useLanguage();
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Will my EV cab run out of charge on outstation highway trips?",
      a: "No! All Grab Rentals EV outstation journeys are dispatched with a guaranteed >90% battery charge. For trips exceeding 200 km, our smart dispatch system and chauffeurs schedule convenient stops at verified 60kW+ DC highway fast-chargers located at food plazas (e.g., Starbucks, McDonald's, Highway Dhabas), allowing you to grab a coffee while the car fast-charges in 25–35 minutes."
    },
    {
      q: "Does running the AC impact the journey or cause delays?",
      a: "Our modern EV fleet utilizes high-efficiency climate control systems and heat pumps. Your chauffeur will maintain comfortable, uninterrupted cabin cooling throughout your trip without impacting the planned range or travel schedule."
    },
    {
      q: "Are highway charging costs and tolls included in the fare?",
      a: "Yes! All Grab Rentals outstation packages are 100% transparent. Highway charging fees, fast-tag toll plaza deductions, and driver allowances are included in all-inclusive fares with zero hidden surcharges or surprise fuel adjustments."
    },
    {
      q: "Can companies book EV cabs for corporate travel and ESG reporting?",
      a: "Yes! Grab Rentals partners with enterprises across India to provide zero-emission employee commutes, executive airport transit, and event logistics. We provide certified monthly CO2 reduction reports for your company's ESG and sustainability compliance."
    },
    {
      q: "What happens if there is heavy highway traffic? Will the battery die?",
      a: "Unlike combustion engine cars that burn fuel while idling, electric vehicles consume negligible power while stationary. When moving slowly in traffic, regenerative braking recovers kinetic energy. Being in traffic jams does not cause unexpected battery depletion."
    },
    {
      q: "Are Grab Rentals EV chauffeurs specially trained?",
      a: "Yes! All our EV chauffeurs undergo specialized training covering regenerative braking optimization, smooth acceleration (zero passenger motion sickness), fast-charger plug handling, and defensive highway driving standards."
    }
  ];

  return (
    <main className="flex flex-col bg-slate-50 min-h-screen">
      {/* 1. Dynamic Hero Section */}
      <PageHeroSection
        pageKey="EV_CABS"
        defaultBadge="100% Electric & Zero Emission Fleet"
        defaultTitle1="Whisper-Quiet, Clean & Sustainable"
        defaultTitle2="EV Cabs"
        defaultSubtitle="Zero engine vibrations, zero tailpipe emissions, and ultra-smooth highway comfort. Book modern electric cabs for Outstation trips, Local hourly rentals, and guaranteed Airport transfers."
        badgeIcon={<Leaf className="w-3.5 h-3.5 text-emerald-400" />}
        accentColorClass="text-emerald-400"
        badgeClass="bg-emerald-500/15 border border-emerald-400/40 text-emerald-400"
      >
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Pre-Planned 60kW+ DC Fast Charging</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Certified Green Chauffeurs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Transparent All-Inclusive Fares</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span>Corporate EV Enquiries & Bulk Bookings:</span>
          <a
            href="tel:+919071100200"
            className="text-emerald-400 font-bold hover:underline flex items-center gap-1 ml-1"
          >
            <Phone className="w-3 h-3" /> +91 9071 100 200
          </a>
        </div>
      </PageHeroSection>

      {/* 2. Floating Interactive Booking Widget */}
      <section id="ev-booking-widget" className="px-3 sm:px-4 md:px-6 relative z-20 -mt-16 sm:-mt-20 md:-mt-28 lg:-mt-32">
        <BookingWidget hideOutstationTab={true} />
      </section>

      {/* 3. Eco Metrics Highlight Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16 w-full">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="pt-2 md:pt-0">
              <div className="inline-flex p-2.5 rounded-xl bg-emerald-50 text-emerald-600 mb-2">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">0 g/km</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Tailpipe CO2 Emissions</div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="inline-flex p-2.5 rounded-xl bg-blue-50 text-blue-600 mb-2">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">300+ Hubs</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Mapped Highway Fast Chargers</div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="inline-flex p-2.5 rounded-xl bg-amber-50 text-amber-600 mb-2">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">4.9 ★</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Green Chauffeur Rating</div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="inline-flex p-2.5 rounded-xl bg-purple-50 text-purple-600 mb-2">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">100%</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Guaranteed On-Time Pickups</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why Choose Grab Rentals EV Cabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
            The Green Difference
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
            Why Smarter Travelers Choose EV Cabs
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Engineered for executive quietness, modern sustainability, and reliable highway journeys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Zero Carbon Emissions</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every 100 km traveled in our electric cabs eliminates approximately 14 kg of toxic CO2 emissions compared to diesel taxis.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Wind className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Whisper-Quiet Cabin</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No engine rumble, exhaust vibration, or gear-shift jerks. Sleep peacefully, listen to podcasts, or conduct conference calls in library-grade silence.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BatteryCharging className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Highway Fast-Charging</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our route scheduling algorithm aligns long journeys with curated 60kW+ DC fast chargers at modern highway food courts for stress-free travel.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">All-Inclusive Transparent Fares</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Zero fuel price spikes, no surprise night surcharges. Fast-tag tolls, charging expenses, and chauffeur allowances are clearly itemized.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Corporate ESG & Group Travel Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-8 sm:p-12 border border-emerald-500/20 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-400/30 px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Corporate ESG & Fleet Leasing
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Zero-Emission Commutes for Sustainable Enterprises
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
              Empower your company’s Net-Zero goals with dedicated employee shuttles, executive airport transit, and monthly green fleet retainers complete with certified carbon reduction audits.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="tel:+919071100200"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call Corporate Travel Desk</span>
              </a>
              <a
                href="https://wa.me/919071100200?text=Hi%20Grab%20Rentals%2C%20I%20am%20interested%20in%20corporate%20EV%20cab%20services"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-5 py-3 rounded-xl transition-all backdrop-blur-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Dedicated Desk</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24 mb-20 w-full">
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
            Transparent Answers
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
            Frequently Asked Questions About EV Cabs
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Everything you need to know about charging, range, comfort, and transparent billing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
