"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  X, 
  Calculator, 
  CheckCircle2, 
  Receipt, 
  Car, 
  ShieldCheck, 
  Printer, 
  AlertCircle, 
  Loader2, 
  FileText,
  Navigation,
  Clock,
  Sparkles
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import NumberPlate from "@/components/ui/NumberPlate";
import { vendorApi } from "@/lib/vendorApi";

export default function TripClosingModal({ isOpen, onClose, trip, onTripCompleted }) {
  if (!isOpen || !trip) return null;

  // Base Booked Details
  const initialBaseFare = Number(trip.totalFare || trip.estimatedAmount || 0);
  const advancePaid = Number(trip.advancePaid || 0);
  const customerRouteKm = Number(trip.customerRouteKm || trip.distanceKm || trip.actualKmShownInCustomer || 0);
  const includedKm = Number(trip.packageKm || trip.distanceKm || (customerRouteKm > 0 ? customerRouteKm : 250));
  const defaultRate = Number(trip.extraKmRate || 14);

  // Form State
  const [startKm, setStartKm] = useState(trip.startKm != null ? String(trip.startKm) : "");
  const [endKm, setEndKm] = useState(trip.endKm != null ? String(trip.endKm) : "");
  const [extraKmOverride, setExtraKmOverride] = useState(trip.extraKm ? String(trip.extraKm) : "");
  const [extraKmRate, setExtraKmRate] = useState(String(defaultRate));

  const [tollCharges, setTollCharges] = useState(trip.tollCharges ? String(trip.tollCharges) : "");
  const [permitCharges, setPermitCharges] = useState(trip.permitCharges ? String(trip.permitCharges) : "");
  const [parkingCharges, setParkingCharges] = useState(trip.parkingCharges ? String(trip.parkingCharges) : "");
  const [driverAllowance, setDriverAllowance] = useState(trip.driverAllowanceCharges ? String(trip.driverAllowanceCharges) : "");
  const [otherCharges, setOtherCharges] = useState(trip.otherCharges ? String(trip.otherCharges) : "");
  const [otherChargesNotes, setOtherChargesNotes] = useState(trip.otherChargesNotes || "");
  const [closingNotes, setClosingNotes] = useState(trip.tripClosingNotes || "");

  const [submitting, setSubmitting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Odometer and Extra KM math
  const calculatedExtraKm = useMemo(() => {
    if (extraKmOverride !== "" && !isNaN(Number(extraKmOverride))) {
      return Math.max(0, Number(extraKmOverride));
    }
    const s = Number(startKm);
    const e = Number(endKm);
    if (!isNaN(s) && !isNaN(e) && e > s) {
      const actualDistance = e - s;
      return Math.max(0, actualDistance - includedKm);
    }
    return 0;
  }, [startKm, endKm, extraKmOverride, includedKm]);

  const actualTraveledKm = useMemo(() => {
    const s = Number(startKm);
    const e = Number(endKm);
    if (!isNaN(s) && !isNaN(e) && e >= s) {
      return e - s;
    }
    return null;
  }, [startKm, endKm]);

  // Live Financial Computations
  const calculations = useMemo(() => {
    const rate = Number(extraKmRate) || defaultRate;
    const extraKmCost = Math.round(calculatedExtraKm * rate);

    const toll = Math.max(0, Number(tollCharges) || 0);
    const permit = Math.max(0, Number(permitCharges) || 0);
    const parking = Math.max(0, Number(parkingCharges) || 0);
    const allowance = Math.max(0, Number(driverAllowance) || 0);
    const other = Math.max(0, Number(otherCharges) || 0);

    const totalExtrasBeforeGst = extraKmCost + toll + permit + parking + allowance + other;
    
    // 5% GST on extra items
    const extrasGst = Math.round(totalExtrasBeforeGst * 0.05);

    // Initial base fare already had 5% GST built in:
    const baseGstPortion = Math.round((initialBaseFare * 0.05) / 1.05);
    const totalGst = baseGstPortion + extrasGst;

    const grandTotalFare = initialBaseFare + totalExtrasBeforeGst + extrasGst;
    const balanceDue = Math.max(0, grandTotalFare - advancePaid);

    return {
      extraKmCost,
      toll,
      permit,
      parking,
      allowance,
      other,
      totalExtrasBeforeGst,
      extrasGst,
      totalGst,
      grandTotalFare,
      balanceDue
    };
  }, [
    calculatedExtraKm,
    extraKmRate,
    defaultRate,
    tollCharges,
    permitCharges,
    parkingCharges,
    driverAllowance,
    otherCharges,
    initialBaseFare,
    advancePaid
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const payload = {
        startKm: startKm ? Number(startKm) : null,
        endKm: endKm ? Number(endKm) : null,
        actualKm: actualTraveledKm,
        extraKm: calculatedExtraKm,
        extraKmRate: Number(extraKmRate) || defaultRate,
        tollCharges: calculations.toll,
        permitCharges: calculations.permit,
        parkingCharges: calculations.parking,
        driverAllowance: calculations.allowance,
        otherCharges: calculations.other,
        otherChargesNotes: otherChargesNotes.trim() || null,
        closingNotes: closingNotes.trim() || null
      };

      const bookingIdentifier = trip.rawId || trip.bookingReference || trip.id;
      const updated = await vendorApi.completeTrip(bookingIdentifier, payload);
      setCompletedSuccess(updated || { ...trip, ...payload, ...calculations });
      if (onTripCompleted) {
        onTripCompleted(updated);
      }
    } catch (err) {
      console.error("Failed to complete trip:", err);
      setErrorMessage(
        err?.response?.data?.message || 
        "Failed to finalize trip fare. Please verify input numbers and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black tracking-tight">Finalize Trip &amp; Generate Bill</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                  #{trip.bookingReference || trip.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Update ending odometer, highway tolls, permits &amp; generate customer tax invoice.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {completedSuccess ? (
          /* Success Screen with Invoice Link */
          <div className="p-8 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-xl font-black text-slate-900">Trip Completed &amp; Billed Successfully!</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Odometer readings, toll receipts, and taxes have been updated. Assigned vehicle and chauffeur are now released to the available fleet.
              </p>
            </div>

            {/* Quick Financial Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-sm mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Final Trip Fare:</span>
                <span className="font-bold text-slate-900">{formatINR(calculations.grandTotalFare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Advance Prepaid:</span>
                <span className="font-semibold text-slate-700">-{formatINR(advancePaid)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black">
                <span className="text-slate-900">Cash / Balance Due:</span>
                <span className="text-emerald-600">{formatINR(calculations.balanceDue)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/vendor/trips/${trip.bookingReference || trip.id}/invoice`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0082fe] hover:bg-blue-600 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all"
              >
                <Printer className="w-4 h-4 text-white" />
                View &amp; Print Tax Invoice
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Close &amp; Return to Trips
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
            
            {/* Quick Trip Header Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Trip Route</span>
                <p className="font-black text-slate-900">{trip.pickup} → {trip.drop}</p>
                <div className="flex items-center gap-2 text-slate-600 flex-wrap">
                  {customerRouteKm > 0 && (
                    <>
                      <span className="inline-flex items-center gap-1 text-blue-700 font-extrabold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                        <Navigation className="w-3 h-3 text-blue-600 shrink-0" />
                        Customer Route: <strong>{customerRouteKm} KM</strong>
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span>Package: <strong>{includedKm} KM Included</strong></span>
                  <span>•</span>
                  <span>Extra Rate: <strong>₹{defaultRate}/KM</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:self-center">
                <NumberPlate number={trip.vehicleNumber || "Assigned"} />
                <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-[11px]">
                  {trip.driverName || "Chauffeur"}
                </span>
              </div>
            </div>

            {/* Customer Selected Add-ons & Amenities */}
            {trip.addons && trip.addons.length > 0 ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/70 border border-blue-200/90 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        Customer Selected Add-ons
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                          {trip.addons.length} Active
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Paid amenities &amp; custom ride preferences chosen by passenger during booking
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Add-on Value</span>
                    <span className="text-xs sm:text-sm font-black text-blue-700 bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-2xs">
                      {formatINR(trip.addonsTotal || trip.addons.reduce((sum, a) => sum + (a.price || 0), 0))}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                  {trip.addons.map((addon) => (
                    <div
                      key={addon.id}
                      className="p-2.5 rounded-xl bg-white border border-blue-100 flex items-center justify-between text-xs shadow-2xs hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="text-base shrink-0">{addon.emoji || "✨"}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate text-[11px]">{addon.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{addon.desc}</p>
                        </div>
                      </div>
                      <span className="font-black text-blue-700 shrink-0 text-xs">
                        {formatINR(addon.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  Customer Add-ons:
                </span>
                <span className="text-[11px] font-semibold text-slate-600">
                  Standard Trip (No extra add-ons selected by passenger)
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Inputs */}
              <div className="space-y-4">
                
                {/* 1. KM Reading Box */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-amber-500" />
                      Odometer &amp; Distance Traveled
                    </span>
                    <div className="flex items-center gap-1.5">
                      {customerRouteKm > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          Route: {customerRouteKm} KM
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-500">
                        Package: {includedKm} KM
                      </span>
                    </div>
                  </div>

                  {/* Customer Route Distance Highlight Banner */}
                  <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-blue-950">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-blue-700 block tracking-wider">
                          Customer Booked Route Distance
                        </span>
                        <span className="text-[11px] font-medium text-slate-600">
                          Actual distance displayed on customer booking checkout
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="text-base font-black text-blue-700 block">
                        {customerRouteKm > 0 ? `${customerRouteKm} KM` : `${includedKm} KM`}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {includedKm} KM Included
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        Start Odometer (KM)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 10200"
                        value={startKm}
                        onChange={(e) => setStartKm(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500">
                          End Odometer (KM)
                        </label>
                        {startKm && !endKm && customerRouteKm > 0 && (
                          <button
                            type="button"
                            onClick={() => setEndKm(String(Number(startKm) + customerRouteKm))}
                            className="text-[9px] font-bold text-blue-600 hover:text-blue-800 underline"
                            title="Auto-fill with booked customer route distance"
                          >
                            +{customerRouteKm} KM (Route)
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        placeholder="e.g. 10520"
                        value={endKm}
                        onChange={(e) => setEndKm(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {actualTraveledKm != null && (
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600">Actual Distance Run:</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-black">{actualTraveledKm} KM</strong>
                        {customerRouteKm > 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            actualTraveledKm > customerRouteKm 
                              ? "bg-amber-100 text-amber-800" 
                              : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {actualTraveledKm > customerRouteKm 
                              ? `+${actualTraveledKm - customerRouteKm} KM vs Route` 
                              : "Within Route Estimate"}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        Extra Distance (KM)
                      </label>
                      <input
                        type="number"
                        placeholder="Auto or Custom"
                        value={extraKmOverride !== "" ? extraKmOverride : (calculatedExtraKm > 0 ? calculatedExtraKm : "")}
                        onChange={(e) => setExtraKmOverride(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        Extra KM Rate (₹)
                      </label>
                      <input
                        type="number"
                        value={extraKmRate}
                        onChange={(e) => setExtraKmRate(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {calculatedExtraKm > 0 && (
                    <div className="text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center justify-between">
                      <span>Extra Distance ({calculatedExtraKm} KM × ₹{extraKmRate})</span>
                      <span>+ {formatINR(calculations.extraKmCost)}</span>
                    </div>
                  )}
                </div>

                {/* 2. Additional Out-of-Pocket Expenses */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <span className="text-xs font-black text-slate-800 block">
                    Itemized Highway &amp; Trip Expenses
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        🛣️ FASTag Tolls (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={tollCharges}
                        onChange={(e) => setTollCharges(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        📋 State Permit / Tax (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={permitCharges}
                        onChange={(e) => setPermitCharges(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        🅿️ Parking Charges (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={parkingCharges}
                        onChange={(e) => setParkingCharges(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        👨‍✈️ Driver Allowance (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={driverAllowance}
                        onChange={(e) => setDriverAllowance(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        ➕ Other Extras (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={otherCharges}
                        onChange={(e) => setOtherCharges(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                        Reason for Other (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hill terrain / Detour"
                        value={otherChargesNotes}
                        onChange={(e) => setOtherChargesNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Column: Live Fare Calculation Card */}
              <div className="space-y-4 flex flex-col justify-between">
                
                <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Live Bill Recalculation
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">GST Included</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Contracted Package Fare:</span>
                      <span className="font-bold text-white">{formatINR(initialBaseFare)}</span>
                    </div>

                    {trip.addons && trip.addons.length > 0 && (
                      <div className="p-2.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1.5 text-[11px]">
                        <div className="flex justify-between text-amber-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            Customer Add-ons ({trip.addons.length}):
                          </span>
                          <span>{formatINR(trip.addonsTotal || trip.addons.reduce((sum, a) => sum + (a.price || 0), 0))}</span>
                        </div>
                        {trip.addons.map((addon) => (
                          <div key={addon.id} className="flex justify-between text-slate-400 text-[10px]">
                            <span className="truncate pr-2">• {addon.name}</span>
                            <span className="text-slate-300 font-medium shrink-0">{formatINR(addon.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {calculations.extraKmCost > 0 && (
                      <div className="flex justify-between items-center text-amber-300">
                        <span>Extra Distance ({calculatedExtraKm} KM):</span>
                        <span className="font-bold">+{formatINR(calculations.extraKmCost)}</span>
                      </div>
                    )}

                    {calculations.toll > 0 && (
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Highway FASTag Toll:</span>
                        <span className="font-bold text-white">+{formatINR(calculations.toll)}</span>
                      </div>
                    )}

                    {calculations.permit > 0 && (
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Interstate Entry Permit:</span>
                        <span className="font-bold text-white">+{formatINR(calculations.permit)}</span>
                      </div>
                    )}

                    {calculations.parking > 0 && (
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Parking Fees:</span>
                        <span className="font-bold text-white">+{formatINR(calculations.parking)}</span>
                      </div>
                    )}

                    {calculations.allowance > 0 && (
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Driver Allowance:</span>
                        <span className="font-bold text-white">+{formatINR(calculations.allowance)}</span>
                      </div>
                    )}

                    {calculations.other > 0 && (
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Other Charges:</span>
                        <span className="font-bold text-white">+{formatINR(calculations.other)}</span>
                      </div>
                    )}

                    {calculations.extrasGst > 0 && (
                      <div className="flex justify-between items-center text-sky-400">
                        <span>GST on Extras (5%):</span>
                        <span className="font-bold">+{formatINR(calculations.extrasGst)}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-black">
                      <span className="text-white">Final Total Amount:</span>
                      <span className="text-amber-400 text-base">{formatINR(calculations.grandTotalFare)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-400 text-xs">
                      <span>Prepaid Advance:</span>
                      <span>-{formatINR(advancePaid)}</span>
                    </div>
                  </div>

                  {/* Balance to Collect Banner */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                        Collect from Passenger
                      </span>
                      <span className="text-lg font-black text-white">
                        {formatINR(calculations.balanceDue)}
                      </span>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>

                {/* Closing Remarks Input */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Trip Completion Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Passenger safely dropped at destination. Final bill verified."
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Finalizing Bill &amp; Completing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Finalize Bill &amp; End Trip</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
