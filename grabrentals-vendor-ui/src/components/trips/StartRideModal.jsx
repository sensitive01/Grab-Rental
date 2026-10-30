"use client";

import { useState, useRef } from "react";
import { 
  X, 
  Navigation, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  KeyRound, 
  Sparkles, 
  Loader2, 
  ArrowRight,
  ArrowLeft,
  User,
  Copy,
  Check,
  Edit3
} from "lucide-react";
import { vendorApi } from "@/lib/vendorApi";

export default function StartRideModal({ isOpen, onClose, trip, onRideStarted }) {
  if (!isOpen || !trip) return null;

  // Step 1: Odometer & Proof | Step 2: Customer OTP Verification
  const [step, setStep] = useState(1);

  // Derive or get the expected 4-digit OTP
  const expectedOtp = (() => {
    if (trip.rideOtp) return String(trip.rideOtp).trim();
    const digits = (trip.bookingReference || trip.id || "").replace(/\D/g, "");
    if (digits.length >= 4) return digits.slice(-4);
    return "7429";
  })();

  const [startKm, setStartKm] = useState(trip.startKm != null ? String(trip.startKm) : "");
  const [odometerProof, setOdometerProof] = useState(null);
  const [odometerPreview, setOdometerPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [copiedOtp, setCopiedOtp] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);

  // Check if a vehicle has been assigned by the vendor
  const hasVehicle = Boolean(
    trip.vehicleNumber && 
    trip.vehicleNumber !== "Assigned by Fleet" && 
    trip.vehicleNumber !== "Unassigned" && 
    trip.vehicleNumber !== "Pending Assignment" &&
    trip.vehicleNumber !== "Assigned" &&
    trip.vehicleNumber.trim().length > 0
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingPhoto(true);
      setErrorMessage("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          setOdometerProof(file);
          setOdometerPreview(reader.result);
          setUploadingPhoto(false);
        }, 650);
      };
      reader.onerror = () => {
        setUploadingPhoto(false);
        setErrorMessage("Failed to process the photo. Please try another image.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyOtp = () => {
    navigator.clipboard?.writeText(expectedOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleAutoFillOtp = () => {
    setOtpInput(expectedOtp);
    setErrorMessage("");
  };

  // Step 1 -> Step 2 validation
  const handleProceedToStep2 = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!hasVehicle) {
      setErrorMessage("Cannot start ride: A fleet vehicle must be assigned by the vendor before starting the trip.");
      return;
    }

    const kmNum = Number(startKm);
    if (!startKm || isNaN(kmNum) || kmNum <= 0) {
      setErrorMessage("Please enter a valid starting odometer reading (KM).");
      return;
    }

    if (!odometerPreview && !odometerProof) {
      setErrorMessage("Please capture or upload odometer dashboard photo proof before proceeding to Customer OTP.");
      return;
    }

    setStep(2);
  };

  // Step 2 Submission & Verification
  const handleVerifyAndStartRide = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanInputOtp = otpInput.trim();
    if (!cleanInputOtp) {
      setErrorMessage("Please enter the 4-digit Start Ride OTP.");
      return;
    }

    if (cleanInputOtp !== expectedOtp) {
      setErrorMessage(`Invalid OTP entered. Please check the code (${expectedOtp}) and try again.`);
      return;
    }

    setSubmitting(true);
    try {
      const tripId = trip.bookingReference || trip.id;
      const kmNum = Number(startKm);
      const updated = await vendorApi.startRide(tripId, {
        startKm: kmNum,
        odometerProof: odometerPreview,
        otp: cleanInputOtp
      });

      setSuccess(true);
      setTimeout(() => {
        if (onRideStarted) onRideStarted(updated || { ...trip, status: "Active", rawStatus: "IN_TRANSIT", startKm: kmNum });
        onClose();
      }, 900);
    } catch (err) {
      console.error("Failed to start ride:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to start ride. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col my-0 sm:my-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shrink-0">
          
          {/* Mobile Drag Indicator Bar */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-2 sm:hidden" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
                step === 1 
                  ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/20 border border-amber-500/30 text-amber-400"
              }`}>
                {step === 1 ? (
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                ) : (
                  <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black tracking-tight text-white truncate">
                    {step === 1 ? "Start Ride: Odometer" : "Verify Ride OTP"}
                  </h2>
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                    step === 1
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}>
                    {step}/2
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate">
                  #{trip.bookingReference || trip.id} • {trip.tripType}
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
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-2 text-center border-b border-slate-100 bg-slate-50/70 text-[11px] sm:text-xs shrink-0">
          <div 
            onClick={() => {
              if (step === 2) {
                setErrorMessage("");
                setStep(1);
              }
            }}
            className={`py-2 sm:py-2.5 px-2 font-black flex items-center justify-center gap-1.5 transition-all ${
              step === 1
                ? "text-emerald-700 bg-emerald-50/70 border-b-2 border-emerald-600"
                : "text-slate-500 hover:text-slate-800 cursor-pointer"
            }`}
          >
            <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] flex items-center justify-center ${
              step === 1 ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700"
            }`}>
              1
            </span>
            <span className="truncate">Start Odometer</span>
          </div>

          <div 
            className={`py-2 sm:py-2.5 px-2 font-black flex items-center justify-center gap-1.5 transition-all ${
              step === 2
                ? "text-amber-700 bg-amber-50/70 border-b-2 border-amber-500"
                : "text-slate-400"
            }`}
          >
            <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] flex items-center justify-center ${
              step === 2 ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-200 text-slate-600"
            }`}>
              2
            </span>
            <span className="truncate">Verify OTP</span>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">

          {/* Success Overlay */}
          {success ? (
            <div className="py-8 sm:py-10 text-center space-y-3 sm:space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Ride Started Successfully!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Odometer recorded at <strong>{startKm} KM</strong>. Trip status is now <strong>In Transit</strong>. Have a safe journey!
              </p>
            </div>
          ) : (
            <>
              {/* Trip Context Card */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Passenger:</span>
                  <strong className="text-slate-900">{trip.customer?.name || "Customer"}</strong>
                  {trip.customer?.phone && (
                    <span className="text-slate-500 text-[11px]">({trip.customer.phone})</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-600">
                  <span className="truncate" title={trip.pickup}>
                    📍 <strong>From:</strong> {trip.pickupCity || trip.pickup}
                  </span>
                  <span className="truncate" title={trip.drop}>
                    🏁 <strong>To:</strong> {trip.dropCity || trip.drop}
                  </span>
                </div>
              </div>

              {/* STEP 1: ODOMETER & PROOF */}
              {step === 1 && (
                <form onSubmit={handleProceedToStep2} className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
                  <div className="space-y-3.5">
                    
                    {!hasVehicle && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-black block">Vehicle Not Assigned</span>
                          <span className="text-[11px] text-amber-800">
                            A fleet vehicle must be assigned by the vendor before this ride can be started. Please assign a vehicle to proceed.
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-emerald-600" />
                        Enter Starting Odometer &amp; Photo
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">Step 1 of 2</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                      {/* Odometer Input */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Start Odometer (KM) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            autoFocus
                            placeholder="e.g. 24550"
                            value={startKm}
                            onChange={(e) => {
                              setStartKm(e.target.value);
                              setErrorMessage("");
                            }}
                            className="w-full px-3.5 py-2.5 sm:py-2.5 bg-white rounded-xl border border-slate-300 text-sm font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            KM
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Current vehicle dashboard odometer</p>
                      </div>

                      {/* Proof Image Upload */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Odometer Dashboard Photo <span className="text-rose-500">*</span>
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileChange}
                          disabled={uploadingPhoto}
                          className="hidden"
                        />
                        {uploadingPhoto ? (
                          <div className="w-full py-2.5 px-3 rounded-xl border border-emerald-400 bg-emerald-50/80 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2.5 shadow-sm animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                            <span>Uploading &amp; Processing Photo...</span>
                          </div>
                        ) : odometerPreview ? (
                          <div className="relative rounded-xl border border-emerald-300 bg-emerald-50/50 p-2 flex items-center gap-2">
                            <img
                              src={odometerPreview}
                              alt="Odometer Proof"
                              className="w-12 h-12 object-cover rounded-lg border border-emerald-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[11px] font-bold text-emerald-800 block truncate">
                                Photo Attached
                              </span>
                              <span className="text-[9px] text-emerald-600 block">
                                {(odometerProof?.size ? (odometerProof.size / 1024).toFixed(0) : "0")} KB
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setOdometerProof(null);
                                setOdometerPreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                              className="p-1.5 rounded-lg hover:bg-emerald-200 text-emerald-700 text-xs cursor-pointer"
                              title="Remove photo"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingPhoto}
                            className="w-full py-2.5 sm:py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                          >
                            <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Capture / Upload Proof</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Step 1 Actions (Responsive Stack on Mobile) */}
                  <div className="pt-2 sm:pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-center transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={uploadingPhoto || !hasVehicle}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {uploadingPhoto ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading Photo...</span>
                        </>
                      ) : (
                        <>
                          <span>Proceed to Customer OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: OTP VERIFICATION */}
              {step === 2 && (
                <form onSubmit={handleVerifyAndStartRide} className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
                  
                  {/* Confirmed Odometer Banner */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 border border-emerald-200/90 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      {odometerPreview && (
                        <img
                          src={odometerPreview}
                          alt="Proof"
                          className="w-8 h-8 rounded-lg object-cover border border-emerald-300 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block truncate">
                          Confirmed Start Odometer
                        </span>
                        <strong className="text-emerald-950 font-black text-sm">{startKm} KM</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setStep(1);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ml-2"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit Meter
                    </button>
                  </div>

                  {/* Simple & Clean Dev OTP Strip */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="text-slate-600 font-medium text-xs">Ride Start OTP:</span>
                      <span className="font-mono font-black text-sm text-slate-900 bg-white px-2.5 py-0.5 rounded border border-amber-300 tracking-widest">
                        {expectedOtp}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoFillOtp}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Auto-fill
                    </button>
                  </div>

                  {/* OTP Verification Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-800 block">
                      Enter 4-Digit Customer OTP <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        placeholder={`Enter ${expectedOtp}`}
                        value={otpInput}
                        onChange={(e) => {
                          setOtpInput(e.target.value.replace(/\D/g, ""));
                          setErrorMessage("");
                        }}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-slate-300 text-center font-mono text-xl sm:text-2xl font-black tracking-widest text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 text-center">
                      Ask customer for the 4-digit code to start ride
                    </p>
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Step 2 Actions (Responsive Stack on Mobile) */}
                  <div className="pt-2 sm:pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setStep(1);
                      }}
                      disabled={submitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-center transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Meter
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying &amp; Starting...
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4 fill-white" />
                          Verify OTP &amp; Start Ride
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
