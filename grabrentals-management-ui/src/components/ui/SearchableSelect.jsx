    "use client";

    import { useState, useRef, useEffect, useMemo } from "react";
    import { Search, ChevronDown, Check, X } from "lucide-react";

    export function SearchableSelect({
      value = "",
      onChange,
      options = [],
      placeholder = "-- Choose an Option --",
      searchPlaceholder = "Type to search...",
      allOptionLabel = "",
      allOptionBadge = "",
      onClear,
      disabled = false,
      className = "",
      icon: TriggerIcon = null
    }) {
      const [isOpen, setIsOpen] = useState(false);
      const [searchQuery, setSearchQuery] = useState("");

      const containerRef = useRef(null);
      const searchInputRef = useRef(null);

      // Close on outside click
      useEffect(() => {
        const handleOutsideClick = (e) => {
          if (containerRef.current && !containerRef.current.contains(e.target)) {
            setIsOpen(false);
            setSearchQuery("");
          }
        };
        const handleKeyDown = (e) => {
          if (e.key === "Escape") {
            setIsOpen(false);
            setSearchQuery("");
          }
        };
        if (isOpen) {
          document.addEventListener("mousedown", handleOutsideClick);
          document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
          document.removeEventListener("mousedown", handleOutsideClick);
          document.removeEventListener("keydown", handleKeyDown);
        };
      }, [isOpen]);

      // Focus search input when dropdown opens
      useEffect(() => {
        if (isOpen) {
          const timer = setTimeout(() => {
            searchInputRef.current?.focus();
          }, 50);
          return () => clearTimeout(timer);
        }
      }, [isOpen]);

      // Find currently selected item
      const selectedOption = useMemo(() => {
        return options.find((opt) => String(opt.value) === String(value)) || null;
      }, [options, value]);

      // Filter options based on search query
      const filteredOptions = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return options;
    return options.filter((opt) => {
      const matchLabel = opt.label && opt.label.toLowerCase().includes(q);
      const matchSub = opt.sublabel && opt.sublabel.toLowerCase().includes(q);
      const matchBadge = opt.badge && opt.badge.toLowerCase().includes(q);
      return matchLabel || matchSub || matchBadge;
    });
  }, [options, searchQuery]);

  const handleSelect = (val) => {
    if (onChange) onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onClear) onClear();
    else if (onChange) onChange("");
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      if (prev) {
        setSearchQuery("");
      }
      return !prev;
    });
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full px-3 py-2 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between gap-2 shadow-2xs cursor-pointer ${
          disabled
            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
            : isOpen
            ? "border-blue-500 ring-2 ring-blue-500/15 bg-white text-slate-900"
            : selectedOption
            ? "border-slate-300 bg-white text-slate-900 hover:border-slate-400"
            : "border-slate-300 bg-white text-slate-500 hover:border-slate-400"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {TriggerIcon && <TriggerIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
          {selectedOption ? (
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-slate-900 truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-500 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleClear(e);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-blue-600" : ""
            }`}
          />
        </div>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-64">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-7 py-1.5 text-xs font-medium text-slate-900 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto p-1.5 space-y-0.5 flex-1 divide-y divide-slate-50">
            {/* Optional All / In-House Option */}
            {allOptionLabel && !searchQuery && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`w-full p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  !value ? "bg-blue-50 text-blue-900 font-bold" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="truncate">{allOptionLabel}</span>
                  {allOptionBadge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium shrink-0">
                      {allOptionBadge}
                    </span>
                  )}
                </div>
                {!value && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
              </button>
            )}

            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No results found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-blue-900 font-black"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 truncate">{opt.label}</span>
                        {opt.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                              opt.badgeColor === "emerald"
                                ? "bg-emerald-100 text-emerald-800"
                                : opt.badgeColor === "blue"
                                ? "bg-blue-100 text-blue-800"
                                : opt.badgeColor === "amber"
                                ? "bg-amber-100 text-amber-800"
                                : opt.badgeColor === "purple"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {opt.sublabel}
                        </p>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
