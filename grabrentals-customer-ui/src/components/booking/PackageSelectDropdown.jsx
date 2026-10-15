"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Clock, ChevronDown, Check, ShieldCheck, Sparkles } from "lucide-react";

export default function PackageSelectDropdown({
  value,
  onChange,
  packages = [],
  placeholder = "Select Hourly Package",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);

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
    if (!value && packages.length > 0) return packages[0];
    return packages.find((p) => p.value === value) || packages[0];
  }, [packages, value]);

  const handleSelect = (pkgValue) => {
    onChange(pkgValue);
    setIsOpen(false);
  };

  const hours = selectedPkg?.hours || 4;
  const km = selectedPkg?.km || 40;
  const exHr = selectedPkg?.extraHourRate ?? 20;
  const exKm = selectedPkg?.extraKmRate ?? 15;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="w-full flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl px-3.5 py-3 transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 group"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">
            {hours} Hours / {km} Kms
          </span>
          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap truncate">
            (Extra: ₹{Math.round(exHr)}/hr, ₹{Math.round(exKm)}/km)
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-amber-600" : "group-hover:text-slate-600"
          }`}
        />
      </button>

      {/* Downward Popover Menu */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 top-full mt-2 z-50 w-full min-w-[320px] sm:min-w-[360px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2 max-h-80 overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95 duration-150 focus:outline-none scrollbar-thin"
        >
          <div className="px-2.5 py-1.5 mb-1 flex items-center justify-between border-b border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Select Package Duration
            </span>
            <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Transparent Pricing
            </span>
          </div>

          {packages.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 font-medium">
              Loading local packages...
            </div>
          ) : (
            <div className="space-y-1">
              {packages.map((pkg) => {
                const isSelected = selectedPkg && pkg.value === selectedPkg.value;
                const pHours = pkg.hours || 4;
                const pKm = pkg.km || 40;
                const pExHr = Math.round(pkg.extraHourRate ?? 20);
                const pExKm = Math.round(pkg.extraKmRate ?? 15);

                return (
                  <button
                    key={pkg.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(pkg.value)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left border ${
                      isSelected
                        ? "bg-amber-50/90 border-amber-300 shadow-xs"
                        : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">
                          {pHours} Hours / {pKm} Kms
                        </div>
                        <div className="text-[11px] font-medium text-slate-500 whitespace-nowrap mt-0.5">
                          Additional: <span className="font-semibold text-slate-700">₹{pExHr}/hr</span> & <span className="font-semibold text-slate-700">₹{pExKm}/km</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-3">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-slate-100 px-2.5 py-1 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Chauffeur & fuel included in base fare
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
