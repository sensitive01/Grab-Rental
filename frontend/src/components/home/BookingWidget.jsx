"use client";

import { useState } from "react";
import { ArrowLeftRight, MapPin, Calendar, Clock, ArrowRight, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BookingWidget() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("outstation");
  const [tripType, setTripType] = useState("one-way");

  // Location inputs
  const [pickupCity, setPickupCity] = useState("Bangalore, Karnataka");
  const [dropCity, setDropCity] = useState("Coimbatore, Tamil Nadu");
  const [stops, setStops] = useState([]); // Array of optional intermediate stops

  // Date & Time inputs
  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dropDate, setDropDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [pickupTime, setPickupTime] = useState("07:00");

  const allowsStops = activeTab === "outstation" || activeTab === "van" || activeTab === "bus";

  // Stop management
  const handleAddStop = (index) => {
    if (stops.length >= 3) return; // Max 3 stops
    if (typeof index === "number") {
      const nextStops = [...stops];
      nextStops.splice(index + 1, 0, "");
      setStops(nextStops);
    } else {
      setStops([...stops, ""]);
    }
  };

  const handleRemoveStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleStopChange = (index, value) => {
    const updated = [...stops];
    updated[index] = value;
    setStops(updated);
  };

  const handleSwap = () => {
    setPickupCity(dropCity);
    setDropCity(pickupCity);
    if (stops.length > 0) {
      setStops([...stops].reverse());
    }
  };

  const handleTripTypeChange = (type) => {
    setTripType(type);
    if (type === "multi-city-tour" && stops.length === 0) {
      setStops([""]);
    }
  };

  // Build target explore URL with search parameters
  const buildExploreUrl = () => {
    const params = new URLSearchParams();
    if (pickupCity) params.set("from", pickupCity);
    if (dropCity) params.set("to", dropCity);
    const validStops = stops.filter((s) => s.trim());
    if (validStops.length > 0) {
      params.set("stops", validStops.join("|"));
    }
    params.set("tripType", tripType);
    params.set("pickupDate", pickupDate);
    if (tripType === "round-trip" && dropDate) {
      params.set("dropDate", dropDate);
    }
    params.set("pickupTime", pickupTime);
    return `/outstation/select-vehicle?${params.toString()}`;
  };

  const hasStops = allowsStops && stops.length > 0;
  const isRoundTrip = tripType === "round-trip";

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
      {allowsStops && (
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-5">
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
                onChange={(e) => handleTripTypeChange(e.target.value)}
                className="hidden"
              />
              <span className={`text-sm font-bold capitalize ${tripType === type ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>
                {type.replace(/-/g, " ")}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* ===================== INPUT SECTION ===================== */}
      {/* If stops or round-trip: 2-row multi-column grid like Savaari */}
      {hasStops || isRoundTrip ? (
        <div className="space-y-4">
          {/* ROW 1: Locations (FROM -> STOP 1 -> STOP 2 -> TO) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            
            {/* FROM: Pickup City */}
            <div className={`w-full relative ${hasStops ? "lg:col-span-4" : "lg:col-span-5"}`}>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                FROM (Pickup City)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-emerald w-5 h-5 pointer-events-none" />
                <input 
                  type="text" 
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  placeholder="e.g. Bangalore, Karnataka" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Swap Button (between pickup & stops/drop) */}
            <div className="hidden lg:flex items-center justify-center pb-2 lg:col-span-1">
              <button 
                type="button"
                onClick={handleSwap}
                title="Swap Pickup & Destination"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-brand-amber hover:border-brand-amber hover:bg-orange-50 transition-all shadow-sm group"
              >
                <ArrowLeftRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* STOPS: Optional intermediate stops */}
            {stops.map((stop, index) => (
              <div key={index} className="w-full relative lg:col-span-3 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-brand-amber uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-amber inline-block"></span>
                    STOP {index + 1}
                    <span className="text-[10px] font-normal text-slate-400 lowercase">(optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(index)}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-amber w-5 h-5 pointer-events-none" />
                  <input 
                    type="text" 
                    value={stop}
                    onChange={(e) => handleStopChange(index, e.target.value)}
                    placeholder={`e.g. Chennai, Tamil Nadu`}
                    className="w-full pl-11 pr-20 py-3.5 bg-amber-50/40 border border-amber-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm"
                  />
                  {/* Action buttons (- and +) like Savaari */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(index)}
                      title="Remove this stop"
                      className="w-7 h-7 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors shadow-2xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    {stops.length < 3 && (
                      <button
                        type="button"
                        onClick={() => handleAddStop(index)}
                        title="Add another stop"
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-brand-amber hover:border-brand-amber hover:bg-orange-50 transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* TO: Drop Destination */}
            <div className={`w-full relative ${
              hasStops 
                ? stops.length === 1 
                  ? "lg:col-span-4" 
                  : "lg:col-span-4"
                : "lg:col-span-6"
            }`}>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                TO (Drop Destination)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-orange w-5 h-5 pointer-events-none" />
                <input 
                  type="text" 
                  value={dropCity}
                  onChange={(e) => setDropCity(e.target.value)}
                  placeholder="e.g. Coimbatore, Tamil Nadu" 
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm"
                />
                {stops.length < 3 && (
                  <button
                    type="button"
                    onClick={() => handleAddStop()}
                    title="Add intermediate stop (Optional)"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-brand-amber hover:border-brand-amber hover:bg-orange-50 transition-all shadow-2xs group"
                  >
                    <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* ROW 2: Schedule & Action (Pick Up Date, Return Date, Pick Up Time, Explore CTA) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end pt-2 border-t border-slate-100">
            
            {/* PICK UP DATE */}
            <div className={isRoundTrip ? "lg:col-span-3" : "lg:col-span-4"}>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                PICK UP DATE
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                <input 
                  type="date" 
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full pl-11 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm cursor-pointer"
                />
              </div>
            </div>

            {/* DROP / RETURN DATE (for Round Trip) */}
            {isRoundTrip && (
              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  DROP DATE (RETURN)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input 
                    type="date" 
                    value={dropDate}
                    onChange={(e) => setDropDate(e.target.value)}
                    className="w-full pl-11 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* PICK UP TIME */}
            <div className={isRoundTrip ? "lg:col-span-2" : "lg:col-span-3"}>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                PICK UP TIME
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                <input 
                  type="time" 
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full pl-11 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm cursor-pointer"
                />
              </div>
            </div>

            {/* CTA Button: EXPLORE CABS */}
            <div className={isRoundTrip ? "lg:col-span-4" : "lg:col-span-5"}>
              <Link 
                href={buildExploreUrl()}
                className="flex items-center justify-center gap-2 w-full bg-[#D97706] hover:bg-[#B45309] text-white py-3.5 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
              >
                EXPLORE CABS <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      ) : (
        /* STANDARD 1-ROW VIEW (When 0 stops and one-way) */
        <div className="flex flex-col lg:flex-row gap-4 items-end relative">
          {/* Pickup City */}
          <div className="flex-1 w-full relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Pickup City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-emerald w-5 h-5 pointer-events-none" />
              <input 
                type="text" 
                value={pickupCity}
                onChange={(e) => setPickupCity(e.target.value)}
                placeholder="e.g. Bangalore (Bengaluru)" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Swap Button */}
          {allowsStops && (
            <div className="hidden lg:flex items-center justify-center pb-2 px-1">
              <button 
                type="button"
                onClick={handleSwap}
                title="Swap Pickup & Destination"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-brand-amber hover:border-brand-amber hover:bg-orange-50 transition-all shadow-sm group"
              >
                <ArrowLeftRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}

          {/* Drop Destination */}
          <div className="flex-1 w-full relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {activeTab === "airport" ? "Trip Type" : activeTab === "local" ? "City / Area" : "Drop Destination"}
            </label>

            {activeTab === "airport" ? (
              <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm">
                <option>To Kempegowda Airport (BLR)</option>
                <option>From Kempegowda Airport (BLR)</option>
              </select>
            ) : (
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-orange w-5 h-5 pointer-events-none" />
                <input 
                  type="text" 
                  value={dropCity}
                  onChange={(e) => setDropCity(e.target.value)}
                  placeholder={activeTab === "local" ? "e.g. Indiranagar / Koramangala" : "e.g. Mysore (145 km)"} 
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm"
                />
                {allowsStops && (
                  <button
                    type="button"
                    onClick={() => handleAddStop()}
                    title="Add intermediate stop (Optional)"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-brand-amber hover:border-brand-amber hover:bg-orange-50 transition-all shadow-2xs group"
                  >
                    <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="flex-1 lg:flex-[1.1] w-full flex gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pick Up Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                <input 
                  type="date" 
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full pl-11 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm cursor-pointer"
                />
              </div>
            </div>
            <div className="w-32 shrink-0">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                <input 
                  type="time" 
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full pl-11 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="w-full lg:w-auto mt-4 lg:mt-0">
            <Link 
              href={buildExploreUrl()}
              className="flex items-center justify-center gap-2 w-full lg:w-44 bg-[#D97706] hover:bg-[#B45309] text-white py-3.5 rounded-lg font-extrabold text-sm uppercase tracking-wide transition-all shadow-sm"
            >
              Explore <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Trust Guarantee Strip */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-bold text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald shrink-0"></span>
          <span>5,00,000+ Verified Highway Trips</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald shrink-0"></span>
          <span>Commercial Badged & Police-Cleared Drivers</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald shrink-0"></span>
          <span>Zero Hidden Night Fares • All-Inclusive Option</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-brand-orange bg-orange-50 px-2.5 py-1 rounded w-full sm:w-auto sm:ml-auto border border-orange-100">
          Flat 10% Off First Outstation Ride
        </div>
      </div>

    </div>
  );
}

