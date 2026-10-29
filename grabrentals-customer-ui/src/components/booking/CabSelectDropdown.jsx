"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Car, ChevronDown, Check } from "lucide-react";

export const CAB_OPTIONS = [
  { slug: "", name: "All Cabs & Vehicles", label: "All Cabs & Vehicles", seats: "All Fleet", badge: "All" },
  { slug: "hatchback", name: "Hatchback", label: "Hatchback", seats: "4+1 Seats", badge: "WagonR, Tiago" },
  { slug: "sedan", name: "Sedan", label: "Sedan", seats: "4+1 Seats", badge: "Dzire, Etios" },
  { slug: "suv", name: "SUV", label: "SUV", seats: "6+1 Seats", badge: "Ertiga, Creta" },
  { slug: "crysta", name: "Innova Crysta", label: "Innova Crysta", seats: "6-7 Seats", badge: "Luxury MPV" },
  { slug: "innovahycross", name: "Innova Hycross", label: "Innova Hycross", seats: "6-7 Seats", badge: "Hybrid MPV" },
  { slug: "urbania", name: "Force Urbania", label: "Force Urbania", seats: "9-16 Seats", badge: "Luxury Van" },
  { slug: "tempo", name: "Tempo Traveller", label: "Tempo Traveller", seats: "9-21 Seats", badge: "Minibus" },
  { slug: "bus", name: "Luxury Bus", label: "Luxury Bus", seats: "35-65 Seats", badge: "Volvo / Coach" },
];

export default function CabSelectDropdown({
  value = "",
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
    if (!value) return CAB_OPTIONS[0];
    const valSlug = value.toLowerCase().trim();
    return CAB_OPTIONS.find((c) => c.slug === valSlug) || CAB_OPTIONS[0];
  }, [value]);

  const handleSelect = (slug) => {
    if (onChange) {
      onChange(slug);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Dropdown Button styled identically to normal BookingWidget inputs */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 pl-3 sm:pl-3.5 pr-3 py-2 sm:py-2.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 transition-all shadow-2xs cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe]"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Car className="w-4 h-4 text-[#0082fe] shrink-0" />
          <span className="truncate text-left text-xs sm:text-sm font-bold text-slate-900">
            {selectedOption.name}
          </span>
          {selectedOption.seats && (
            <span className="hidden sm:inline-block text-[10px] font-bold text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded shrink-0">
              {selectedOption.seats}
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
        <div className="absolute right-0 top-full mt-1.5 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            Select Travel Class
          </div>
          {CAB_OPTIONS.map((item) => {
            const isSelected = (value || "").toLowerCase() === item.slug;
            return (
              <button
                key={item.slug || "all"}
                type="button"
                onClick={() => handleSelect(item.slug)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                  isSelected
                    ? "bg-blue-50/80 text-[#0082fe] font-bold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="text-[10.5px] text-slate-500">{item.seats} · {item.badge}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#0082fe] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
