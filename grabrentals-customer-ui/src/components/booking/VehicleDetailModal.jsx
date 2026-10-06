"use client";

import { useEffect } from "react";
import Image from "next/image";
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Car, 
  Fuel, 
  Settings2, 
  Users, 
  Calendar, 
  MapPin, 
  UserCheck, 
  Luggage, 
  Wind, 
  Navigation, 
  Clock, 
  PhoneCall, 
  ArrowRight,
  Sparkles,
  Award
} from "lucide-react";

export default function VehicleDetailModal({
  isOpen,
  onClose,
  vehicle,
  trip,
  distanceKm,
  onBook
}) {
  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !vehicle) return null;

  const title = vehicle.title || "Toyota Innova Crysta";
  const plate = vehicle.vehicleNumber || vehicle.regNumber || "KA 01 AB 1234";
  const type = vehicle.vehicleType || vehicle.category || "SUV";
  const fuel = vehicle.fuelType || (vehicle.fuelOptions?.[0]) || "Diesel";
  const transmission = vehicle.transmission || "Automatic";
  const seats = vehicle.seatingCapacity || vehicle.seats || vehicle.seating || 7;
  const year = vehicle.year || vehicle.modelYear || "2024";
  const location = vehicle.city || vehicle.location || "Bangalore";
  const chauffeur = vehicle.driverName || vehicle.chauffeur || "Rajesh Kumar";
  const dailyPrice = vehicle.dailyPrice || vehicle.pricing?.perDayRate || 4500;
  const estTripFare = vehicle.pricing?.discountedPrice || (dailyPrice * 1.2);
  const advanceAmount = vehicle.pricing?.advanceAmount || Math.round(estTripFare * 0.20);
  const taxes = vehicle.pricing?.chargesAndTaxes || Math.round(estTripFare * 0.35);
  const totalFare = estTripFare + taxes;

  const handleProceedBooking = () => {
    onClose();
    onBook(vehicle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto z-10 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h2>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Available
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{plate} • Commercial Outstation Fleet</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Vehicle Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Visual Image */}
            <div className="md:col-span-5 bg-gradient-to-b from-slate-100 to-slate-50 rounded-2xl border border-slate-200/80 p-4 flex flex-col items-center justify-center relative min-h-[220px]">
              <div className="relative w-full h-44 sm:h-52">
                <Image
                  src={vehicle.image || "/images/cars/innova.jpg"}
                  alt={title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 380px"
                  priority
                />
              </div>
              <div className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-200/60 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Hub: {location}
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Sanitized & Inspected
                </span>
              </div>
            </div>

            {/* Core Specs Grid */}
            <div className="md:col-span-7 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Vehicle Type</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Car className="w-4 h-4 text-blue-600" />
                    <span>{type}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Fuel Type</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Fuel className="w-4 h-4 text-blue-600" />
                    <span className="capitalize">{fuel}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Transmission</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Settings2 className="w-4 h-4 text-blue-600" />
                    <span>{transmission}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Capacity</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{seats} Seats</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Model Year</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{year}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Luggage Space</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Luggage className="w-4 h-4 text-blue-600" />
                    <span>{seats >= 6 ? "4-5 Bags" : "2-3 Bags"}</span>
                  </div>
                </div>
              </div>

              {/* Comfort & Safety Highlights */}
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                <span className="bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5" /> High-Cool Dual AC
                </span>
                <span className="bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" /> Real-time GPS Tracking
                </span>
                <span className="bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Speed Governor Certified
                </span>
              </div>
            </div>

          </div>

          {/* Chauffeur Details */}
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-black text-lg shrink-0">
                {chauffeur.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-base">{chauffeur}</h4>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3 text-blue-600" /> Verified Chauffeur
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Commercial Badge Holder • 8+ Years Highway Experience • Kannada, Hindi & English
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 sm:self-center shrink-0">
              <div className="text-center">
                <span className="text-amber-500 text-sm">★ 4.95</span>
                <span className="block text-[10px] text-slate-400 font-medium">Rating</span>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="text-center">
                <span className="text-slate-800 text-sm">1,240+</span>
                <span className="block text-[10px] text-slate-400 font-medium">Trips Completed</span>
              </div>
            </div>
          </div>

          {/* Route & Inclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Trip Route Details */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                Trip Route & Schedule
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>From: {trip?.from || "Bangalore"}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span>To: {trip?.to || "Coimbatore"}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1 border-t border-slate-100">
                  <span>Trip Type: <strong>{trip?.tripType || "One way"}</strong></span>
                  <span>Distance: <strong className="text-blue-600">{distanceKm} km</strong></span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Pickup: <strong>{trip?.date || "28-09-2026"} at {trip?.time || "07:00 AM"}</strong></span>
                </div>
              </div>
            </div>

            {/* Package Inclusions */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                All-Inclusive Guarantee
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Includes base fare & fuel for {distanceKm} km
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Dedicated chauffeur allowance & night driving charges included
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Free cancellation up to 1 hour before pickup
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Modal Footer / Price & Book CTA */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-blue-600">₹{dailyPrice.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-500">/ day</span>
              <span className="text-xs text-slate-400 font-medium">| Trip Fare: ₹{Math.round(estTripFare).toLocaleString()}</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Pay 20% (₹{advanceAmount.toLocaleString()}) to confirm • Balance after trip completion
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition text-sm cursor-pointer"
            >
              Back to Fleet
            </button>
            <button
              onClick={handleProceedBooking}
              className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Proceed to Book
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
