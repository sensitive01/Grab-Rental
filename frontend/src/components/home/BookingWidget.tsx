"use client";

import { useState } from "react";
import { ArrowLeftRight, MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BookingWidget() {
  const [activeTab, setActiveTab] = useState("outstation");
  const [tripType, setTripType] = useState("one-way");

  return (
    <div className="bg-white text-slate-900 rounded-2xl shadow-2xl p-6 max-w-6xl mx-auto -mb-16 border border-slate-200/50">
      
      {/* Top Segmented Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto hide-scrollbar pb-1">
        {[
          { id: "outstation", label: "Outstation" },
          { id: "local", label: "Local / Hourly Rental" },
          { id: "airport", label: "Airport Transfer" },
          { id: "van", label: "Van & Tempo (9–26 seats)" },
          { id: "bus", label: "Luxury Bus (35–55 seats)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-6 py-3 text-sm font-bold transition-colors border-b-[3px] ${
              activeTab === tab.id
                ? "text-brand-amber border-brand-amber bg-orange-50/50 rounded-t-lg"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trip Type Radios */}
      {(activeTab === "outstation" || activeTab === "van" || activeTab === "bus") && (
        <div className="flex items-center gap-6 mb-5">
          {["one-way", "round-trip", "multi-city-tour"].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tripType === type ? 'border-brand-amber' : 'border-slate-300'}`}>
                {tripType === type && <div className="w-2 h-2 rounded-full bg-brand-amber" />}
              </div>
              <input
                type="radio"
                name="tripType"
                value={type}
                checked={tripType === type}
                onChange={(e) => setTripType(e.target.value)}
                className="hidden"
              />
              <span className={`text-sm font-bold capitalize ${tripType === type ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>
                {type.replace(/-/g, " ")}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Input Grid (4 columns) */}
      <div className="flex flex-col lg:flex-row gap-4 items-end relative">
        {/* Pickup City */}
        <div className="flex-1 w-full relative">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pickup City</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-emerald w-5 h-5" />
            <input 
              type="text" 
              placeholder="e.g. Bangalore (Bengaluru)" 
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Swap Button */}
        {(activeTab === "outstation" || activeTab === "van" || activeTab === "bus") && (
          <div className="hidden lg:flex items-center justify-center pb-2 px-1">
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-brand-amber hover:border-brand-amber hover:bg-orange-50 transition-all shadow-sm group">
              <ArrowLeftRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* Drop Destination */}
        <div className="flex-1 w-full relative">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Drop Destination</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-orange w-5 h-5" />
            <input 
              type="text" 
              placeholder="e.g. Mysore (145 km)" 
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex-1 lg:flex-[1.1] w-full flex gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <input 
                type="date" 
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full pl-11 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
          </div>
          <div className="w-32 shrink-0">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <input 
                type="time" 
                defaultValue="06:00"
                className="w-full pl-11 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="w-full lg:w-auto mt-4 lg:mt-0">
          <Link 
            href="/outstation/select-vehicle"
            className="flex items-center justify-center gap-2 w-full lg:w-44 bg-[#D97706] hover:bg-[#B45309] text-white py-3.5 rounded-lg font-extrabold text-sm uppercase tracking-wide transition-all shadow-sm"
          >
            Explore <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Trust Guarantee Strip */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs font-bold text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
          5,00,000+ Verified Highway Trips
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
          Commercial Badged & Police-Cleared Drivers
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
          Zero Hidden Night Fares • All-Inclusive Option
        </div>
        <div className="flex items-center gap-2 text-brand-orange bg-orange-50 px-2 py-0.5 rounded ml-auto border border-orange-100">
          Flat 10% Off First Outstation Ride
        </div>
      </div>

    </div>
  );
}
