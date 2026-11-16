"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Clock, ChevronDown, Check } from "lucide-react";
import { DEFAULT_LOCAL_PACKAGES } from "@/lib/packageUtils";

export default function PackageSelectDropdown({
  value,
  onChange,
  packages = [],
  className = "",
  hasError = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const displayPackages = useMemo(() => {
    if (Array.isArray(packages) && packages.length > 0) return packages;
    return DEFAULT_LOCAL_PACKAGES;
  }, [packages]);

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

  // Current selected package lookup
  const selectedPkg = useMemo(() => {
    if (!value && displayPackages.length > 0) return displayPackages[0];
    return displayPackages.find((p) => p.value === value) || displayPackages[0];
  }, [displayPackages, value]);

  const handleSelect = (pkgValue) => {
    if (onChange) onChange(pkgValue);
    setIsOpen(false);
  };

  const hours = selectedPkg?.hours || 8;
  const km = selectedPkg?.km || 80;
  const exHr = selectedPkg?.extraHourRate ?? 150;
  const exKm = selectedPkg?.extraKmRate ?? 14;

  return (
    <div ref={containerRef} className={`relative w-full min-w-0 ${className}`}>
      {/* Trigger Button - exactly 44px height, rounded-xl */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`w-full min-w-0 h-[44px] flex items-center justify-between text-left rounded-xl px-3 py-2 bg-white transition-all cursor-pointer focus:outline-none group ${
          hasError
            ? "border-2 border-rose-500 bg-rose-50/25 ring-2 ring-rose-200/60"
            : "border border-slate-200 hover:border-amber-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 pointer-events-none" />
          <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
            {hours} Hours / {km} Kms
          </span>
          <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap truncate hidden sm:inline">
            (₹{Math.round(exHr)}/hr, ₹{Math.round(exKm)}/km)
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 ml-1.5 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-amber-600" : "group-hover:text-slate-600"
          }`}
        />
      </button>

      {/* Downward Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 duration-150 max-h-72 flex flex-col">
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Available Hourly Packages</span>
            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
              Local Usage
            </span>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 py-1">
            {displayPackages.map((pkg) => {
              const isSelected = pkg.value === selectedPkg?.value;
              return (
                <button
                  key={pkg.value}
                  type="button"
                  onClick={() => handleSelect(pkg.value)}
                  className={`w-full px-3 py-2.5 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-amber-50/80 text-amber-950 font-bold"
                      : "hover:bg-slate-50 text-slate-700 font-medium"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900">
                      {pkg.hours} Hours / {pkg.km} Kms
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Extra: ₹{Math.round(pkg.extraHourRate ?? 150)}/hr • ₹{Math.round(pkg.extraKmRate ?? 14)}/km
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
