"use client";

import { useState, useMemo } from "react";
import { ArrowLeftRight, MapPin, Calendar, Clock, ArrowRight, Plus, Minus, Navigation } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CityAutocompleteInput from "@/components/booking/CityAutocompleteInput";
import LocationPickerModal from "@/components/booking/LocationPickerModal";
import { detectRouteDistance } from "@/lib/cities";
import { useLanguage } from "@/context/LanguageContext";

export default function BookingWidget() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("outstation");
  const [tripType, setTripType] = useState("one-way");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState("pickup"); // 'pickup' | 'drop'

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

  // Automatic KM & Route Duration Detection
  const routeEstimate = useMemo(() => {
    return detectRouteDistance(pickupCity, dropCity, stops, tripType);
  }, [pickupCity, dropCity, stops, tripType]);

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

  const handleExploreClick = () => {
    const validStops = stops.filter((s) => s.trim());
    if (typeof window !== "undefined") {
      sessionStorage.setItem("grab_pending_trip", JSON.stringify({
        from: pickupCity,
        to: dropCity,
        stops: validStops.join("|"),
        tripType,
        date: pickupDate,
        time: pickupTime
      }));
    }
  };

  const hasStops = allowsStops && stops.length > 0;
  const isRoundTrip = tripType === "round-trip";

  return (
    <div className="bg-white text-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 max-w-6xl mx-auto border border-slate-200/50">
      
      {/* Top Segmented Tabs */}
      <div className="flex border-b border-slate-200 mb-4 sm:mb-6 overflow-x-auto hide-scrollbar pb-1 gap-1">
        {[
          { id: "outstation", label: t("outstation_cabs") },
          { id: "local", label: t("local_rental") },
          { id: "airport", label: t("airport") },
          { id: "van", label: t("tempo_traveller") },
          { id: "bus", label: t("luxury_buses") },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-3.5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-colors border-b-[3px] ${
              activeTab === tab.id
                ? "text-brand-amber border-brand-amber bg-orange-50/50 rounded-t-lg"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trip Type Radios / Bordered Pill Buttons */}
      {allowsStops && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
          {[
            { id: "one-way", label: t("one_way") },
            { id: "round-trip", label: t("round_trip") },
            { id: "multi-city-tour", label: t("multi_city_tour") || "Multi-City Tour" },
          ].map((item) => {
            const isSelected = tripType === item.id;
            return (
              <label
                key={item.id}
                className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-amber-50/70 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-500/30 font-bold"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 font-semibold"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                    isSelected ? "border-amber-600" : "border-slate-300"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-amber-600" />}
                </div>
                <input
                  type="radio"
                  name="tripType"
                  value={item.id}
                  checked={isSelected}
                  onChange={(e) => handleTripTypeChange(e.target.value)}
                  className="hidden"
                />
                <span className="text-xs sm:text-sm capitalize whitespace-nowrap">
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {/* ===================== INPUT SECTION ===================== */}
      {/* If stops or round-trip: 2-row multi-column grid like Savaari */}
      {hasStops || isRoundTrip ? (
        <div className="space-y-4">
          {/* ROW 1: Locations (FROM -> STOP 1 -> STOP 2 -> TO) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-start">
            
            {/* FROM: Pickup City */}
            <div className={`w-full relative ${hasStops ? "lg:col-span-4" : "lg:col-span-5"}`}>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t("from_city")}
              </label>
              <CityAutocompleteInput 
                value={pickupCity}
                onChange={setPickupCity}
                placeholder="e.g. Bangalore (Bengaluru)" 
                iconColor="text-brand-emerald"
                inputClassName="rounded-xl"
              />
              <button
                type="button"
                onClick={() => {
                  setMapTarget("pickup");
                  setIsMapModalOpen(true);
                }}
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors cursor-pointer group"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span>{t("choose_from_location") || "Choose from Location"}</span>
              </button>
            </div>

            {/* Swap Button (between pickup & stops/drop) */}
            <div className="hidden lg:flex items-center justify-center pt-6 lg:col-span-1">
              <button 
                type="button"
                onClick={handleSwap}
                title="Swap Pickup & Destination"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-brand-amber hover:border-brand-amber hover:bg-orange-50 transition-all shadow-sm group cursor-pointer"
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
                    {t("stop_label") || "STOP"} {index + 1}
                    <span className="text-[10px] font-normal text-slate-400 lowercase">(optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(index)}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>

                <CityAutocompleteInput
                  value={stop}
                  onChange={(val) => handleStopChange(index, val)}
                  placeholder="Type stop city (e.g. Salem)"
                  iconColor="text-brand-amber"
                  inputClassName="bg-amber-50/40 border-amber-200 rounded-xl"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(index)}
                      title="Remove this stop"
                      className="w-7 h-7 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  }
                />

                {/* Map picker & Quick suggestion chips */}
                <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setMapTarget(`stop-${index}`);
                      setIsMapModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors cursor-pointer group"
                  >
                    <MapPin className="w-3 h-3 text-purple-500 group-hover:scale-110 transition-transform" />
                    <span>Choose on Map</span>
                  </button>

                  {!stop && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-semibold">{t("suggested") || "Suggested:"}</span>
                      {["Salem", "Chennai", "Mysore", "Vellore"].map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleStopChange(index, city)}
                          className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                        >
                          + {city}
                        </button>
                      ))}
                    </div>
                  )}
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
                {t("to_city")}
              </label>
              <CityAutocompleteInput 
                value={dropCity}
                onChange={setDropCity}
                placeholder="e.g. Coimbatore, Tamil Nadu" 
                iconColor="text-brand-orange"
                inputClassName="rounded-xl"
              />

              {/* Action triggers below field */}
              <div className="flex items-center justify-between gap-3 mt-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setMapTarget("drop");
                    setIsMapModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors cursor-pointer group"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span>{t("choose_to_location") || "Choose to Location"}</span>
                </button>

                {allowsStops && stops.length < 3 && (
                  <button
                    type="button"
                    onClick={() => handleAddStop()}
                    className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors cursor-pointer group"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span>{t("add_stop") || "Add Stop"}</span>
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
                {t("pickup_date")}
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
                  {t("return_date")}
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
                {t("pickup_time")}
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
                onClick={handleExploreClick}
                className="flex items-center justify-center gap-2 w-full bg-[#D97706] hover:bg-[#B45309] text-white py-3.5 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg whitespace-nowrap shrink-0"
              >
                {t("search_cabs")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      ) : (
        /* STANDARD 1-ROW VIEW (When 0 stops and one-way) */
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start relative">
          {/* Pickup City */}
          <div className="flex-1 w-full relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {t("from_city")}
            </label>
            <CityAutocompleteInput 
              value={pickupCity}
              onChange={setPickupCity}
              placeholder="e.g. Bangalore (Bengaluru)" 
              iconColor="text-brand-emerald"
            />
            <button
              type="button"
              onClick={() => {
                setMapTarget("pickup");
                setIsMapModalOpen(true);
              }}
              className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors cursor-pointer group"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>{t("choose_from_location") || "Choose from Location"}</span>
            </button>
          </div>

          {/* Desktop Swap Button */}
          {allowsStops && (
            <div className="hidden lg:flex items-center justify-center pt-6 px-1">
              <button 
                type="button"
                onClick={handleSwap}
                title="Swap Pickup & Destination"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-brand-amber hover:border-brand-amber hover:bg-orange-50 transition-all shadow-sm group cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}

          {/* Mobile Swap Button */}
          {allowsStops && (
            <div className="flex lg:hidden justify-center -my-1 w-full relative z-10">
              <button 
                type="button"
                onClick={handleSwap}
                title="Swap Pickup & Destination"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-brand-amber hover:border-brand-amber shadow-sm cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 rotate-90" />
              </button>
            </div>
          )}

          {/* Drop Destination */}
          <div className="flex-1 w-full relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {activeTab === "airport" ? t("airport") : activeTab === "local" ? t("local_rental") : t("to_city")}
            </label>

            {activeTab === "airport" ? (
              <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm">
                <option>To Kempegowda Airport (BLR)</option>
                <option>From Kempegowda Airport (BLR)</option>
              </select>
            ) : (
              <CityAutocompleteInput
                value={dropCity}
                onChange={setDropCity}
                placeholder={activeTab === "local" ? "e.g. Indiranagar / Koramangala" : "e.g. Coimbatore, Tamil Nadu"}
                iconColor="text-brand-orange"
              />
            )}

            <div className="flex items-center justify-between gap-3 mt-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setMapTarget("drop");
                  setIsMapModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors cursor-pointer group"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span>{t("choose_to_location") || "Choose to Location"}</span>
              </button>

              {allowsStops && stops.length < 3 && (
                <button
                  type="button"
                  onClick={() => handleAddStop()}
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors cursor-pointer group"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span>{t("add_stop") || "Add Stop"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex-1 lg:flex-[1.1] w-full grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t("pickup_date")}</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
                <input 
                  type="date" 
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full pl-9 sm:pl-11 pr-2 sm:pr-3 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t("pickup_time")}</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
                <input 
                  type="time" 
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full pl-9 sm:pl-11 pr-2 sm:pr-3 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber transition-all shadow-sm cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="w-full lg:w-auto mt-2 sm:mt-4 lg:mt-[23px]">
            <Link 
              href={buildExploreUrl()}
              onClick={handleExploreClick}
              className="flex items-center justify-center gap-2 w-full lg:w-auto lg:min-w-[130px] px-6 bg-[#D97706] hover:bg-[#B45309] text-white py-3.5 rounded-lg font-extrabold text-sm uppercase tracking-wide transition-all shadow-md active:scale-95 whitespace-nowrap shrink-0"
            >
              {t("search_cabs")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Automatic Route Distance & Driving Time Detection Banner */}
      {routeEstimate.isDetected && routeEstimate.distanceKm > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-amber-50/70 border border-amber-200/80 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {t("auto_detected_route") || "Auto-Detected Route:"}
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {routeEstimate.distanceKm} km
            </span>
            <span className="text-xs font-semibold text-slate-500 capitalize">
              ({tripType === "one-way" ? t("trip_one_way") : tripType === "round-trip" ? t("trip_round_trip") : t("multi_city_tour")})
            </span>
          </div>
          <div className="text-xs font-bold text-amber-800 bg-white/90 px-3 py-1 rounded-lg border border-amber-200/60 flex items-center gap-1.5 shadow-2xs">
            <span>⏱️ {t("estimated_driving_time") || "Estimated Driving Time:"}</span>
            <span className="text-slate-900 font-extrabold">~{routeEstimate.durationHours} hrs</span>
          </div>
        </div>
      )}

      {/* Trust Guarantee & Promo Strip (Orange Banner matching design) */}
      <div className="mt-4 sm:mt-6 p-3 sm:px-5 sm:py-2.5 rounded-xl bg-[#EA580C] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold shadow-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="font-bold text-white tracking-tight">{t("verified_highway_trips") || "5,00,000+ Verified Highway Trips"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="font-bold text-white tracking-tight">{t("police_cleared_drivers") || "Commercial Badged & Police-Cleared Drivers"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="font-bold text-white tracking-tight">{t("zero_hidden_fares") || "Zero Hidden Night Fares • All-Inclusive Option"}</span>
          </div>
        </div>
        
        {/* Promo Pill on Far Right */}
        <div className="bg-white text-[#EA580C] font-black text-xs px-3.5 py-1.5 rounded-lg shadow-xs whitespace-nowrap w-full sm:w-auto text-center">
          {t("flat_discount_promo") || "Flat 10% Off First Outstation Ride"}
        </div>
      </div>

      {/* Interactive Google Maps / Leaflet Location Picker Modal */}
      <LocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        activeTarget={mapTarget}
        pickupValue={pickupCity}
        dropValue={dropCity}
        stops={stops}
        allowStops={allowsStops}
        onSelect={(selectedLocation, coords, target, allValues) => {
          if (allValues) {
            if (allValues.pickup) setPickupCity(allValues.pickup);
            if (allValues.drop) setDropCity(allValues.drop);
            if (Array.isArray(allValues.stops)) setStops(allValues.stops);
          } else if (target === "drop") {
            setDropCity(selectedLocation);
          } else if (typeof target === "string" && target.startsWith("stop-")) {
            const idx = parseInt(target.replace("stop-", ""), 10);
            if (idx >= 0) {
              const updated = [...stops];
              updated[idx] = selectedLocation;
              setStops(updated);
            }
          } else {
            setPickupCity(selectedLocation);
          }
        }}
        onSelectPickup={(selectedLocation) => {
          setPickupCity(selectedLocation);
        }}
        onSelectDrop={(selectedLocation) => {
          setDropCity(selectedLocation);
        }}
        onSelectStops={(newStops) => {
          setStops(newStops);
        }}
      />

    </div>
  );
}

