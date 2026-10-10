"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { MapPin, Check, Plus, X, Sparkles } from "lucide-react";
import { searchCities, saveCustomCity, formatCityLabel } from "@/lib/cities";

export default function CityAutocompleteInput({
  value = "",
  onChange,
  placeholder = "Enter city name...",
  icon: Icon = MapPin,
  iconColor = "text-brand-emerald",
  inputClassName = "",
  containerClassName = "",
  rightElement = null,
  disabled = false,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync internal input value with incoming prop value
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Filter cities as user types
  const suggestions = useMemo(() => {
    return searchCities(inputValue);
  }, [inputValue]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (onChange) onChange(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectCity = (city) => {
    const formatted = formatCityLabel(city);
    setInputValue(formatted);
    if (onChange) onChange(formatted);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleAddCustom = () => {
    const clean = inputValue.trim();
    if (!clean) return;
    saveCustomCity(clean);
    const formatted = clean.includes(",") ? clean : `${clean}, India`;
    setInputValue(formatted);
    if (onChange) onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    if (onChange) onChange("");
    inputRef.current?.focus();
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleSelectCity(suggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        handleAddCustom();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Check if current typed string is an exact match in suggestions
  const isExactMatch = suggestions.some(
    (s) => s.name.toLowerCase() === inputValue.trim().toLowerCase() ||
           formatCityLabel(s).toLowerCase() === inputValue.trim().toLowerCase()
  );

  return (
    <div ref={containerRef} className={`relative w-full ${containerClassName}`}>
      <div className="relative flex items-center">
        {Icon && (
          <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${iconColor}`} />
        )}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={`w-full pl-11 ${rightElement ? "pr-14" : "pr-8"} py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm ${inputClassName}`}
        />

        {/* Clear content button */}
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute ${rightElement ? "right-10" : "right-3"} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors`}
            title="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Optional Right Element (e.g. + stop button) */}
        {rightElement && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 duration-150 max-h-72 flex flex-col">
          
          {/* Header Title */}
          <div className="px-3.5 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>{inputValue ? "Matching Cities" : "Popular Outstation Hubs"}</span>
            <span className="text-[10px] lowercase font-normal text-slate-400">Click to select</span>
          </div>

          {/* List of Suggestions */}
          <div className="overflow-y-auto divide-y divide-slate-50 py-1">
            {suggestions.map((city, idx) => {
              const isSelected = formatCityLabel(city).toLowerCase() === inputValue.trim().toLowerCase();
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={`${city.name}-${city.state}-${idx}`}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isHighlighted ? "bg-amber-50/70 text-amber-900" : isSelected ? "bg-slate-50 font-bold" : "hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className={`w-4 h-4 shrink-0 ${city.popular ? "text-amber-500" : "text-slate-400"}`} />
                    <div className="truncate">
                      <span className="font-bold text-sm text-slate-900">
                        {city.name}
                      </span>
                      {city.aliases && city.aliases.length > 0 && (
                        <span className="text-xs text-slate-400 ml-1.5 font-normal">
                          ({city.aliases[0]})
                        </span>
                      )}
                      <span className="text-xs text-slate-500 ml-1.5 font-normal">
                        • {city.state}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {city.popular && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                        <Sparkles className="w-2.5 h-2.5" /> Hub
                      </span>
                    )}
                    {city.custom && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                        Custom
                      </span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                </button>
              );
            })}

            {/* Custom Add Option if user typed something new */}
            {inputValue.trim() && !isExactMatch && (
              <button
                type="button"
                onClick={handleAddCustom}
                className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 bg-blue-50/60 hover:bg-blue-100/80 text-blue-700 transition-colors border-t border-blue-100 cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0 text-blue-600" />
                <div className="text-xs font-semibold truncate">
                  Use custom city: <strong className="text-blue-900">"{inputValue.trim()}"</strong>
                </div>
              </button>
            )}

            {suggestions.length === 0 && !inputValue.trim() && (
              <div className="p-4 text-center text-xs text-slate-400">
                Type any city or town name to search
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
