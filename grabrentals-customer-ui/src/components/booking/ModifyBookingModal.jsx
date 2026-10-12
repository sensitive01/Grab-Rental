"use client";

import { useState } from "react";
import { X, MapPin, Calendar, Clock, ArrowRight, Plus, Minus } from "lucide-react";
import CityAutocompleteInput from "@/components/booking/CityAutocompleteInput";

export default function ModifyBookingModal({ isOpen, onClose, currentTrip, onSave }) {
  const [from, setFrom] = useState(currentTrip?.from || "Bangalore, Karnataka");
  const [to, setTo] = useState(currentTrip?.to || "Coimbatore, Tamil Nadu");
  const [stops, setStops] = useState(() => {
    if (Array.isArray(currentTrip?.stops)) return currentTrip.stops;
    if (typeof currentTrip?.stops === "string" && currentTrip.stops.trim()) {
      return currentTrip.stops.split(/[|,]/).map((s) => s.trim()).filter(Boolean);
    }
    return [];
  });
  const [tripType, setTripType] = useState(currentTrip?.tripType || "One way");
  const [date, setDate] = useState(currentTrip?.date || "2026-09-28");
  const [time, setTime] = useState(currentTrip?.time || "07:00");

  if (!isOpen) return null;

  const handleAddStop = () => {
    if (stops.length >= 3) return;
    setStops([...stops, ""]);
  };

  const handleRemoveStop = (idx) => {
    setStops(stops.filter((_, i) => i !== idx));
  };

  const handleStopChange = (idx, val) => {
    const updated = [...stops];
    updated[idx] = val;
    setStops(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validStops = stops.filter((s) => s && s.trim());
    onSave({ from, to, stops: validStops.join("|"), tripType, date, time });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Modify Outstation Trip</h3>
            <p className="text-xs text-slate-500">Update your pickup location, route, and schedule</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Trip Type */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 block">Trip Type</label>
              {stops.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stop</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["One way", "Round trip"].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setTripType(type)}
                  className={`py-2.5 px-3 rounded-xl font-extrabold border transition-all text-center cursor-pointer ${
                    tripType.toLowerCase().includes(type.toLowerCase().slice(0, 3)) 
                      ? "border-amber-500 bg-amber-50 text-amber-800" 
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Route: Pickup City */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Pickup City</label>
            <CityAutocompleteInput
              value={from}
              onChange={setFrom}
              placeholder="Enter pickup city..."
              iconColor="text-emerald-600"
              inputClassName="py-2.5 rounded-xl"
              required
            />
          </div>

          {/* Intermediate Stops */}
          {stops.map((stop, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-purple-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
                  Stop {index + 1}
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveStop(index)}
                  className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
              <CityAutocompleteInput
                value={stop}
                onChange={(val) => handleStopChange(index, val)}
                placeholder="Enter stop city (e.g. Salem)..."
                iconColor="text-purple-600"
                inputClassName="py-2.5 rounded-xl bg-purple-50/30 border-purple-200"
              />
            </div>
          ))}

          {/* Destination City */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Destination City</label>
            <CityAutocompleteInput
              value={to}
              onChange={setTo}
              placeholder="Enter destination city..."
              iconColor="text-amber-600"
              inputClassName="py-2.5 rounded-xl"
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pickup Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Pickup Time</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-black bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-md shadow-amber-600/20 cursor-pointer"
            >
              <span>Update Cabs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
