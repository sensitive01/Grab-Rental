"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Wallet, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Smartphone, 
  Loader2, 
  User, 
  Phone, 
  FileText,
  Calendar,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import SearchSummaryBar from "@/components/booking/SearchSummaryBar";
import { customerApi } from "@/lib/customerApi";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";

function resolveCarImage(title, category, rawImage) {
  if (rawImage && typeof rawImage === "string" && !rawImage.includes("blob:")) {
    return rawImage;
  }

  const t = (title || "").toLowerCase();
  const c = (category || "").toLowerCase();
  
  if (t.includes("innova") || t.includes("crysta") || t.includes("hycross") || t.includes("fortuner")) {
    return "/images/cars/innova.jpg";
  }
  if (t.includes("s-presso") || t.includes("spresso")) {
    return "/images/cars/spresso.jpg";
  }
  if (t.includes("wagon") || t.includes("celerio") || t.includes("tiago") || t.includes("alto")) {
    return "/images/cars/wagon_r.jpg";
  }
  if (t.includes("ertiga") || t.includes("carens") || t.includes("triber") || t.includes("rumion")) {
    return "/images/cars/ertiga.jpg";
  }
  if (t.includes("dzire") || t.includes("etios") || t.includes("amaze") || t.includes("verna") || t.includes("aura") || t.includes("city")) {
    return "/images/cars/dzire.jpg";
  }

  if (c.includes("hatchback")) return "/images/cars/wagon_r.jpg";
  if (c.includes("suv_6")) return "/images/cars/ertiga.jpg";
  if (c.includes("suv_7")) return "/images/cars/innova.jpg";
  return "/images/cars/dzire.jpg";
}

export default function ReviewPayPage() {
  const router = useRouter();
  const [paymentPlan, setPaymentPlan] = useState("advance");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [bookingConfig, setBookingConfig] = useState(null);
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("grab_selected_booking");
        if (stored) {
          const parsed = JSON.parse(stored);
          setBookingConfig(parsed);

          // Prefill pickup & drop addresses if empty
          if (parsed.trip?.from) {
            setPickupAddress(`${parsed.trip.from} (City Center / Main Landmark)`);
          }
          if (parsed.trip?.to) {
            setDropAddress(`${parsed.trip.to} (City Center / Main Landmark)`);
          }
        }

        const user = getCurrentUser();
        if (user) {
          if (user.name) setPassengerName(user.name);
          if (user.phone) setPassengerPhone(user.phone);
        }
      } catch (err) {
        console.warn("Could not load stored booking config:", err);
      }
    }
  }, []);

  // Dynamic pricing from backend tariff engine (stored in sessionStorage by select-vehicle page)
  const baseFare = bookingConfig?.car?.fare || 0;
  const taxes = bookingConfig?.car?.taxes || 0;
  const luggageCarrierFee = bookingConfig?.car?.withLuggageCarrier ? 149 : 0;
  const totalAmount = bookingConfig?.car?.totalFare || (baseFare + taxes + luggageCarrierFee);
  const advanceAmount = bookingConfig?.car?.advancePaid || Math.round(totalAmount * 0.20);
  const driverLaterAmount = totalAmount - advanceAmount;
  const distanceKm = bookingConfig?.distanceKm || 0;
  const perKmRate = bookingConfig?.car?.perKmRate || 0;

  const handlePayAndBook = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      router.push("/login?redirect=/outstation/review-pay");
      return;
    }

    if (!pickupAddress.trim()) {
      setErrorMsg("Please enter your exact pickup address or landmark.");
      return;
    }

    if (!passengerName.trim() || !passengerPhone.trim()) {
      setErrorMsg("Please provide passenger name and mobile number.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const user = getCurrentUser();
      const advancePaid = paymentPlan === "advance" ? advanceAmount : totalAmount;

      // Construct ISO timestamp from trip date and time
      let pickupIso = new Date(Date.now() + 86400000).toISOString();
      if (bookingConfig?.trip?.date) {
        try {
          const dateParts = bookingConfig.trip.date.split("-");
          let yyyy, mm, dd;
          if (dateParts[0].length === 4) {
            [yyyy, mm, dd] = dateParts;
          } else {
            [dd, mm, yyyy] = dateParts;
          }
          const timeParts = (bookingConfig.trip.time || "07:00").split(":");
          const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(timeParts[0] || 7), Number(timeParts[1] || 0));
          if (!isNaN(dt.getTime())) {
            pickupIso = dt.toISOString();
          }
        } catch {
          // Keep fallback ISO
        }
      }

      const rawStops = bookingConfig?.trip?.stops || bookingConfig?.stops || null;
      let stopsVal = null;
      if (rawStops) {
        if (Array.isArray(rawStops)) {
          const filtered = rawStops.filter(Boolean);
          if (filtered.length > 0) stopsVal = filtered.join("|");
        } else if (typeof rawStops === "string" && rawStops.trim()) {
          stopsVal = rawStops.trim();
        }
      }

      const bookingPayload = {
        tripType: (bookingConfig?.trip?.tripType || "One way").toLowerCase().includes("round") ? "ROUND_TRIP" : "ONE_WAY",
        pickupCity: bookingConfig?.trip?.from || "Bangalore",
        dropCity: bookingConfig?.trip?.to || "Coimbatore",
        stops: stopsVal,
        pickupAddress: pickupAddress.trim(),
        dropAddress: dropAddress.trim() || `${bookingConfig?.trip?.to || "Destination"} Center`,
        pickupDateTime: pickupIso,
        returnDateTime: null,
        vehicleCategory: bookingConfig?.car?.category || "SEDAN",
        passengerCount: 2,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        totalFare: totalAmount,
        advancePaid,
        paymentStatus: paymentPlan === "advance" ? "ADVANCE_PAID" : "FULL_PAID",
        specialInstructions: `${specialInstructions ? specialInstructions.trim() + " | " : ""}${stopsVal ? "Intermediate Stops: " + stopsVal.replace(/\|/g, ", ") + " | " : ""}Vehicle: ${bookingConfig?.car?.title || "Fleet"} | Fuel: ${bookingConfig?.car?.fuel || "CNG"} | Distance: ${distanceKm} km | Rate: ₹${perKmRate}/km${bookingConfig?.car?.withLuggageCarrier ? " | Rooftop Carrier Included" : ""}`,
      };

      const res = await customerApi.createBooking(bookingPayload);
      if (res && res.data) {
        sessionStorage.setItem("grab_confirmed_booking", JSON.stringify({ ...res.data, stops: res.data.stops || stopsVal }));
        const bookingRef = res.data.bookingReference || res.data.id;
        router.push(`/booking/confirmation?id=${encodeURIComponent(bookingRef)}`);
      } else {
        throw new Error("Unable to confirm booking. Please try again.");
      }
    } catch (err) {
      console.error("[ReviewPay] Booking creation error:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to confirm booking. Please verify your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!bookingConfig) {
    return (
      <main className="bg-slate-50 min-h-screen py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Loading Selected Vehicle...</h2>
          <p className="text-xs text-slate-500">
            If you came directly, please choose your car first.
          </p>
          <Link
            href="/outstation/select-vehicle"
            className="inline-block py-2.5 px-6 rounded-xl bg-amber-600 text-white font-bold text-xs uppercase tracking-wider"
          >
            Select Vehicle
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen pb-24">
      <SearchSummaryBar activeStep={2} />
      
      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-8">
        
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">Review & Pay</h1>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePayAndBook} className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Passenger & Pickup Details + Payment Options */}
          <div className="flex-1 space-y-6">
            
            {/* 1. Passenger Information */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-slate-900 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">1</div>
                <h2 className="text-lg font-black text-slate-900">Passenger & Pickup Details</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      Passenger Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="E.g. Rajesh Kumar"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                      Mobile Number (For Driver SMS) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    Exact Pickup Address / Landmark / Hotel *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                    <textarea
                      rows={2}
                      required
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Enter street, apartment/building name, landmark..."
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                    ></textarea>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    Drop Destination Landmark (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-amber-600 absolute left-3.5 top-3" />
                    <textarea
                      rows={2}
                      value={dropAddress}
                      onChange={(e) => setDropAddress(e.target.value)}
                      placeholder="Enter destination address or drop landmark..."
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                    ></textarea>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    Special Chauffeur Requests (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="E.g., Carrying excess baggage, baby in car, early departure..."
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Plan Selection */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-slate-900 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">2</div>
                <h2 className="text-lg font-black text-slate-900">Select Payment Plan</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label 
                  onClick={() => setPaymentPlan("advance")}
                  className={`relative border-2 ${paymentPlan === 'advance' ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-600/10' : 'border-slate-200 bg-white'} p-5 rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all`}
                >
                  <input type="radio" name="payment" checked={paymentPlan === "advance"} onChange={() => setPaymentPlan("advance")} className="absolute top-4 right-4 w-4 h-4 accent-amber-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 mb-1">Pay 20% Advance Now</span>
                  <span className="text-2xl font-black text-amber-700 mb-1">₹{advanceAmount.toLocaleString()}</span>
                  <span className="text-[11px] font-bold text-slate-500">Pay ₹{driverLaterAmount.toLocaleString()} to chauffeur at trip end</span>
                </label>
                
                <label 
                  onClick={() => setPaymentPlan("full")}
                  className={`relative border-2 ${paymentPlan === 'full' ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-600/10' : 'border-slate-200 bg-white'} p-5 rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all`}
                >
                  <input type="radio" name="payment" checked={paymentPlan === "full"} onChange={() => setPaymentPlan("full")} className="absolute top-4 right-4 w-4 h-4 accent-amber-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 mb-1">Pay Full Amount</span>
                  <span className="text-2xl font-black text-slate-900 mb-1">₹{totalAmount.toLocaleString()}</span>
                  <span className="text-[11px] font-bold text-emerald-600">Zero cash hassle during the ride</span>
                </label>
              </div>
            </div>

            {/* 3. Payment Gateway Options */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-slate-900 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">3</div>
                <h2 className="text-lg font-black text-slate-900">Supported Payment Methods</h2>
              </div>

              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-700 shadow-2xs">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Instant UPI & QR</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Google Pay, PhonePe, Paytm, BHIM</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Zero Fee</span>
                </div>
                
                <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-700 shadow-2xs">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Debit & Credit Cards</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Visa, MasterCard, RuPay, Amex</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">All Banks</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Fare Breakdown & Confirmation Action */}
          <div className="w-full lg:w-[420px]">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm sticky top-36 overflow-hidden">
              
              <div className="bg-slate-900 text-white p-5">
                <h3 className="text-base font-black tracking-tight">Final Booking Summary</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {bookingConfig.trip?.from} {bookingConfig.trip?.stops ? `→ Via ${String(bookingConfig.trip.stops).replace(/\|/g, ", ")} ` : ""}→ {bookingConfig.trip?.to} • {bookingConfig.trip?.tripType}
                </p>
              </div>

              {/* Selected Vehicle Overview */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-14 relative bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0">
                    <Image 
                      src={resolveCarImage(bookingConfig.car?.title, bookingConfig.car?.category, bookingConfig.car?.image)} 
                      alt={bookingConfig.car?.title || "Car"} 
                      fill 
                      unoptimized={true}
                      className="object-contain p-1" 
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{bookingConfig.car?.title}</h4>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      {bookingConfig.car?.seating} Seats • {bookingConfig.car?.fuel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Fare Breakdown — all values from backend tariff engine */}
              <div className="p-5 border-b border-slate-100 space-y-3">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Fare Breakdown</h4>
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>Base Outstation Fare ({distanceKm} km × ₹{Number(perKmRate).toFixed(1)}/km)</span>
                    <span className="text-slate-900 font-bold">₹{baseFare.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Driver Allowance & Night Charges</span>
                    <span className="text-emerald-700 font-extrabold">Included (₹0)</span>
                  </div>
                  {bookingConfig.car?.withLuggageCarrier && (
                    <div className="flex justify-between items-center text-amber-800">
                      <span>Rooftop Luggage Carrier</span>
                      <span className="font-bold">+ ₹{luggageCarrierFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>GST, Tolls & State Passenger Tax</span>
                    <span className="text-slate-900 font-bold">₹{taxes.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Total & Action */}
              <div className="p-5 bg-amber-50/40 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Total Ride Value</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">₹{totalAmount.toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-amber-200/80 flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-900">Paying Now:</span>
                  <span className="font-black text-amber-700 text-sm">
                    ₹{paymentPlan === "advance" ? advanceAmount.toLocaleString() : totalAmount.toLocaleString()}
                  </span>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Forwarding to Dispatch Engine...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> 
                      Confirm & Pay ₹{paymentPlan === "advance" ? advanceAmount.toLocaleString() : totalAmount.toLocaleString()}
                    </>
                  )}
                </button>
                
                <p className="text-[10px] text-slate-500 font-bold text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Encrypted & Verified Booking
                </p>
              </div>

            </div>
          </div>

        </form>
      </div>
    </main>
  );
}
