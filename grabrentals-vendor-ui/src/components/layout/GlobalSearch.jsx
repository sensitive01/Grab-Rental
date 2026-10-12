"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  X, 
  Car, 
  User, 
  Calendar, 
  Navigation, 
  ArrowRight, 
  Plus, 
  ExternalLink, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Command,
  Loader2,
  Phone,
  ShieldCheck
} from "lucide-react";
import { vendorApi } from "@/lib/vendorApi";
import NumberPlate from "@/components/ui/NumberPlate";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatINR } from "@/lib/utils";

// Quick action shortcuts available to vendors
const QUICK_SHORTCUTS = [
  {
    title: "Live Ongoing Trips",
    subtitle: "Real-time telemetry and dispatched vehicles",
    href: "/vendor/trips/active",
    icon: Navigation,
    badge: "Live",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    category: "actions"
  },
  {
    title: "All Fleet Vehicles",
    subtitle: "Manage, edit and view vehicle inventory",
    href: "/vendor/vehicles",
    icon: Car,
    category: "actions"
  },
  {
    title: "+ Add New Vehicle",
    subtitle: "Register commercial vehicle to your fleet",
    href: "/vendor/vehicles/add",
    icon: Plus,
    category: "actions"
  },
  {
    title: "Drivers & Chauffeurs",
    subtitle: "Manage badges, licenses and contact info",
    href: "/vendor/drivers",
    icon: User,
    category: "actions"
  },
  {
    title: "All Bookings",
    subtitle: "Assigned, active, and completed booking orders",
    href: "/vendor/bookings",
    icon: Calendar,
    category: "actions"
  },
  {
    title: "Earnings & Revenue",
    subtitle: "Vendor net balance, dues, and transaction logs",
    href: "/vendor/earnings",
    icon: DollarSign,
    category: "actions"
  },
  {
    title: "Documents & Compliance",
    subtitle: "RC, commercial permit, insurance & fitness validity",
    href: "/vendor/documents",
    icon: FileText,
    category: "actions"
  }
];

export default function GlobalSearch({ onClose = null, autoFocus = false, isMobile = false }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Real Database Data only (no mock data)
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Load real API data from database when component mounts or on first focus
  const loadSearchData = useCallback(async () => {
    if (hasLoadedData) return;
    setLoading(true);
    try {
      const [vRes, dRes, bRes] = await Promise.allSettled([
        vendorApi.getVehicles(),
        vendorApi.getDrivers(),
        vendorApi.getBookings()
      ]);

      const vData = (vRes.status === "fulfilled" && Array.isArray(vRes.value)) ? vRes.value : [];
      const dData = (dRes.status === "fulfilled" && Array.isArray(dRes.value)) ? dRes.value : [];
      const bData = (bRes.status === "fulfilled" && Array.isArray(bRes.value)) ? bRes.value : [];

      setVehicles(vData);
      setDrivers(dData);
      setBookings(bData);
      setHasLoadedData(true);
    } catch (err) {
      console.error("GlobalSearch error loading database records:", err);
      setVehicles([]);
      setDrivers([]);
      setBookings([]);
      setHasLoadedData(true);
    } finally {
      setLoading(false);
    }
  }, [hasLoadedData]);

  // Global hotkey: Cmd+K, Ctrl+K, or "/"
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Don't trigger if user is actively typing in another form element
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.isContentEditable);
      
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        loadSearchData();
      } else if (e.key === "/" && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        loadSearchData();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [loadSearchData]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered Results calculation
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        vehicles: [],
        drivers: [],
        bookings: [],
        actions: QUICK_SHORTCUTS,
        total: QUICK_SHORTCUTS.length
      };
    }

    // 1. Filter Vehicles
    const matchedVehicles = vehicles.filter((v) => {
      const reg = (v.registrationNumber || v.plateNumber || "").toLowerCase();
      const model = (v.model || v.name || "").toLowerCase();
      const cat = (v.category || v.type || "").toLowerCase();
      const drv = (v.assignedDriverName || "").toLowerCase();
      return reg.includes(q) || model.includes(q) || cat.includes(q) || drv.includes(q);
    });

    // 2. Filter Drivers
    const matchedDrivers = drivers.filter((d) => {
      const name = (d.name || d.driverName || "").toLowerCase();
      const phone = (d.phone || d.mobile || "").toLowerCase();
      const lic = (d.licenseNumber || "").toLowerCase();
      return name.includes(q) || phone.includes(q) || lic.includes(q);
    });

    // 3. Filter Bookings / Trips
    const matchedBookings = bookings.filter((b) => {
      const ref = (b.bookingReference || b.id || "").toLowerCase();
      const pick = (b.pickup || b.pickupCity || "").toLowerCase();
      const drop = (b.drop || b.dropCity || "").toLowerCase();
      const drv = (b.driverName || "").toLowerCase();
      const veh = (b.vehicleNumber || "").toLowerCase();
      const st = (b.status || b.rawStatus || "").toLowerCase();
      return ref.includes(q) || pick.includes(q) || drop.includes(q) || drv.includes(q) || veh.includes(q) || st.includes(q);
    });

    // 4. Filter Actions
    const matchedActions = QUICK_SHORTCUTS.filter((a) => {
      return a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q);
    });

    const total = matchedVehicles.length + matchedDrivers.length + matchedBookings.length + matchedActions.length;

    return {
      vehicles: matchedVehicles,
      drivers: matchedDrivers,
      bookings: matchedBookings,
      actions: matchedActions,
      total
    };
  }, [query, vehicles, drivers, bookings]);

  // Flatten active items for keyboard selection
  const flatItems = useMemo(() => {
    const items = [];
    if (activeFilter === "all" || activeFilter === "bookings") {
      searchResults.bookings.forEach((b) => items.push({ type: "booking", data: b, href: b.isLive ? "/vendor/trips/active" : `/vendor/bookings` }));
    }
    if (activeFilter === "all" || activeFilter === "vehicles") {
      searchResults.vehicles.forEach((v) => items.push({ type: "vehicle", data: v, href: `/vendor/vehicles` }));
    }
    if (activeFilter === "all" || activeFilter === "drivers") {
      searchResults.drivers.forEach((d) => items.push({ type: "driver", data: d, href: `/vendor/drivers` }));
    }
    if (activeFilter === "all" || activeFilter === "actions") {
      searchResults.actions.forEach((a) => items.push({ type: "action", data: a, href: a.href }));
    }
    return items;
  }, [searchResults, activeFilter]);

  // Reset selected index on filter/query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        loadSearchData();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        handleSelectItem(flatItems[selectedIndex].href);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
      if (onClose) onClose();
    }
  };

  const handleSelectItem = (href) => {
    setIsOpen(false);
    setQuery("");
    if (onClose) onClose();
    router.push(href);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${isMobile ? "" : "max-w-md"}`}>
      
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            loadSearchData();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search vehicles (TN-38...), bookings (#BK...), or drivers..."
          className="w-full pl-10 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
        />

        {/* Right side controls: Clear & Shortcut Hint */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {loading && (
            <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          )}

          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
              <span className="text-[9px]">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Dynamic Results Dropdown Popover */}
      {isOpen && (
        <div className={`absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95 duration-150 ${isMobile ? "max-h-[70vh]" : "max-h-[480px] w-full min-w-[360px] sm:min-w-[440px]"}`}>
          
          {/* Header Bar with Filter Tabs */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeFilter === "all"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                All {query ? `(${searchResults.total})` : ""}
              </button>
              
              {(searchResults.bookings.length > 0 || !query) && (
                <button
                  type="button"
                  onClick={() => setActiveFilter("bookings")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    activeFilter === "bookings"
                      ? "bg-amber-500 text-slate-950 shadow-2xs font-black"
                      : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  <span>Trips & Bookings</span>
                  {query && <span className="text-[10px] opacity-75">({searchResults.bookings.length})</span>}
                </button>
              )}

              {(searchResults.vehicles.length > 0 || !query) && (
                <button
                  type="button"
                  onClick={() => setActiveFilter("vehicles")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    activeFilter === "vehicles"
                      ? "bg-amber-500 text-slate-950 shadow-2xs font-black"
                      : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  <span>Vehicles</span>
                  {query && <span className="text-[10px] opacity-75">({searchResults.vehicles.length})</span>}
                </button>
              )}

              {(searchResults.drivers.length > 0 || !query) && (
                <button
                  type="button"
                  onClick={() => setActiveFilter("drivers")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    activeFilter === "drivers"
                      ? "bg-amber-500 text-slate-950 shadow-2xs font-black"
                      : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  <span>Drivers</span>
                  {query && <span className="text-[10px] opacity-75">({searchResults.drivers.length})</span>}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Results Scroll Area */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 p-2">
            
            {/* Case 1: Empty Query - Quick Access Shortcuts */}
            {!query && (
              <div>
                <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Quick Access & Navigation</span>
                  <span className="text-[9px] font-normal lowercase">Click to open</span>
                </div>
                <div className="space-y-1">
                  {QUICK_SHORTCUTS.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.href}
                        type="button"
                        onClick={() => handleSelectItem(action.href)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60 group-hover:bg-amber-100 group-hover:scale-105 transition-all">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors flex items-center gap-2">
                              <span>{action.title}</span>
                              {action.badge && (
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border ${action.badgeColor}`}>
                                  {action.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {action.subtitle}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Case 2: Query Typed with No Matches */}
            {query && flatItems.length === 0 && (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  No matching results for &ldquo;{query}&rdquo;
                </h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Try searching by vehicle registration (e.g. <span className="font-mono font-semibold text-slate-700">TN-38</span>), driver name (e.g. <span className="font-semibold text-slate-700">Senthil</span>), or booking reference (<span className="font-mono font-semibold text-slate-700">#GR-</span>).
                </p>
              </div>
            )}

            {/* Case 3: Bookings & Trips Results */}
            {query && (activeFilter === "all" || activeFilter === "bookings") && searchResults.bookings.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  <span>Bookings & Dispatches ({searchResults.bookings.length})</span>
                </div>
                <div className="space-y-1 mt-1">
                  {searchResults.bookings.map((b) => (
                    <button
                      key={b.id || b.bookingReference}
                      type="button"
                      onClick={() => handleSelectItem(b.isLive ? "/vendor/trips/active" : "/vendor/bookings")}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50/60 border border-transparent hover:border-amber-200/80 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-mono font-black text-[10px] shrink-0 mt-0.5 shadow-2xs">
                          {b.isLive ? "LIVE" : "BK"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-extrabold text-slate-900 font-mono">
                              {b.bookingReference || b.id}
                            </span>
                            {b.isLive && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                                On Road Now
                              </span>
                            )}
                            <span className="text-[10px] font-semibold text-slate-500 uppercase">
                              {b.tripType}
                            </span>
                          </div>
                          <div className="text-xs text-slate-700 font-medium truncate mt-0.5 flex items-center gap-1">
                            <span className="font-bold">{b.pickupCity || b.pickup}</span>
                            <span className="text-slate-400">→</span>
                            <span className="font-bold">{b.dropCity || b.drop}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>Vehicle: <strong className="text-slate-700">{b.vehicleNumber}</strong></span>
                            {b.driverName && <span>• Chauffeur: <strong className="text-slate-700">{b.driverName}</strong></span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        {b.vendorNet > 0 && (
                          <div className="text-xs font-black text-emerald-700">
                            {formatINR(b.vendorNet)}
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-amber-600 group-hover:underline flex items-center justify-end gap-1 mt-0.5">
                          View Trip <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Case 4: Vehicles Results */}
            {query && (activeFilter === "all" || activeFilter === "vehicles") && searchResults.vehicles.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <Car className="w-3 h-3" />
                  <span>Fleet Vehicles ({searchResults.vehicles.length})</span>
                </div>
                <div className="space-y-1 mt-1">
                  {searchResults.vehicles.map((v) => (
                    <button
                      key={v.id || v.registrationNumber}
                      type="button"
                      onClick={() => handleSelectItem(`/vendor/vehicles`)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <NumberPlate 
                          number={v.registrationNumber || v.plateNumber} 
                          variant="yellow" 
                          className="scale-95 origin-left"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                            {v.model || v.name || "Fleet Vehicle"}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{v.category || "Commercial Cab"}</span>
                            {v.assignedDriverName && (
                              <span>• Assigned: <strong>{v.assignedDriverName}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          (v.status || "").toUpperCase() === "ON_TRIP"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}>
                          {v.status || "Active"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Case 5: Drivers Results */}
            {query && (activeFilter === "all" || activeFilter === "drivers") && searchResults.drivers.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <User className="w-3 h-3" />
                  <span>Chauffeurs & Drivers ({searchResults.drivers.length})</span>
                </div>
                <div className="space-y-1 mt-1">
                  {searchResults.drivers.map((d) => (
                    <button
                      key={d.id || d.name}
                      type="button"
                      onClick={() => handleSelectItem(`/vendor/drivers`)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                          {(d.name || "D")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors flex items-center gap-1.5">
                            <span>{d.name}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" title="Police Cleared & Badged" />
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5 text-slate-400" />
                              {d.phone || d.mobile}
                            </span>
                            {d.currentVehicle && (
                              <span>• Vehicle: <strong className="text-slate-700">{d.currentVehicle}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {d.status || "Verified"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Case 6: Matching Navigation Actions */}
            {query && (activeFilter === "all" || activeFilter === "actions") && searchResults.actions.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Quick Actions ({searchResults.actions.length})</span>
                </div>
                <div className="space-y-1 mt-1">
                  {searchResults.actions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.href}
                        type="button"
                        onClick={() => handleSelectItem(action.href)}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 text-slate-500 group-hover:text-amber-600 transition-colors" />
                          <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                            {action.title}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Footer Bar with Keyboard Navigation Hints */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <div className="flex items-center gap-3">
              <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-600">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-600">↓</kbd> to navigate</span>
              <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-600">↵</kbd> to open</span>
            </div>
            <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-600">ESC</kbd> to exit</span>
          </div>

        </div>
      )}

    </div>
  );
}
