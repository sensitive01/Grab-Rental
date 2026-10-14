"use client";

import BookingWidget from "@/components/home/BookingWidget";
import { Clock, MapPin, CheckCircle, ShieldCheck, Sparkles, Navigation, Calendar } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PackagesPage() {
  const { t } = useLanguage();

  const packagesList = [
    {
      type: "Hourly City Rental",
      hours: "4 Hours / 40 km",
      subtitle: "Quick City Errands & Short Meetings",
      desc: "Chauffeur-driven sedan or SUV on standby within city limits. Extra kilometers and hours billed transparently.",
      price: "₹1,200",
      features: ["Chauffeur on standby", "Doorstep pickup & drop", "Clean sanitized car", "AC running throughout"],
      tag: "Express",
    },
    {
      type: "Full Day Sightseeing",
      hours: "8 Hours / 80 km",
      subtitle: "City Tour, Shopping & Family Visits",
      desc: "Our most popular package for hassle-free city exploration, back-to-back appointments, or leisure outings.",
      price: "₹2,100",
      features: ["Unlimited local stops", "Experienced city driver", "Free cancellation up to 6 hrs", "Transparent toll/fuel policy"],
      popular: true,
      tag: "Most Popular",
    },
    {
      type: "Extended Full Day",
      hours: "12 Hours / 120 km",
      subtitle: "Weddings, Functions & Corporate Day Trips",
      desc: "Complete flexibility for all-day functions, ceremonies, and continuous corporate business meetings.",
      price: "₹2,900",
      features: ["Dedicated vehicle for 12 hours", "Night allowance included till 10 PM", "Luxury Sedans & MPVs available", "Corporate invoicing ready"],
      tag: "Best Value",
    },
    {
      type: "Heritage & Pilgrimage Tour",
      hours: "Multi-Day Tour Package",
      subtitle: "Tirupati, Mysore, Ooty, Coorg, Madurai",
      desc: "All-inclusive curated multi-day tour packages with commercial badged chauffeurs and verified hotel-pickup.",
      price: "₹4,500/day",
      features: ["Driver batta included", "Interstate state permits handled", "Doorstep luggage assistance", "24/7 round-the-clock trip support"],
      tag: "Tour Special",
    },
  ];

  return (
    <main className="flex flex-col bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="text-white pt-6 sm:pt-8 md:pt-12 pb-28 sm:pb-36 md:pb-44 px-3 sm:px-4 lg:px-8 relative overflow-hidden flex flex-col items-center bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/images/customer-hero-banner.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/30 to-slate-950/80"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center mb-4 sm:mb-8 mt-1 sm:mt-2 md:mt-4">
          <div className="inline-flex items-center gap-2 bg-brand-navy-dark/80 backdrop-blur-md border border-slate-700/50 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-brand-amber mb-3 sm:mb-5 shadow-xl">
            <Clock className="w-3 h-3 text-brand-amber" /> {t("local_hero_badge") || "Flexible Hourly & Tour Packages"}
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-3 sm:mb-5 drop-shadow-2xl">
            Curated Travel & Rental Packages
          </h1>
          <p className="text-xs sm:text-base md:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto font-medium drop-shadow-md px-2">
            Choose from flexible 4hr, 8hr, and 12hr hourly city rentals or multi-day customized outstation tour packages with professional chauffeurs.
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-700 bg-amber-100/70 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> All-Inclusive Fixed Price Fares
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 sm:mb-4">
            Popular Tour & Hourly Rental Packages
          </h2>
          <p className="text-xs sm:text-base text-slate-600 font-medium max-w-2xl mx-auto">
            Transparent pricing with zero surge fees. Extra kilometers and hours are billed straightforwardly without hidden charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {packagesList.map((pkg, idx) => (
            <div
              key={idx}
              className={`bg-white p-5 sm:p-6 rounded-2xl shadow-sm border flex flex-col relative transition-all hover:shadow-md ${
                pkg.popular ? "border-brand-amber ring-2 ring-brand-amber/20 shadow-md" : "border-slate-200"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  {pkg.tag}
                </div>
              )}
              {!pkg.popular && (
                <div className="inline-flex items-center self-start text-[10px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full mb-2">
                  {pkg.tag}
                </div>
              )}
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-0.5">{pkg.hours}</h3>
              <p className="text-amber-700 font-semibold text-xs mb-3">{pkg.subtitle}</p>
              <p className="text-xs text-slate-500 mb-4 flex-1 leading-relaxed">{pkg.desc}</p>

              <div className="space-y-2 border-t border-slate-100 pt-3 mb-4">
                {pkg.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="text-base sm:text-lg font-black text-slate-900 border-t border-slate-100 pt-3 flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-500">Starts at</span>
                <span className="text-lg sm:text-xl font-extrabold text-amber-600">{pkg.price}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Punctual Chauffeur Guarantee</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your chauffeur arrives 15 minutes before the scheduled pickup time with your vehicle cooled and ready.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Police-Verified Drivers</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                All drivers undergo comprehensive background checks, commercial license verification, and route audits.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Clean & Sanitized Fleet</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every vehicle is thoroughly vacuumed, sanitized, and equipped with functioning AC and phone chargers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
