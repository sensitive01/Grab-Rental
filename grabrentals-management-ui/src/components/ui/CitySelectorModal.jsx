"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  X, 
  MapPin, 
  Search, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2,
  Building2,
  RotateCcw
} from "lucide-react";

export const KARNATAKA_CITIES = [
  "Bangalore",
  "Mysore",
  "Mangalore",
  "Hubli-Dharwad",
  "Belgaum",
  "Shimoga",
  "Davanagere",
  "Gulbarga",
  "Bellary",
  "Udupi",
  "Hassan",
  "Tumkur",
  "Chikmagalur",
  "Madikeri (Coorg)",
  "Bidar",
  "Raichur",
  "Bijapur",
  "Karwar",
  "Chitradurga",
  "Kolar",
  "Hospet"
];

export const TAMIL_NADU_CITIES = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Trichy",
  "Salem",
  "Tirunelveli",
  "Vellore",
  "Erode",
  "Tiruppur",
  "Thanjavur",
  "Dindigul",
  "Ooty",
  "Kodaikanal",
  "Hosur",
  "Nagercoil",
  "Kanchipuram",
  "Cuddalore",
  "Karur",
  "Kumbakonam",
  "Tuticorin",
  "Pondicherry"
];

export default function CitySelectorModal({
  isOpen,
  onClose,
  initialCities = "",
  onApply
}) {
  // Parse initial selected cities
  const [selected, setSelected] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL"); // "ALL" | "KA" | "TN"
  const [searchQuery, setSearchQuery] = useState("");
  const [customCity, setCustomCity] = useState("");

  // Sync initial cities on open
  useEffect(() => {
    if (isOpen) {
      if (Array.isArray(initialCities)) {
        setSelected(initialCities);
      } else if (typeof initialCities === "string" && initialCities.trim()) {
        const parsed = initialCities
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
        setSelected(parsed);
      } else {
        setSelected([]);
      }
      setSearchQuery("");
      setCustomCity("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialCities]);

  // Combine and annotate city lists
  const allCityItems = useMemo(() => {
    const list = [];
    KARNATAKA_CITIES.forEach((name) => {
      list.push({ name, state: "Karnataka", code: "KA" });
    });
    TAMIL_NADU_CITIES.forEach((name) => {
      list.push({ name, state: "Tamil Nadu", code: "TN" });
    });

    // Also include any custom selected cities not in the list
    selected.forEach((sel) => {
      if (!list.some((item) => item.name.toLowerCase() === sel.toLowerCase())) {
        list.push({ name: sel, state: "Custom", code: "OTHER" });
      }
    });

    return list;
  }, [selected]);

  // Filtered by tab and search query
  const filteredCities = useMemo(() => {
    let result = allCityItems;

    if (activeTab === "KA") {
      result = result.filter((item) => item.state === "Karnataka");
    } else if (activeTab === "TN") {
      result = result.filter((item) => item.state === "Tamil Nadu");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allCityItems, activeTab, searchQuery]);

  // Toggle selection
  const toggleCity = (cityName) => {
    setSelected((prev) => {
      const exists = prev.some(
        (c) => c.toLowerCase() === cityName.toLowerCase()
      );
      if (exists) {
        return prev.filter((c) => c.toLowerCase() !== cityName.toLowerCase());
      } else {
        return [...prev, cityName];
      }
    });
  };

  // Quick actions
  const selectAllState = (stateName) => {
    const stateCities =
      stateName === "Karnataka" ? KARNATAKA_CITIES : TAMIL_NADU_CITIES;
    setSelected((prev) => {
      const set = new Set(prev);
      stateCities.forEach((c) => set.add(c));
      return Array.from(set);
    });
  };

  const removeCity = (cityName) => {
    setSelected((prev) =>
      prev.filter((c) => c.toLowerCase() !== cityName.toLowerCase())
    );
  };

  const clearAll = () => {
    setSelected([]);
  };

  const handleAddCustomCity = (e) => {
    e?.preventDefault();
    if (!customCity.trim()) return;
    const trimmed = customCity.trim();
    if (!selected.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setSelected((prev) => [...prev, trimmed]);
    }
    setCustomCity("");
  };

  const handleApply = () => {
    onApply(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-2xs">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Select Operational Cities
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Choose Karnataka & Tamil Nadu cities where your fleet primarily operates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-4 sm:px-6 pb-2 space-y-3 bg-white border-b border-slate-100">
          
          {/* Search + Custom Add */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city (e.g. Bangalore, Salem, Mysore, Ooty...)"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomCity();
                  }
                }}
                placeholder="+ Add other city"
                className="w-36 sm:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              />
              <button
                type="button"
                onClick={handleAddCustomCity}
                disabled={!customCity.trim()}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* State Tabs & Quick Select All Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Tabs */}
            <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/70 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "ALL"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Cities ({KARNATAKA_CITIES.length + TAMIL_NADU_CITIES.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("KA")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "KA"
                    ? "bg-white text-amber-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Karnataka</span>
                <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                  {KARNATAKA_CITIES.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("TN")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "TN"
                    ? "bg-white text-blue-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Tamil Nadu</span>
                <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">
                  {TAMIL_NADU_CITIES.length}
                </span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => selectAllState("Karnataka")}
                className="px-2.5 py-1 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition cursor-pointer"
              >
                + All Karnataka
              </button>
              <button
                type="button"
                onClick={() => selectAllState("Tamil Nadu")}
                className="px-2.5 py-1 text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition cursor-pointer"
              >
                + All Tamil Nadu
              </button>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Selected Cities Badges Strip */}
          {selected.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Selected Cities ({selected.length})
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition"
                >
                  Remove All
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50/60 rounded-xl border border-slate-200/60">
                {selected.map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs"
                  >
                    <span>{city}</span>
                    <button
                      type="button"
                      onClick={() => removeCity(city)}
                      className="hover:text-rose-600 transition cursor-pointer"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Cities Grid List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {filteredCities.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">No cities found matching "{searchQuery}"</p>
              <button
                type="button"
                onClick={() => {
                  if (searchQuery.trim()) {
                    setCustomCity(searchQuery.trim());
                    handleAddCustomCity();
                  }
                }}
                className="text-xs font-bold text-amber-600 hover:underline"
              >
                + Add "{searchQuery}" as custom city
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredCities.map((item) => {
                const isSelected = selected.some(
                  (c) => c.toLowerCase() === item.name.toLowerCase()
                );
                return (
                  <button
                    type="button"
                    key={`${item.state}-${item.name}`}
                    onClick={() => toggleCity(item.name)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer group select-none ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500 text-amber-950 font-bold shadow-2xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? "bg-amber-500 border-amber-500 text-slate-950"
                            : "border-slate-300 bg-white group-hover:border-slate-400"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs truncate">{item.name}</span>
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ml-1.5 ${
                        item.state === "Karnataka"
                          ? "bg-amber-100/80 text-amber-800"
                          : item.state === "Tamil Nadu"
                          ? "bg-blue-100/80 text-blue-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.code}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-700">
            <span className="text-amber-600 font-black">{selected.length}</span>{" "}
            {selected.length === 1 ? "city" : "cities"} selected
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Apply Selected Cities</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
