"use client";

import { useState, useMemo, useRef } from "react";
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
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Camera,
  Banknote,
  QrCode,
  Edit3,
  Plus,
  Trash2
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { vendorApi } from "@/lib/vendorApi";

const EXTRA_CHARGE_CONFIG = [
  { id: "TOLL", label: "FASTag Tolls", icon: "🛣️", placeholder: "e.g. 350" },
  { id: "PERMIT", label: "State Permit / Entry Tax", icon: "📋", placeholder: "e.g. 500" },
  { id: "PARKING", label: "Parking Charges", icon: "🅿️", placeholder: "e.g. 100" },
  { id: "ALLOWANCE", label: "Driver Allowance", icon: "👨‍✈️", placeholder: "e.g. 400" },
  { id: "OTHER", label: "Other Extras", icon: "➕", placeholder: "e.g. 250", hasNotes: true }
];

export default function TripClosingModal({ isOpen, onClose, trip, onTripCompleted }) {
  if (!isOpen || !trip) return null;

  // Step State: 1 = End Odometer & Proof, 2 = Extra Charges, 3 = Payment & Invoice
  const [step, setStep] = useState(1);

  // Base Booked Details
  const initialBaseFare = Number(trip.totalFare || trip.estimatedAmount || 0);
  const advancePaid = Number(trip.advancePaid || 0);
  const customerRouteKm = Number(trip.customerRouteKm || trip.distanceKm || trip.actualKmShownInCustomer || 0);
  const includedKm = Number(trip.packageKm || trip.distanceKm || (customerRouteKm > 0 ? customerRouteKm : 250));
  const defaultRate = Number(trip.extraKmRate || 14);

  const customerAddons = useMemo(() => {
    return Array.isArray(trip.addons) ? trip.addons : [];
  }, [trip.addons]);

  const customerAddonsTotal = useMemo(() => {
    if (trip.addonsTotal != null && !isNaN(Number(trip.addonsTotal))) {
      return Number(trip.addonsTotal);
    }
    return customerAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  }, [trip.addonsTotal, customerAddons]);

  const baseVehicleFare = useMemo(() => {
    if (trip.baseFare != null && !isNaN(Number(trip.baseFare))) {
      return Number(trip.baseFare);
    }
    return Math.max(0, initialBaseFare - customerAddonsTotal);
  }, [trip.baseFare, initialBaseFare, customerAddonsTotal]);

  // Step 1: Odometer & Proof
  const [startKm, setStartKm] = useState(trip.startKm != null ? String(trip.startKm) : "");
  const [endKm, setEndKm] = useState(trip.endKm != null ? String(trip.endKm) : "");
  const [endOdometerProof, setEndOdometerProof] = useState(null);
  const [endOdometerPreview, setEndOdometerPreview] = useState(null);
  const [uploadingEndProof, setUploadingEndProof] = useState(false);

  // Step 2: Extra Charges
  const [extraKmOverride, setExtraKmOverride] = useState(trip.extraKm ? String(trip.extraKm) : "");
  const [extraKmRate, setExtraKmRate] = useState(String(defaultRate));

  // Dynamic Extra Charges State
  const [activeExtraKeys, setActiveExtraKeys] = useState(() => {
    const keys = [];
    if (trip.tollCharges && Number(trip.tollCharges) > 0) keys.push("TOLL");
    if (trip.permitCharges && Number(trip.permitCharges) > 0) keys.push("PERMIT");
    if (trip.parkingCharges && Number(trip.parkingCharges) > 0) keys.push("PARKING");
    if (trip.driverAllowanceCharges && Number(trip.driverAllowanceCharges) > 0) keys.push("ALLOWANCE");
    if (trip.otherCharges && Number(trip.otherCharges) > 0) keys.push("OTHER");
    return keys;
  });

  const [tollCharges, setTollCharges] = useState(trip.tollCharges ? String(trip.tollCharges) : "");
  const [permitCharges, setPermitCharges] = useState(trip.permitCharges ? String(trip.permitCharges) : "");
  const [parkingCharges, setParkingCharges] = useState(trip.parkingCharges ? String(trip.parkingCharges) : "");
  const [driverAllowance, setDriverAllowance] = useState(trip.driverAllowanceCharges ? String(trip.driverAllowanceCharges) : "");
  const [otherCharges, setOtherCharges] = useState(trip.otherCharges ? String(trip.otherCharges) : "");
  const [otherChargesNotes, setOtherChargesNotes] = useState(trip.otherChargesNotes || "");

  // Dropdown Add Bar State
  const [selectedChargeType, setSelectedChargeType] = useState("");
  const [chargeAmountInput, setChargeAmountInput] = useState("");
  const [chargeNotesInput, setChargeNotesInput] = useState("");

  const handleAddExtraCharge = () => {
    if (!selectedChargeType) return;

    const amount = chargeAmountInput.trim();

    if (!activeExtraKeys.includes(selectedChargeType)) {
      setActiveExtraKeys((prev) => [...prev, selectedChargeType]);
    }

    if (selectedChargeType === "TOLL") {
      if (amount) setTollCharges(amount);
    } else if (selectedChargeType === "PERMIT") {
      if (amount) setPermitCharges(amount);
    } else if (selectedChargeType === "PARKING") {
      if (amount) setParkingCharges(amount);
    } else if (selectedChargeType === "ALLOWANCE") {
      if (amount) setDriverAllowance(amount);
    } else if (selectedChargeType === "OTHER") {
      if (amount) setOtherCharges(amount);
      if (chargeNotesInput.trim()) setOtherChargesNotes(chargeNotesInput.trim());
    }

    setSelectedChargeType("");
    setChargeAmountInput("");
    setChargeNotesInput("");
  };

  const handleRemoveExtraCharge = (key) => {
    setActiveExtraKeys((prev) => prev.filter((k) => k !== key));
    if (key === "TOLL") setTollCharges("");
    if (key === "PERMIT") setPermitCharges("");
    if (key === "PARKING") setParkingCharges("");
    if (key === "ALLOWANCE") setDriverAllowance("");
    if (key === "OTHER") {
      setOtherCharges("");
      setOtherChargesNotes("");
    }
  };

  const availableChargeOptions = useMemo(() => {
    return EXTRA_CHARGE_CONFIG.filter((cfg) => !activeExtraKeys.includes(cfg.id));
  }, [activeExtraKeys]);

  // Step 3: Payment & Notes
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [upiProofFile, setUpiProofFile] = useState(null);
  const [upiProofPreview, setUpiProofPreview] = useState(null);
  const [uploadingUpiProof, setUploadingUpiProof] = useState(false);
  const [closingNotes, setClosingNotes] = useState(trip.tripClosingNotes || "");

  const [submitting, setSubmitting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const endFileInputRef = useRef(null);
  const upiFileInputRef = useRef(null);

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

    const toll = activeExtraKeys.includes("TOLL") ? Math.max(0, Number(tollCharges) || 0) : 0;
    const permit = activeExtraKeys.includes("PERMIT") ? Math.max(0, Number(permitCharges) || 0) : 0;
    const parking = activeExtraKeys.includes("PARKING") ? Math.max(0, Number(parkingCharges) || 0) : 0;
    const allowance = activeExtraKeys.includes("ALLOWANCE") ? Math.max(0, Number(driverAllowance) || 0) : 0;
    const other = activeExtraKeys.includes("OTHER") ? Math.max(0, Number(otherCharges) || 0) : 0;

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
    activeExtraKeys,
    tollCharges,
    permitCharges,
    parkingCharges,
    driverAllowance,
    otherCharges,
    initialBaseFare,
    advancePaid
  ]);

  const handleEndFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingEndProof(true);
      setErrorMessage("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          setEndOdometerProof(file);
          setEndOdometerPreview(reader.result);
          setUploadingEndProof(false);
        }, 650);
      };
      reader.onerror = () => {
        setUploadingEndProof(false);
        setErrorMessage("Failed to read image file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpiFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingUpiProof(true);
      setErrorMessage("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          setUpiProofFile(file);
          setUpiProofPreview(reader.result);
          setUploadingUpiProof(false);
        }, 500);
      };
      reader.onerror = () => {
        setUploadingUpiProof(false);
        setErrorMessage("Failed to read image file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToStep2 = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage("");

    const s = Number(startKm);
    const eKm = Number(endKm);

    if (!endKm || isNaN(eKm) || eKm <= 0) {
      setErrorMessage("Please enter a valid ending odometer reading (KM).");
      return;
    }

    if (!isNaN(s) && eKm < s) {
      setErrorMessage(`End odometer (${eKm} KM) cannot be less than start odometer (${s} KM).`);
      return;
    }

    setStep(2);
  };

  // Step 2 -> Proceed to Step 3
  const handleProceedToStep3 = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage("");
    setStep(3);
  };

  // Main Form Submit Router
  const handleFormSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (step === 1) {
      handleProceedToStep2(e);
    } else if (step === 2) {
      handleProceedToStep3(e);
    } else if (step === 3) {
      handleSubmitFinal(e);
    }
  };

  // Final Step 3 Submit -> Finalize Bill & Complete Trip
  const handleSubmitFinal = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage("");

    if (paymentMethod === "UPI" && calculations.balanceDue > 0 && !upiProofFile && !upiProofPreview) {
      setErrorMessage("Please capture or upload the UPI payment screenshot/proof before finalizing.");
      return;
    }

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
        closingNotes: closingNotes.trim() || null,
        paymentMethod: paymentMethod || "CASH",
        paymentProofUrl: upiProofPreview || null,
        endOdometerProofUrl: endOdometerPreview || null
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

  const paymentOptions = [
    { id: "CASH", label: "Cash", icon: Banknote, desc: "Collected in cash by driver", shortDesc: "Driver cash" },
    { id: "UPI", label: "UPI / QR", icon: QrCode, desc: "Google Pay, PhonePe, Paytm QR", shortDesc: "GPay / QR" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 shadow-2xl w-full max-w-2xl h-[92vh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3.5 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          
          {/* Mobile Drag Indicator Bar */}
          <div className="w-12 h-1 bg-white/25 rounded-full mx-auto mb-2 sm:hidden" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                <Receipt className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-black tracking-tight truncate">
                    {step === 1 ? "End Trip: Odometer" : step === 2 ? "Extra Charges & Expenses" : "Payment & Tax Invoice"}
                  </h2>
                  <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold shrink-0">
                    Step {step} of 3
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 font-mono truncate">
                  #{trip.bookingReference || trip.id} • {trip.tripType}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3-Step Navigation Tabs */}
        {!completedSuccess && (
          <div className="grid grid-cols-3 text-center border-b border-slate-200 bg-slate-50 text-[11px] sm:text-xs shrink-0 select-none">
            <button
              type="button"
              onClick={() => {
                if (step > 1) {
                  setErrorMessage("");
                  setStep(1);
                }
              }}
              className={`py-2 px-1 font-black flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                step === 1
                  ? "text-amber-900 bg-amber-500/15 border-b-2 border-amber-500"
                  : "text-slate-500 hover:text-slate-800 cursor-pointer"
              }`}
            >
              <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] flex items-center justify-center ${
                step === 1 ? "bg-amber-500 text-slate-950 font-black" : "bg-emerald-100 text-emerald-800 font-bold"
              }`}>
                1
              </span>
              <span className="hidden sm:inline">End Odometer</span>
              <span className="sm:hidden font-bold">1. Meter</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (step > 2) {
                  setErrorMessage("");
                  setStep(2);
                }
              }}
              className={`py-2 px-1 font-black flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                step === 2
                  ? "text-amber-900 bg-amber-500/15 border-b-2 border-amber-500"
                  : step > 2 ? "text-slate-500 hover:text-slate-800 cursor-pointer" : "text-slate-400 cursor-not-allowed"
              }`}
            >
              <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] flex items-center justify-center ${
                step === 2 ? "bg-amber-500 text-slate-950 font-black" : step > 2 ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-slate-200 text-slate-600"
              }`}>
                2
              </span>
              <span className="hidden sm:inline">Extra Charges</span>
              <span className="sm:hidden font-bold">2. Extras</span>
            </button>

            <div
              className={`py-2 px-1 font-black flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                step === 3
                  ? "text-amber-900 bg-amber-500/15 border-b-2 border-amber-500"
                  : "text-slate-400"
              }`}
            >
              <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] flex items-center justify-center ${
                step === 3 ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-200 text-slate-600"
              }`}>
                3
              </span>
              <span className="hidden sm:inline">Payment &amp; Bill</span>
              <span className="sm:hidden font-bold">3. Payment</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        {completedSuccess ? (
          /* Celebratory Success Screen */
          <div className="p-6 sm:p-10 text-center space-y-5 overflow-y-auto flex-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-50 animate-bounce">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Trip Completed &amp; Billed!</h3>
              <p className="text-xs text-slate-600">
                Official Tax Invoice generated for Booking <strong>#{trip.bookingReference || trip.id}</strong>.
              </p>
            </div>

            {/* Quick Financial Summary */}
            <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Final Billed Fare:</span>
                <strong className="text-slate-900 font-black">{formatINR(completedSuccess.finalTotalFare || calculations.grandTotalFare)}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Mode:</span>
                <strong className="text-slate-900 font-bold uppercase">{paymentMethod}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Balance Collected:</span>
                <strong className="text-emerald-700 font-black">{formatINR(calculations.balanceDue)}</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <Link
                href={`/vendor/trips/${trip.bookingReference || trip.id}/invoice`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0082fe] hover:bg-blue-600 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-white" />
                View &amp; Print Tax Invoice
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close &amp; Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5">
              
              {/* Quick Trip Route Banner */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5 text-xs">
                <div>
                  <span className="text-[9px] font-black uppercase text-amber-800 tracking-wider block">
                    Trip Route
                  </span>
                  <p className="font-black text-slate-900 text-xs sm:text-sm break-words leading-snug mt-0.5">
                    {trip.pickup} {trip.drop ? `→ ${trip.drop}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-[10px] sm:text-[11px] flex-wrap pt-0.5 border-t border-amber-500/15">
                  {customerRouteKm > 0 && (
                    <span className="inline-flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                      <Navigation className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                      {customerRouteKm} KM Booked
                    </span>
                  )}
                  <span>Pkg: <strong>{includedKm} KM</strong></span>
                  <span>•</span>
                  <span>Rate: <strong>₹{defaultRate}/KM</strong></span>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 1: END ODOMETER & DASHBOARD PHOTO PROOF */}
              {/* ============================================================ */}
              {step === 1 && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-amber-500" />
                        Ending Odometer Reading
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">Step 1 of 3</span>
                    </div>

                    {/* Start & End Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Start Odometer */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-600">
                            Start Odometer (KM)
                          </label>
                          {trip.startKm != null && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={startKm}
                            readOnly
                            className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs sm:text-sm font-black text-slate-700 cursor-not-allowed"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            KM
                          </span>
                        </div>
                      </div>

                      {/* End Odometer */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-800">
                            End Odometer (KM) <span className="text-rose-500">*</span>
                          </label>
                          {startKm && !endKm && customerRouteKm > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setEndKm(String(Number(startKm) + customerRouteKm));
                                setErrorMessage("");
                              }}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                            >
                              +{customerRouteKm} KM (Route)
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            autoFocus
                            placeholder="e.g. 10520"
                            value={endKm}
                            onChange={(e) => {
                              setEndKm(e.target.value);
                              setErrorMessage("");
                            }}
                            className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-sm font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            KM
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* End Photo Proof */}
                    <div className="pt-2 border-t border-slate-200/80">
                      <label className="text-[10px] sm:text-[11px] font-bold text-slate-700 block mb-1">
                        End Odometer Photo Proof (Optional / Recommended)
                      </label>
                      <input
                        ref={endFileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleEndFileChange}
                        disabled={uploadingEndProof}
                        className="hidden"
                      />
                      {uploadingEndProof ? (
                        <div className="w-full py-2.5 px-3 rounded-xl border border-amber-400 bg-amber-50/80 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                          <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                          <span>Uploading &amp; Processing Photo...</span>
                        </div>
                      ) : endOdometerPreview ? (
                        <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-2 flex items-center gap-2">
                          <img
                            src={endOdometerPreview}
                            alt="End Odometer Proof"
                            className="w-11 h-11 object-cover rounded-lg border border-emerald-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-emerald-800 block truncate">
                              End Photo Attached
                            </span>
                            <span className="text-[10px] text-emerald-600 block">
                              {(endOdometerProof?.size ? (endOdometerProof.size / 1024).toFixed(0) : "0")} KB
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEndOdometerProof(null);
                              setEndOdometerPreview(null);
                              if (endFileInputRef.current) endFileInputRef.current.value = "";
                            }}
                            className="p-1.5 rounded-lg hover:bg-emerald-200 text-emerald-700 text-xs cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => endFileInputRef.current?.click()}
                          disabled={uploadingEndProof}
                          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-amber-500 bg-white hover:bg-amber-50/40 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Capture / Upload End Dashboard Photo</span>
                        </button>
                      )}
                    </div>

                    {/* Distance Badge */}
                    {actualTraveledKm != null && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
                        <span className="text-slate-600 font-medium">Actual Traveled:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-900 font-black">{actualTraveledKm} KM</strong>
                          {customerRouteKm > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              actualTraveledKm > customerRouteKm 
                                ? "bg-amber-100 text-amber-800" 
                                : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {actualTraveledKm > customerRouteKm 
                                ? `+${actualTraveledKm - customerRouteKm} KM extra` 
                                : "Within estimate"}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 2: EXTRA CHARGES & DROPDOWN SELECTOR */}
              {/* ============================================================ */}
              {step === 2 && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  
                  {/* Distance Recap Chip */}
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs flex-wrap gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-slate-500" />
                      <span>Run: <strong>{actualTraveledKm || 0} KM</strong></span>
                      <span>•</span>
                      <span>Pkg: <strong>{includedKm} KM</strong></span>
                    </div>
                    <span className="font-bold text-amber-800">
                      Extra: {calculatedExtraKm} KM
                    </span>
                  </div>

                  {/* Customer Booked Package & Add-ons (Calculated on Customer Side) */}
                  <div className="p-3.5 rounded-2xl border border-blue-200/80 bg-blue-50/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-blue-950">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-blue-950">
                          Pre-booked Add-ons (Customer Side)
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300">
                        ✓ Already Paid at Booking
                      </span>
                    </div>

                    {/* Base Fare & Prepaid Advance */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-blue-100 space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">Contracted Base Fare</span>
                        <strong className="text-slate-900 font-black text-sm">{formatINR(initialBaseFare)}</strong>
                        <span className="text-[10px] text-slate-500 block">{includedKm} KM Included</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-blue-100 space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">Prepaid Advance</span>
                        <strong className="text-emerald-700 font-black text-sm">{formatINR(advancePaid)}</strong>
                        <span className="text-[10px] text-emerald-600 font-bold block">
                          {advancePaid >= initialBaseFare ? "✓ Fully Prepaid" : `${formatINR(initialBaseFare - advancePaid)} balance`}
                        </span>
                      </div>
                    </div>

                    {/* Individual Customer Add-ons List */}
                    {customerAddons.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider block">
                            Customer Selected Services ({customerAddons.length}):
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700">
                            Already Paid by Customer
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {customerAddons.map((addon, idx) => (
                            <div
                              key={addon.id || idx}
                              className="p-2.5 bg-white rounded-xl border border-blue-200/70 shadow-2xs flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base shrink-0">{addon.emoji || "✨"}</span>
                                <div className="min-w-0">
                                  <p className="font-black text-slate-900 truncate text-xs">{addon.name}</p>
                                  {addon.desc && (
                                    <p className="text-[10px] text-slate-500 truncate">{addon.desc}</p>
                                  )}
                                </div>
                              </div>
                              <span className="font-bold text-slate-700 shrink-0 text-xs">
                                {formatINR(addon.price || 0)} <span className="text-[10px] text-emerald-600 font-semibold">(Paid)</span>
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 px-1 font-bold text-blue-950">
                          <span>Total Pre-paid Add-ons:</span>
                          <span className="font-black text-slate-800 text-xs sm:text-sm">
                            {formatINR(customerAddonsTotal)} <span className="text-[10px] text-emerald-600 font-normal">(Included in Advance)</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-white/70 border border-blue-100 text-center">
                        <span className="text-[11px] text-slate-500">
                          No optional add-ons selected by customer for this booking.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Extra Distance Input */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      1. Extra Distance Charges
                    </h4>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Extra KM
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={extraKmOverride !== "" ? extraKmOverride : (calculatedExtraKm > 0 ? calculatedExtraKm : "")}
                          onChange={(e) => setExtraKmOverride(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Rate (₹/KM)
                        </label>
                        <input
                          type="number"
                          value={extraKmRate}
                          onChange={(e) => setExtraKmRate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {calculatedExtraKm > 0 && (
                      <div className="text-[11px] font-extrabold text-amber-800 bg-amber-100/70 border border-amber-300 px-2.5 py-1.5 rounded-xl flex items-center justify-between">
                        <span>Extra Distance ({calculatedExtraKm} KM × ₹{extraKmRate}):</span>
                        <span>+ {formatINR(calculations.extraKmCost)}</span>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Selector for Highway Tolls & Expenses */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        2. Highway Tolls &amp; Out-of-Pocket Expenses
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-500">
                        Choose an expense from the dropdown and add amount.
                      </p>
                    </div>

                    {/* Add Bar */}
                    <div className="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                      <select
                        value={selectedChargeType}
                        onChange={(e) => setSelectedChargeType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="">
                          {availableChargeOptions.length === 0 
                            ? "All extra categories added" 
                            : "+ Choose Extra Charge to Add..."}
                        </option>
                        {availableChargeOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.icon} {opt.label}
                          </option>
                        ))}
                      </select>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="Enter amount"
                            value={chargeAmountInput}
                            onChange={(e) => setChargeAmountInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddExtraCharge();
                              }
                            }}
                            disabled={!selectedChargeType}
                            className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleAddExtraCharge}
                          disabled={!selectedChargeType}
                          className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>

                      {selectedChargeType === "OTHER" && (
                        <input
                          type="text"
                          placeholder="Reason for Other Extras (e.g. Hill terrain / Night waiting)"
                          value={chargeNotesInput}
                          onChange={(e) => setChargeNotesInput(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                        />
                      )}
                    </div>

                    {/* Active Items List */}
                    <div className="space-y-1.5">
                      {activeExtraKeys.length === 0 ? (
                        <div className="p-3 rounded-xl border border-dashed border-slate-200 bg-white text-center">
                          <p className="text-[11px] font-bold text-slate-600">No extra charges added</p>
                          <p className="text-[10px] text-slate-400">Select an item above if tolls or permits were incurred.</p>
                        </div>
                      ) : (
                        activeExtraKeys.map((key) => {
                          const config = EXTRA_CHARGE_CONFIG.find((c) => c.id === key);
                          if (!config) return null;

                          let value = "";
                          let onChangeValue = () => {};

                          if (key === "TOLL") {
                            value = tollCharges;
                            onChangeValue = (e) => setTollCharges(e.target.value);
                          } else if (key === "PERMIT") {
                            value = permitCharges;
                            onChangeValue = (e) => setPermitCharges(e.target.value);
                          } else if (key === "PARKING") {
                            value = parkingCharges;
                            onChangeValue = (e) => setParkingCharges(e.target.value);
                          } else if (key === "ALLOWANCE") {
                            value = driverAllowance;
                            onChangeValue = (e) => setDriverAllowance(e.target.value);
                          } else if (key === "OTHER") {
                            value = otherCharges;
                            onChangeValue = (e) => setOtherCharges(e.target.value);
                          }

                          return (
                            <div
                              key={key}
                              className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5 animate-in fade-in duration-150"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-sm shrink-0">{config.icon}</span>
                                  <span className="text-xs font-black text-slate-800 truncate">
                                    {config.label}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <div className="relative w-28 sm:w-32">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                      ₹
                                    </span>
                                    <input
                                      type="number"
                                      placeholder={config.placeholder}
                                      value={value}
                                      onChange={onChangeValue}
                                      className="w-full pl-5 pr-2 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExtraCharge(key)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Remove charge"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {key === "OTHER" && (
                                <input
                                  type="text"
                                  placeholder="Reason (e.g. Hill terrain / Night waiting)"
                                  value={otherChargesNotes}
                                  onChange={(e) => setOtherChargesNotes(e.target.value)}
                                  className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                                />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Subtotal */}
                    <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-bold">Total Additional Extras:</span>
                      <strong className="text-slate-900 font-black">{formatINR(calculations.totalExtrasBeforeGst)}</strong>
                    </div>

                  </div>

                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 3: PAYMENT TYPE & COMPACT TAX INVOICE */}
              {/* ============================================================ */}
              {step === 3 && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  
                  {/* Compact Live Bill Summary Card */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white shadow-md space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                      <span className="font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Live Bill Recalculation
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">GST Included</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Contracted Package Fare:</span>
                        <span className="font-bold text-white">{formatINR(initialBaseFare)}</span>
                      </div>

                      {calculations.extraKmCost > 0 && (
                        <div className="flex justify-between items-center text-amber-300">
                          <span>Extra Distance ({calculatedExtraKm} KM):</span>
                          <span className="font-bold">+{formatINR(calculations.extraKmCost)}</span>
                        </div>
                      )}

                      {calculations.toll > 0 && (
                        <div className="flex justify-between items-center text-slate-300">
                          <span>FASTag Highway Tolls:</span>
                          <span className="font-bold text-white">+{formatINR(calculations.toll)}</span>
                        </div>
                      )}

                      {calculations.permit > 0 && (
                        <div className="flex justify-between items-center text-slate-300">
                          <span>State Entry Permit:</span>
                          <span className="font-bold text-white">+{formatINR(calculations.permit)}</span>
                        </div>
                      )}

                      {calculations.parking > 0 && (
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Parking Charges:</span>
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

                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-black">
                        <span className="text-white">Final Total Amount:</span>
                        <span className="text-amber-400 text-base">{formatINR(calculations.grandTotalFare)}</span>
                      </div>

                      <div className="flex justify-between items-center text-slate-400 text-[11px]">
                        <span>Prepaid Advance:</span>
                        <span>-{formatINR(advancePaid)}</span>
                      </div>
                    </div>

                    {/* Prominent Balance Due Banner */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-emerald-400 block tracking-wider">
                          Collect from Passenger
                        </span>
                        <span className="text-lg sm:text-xl font-black text-white">
                          {formatINR(calculations.balanceDue)}
                        </span>
                      </div>
                      <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                    </div>
                  </div>

                  {/* Payment Collection Method (Mobile-Optimized Grid) */}
                  <div className="p-3 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Payment Collection Method <span className="text-rose-500">*</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {paymentOptions.map((opt) => {
                        const IconComp = opt.icon;
                        const isSelected = paymentMethod === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setPaymentMethod(opt.id)}
                            className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                              isSelected
                                ? "bg-amber-500/15 border-amber-500 text-slate-950 shadow-xs ring-1 ring-amber-500/30"
                                : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-100 text-slate-600"
                            }`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs sm:text-sm font-black block truncate">{opt.label}</span>
                              <span className="text-[10px] text-slate-500 block truncate">{opt.shortDesc || opt.desc}</span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Simplified UPI Payment Proof */}
                    {paymentMethod === "UPI" && (
                      <div className="pt-2 border-t border-slate-200">
                        <input
                          ref={upiFileInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleUpiFileChange}
                          disabled={uploadingUpiProof}
                          className="hidden"
                        />

                        {uploadingUpiProof ? (
                          <div className="w-full py-2 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                            <span>Attaching screenshot...</span>
                          </div>
                        ) : upiProofPreview ? (
                          <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-2 flex items-center gap-2.5">
                            <img
                              src={upiProofPreview}
                              alt="UPI Proof"
                              className="w-10 h-10 object-cover rounded-lg border border-emerald-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-emerald-800 block truncate flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                UPI Proof Attached
                              </span>
                              <span className="text-[10px] text-emerald-600 block">
                                {(upiProofFile?.size ? (upiProofFile.size / 1024).toFixed(0) : "0")} KB
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setUpiProofFile(null);
                                setUpiProofPreview(null);
                                if (upiFileInputRef.current) upiFileInputRef.current.value = "";
                              }}
                              className="p-1.5 rounded-lg hover:bg-emerald-200 text-emerald-700 cursor-pointer"
                              title="Remove photo"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => upiFileInputRef.current?.click()}
                            disabled={uploadingUpiProof}
                            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/30 hover:bg-amber-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                          >
                            <Camera className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Upload UPI Payment Proof <span className="text-rose-500">*</span></span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Driver Completion Notes */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      Trip Remarks (optional)
                    </label>
                    <textarea
                      rows={1}
                      placeholder="Passenger safely dropped. Bill verified."
                      value={closingNotes}
                      onChange={(e) => setClosingNotes(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                </div>
              )}

            </div>

            {/* Sticky Bottom Action Bar (Thumb-friendly & always visible on phones) */}
            <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shrink-0 flex items-center justify-between gap-2 shadow-lg">
              {step === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={uploadingEndProof}
                    className="inline-flex items-center justify-center gap-1.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <span>Proceed to Extra Charges</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : step === 2 ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setStep(1);
                    }}
                    className="inline-flex items-center justify-center gap-1 px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setStep(2);
                    }}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-1 px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Finalizing Fare...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-slate-950" />
                        <span>Finalize Bill &amp; End Trip 🏁</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
