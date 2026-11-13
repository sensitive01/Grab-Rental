"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { operationsApi } from "@/lib/operationsApi";
import { formatINR } from "@/lib/utils";
import {
  Car,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Luggage,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Send,
  Navigation,
} from "lucide-react";

export function CreateBookingModal({ isOpen, onClose, onSuccess, onToast }) {
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [tripType, setTripType] = useState("ONE_WAY");
  const [pickupCity, setPickupCity] = useState("Chennai");
  const [dropCity, setDropCity] = useState("Bengaluru");
  const [stops, setStops] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  
  // Dates default: 1 hour from now
  const [pickupDateTime, setPickupDateTime] = useState(() => {
    const d = new Date(Date.now() + 3600000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [returnDateTime, setReturnDateTime] = useState("");

  // Passenger
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);

  // Vehicle Category
  const [vehicleCategory, setVehicleCategory] = useState("SEDAN");

  // Customer Addons
  const [addonLanguage, setAddonLanguage] = useState(false);
  const [chauffeurLang, setChauffeurLang] = useState("English");
  const [addonLuggage, setAddonLuggage] = useState(false);
  const [addonNewCar, setAddonNewCar] = useState(false);
  const [addonFastag, setAddonFastag] = useState(false);
  const [addonPet, setAddonPet] = useState(false);
  const [petType, setPetType] = useState("Dog");
  const [petCount, setPetCount] = useState(1);
  const [petCharge, setPetCharge] = useState(500);

  // Financials
  const [totalFare, setTotalFare] = useState("5901");
  const [advancePaid, setAdvancePaid] = useState("5901");
  const [paymentStatus, setPaymentStatus] = useState("ADVANCE_PAID");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentUtrNumber, setPaymentUtrNumber] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  // Dispatch Mode
  const [dispatchMode, setDispatchMode] = useState("QUEUE"); // "QUEUE" or "DIRECT"
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [loadingFleet, setLoadingFleet] = useState(false);

  // Fetch available vehicles & drivers when Direct Allocation is selected
  useEffect(() => {
    if (dispatchMode === "DIRECT" && isOpen) {
      async function loadFleet() {
        setLoadingFleet(true);
        try {
          const [vRes, dRes] = await Promise.all([
            operationsApi.getVehicles("AVAILABLE"),
            operationsApi.getDrivers("AVAILABLE"),
          ]);
          setAvailableVehicles(vRes.data || []);
          setAvailableDrivers(dRes.data || []);
        } catch (err) {
          console.error("Failed to fetch available fleet:", err);
        } finally {
          setLoadingFleet(false);
        }
      }
      loadFleet();
    }
  }, [dispatchMode, isOpen]);

  if (!isOpen) return null;

  // Auto-update payment status based on advance vs total
  const fareNum = Number(totalFare) || 0;
  const advanceNum = Number(advancePaid) || 0;
  const balanceDue = Math.max(0, fareNum - advanceNum);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passengerName.trim()) {
      onToast?.({ type: "error", message: "Passenger Name is required." });
      return;
    }
    if (!passengerPhone.trim()) {
      onToast?.({ type: "error", message: "Passenger Phone Number is required for WhatsApp dispatch." });
      return;
    }
    if (!pickupCity.trim()) {
      onToast?.({ type: "error", message: "Pickup City is required." });
      return;
    }
    if (!pickupAddress.trim()) {
      onToast?.({ type: "error", message: "Detailed Pickup Address is required." });
      return;
    }
    if (fareNum <= 0) {
      onToast?.({ type: "error", message: "Total Fare must be greater than zero." });
      return;
    }

    if (dispatchMode === "DIRECT" && !selectedVehicleId) {
      onToast?.({ type: "warning", message: "Please select an assigned vehicle for Direct Allocation." });
      return;
    }

    setSubmitting(true);

    try {
      // Build special instructions string incorporating add-ons
      const instructionParts = [];
      if (specialNotes.trim()) instructionParts.push(specialNotes.trim());
      if (addonLanguage) instructionParts.push(`Language Chauffeur (${chauffeurLang}) (₹199)`);
      if (addonLuggage) instructionParts.push(`Luggage Carrier Added (₹249)`);
      if (addonNewCar) instructionParts.push(`Car < 3 Years (₹299)`);
      if (addonFastag) instructionParts.push(`Expressway FASTag Pass (₹415)`);
      if (addonPet) instructionParts.push(`Pet Friendly Cab (${petType} × ${petCount}, Pet Fee: ₹${petCharge})`);

      const payload = {
        tripType,
        pickupCity: pickupCity.trim(),
        dropCity: tripType === "LOCAL" ? pickupCity.trim() : (dropCity.trim() || pickupCity.trim()),
        stops: stops.trim() || null,
        pickupAddress: pickupAddress.trim(),
        dropAddress: dropAddress.trim() || (dropCity.trim() ? `${dropCity.trim()} City Center` : "Destination"),
        pickupDateTime: `${pickupDateTime}:00`,
        returnDateTime: tripType === "ROUND_TRIP" && returnDateTime ? `${returnDateTime}:00` : null,
        vehicleCategory,
        passengerCount: Number(passengerCount) || 1,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        passengerEmail: passengerEmail.trim() || null,
        totalFare: fareNum,
        advancePaid: advanceNum,
        paymentStatus,
        paymentMethod,
        paymentUtrNumber: paymentUtrNumber.trim() || null,
        isPetFriendly: addonPet,
        petType: addonPet ? petType : null,
        petCount: addonPet ? Number(petCount) : 0,
        petCharge: addonPet ? Number(petCharge) : 0,
        specialInstructions: instructionParts.join(" | "),
        initialStatus: dispatchMode === "DIRECT" ? "CONFIRMED" : "PENDING_ALLOCATION",
        assignedVehicleId: dispatchMode === "DIRECT" && selectedVehicleId ? selectedVehicleId : null,
        assignedDriverId: dispatchMode === "DIRECT" && selectedDriverId ? selectedDriverId : null,
      };

      const res = await operationsApi.createBooking(payload);

      if (res && res.success) {
        onToast?.({
          type: "success",
          message: `Booking #${res.data?.bookingReference || "CREATED"} created successfully! ${
            dispatchMode === "DIRECT" ? "Scenario 2 Confirmed Voucher" : "Scenario 1 Estimate"
          } dispatched via WhatsApp.`,
        });
        onSuccess?.(res.data);
        onClose();
      } else {
        throw new Error(res?.message || "Failed to create booking.");
      }
    } catch (err) {
      console.error("Create booking error:", err);
      onToast?.({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Failed to create manual booking.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Manual Booking & Reservation"
      subtitle="Enter phone, WhatsApp, or corporate reservation directly into the dispatch ledger"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Section 1: Passenger Information */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" /> Passenger &amp; Contact Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Passenger Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="e.g. Arun Kumar"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Passenger Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Receives automated WhatsApp document</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Passenger Email <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={passengerEmail}
                onChange={(e) => setPassengerEmail(e.target.value)}
                placeholder="arun@example.com"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Passenger Count</label>
              <input
                type="number"
                min="1"
                max="30"
                value={passengerCount}
                onChange={(e) => setPassengerCount(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Trip Type & Itinerary */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-amber-500" /> Route &amp; Pickup Schedule
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Trip Type</label>
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ONE_WAY">One Way Outstation</option>
                <option value="ROUND_TRIP">Round Trip Outstation</option>
                <option value="LOCAL">Local Hourly Rental</option>
                <option value="AIRPORT">Airport Transfer</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Pickup City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={pickupCity}
                onChange={(e) => setPickupCity(e.target.value)}
                placeholder="e.g. Chennai"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {tripType === "LOCAL" ? "Package / Service" : "Drop City"}
              </label>
              <input
                type="text"
                value={dropCity}
                onChange={(e) => setDropCity(e.target.value)}
                placeholder={tripType === "LOCAL" ? "e.g. 8 Hr / 80 Km" : "e.g. Bengaluru"}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Intermediate Stops</label>
              <input
                type="text"
                value={stops}
                onChange={(e) => setStops(e.target.value)}
                placeholder="e.g. Vellore, Ambur"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Pickup Date &amp; Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={pickupDateTime}
                onChange={(e) => setPickupDateTime(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {tripType === "ROUND_TRIP" && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Return Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={returnDateTime}
                  onChange={(e) => setReturnDateTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Detailed Pickup Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Door No, Street, Landmark, Pincode"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Destination Address</label>
              <input
                type="text"
                value={dropAddress}
                onChange={(e) => setDropAddress(e.target.value)}
                placeholder="Drop landmark or hotel address"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Vehicle Category & Add-ons */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-500" /> Fleet Category &amp; Customer Add-ons
          </h4>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Category</label>
            <select
              value={vehicleCategory}
              onChange={(e) => setVehicleCategory(e.target.value)}
              className="w-full sm:w-72 text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="SEDAN">Sedan (Dzire, Etios, Aura)</option>
              <option value="PRIME_SEDAN">Prime Sedan (Ciaz, City)</option>
              <option value="SUV">SUV (Ertiga, XL6)</option>
              <option value="INNOVA_CRYSTA">Innova Crysta</option>
              <option value="TEMPO_TRAVELLER">Force Urbania / Tempo Traveller</option>
              <option value="LUXURY">Luxury Chauffeur (Camry, Mercedes)</option>
            </select>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-[11px] font-bold text-slate-700 block">Select Customer Add-ons:</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addonLanguage}
                  onChange={(e) => setAddonLanguage(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-800">🗣️ Language Chauffeur (+₹199)</span>
                  <p className="text-[10px] text-slate-500">Appoint driver fluent in customer&apos;s preferred language</p>
                  {addonLanguage && (
                    <select
                      value={chauffeurLang}
                      onChange={(e) => setChauffeurLang(e.target.value)}
                      className="mt-1 text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white font-medium"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Malayalam">Malayalam</option>
                    </select>
                  )}
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addonLuggage}
                  onChange={(e) => setAddonLuggage(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-800">🧳 Luggage / Rooftop Carrier (+₹249)</span>
                  <p className="text-[10px] text-slate-500">Cab with secure luggage rack and waterproof tarpaulin</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addonNewCar}
                  onChange={(e) => setAddonNewCar(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-800">✨ Guaranteed Car &lt; 3 Years (+₹299)</span>
                  <p className="text-[10px] text-slate-500">Pristine, late-model vehicle (model year 2023+)</p>
                </div>
              </label>

              {/* Expressway FASTag option hidden per request */}
              {/*
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addonFastag}
                  onChange={(e) => setAddonFastag(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-800">🛣️ Expressway FASTag Included (+₹415)</span>
                  <p className="text-[10px] text-slate-500">All highway toll plaza passes included in booking</p>
                </div>
              </label>
              */}

              <label className="flex items-start gap-2.5 cursor-pointer sm:col-span-2">
                <input
                  type="checkbox"
                  checked={addonPet}
                  onChange={(e) => setAddonPet(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-800">🐾 Pet Friendly Cab</span>
                  <p className="text-[10px] text-slate-500">Cabin seat protector &amp; pet travel package</p>
                  {addonPet && (
                    <div className="flex items-center gap-2 mt-1">
                      <select
                        value={petType}
                        onChange={(e) => setPetType(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white font-medium"
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                      </select>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={petCount}
                        onChange={(e) => setPetCount(e.target.value)}
                        className="w-16 text-xs border border-slate-200 rounded-lg px-2 py-1"
                        placeholder="Count"
                      />
                      <input
                        type="number"
                        min="0"
                        value={petCharge}
                        onChange={(e) => setPetCharge(e.target.value)}
                        className="w-24 text-xs border border-slate-200 rounded-lg px-2 py-1 font-mono"
                        placeholder="Fee (₹)"
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Pricing & Advance Payment */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-500" /> Pricing &amp; Payment Settlement
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Total Ride Fare (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={totalFare}
                onChange={(e) => setTotalFare(e.target.value)}
                className="w-full text-sm font-mono font-bold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Advance Amount Paid (₹)</label>
              <input
                type="number"
                min="0"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                className="w-full text-sm font-mono font-bold text-emerald-700 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Balance Due at Drop</label>
              <div className="w-full text-sm font-mono font-black px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-amber-800">
                ₹{balanceDue.toLocaleString("en-IN")}.00
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ADVANCE_PAID">ADVANCE_PAID (Advance Received)</option>
                <option value="PAID">PAID (Fully Prepaid)</option>
                <option value="PENDING">PENDING (Cash on Drop)</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW (UPI Proof Uploaded)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="CASH">Cash / Spot Payment</option>
                <option value="BANK_TRANSFER">NEFT / Bank Transfer</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="PAY_AT_DROP">Pay directly to Chauffeur</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">UTR / Transaction Ref</label>
              <input
                type="text"
                value={paymentUtrNumber}
                onChange={(e) => setPaymentUtrNumber(e.target.value)}
                placeholder="Bank UTR or Cash receipt"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Special Dispatch Notes</label>
            <textarea
              rows="2"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="e.g. VIP passenger, child safety seat requested, specific landmark note..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Section 5: Dispatch & Allocation Options (Commented out for now; defaults to Standard Queue Dispatch) */}
        {/*
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" /> Dispatch Mode &amp; Allocation
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setDispatchMode("QUEUE")}
              className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                dispatchMode === "QUEUE"
                  ? "bg-amber-50/70 border-amber-400 shadow-xs"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="dispatchMode"
                  checked={dispatchMode === "QUEUE"}
                  onChange={() => setDispatchMode("QUEUE")}
                  className="text-amber-500 focus:ring-amber-400"
                />
                <span className="font-bold text-xs text-slate-900">Standard Queue Dispatch</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-5">
                Places booking into <strong className="text-amber-700">Pending Allocation</strong> queue. Generates <strong>Scenario 1 Estimate PDF</strong> and sends to passenger WhatsApp.
              </p>
            </div>

            <div
              onClick={() => setDispatchMode("DIRECT")}
              className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                dispatchMode === "DIRECT"
                  ? "bg-purple-50/70 border-purple-400 shadow-xs"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="dispatchMode"
                  checked={dispatchMode === "DIRECT"}
                  onChange={() => setDispatchMode("DIRECT")}
                  className="text-purple-600 focus:ring-purple-400"
                />
                <span className="font-bold text-xs text-slate-900">Direct Allocation &amp; Confirm</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-5">
                Appoints available vehicle &amp; driver right now. Sets status to <strong className="text-purple-700">CONFIRMED</strong> and sends <strong>Scenario 2 Confirmed Voucher</strong> without OTP.
              </p>
            </div>
          </div>

          {dispatchMode === "DIRECT" && (
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-3 animate-in fade-in">
              <span className="text-[11px] font-bold text-purple-900 block">Appoint Vehicle &amp; Chauffeur:</span>
              
              {loadingFleet ? (
                <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> Loading available fleet...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Assigned Vehicle <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">-- Choose Available Vehicle --</option>
                      {availableVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.model} ({v.registrationNumber || v.vehicleNumber}) - {v.category || v.vehicleType}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Chauffeur</label>
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">-- Appoint Driver (or vendor will assign) --</option>
                      {availableDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        */}

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Automated WhatsApp notification will be dispatched to:{" "}
            <span className="font-mono font-bold text-slate-900">{passengerPhone || "—"}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="amber"
              size="sm"
              icon={submitting ? Loader2 : Send}
              disabled={submitting}
            >
              {submitting ? "Creating Reservation..." : "Create Booking & Dispatch"}
            </Button>
          </div>
        </div>

      </form>
    </Modal>
  );
}
