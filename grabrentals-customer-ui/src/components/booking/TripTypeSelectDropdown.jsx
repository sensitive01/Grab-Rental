"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Compass, ChevronDown, Check, RotateCcw, ArrowRight, Clock, Plane, Map } from "lucide-react";

export const TRIP_TYPE_OPTIONS = [
  {
    id: "outstation-round",
    service: "outstation",
    tripType: "round-trip",
    name: "Outstation (Round Trip)",
    badge: "Most Popular",
    desc: "Round trip returning to original city",
    icon: RotateCcw,
  },
  {
    id: "outstation-oneway",
    service: "outstation",
    tripType: "one-way",
    name: "Outstation (One Way)",
    badge: "Direct Drop",
    desc: "Point-to-point one-way transit",
    icon: ArrowRight,
  },
  {
    id: "outstation-multi",
    service: "outstation",
    tripType: "multi-city-tour",
    name: "Outstation (Multi-City Tour)",
    badge: "Custom Route",
    desc: "Visit multiple destinations in one journey",
    icon: Map,
  },
  {
    id: "local",
    service: "local",
    tripType: "local",
    name: "Local Hourly Rental",
    badge: "Hourly Chauffeur",
    desc: "Within city limits (4hr, 8hr, 12hr packages)",
    icon: Clock,
  },
  {
    id: "airport",
    service: "airport",
    tripType: "airport",
    name: "Airport Transfer",
    badge: "24/7 On-Time",
    desc: "Dedicated airport pickup and drop",
    icon: Plane,
  },
  {
    id: "package",
    service: "package",
    tripType: "round-trip",
    name: "Tour Packages",
    badge: "Holiday Routes",
    desc: "Curated holiday and pilgrimage routes",
    icon: Compass,
  },
];

export default function TripTypeSelectDropdown({
  activeTab = "outstation",
  tripType = "round-trip",
  onChange,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = useMemo(() => {
    if (activeTab === "outstation") {
      if (tripType === "one-way") return TRIP_TYPE_OPTIONS[1];
      if (tripType === "multi-city-tour") return TRIP_TYPE_OPTIONS[2];
      return TRIP_TYPE_OPTIONS[0];
    }
    if (activeTab === "local") return TRIP_TYPE_OPTIONS[3];
    if (activeTab === "airport") return TRIP_TYPE_OPTIONS[4];
    if (activeTab === "package") return TRIP_TYPE_OPTIONS[5];
    return TRIP_TYPE_OPTIONS[0];
  }, [activeTab, tripType]);

  const handleSelect = (option) => {
    if (onChange) {
      onChange(option);
    }
    setIsOpen(false);
  };

  const IconComponent = selectedOption.icon || Compass;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Dropdown Button styled identically to normal BookingWidget inputs */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 pl-3 sm:pl-3.5 pr-3 py-2 sm:py-2.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 transition-all shadow-2xs cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe]"
      >
        <div className="flex items-center gap-2 min-w-0">
          <IconComponent className="w-4 h-4 text-[#0082fe] shrink-0" />
          <span className="truncate text-left text-xs sm:text-sm font-bold text-slate-900">
            {selectedOption.name}
          </span>
          {selectedOption.badge && (
            <span className="hidden sm:inline-block text-[10px] font-bold text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-[#0082fe]" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            Select Trip Type / Service
          </div>
          {TRIP_TYPE_OPTIONS.map((item) => {
            const isSelected = selectedOption.id === item.id;
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                  isSelected
                    ? "bg-blue-50/80 text-[#0082fe] font-bold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <ItemIcon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-[#0082fe]" : "text-slate-400"}`} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-900 truncate">{item.name}</span>
                    <span className="text-[10.5px] text-slate-500 truncate">{item.desc}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#0082fe] shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
