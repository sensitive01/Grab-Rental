"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Clock, ChevronDown, Check } from "lucide-react";

export default function TimeSelectDropdown({
  value,
  onChange,
  availableSlots = [],
  placeholder = "Select Time",
  className = "",
  size = "normal" // "normal" | "compact"
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

  // When dropdown opens, scroll selected slot into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeElement = listRef.current.querySelector('[data-selected="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen]);

  // Selected label lookup
  const selectedSlot = useMemo(() => {
    return availableSlots.find((s) => s.value === value);
  }, [availableSlots, value]);

  const displayLabel = selectedSlot ? selectedSlot.label : (value || placeholder);

  const handleSelect = (slotValue) => {
    onChange(slotValue);
    setIsOpen(false);
  };

  const isCompact = size === "compact";

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`w-full flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl font-bold text-slate-900 transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
          isCompact ? "py-2.5 pl-3.5 pr-3 text-sm" : "py-3 sm:py-3.5 pl-3.5 pr-3 text-xs sm:text-sm"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Clock className={`text-amber-500 shrink-0 ${isCompact ? "w-4 h-4" : "w-4 h-4"}`} />
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-amber-500" : ""
          }`}
        />
      </button>

      {/* Downward Controlled Dropdown Menu */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-1.5 px-1 max-h-60 overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95 duration-150 focus:outline-none scrollbar-thin"
        >
          {availableSlots.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400 font-medium">
              No times available for this date
            </div>
          ) : (
            availableSlots.map((slot) => {
              const isSelected = slot.value === value;
              return (
                <button
                  key={slot.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  data-selected={isSelected}
                  onClick={() => handleSelect(slot.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 my-0.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-amber-500 text-white font-bold shadow-xs"
                      : "text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  <span>{slot.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
