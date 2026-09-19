"use client";

import { useState } from "react";
import { ArrowLeftRight, ArrowRight, MapPin, Calendar, Clock } from "lucide-react";
import Link from "next/link";

export default function BookingWidget() {
  const [activeTab, setActiveTab] = useState("outstation");
  const [tripType, setTripType] = useState("one-way");

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-slate-200/80">
      {/* Booking Type Tabs */}
      <div className="flex bg-slate-50 border-b border-slate-200 overflow-x-auto hide-scrollbar">
        {[
          { id: "outstation", label: "Outstation" },
          { id: "local", label: "Local / Hourly" },
          { id: "airport", label: "Airport Transfer" },
          { id: "van", label: "Van & Tempo (9-26 seats)" },
          { id: "bus", label: "Luxury Bus (35-55 seats)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-6 py-4 text-sm font-semibold transition-colors border-b-4 ${
              activeTab === tab.id
                ? "text-brand-amber border-brand-amber bg-white"
                : "text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">
        {/* Sub-options for Outstation */}
        {(activeTab === "outstation" || activeTab === "van" || activeTab === "bus") && (
          <div className="flex items-center gap-6 mb-6">
            {["one-way", "round-trip", "multi-city"].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tripType"
                  value={type}
                  checked={tripType === type}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-4 h-4 text-brand-amber focus:ring-brand-amber"
                />
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {type.replace("-", " ")} {type === "multi-city" && "Tour"}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Form Grid */}
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Pickup */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pickup City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="e.g. Bangalore" 
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all"
              />
            </div>
          </div>

          {/* Swap Button (only for Outstation) */}
          {(activeTab === "outstation" || activeTab === "van" || activeTab === "bus") && (
            <button className="hidden md:flex w-10 h-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-brand-amber hover:border-brand-amber hover:bg-orange-50 transition-all mb-2 flex-shrink-0 group">
              <ArrowLeftRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          )}

          {/* Drop (or Trip Type for Airport) */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {activeTab === "airport" ? "Trip Type" : activeTab === "local" ? "City / Area" : "Drop Destination"}
            </label>
            {activeTab === "airport" ? (
              <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all">
                <option>To the Airport</option>
                <option>From the Airport</option>
              </select>
            ) : (
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder={activeTab === "local" ? "e.g. Indiranagar" : "e.g. Mysore"} 
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all"
                />
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="flex-1 w-full flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="date" 
                  className="w-full pl-10 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all"
                />
              </div>
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="time" 
                  defaultValue="09:00"
                  className="w-full pl-10 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all"
                />
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <Link 
              href="/book/vehicles"
              className="flex items-center justify-center gap-2 w-full md:w-auto bg-brand-amber hover:bg-brand-amber-hover text-white px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-sm hover:shadow-md"
            >
              Explore Cabs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
          5,00,000+ Verified Trips
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
          Commercial Badged Drivers
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
          Zero Hidden Night Fares
        </div>
        <div className="flex items-center gap-2 text-brand-amber-light">
          <span className="w-2 h-2 rounded-full bg-brand-amber animate-pulse"></span>
          Flat 10% Off on First Booking
        </div>
      </div>
    </div>
  );
}
