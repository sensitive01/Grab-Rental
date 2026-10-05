"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  getFleetBySlug, 
  FLEET_CATEGORIES 
} from "@/lib/fleetData";
import { 
  Users, 
  Briefcase, 
  Fuel, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  Car, 
  MapPin, 
  Gauge, 
  Tv, 
  Wind, 
  Eye, 
  Sparkles, 
  Award, 
  ChevronRight, 
  PhoneCall,
  Calendar,
  Clock
} from "lucide-react";

export default function FleetDetailPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || "sedan";
  const fleet = getFleetBySlug(slug);

  const [activePhoto, setActivePhoto] = useState(fleet.gallery?.[0] || fleet.image);
  const [selectedService, setSelectedService] = useState("outstation");

  const otherFleets = FLEET_CATEGORIES.filter((f) => f.slug !== fleet.slug);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Header / Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/fleet" className="hover:text-slate-900 transition-colors">Our Fleet</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-bold">{fleet.name}</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
              <span>Yellow Board Commercial Permit</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>4.9 / 5.0 (2,400+ Trips)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Hero Showcase Section */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left / Center: Visual Gallery & Core Specs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Interactive Stage Photo */}
            <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden bg-white shadow-md border border-slate-200 group">
              <Image 
                src={activePhoto} 
                alt={fleet.name} 
                fill 
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              {fleet.badge && (
                <div className="absolute top-4 left-4 bg-brand-orange text-white text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg">
                  {fleet.badge}
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20">
                {fleet.popularName}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {fleet.gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(imgUrl)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activePhoto === imgUrl ? "border-brand-amber shadow-md scale-105" : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={imgUrl} alt={`${fleet.name} view ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Vehicle Title & Overview */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-brand-amber">Premium Class Fleet</span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">{fleet.name}</h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">{fleet.popularName}</p>
              </div>

              <p className="text-slate-700 font-medium text-base leading-relaxed">
                {fleet.headline}. {fleet.desc}
              </p>

              {/* Models / Variants Chips */}
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Available Models & Variants</p>
                <div className="flex flex-wrap gap-2">
                  {fleet.variants.map((v, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200">
                      <Car className="w-3.5 h-3.5 text-brand-amber" />
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Vehicle Technical Specs Grid */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-brand-amber" />
                Vehicle Specifications & Deployment
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Users className="w-4 h-4 text-brand-amber" />
                    <span className="text-[11px] font-bold uppercase">Seating Capacity</span>
                  </div>
                  <p className="text-base font-extrabold text-slate-900">{fleet.seatingCapacity} Seater</p>
                  <p className="text-[11px] text-slate-500">{fleet.seatingLabel}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Briefcase className="w-4 h-4 text-brand-amber" />
                    <span className="text-[11px] font-bold uppercase">Luggage Capacity</span>
                  </div>
                  <p className="text-base font-extrabold text-slate-900">Boot & Racks</p>
                  <p className="text-[11px] text-slate-500 truncate">{fleet.luggageCapacity}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Fuel className="w-4 h-4 text-brand-amber" />
                    <span className="text-[11px] font-bold uppercase">Fuel & Alternate</span>
                  </div>
                  <p className="text-base font-extrabold text-slate-900">{fleet.alternateFuel}</p>
                  <p className="text-[11px] text-slate-500">Euro-6 Eco Fleet</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Gauge className="w-4 h-4 text-brand-amber" />
                    <span className="text-[11px] font-bold uppercase">Engine Capacity</span>
                  </div>
                  <p className="text-base font-extrabold text-slate-900">{fleet.engineCc}</p>
                  <p className="text-[11px] text-slate-500">High-Torque Performance</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Wind className="w-4 h-4 text-brand-amber" />
                    <span className="text-[11px] font-bold uppercase">Transmission</span>
                  </div>
                  <p className="text-base font-extrabold text-slate-900">Auto / Manual</p>
                  <p className="text-[11px] text-slate-500">{fleet.transmission}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-[11px] font-bold uppercase">Registration</span>
                  </div>
                  <p className="text-base font-extrabold text-emerald-700">Yellow Board</p>
                  <p className="text-[11px] text-slate-500">Commercial All-India</p>
                </div>
              </div>

              {/* Parking Hub Pin */}
              <div className="flex items-center gap-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-amber-900 uppercase tracking-wide">Parking Location & Deployment Hubs</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{fleet.parkingLocation}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Features & Options Checklist */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-amber" />
                    Vehicle Features & Equipment
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Every vehicle in this class includes guaranteed amenities</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fleet.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chauffeur Standards */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-brand-amber">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Antigravity Chauffeur Excellence Guarantee</h3>
                  <p className="text-xs text-slate-300">Dedicated professionals trained in executive etiquette and high-speed highway safety</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {fleet.chauffeurStandards.map((std, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{std}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking & Transparent Fare Breakdown (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              
              {/* Fare & Booking Calculator Box */}
              <div className="bg-white rounded-3xl border-2 border-brand-amber/30 p-6 sm:p-8 shadow-xl space-y-6">
                
                {/* Price Header */}
                <div className="flex items-baseline justify-between border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">All-Inclusive Starting Fare</span>
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">{fleet.price}</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    No Hidden Charges
                  </span>
                </div>

                {/* Service Selector Tabs */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Trip Type</label>
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setSelectedService("outstation")}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                        selectedService === "outstation" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Outstation
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedService("local")}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                        selectedService === "local" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Local Rental
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedService("airport")}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                        selectedService === "airport" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Airport
                    </button>
                  </div>
                </div>

                {/* Pricing Details Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  {selectedService === "outstation" && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Base Distance Rate</span>
                        <span className="font-extrabold text-slate-900">₹{fleet.perKmRate} / km</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Minimum Billed Distance</span>
                        <span className="font-extrabold text-slate-900">250 km / calendar day</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Driver Day Allowance (Beta)</span>
                        <span className="font-extrabold text-slate-900">₹400 / day</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Night Allowance (10 PM - 6 AM)</span>
                        <span className="font-extrabold text-slate-900">₹250 / night</span>
                      </div>
                    </>
                  )}

                  {selectedService === "local" && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Standard 8 Hr / 80 Km Package</span>
                        <span className="font-extrabold text-slate-900">{fleet.hourlyPackage}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Extra Hour</span>
                        <span className="font-extrabold text-slate-900">₹150 / hr</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Extra Km</span>
                        <span className="font-extrabold text-slate-900">₹{fleet.perKmRate} / km</span>
                      </div>
                    </>
                  )}

                  {selectedService === "airport" && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Point-to-Point Flat Transfer</span>
                        <span className="font-extrabold text-slate-900">{fleet.airportFlatRate}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Flight Delay Waiting (First 45m)</span>
                        <span className="font-extrabold text-emerald-600">Free Included</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Doorstep Luggage Assistance</span>
                        <span className="font-extrabold text-emerald-600">Included</span>
                      </div>
                    </>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-800">
                    <span>GST (5%) & Tolls</span>
                    <span className="text-slate-500 font-normal">Calculated as per actuals / route</span>
                  </div>
                </div>

                {/* Instant Book CTA */}
                <Link
                  href={`/?fleet=${fleet.slug}&service=${selectedService}`}
                  className="w-full py-4 px-6 rounded-2xl bg-brand-navy hover:bg-slate-800 text-white font-black text-center flex items-center justify-center gap-2 shadow-lg transition-all text-sm uppercase tracking-wider"
                >
                  <span>Book {fleet.name} Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="text-center">
                  <a 
                    href="tel:+919045450000" 
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-amber transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-brand-amber" />
                    Need custom booking? Call 24/7 Helpline: +91 90454 50000
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Free cancellation 6h prior</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live GPS sharing with family</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto GST Tax Invoice</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>24x7 Antigravity Support</span>
                  </div>
                </div>

              </div>

              {/* Other Fleet Recommendations */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <h3 className="text-base font-black text-slate-900">Explore Other Fleet Categories</h3>
                <div className="space-y-3">
                  {otherFleets.map((other) => (
                    <Link
                      key={other.slug}
                      href={`/fleet/${other.slug}`}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-brand-amber hover:bg-amber-50/40 transition-all group"
                    >
                      <div className="relative w-14 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <Image src={other.image} alt={other.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                          {other.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">{other.seatingCapacity} Seats · {other.price}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
