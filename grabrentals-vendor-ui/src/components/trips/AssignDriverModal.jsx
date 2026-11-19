"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Phone, 
  Car, 
  CheckCircle2, 
  X, 
  Loader2, 
  Search, 
  ShieldCheck, 
  AlertCircle,
  IdCard,
  Award
} from "lucide-react";
import NumberPlate from "@/components/ui/NumberPlate";
import { vendorApi } from "@/lib/vendorApi";

export default function AssignDriverModal({ isOpen, onClose, trip, onSuccess }) {
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isOpen || !trip) return;
    setErrorMessage("");
    setSelectedDriverId(trip.driverId || "");

    const fetchDrivers = async () => {
      setLoadingDrivers(true);
      try {
        const list = await vendorApi.getDrivers();
        setDrivers(Array.isArray(list) ? list : []);
        // If trip already has a driverId, pre-select it
        if (trip.driverId) {
          setSelectedDriverId(trip.driverId);
        } else if (Array.isArray(list) && list.length === 1) {
          // If vendor only has 1 driver, auto-select them for convenience
          setSelectedDriverId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load vendor drivers:", err);
        setErrorMessage("Could not load your fleet drivers. Please try again.");
      } finally {
        setLoadingDrivers(false);
      }
    };

    fetchDrivers();
  }, [isOpen, trip]);

  if (!isOpen || !trip) return null;

  const filteredDrivers = drivers.filter((d) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (d.name && d.name.toLowerCase().includes(term)) ||
      (d.phone && d.phone.toLowerCase().includes(term)) ||
      (d.licenseNumber && d.licenseNumber.toLowerCase().includes(term)) ||
      (d.assignedVehicle && d.assignedVehicle.toLowerCase().includes(term))
    );
  });

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedDriverId) {
      setErrorMessage("Please select a commercial chauffeur to assign to this trip.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const tripId = trip.rawId || trip.id || trip.bookingReference;
      const updated = await vendorApi.assignDriver(tripId, selectedDriverId);
      if (onSuccess) {
        onSuccess(updated);
      }
      onClose();
    } catch (err) {
      console.error("Failed to assign driver:", err);
      setErrorMessage(
        err.response?.data?.message || 
        err.message || 
        "Failed to assign chauffeur. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-white">
                  Assign Commercial Chauffeur
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  #{trip.bookingReference || trip.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Allocate a verified chauffeur from your fleet roster to lead this journey.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Trip Snapshot Mini-Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Vehicle:</span>
                {trip.vehicleNumber && trip.vehicleNumber !== "Unassigned" ? (
                  <div className="flex items-center gap-1.5">
                    <NumberPlate number={trip.vehicleNumber} />
                    <span className="text-slate-600 font-semibold text-[11px]">{trip.vehicleType}</span>
                  </div>
                ) : (
                  <span className="text-amber-700 font-bold text-[11px]">Pending Allocation</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Passenger: <strong className="text-slate-900">{trip.customer?.name || "Guest"}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
              <span className="truncate">📍 {trip.pickupCity || trip.pickup}</span>
              <span className="text-slate-400 mx-1">➔</span>
              <span className="truncate">🏁 {trip.dropCity || trip.drop}</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver by name, phone, license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Driver List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Select Chauffeur ({filteredDrivers.length} Available)
            </label>

            {loadingDrivers ? (
              <div className="py-10 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Loading fleet chauffeurs...</p>
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 space-y-2">
                <User className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Chauffeurs Found</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  {searchTerm 
                    ? "No drivers match your search query. Try clearing the filter."
                    : "No drivers registered in your fleet. Please add drivers under Fleet Drivers menu."}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredDrivers.map((driver) => {
                  const isSelected = selectedDriverId === driver.id;
                  const isDriverAvailable = (driver.status || "").toUpperCase() === "AVAILABLE" || !driver.status;

                  return (
                    <div
                      key={driver.id}
                      onClick={() => {
                        setSelectedDriverId(driver.id);
                        setErrorMessage("");
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected 
                          ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 shadow-xs" 
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Radio Check or Avatar */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs transition-colors ${
                          isSelected 
                            ? "bg-amber-500 text-slate-950 shadow-sm" 
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}>
                          {isSelected ? <CheckCircle2 className="w-5 h-5 text-slate-950" /> : driver.name?.charAt(0) || "D"}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-black text-slate-900 truncate">
                              {driver.name}
                            </strong>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                              isDriverAvailable
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}>
                              {driver.status || "Available"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> {driver.phone || "N/A"}
                            </span>
                            {driver.licenseNumber && (
                              <span className="flex items-center gap-1 font-mono text-[10px]">
                                <IdCard className="w-3 h-3 text-slate-400" /> {driver.licenseNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Tag */}
                      {driver.assignedVehicle && (
                        <div className="text-[10px] text-right shrink-0">
                          <span className="text-slate-400 block">Default Car</span>
                          <span className="font-semibold text-slate-700">{driver.assignedVehicle}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAssign}
            disabled={submitting || !selectedDriverId}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Assigning Chauffeur...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm Chauffeur Assignment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
