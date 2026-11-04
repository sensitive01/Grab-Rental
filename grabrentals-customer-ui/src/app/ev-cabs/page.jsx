"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  ArrowRight,
  MapPin,
  Users,
  Briefcase,
  Wind,
  Check,
  MessageCircle,
  HelpCircle,
  Award
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import BookingWidget from "@/components/home/BookingWidget";

export default function EvCabsPage() {
  const { t } = useLanguage();
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const scrollToWidget = () => {
    const el = document.getElementById("ev-booking-widget");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const evFleet = [
    {
      id: "nexon-ev",
      name: "Tata Nexon EV Max / Long Range",
      category: "Compact Electric SUV",
      badge: "Most Popular",
      range: "437 km Certified Range",
      passengers: "4 Passengers",
      luggage: "3 Bags (350L Boot)",
      image: "/images/fleet/suv_electric.jpg",
      description: "India's highest rated electric SUV. Whisper-quiet cabin, punchy instant torque, and panoramic highway ride comfort.",
      features: [
        "Multi-Mode Regenerative Braking",
        "Fast DC Charging (10-80% in 56 mins)",
        "Automatic Climate Control with Air Filter",
        "Dual Airbags & ESP Safety Standard"
      ],
      idealFor: "Outstation family trips, weekend getaways & airport runs"
    },
    {
      id: "mg-zs-ev",
      name: "MG ZS EV Excite / Exclusive",
      category: "Premium Executive SUV",
      badge: "Executive Class",
      range: "461 km Certified Range",
      passengers: "4 - 5 Passengers",
      luggage: "4 Bags (448L Boot)",
      image: "/images/fleet/suv_electric.jpg",
      description: "Spacious luxury electric SUV equipped with panoramic sunroof, ultra-plush leatherette seating, and PM 2.5 air filtration.",
      features: [
        "Panoramic Sky Roof & Ambient Cabin",
        "PM 2.5 In-Cabin Air Purification",
        "Rear AC Vents & High Recline Comfort",
        "5-Star Euro NCAP Crash Test Safety"
      ],
      idealFor: "VIP executive travel, long expressway cruising & corporate transit"
    },
    {
      id: "byd-atto3",
      name: "BYD Atto 3 Extended Range",
      category: "Luxury Long-Range EV",
      badge: "Flagship Luxury",
      range: "521 km Certified Range",
      passengers: "5 Passengers",
      luggage: "4 Bags (440L Boot)",
      image: "/images/fleet/suv_electric.jpg",
      description: "World-class Blade Battery engineering with extraordinary range and futuristic noise-dampened soundstage cabin.",
      features: [
        "Ultra-Safe Blade Battery Technology",
        "80kW DC Ultra-Fast Highway Charging",
        "Acoustic Noise-Canceling Glass Cabin",
        "Dirac HD 8-Speaker Audio & Ambient Lighting"
      ],
      idealFor: "Inter-city non-stop journeys & luxury family vacations"
    },
    {
      id: "tigor-ev",
      name: "Tata Tigor EV Ziptron",
      category: "City & Airport Electric Sedan",
      badge: "Value Smart",
      range: "315 km Certified Range",
      passengers: "4 Passengers",
      luggage: "2 Bags (316L Boot)",
      image: "/images/fleet/suv_electric.jpg",
      description: "Smart, agile, and eco-friendly electric sedan tailored for city commute, hourly meetings, and on-time airport transfers.",
      features: [
        "Silent Ziptron Electric Powertrain",
        "Smooth Automatic Drive Without Jerks",
        "Deep Boot for Strolley Bags",
        "Zero Congestion Tailpipe Emissions"
      ],
      idealFor: "Intra-city business meetings, hourly rentals & airport rides"
    }
  ];

  const popularRoutes = [
    {
      route: "Bangalore ⇄ Mysore Expressway",
      distance: "145 km",
      time: "2 hrs 10 mins",
      charging: "0 Charging Stops Needed (Full Non-Stop)",
      co2Saved: "22 kg CO2 Saved",
      tag: "10-Lane Expressway"
    },
    {
      route: "Chennai ⇄ Pondicherry (ECR)",
      distance: "155 km",
      time: "3 hrs 15 mins",
      charging: "Scenic Coastal Highway • Full Battery Reach",
      co2Saved: "24 kg CO2 Saved",
      tag: "Coastal Getaway"
    },
    {
      route: "Mumbai ⇄ Pune Expressway",
      distance: "150 km",
      time: "2 hrs 45 mins",
      charging: "Regenerative Braking on Ghats • 10+ Highway Hubs",
      co2Saved: "23 kg CO2 Saved",
      tag: "Western Ghats Route"
    },
    {
      route: "Delhi ⇄ Agra Yamuna Expressway",
      distance: "210 km",
      time: "3 hrs 30 mins",
      charging: "1 Mid-Way Food Court Top-Up (25 mins)",
      co2Saved: "32 kg CO2 Saved",
      tag: "Heritage Highway"
    }
  ];

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
      {/* 1. Hero Section */}
      <section className="relative text-white pt-14 pb-28 sm:pt-20 sm:pb-36 md:pt-24 md:pb-44 px-4 sm:px-6 overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 scale-105"
          style={{ backgroundImage: 'url("/images/customer-hero-banner.png")' }}
        />
        {/* Subtle emerald and cyan ambient gradient overlays for eco look */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-emerald-950/20 to-slate-950" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-emerald-400 mb-4 shadow-lg shadow-emerald-950/40">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Electric & Zero Emission Fleet</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-xl text-white">
            Whisper-Quiet, Clean & Sustainable <span className="text-emerald-400">EV Cabs</span>
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-md mb-6">
            Zero engine vibrations, zero tailpipe emissions, and ultra-smooth highway comfort. Book modern electric cabs for Outstation trips, Local hourly rentals, and guaranteed Airport transfers.
          </p>

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

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>Corporate EV Enquiries & Bulk Bookings:</span>
            <a
              href="tel:+919071100200"
              className="text-emerald-400 font-bold hover:underline flex items-center gap-1 ml-1"
            >
              <Phone className="w-3 h-3" /> +91 90711 00200
            </a>
          </div>
        </div>
      </section>

      {/* 2. Floating Interactive Booking Widget */}
      <section id="ev-booking-widget" className="px-3 sm:px-4 md:px-6 relative z-20 -mt-16 sm:-mt-20 md:-mt-28 lg:-mt-32">
        <BookingWidget />
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

      {/* 5. EV Fleet Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
              Pristine Fleet
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
              Our Premium Electric Vehicles
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md">
            Meticulously maintained, sanitized before every ride, and driven by commercial-badged EV specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {evFleet.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Vehicle Header & Badges */}
                <div className="p-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {vehicle.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {vehicle.badge}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">{vehicle.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">{vehicle.description}</p>
                </div>

                {/* Vehicle Image */}
                <div className="relative h-56 sm:h-64 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={vehicle.image}
                    alt={vehicle.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{vehicle.range}</span>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Capacity</div>
                        <div className="text-xs font-bold text-slate-800">{vehicle.passengers}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Luggage</div>
                        <div className="text-xs font-bold text-slate-800">{vehicle.luggage}</div>
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <BatteryCharging className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Fast Charge</div>
                        <div className="text-xs font-bold text-slate-800">DC Fast Ready</div>
                      </div>
                    </div>
                  </div>

                  {/* Highlights list */}
                  <div className="space-y-2 mb-4">
                    {vehicle.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] font-medium text-slate-500 italic bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/60">
                    <strong className="text-emerald-900 not-italic">Ideal for:</strong> {vehicle.idealFor}
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-6 pt-0">
                <button
                  type="button"
                  onClick={scrollToWidget}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Book {vehicle.name.split(" ")[0]} EV Ride</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Popular Green Highway Routes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24 w-full">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
            Highway Network
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
            Popular Electrified Outstation Routes
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Proven intercity routes with reliable fast-charger infrastructure and verified driving times.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularRoutes.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    {r.tag}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {r.co2Saved}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mb-2">{r.route}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
                  <div className="flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{r.distance}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{r.time}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{r.charging}</p>
              </div>

              <button
                type="button"
                onClick={scrollToWidget}
                className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-between group cursor-pointer"
              >
                <span>Check Outstation Fare</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Corporate ESG & Group Travel Banner */}
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

      {/* 8. Frequently Asked Questions Accordion */}
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

