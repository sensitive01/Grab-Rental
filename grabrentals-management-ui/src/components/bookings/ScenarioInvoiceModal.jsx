"use client";

import { useState } from "react";
import {
  Printer,
  Download,
  Send,
  CheckCircle2,
  Car,
  User as UserIcon,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { operationsApi } from "@/lib/operationsApi";

function extractBookingAddons(booking) {
  if (!booking) return [];
  if (Array.isArray(booking.addons) && booking.addons.length > 0) {
    return booking.addons;
  }
  const list = [];
  const spec = `${booking.specialInstructions || ""} ${booking.notes || ""}`;

  // 1. Language Chauffeur
  if (/language chauffeur|language/i.test(spec)) {
    const m = spec.match(/Language Chauffeur\s*\(([^)]+)\)(?:\s*\([?₹](\d+)\))?/i);
    let lang = "English";
    let fee = 199;
    if (m) {
      if (m[1]) lang = m[1].trim();
      if (m[2]) fee = Number(m[2]);
    }
    list.push({
      id: "language_chauffeur",
      name: `Language Chauffeur (${lang})`,
      description: `Dedicated ${lang}-fluent professional chauffeur`,
      sacCode: "9966",
      packageQty: "1 Duty",
      price: fee,
      emoji: "🗣️",
    });
  }

  // 2. Luggage / Rooftop Carrier
  if (/luggage carrier|roof top carrier|carrier added/i.test(spec)) {
    const m = spec.match(/Luggage Carrier Added\s*\([?₹](\d+)\)/i);
    let fee = 249;
    if (m && m[1]) fee = Number(m[1]);
    list.push({
      id: "luggage_carrier",
      name: "Luggage / Roof Top Carrier",
      description: "Secure rooftop luggage rack & weatherproof tarpaulin",
      sacCode: "9966",
      packageQty: "1 Vehicle",
      price: fee,
      emoji: "🧳",
    });
  }

  // 3. Guaranteed Car < 3 Years
  if (/car < 3 years|vehicle < 3 years|new car guarantee/i.test(spec)) {
    const m = spec.match(/Car < 3 Years\s*\([?₹](\d+)\)/i);
    let fee = 299;
    if (m && m[1]) fee = Number(m[1]);
    list.push({
      id: "new_car_guarantee",
      name: "Guaranteed Car < 3 Years Old",
      description: "Pristine, late-model vehicle (model year 2023 or newer)",
      sacCode: "9966",
      packageQty: "1 Vehicle",
      price: fee,
      emoji: "✨",
    });
  }

  // 4. Expressway FASTag Pass
  if (/fastag pass|expressway fastag/i.test(spec)) {
    const m = spec.match(/Expressway FASTag Pass\s*\([?₹](\d+)\)/i);
    let fee = 415;
    if (m && m[1]) fee = Number(m[1]);
    list.push({
      id: "fastag_pass",
      name: "Expressway FASTag Included",
      description: "Prepaid electronic highway toll plaza pass",
      sacCode: "9966",
      packageQty: "Unlimited",
      price: fee,
      emoji: "🛣️",
    });
  }

  // 5. Pet Friendly Accommodation
  const isPet = Boolean(booking.isPetFriendly) || /pet friendly cab|pet fee/i.test(spec);
  if (isPet) {
    const pType = booking.petType || "Pet";
    const pCount = booking.petCount || 1;
    const pCharge = Number(booking.petCharge || 0);
    list.push({
      id: "pet_friendly",
      name: `Pet Friendly Accommodation (${pType} × ${pCount})`,
      description: "Cabin seat protector & pet sanitization package",
      sacCode: "9966",
      packageQty: "1 Surcharge",
      price: pCharge,
      emoji: "🐾",
    });
  }

  return list;
}

export function ScenarioInvoiceModal({ isOpen, onClose, booking, onToast }) {
  const [activeScenario, setActiveScenario] = useState(
    booking?.status === "COMPLETED" ? 3 : booking?.status === "CONFIRMED" || booking?.assignedVehicle ? 2 : 1
  );
  const [sendingScenario, setSendingScenario] = useState(false);

  if (!isOpen || !booking) return null;

  const bRef = booking?.bookingReference || booking?.id || "GRB1025";
  const invNumber = booking?.invoiceNumber || `INV-${String(bRef).replace(/[^A-Za-z0-9]/g, "")}`;
  const customerName = booking?.passengerName || booking?.customerName || "Valued Passenger";
  const customerPhone = booking?.passengerPhone || booking?.customerPhone || "+91 Contact on File";
  const pickupCity = booking?.pickupCity || "Origin";
  const dropCity = booking?.dropCity || "Destination";
  const tripType = (booking?.tripType || "ONE_WAY").replace(/_/g, " ");

  const isFinalScenario = activeScenario === 3;
  const customerAddons = extractBookingAddons(booking);
  const addonsTotal = customerAddons.reduce((sum, a) => sum + Number(a.price || 0), 0);

  // Trip Closing Extras
  const extraKm = Number(booking?.extraKm || 0);
  const extraKmRate = Number(booking?.extraKmRate || 14);
  const extraKmCharge = Number(booking?.extraKmCharge || (extraKm * extraKmRate));
  const tollCharges = Number(booking?.tollCharges || 0);
  const parkingCharges = Number(booking?.parkingCharges || 0);
  const driverAllowanceCharges = Number(booking?.driverAllowanceCharges || 0);
  const otherCharges = Number(booking?.otherCharges || 0);
  const tripClosingExtrasSubtotal = extraKmCharge + tollCharges + parkingCharges + driverAllowanceCharges + otherCharges;
  const extrasGst = tripClosingExtrasSubtotal > 0 ? Math.round(tripClosingExtrasSubtotal * 0.05) : 0;
  const totalClosingExtrasWithGst = tripClosingExtrasSubtotal + extrasGst;

  // Initial Booked Fare vs Scenario Fare
  const initialBookedFare = (booking?.finalTotalFare && totalClosingExtrasWithGst > 0)
    ? Math.max(0, Number(booking.finalTotalFare) - totalClosingExtrasWithGst)
    : Number(booking?.totalFare || 4500);

  // Base Rental Line Item = initialBookedFare minus customerAddons
  const baseFare = Math.max(0, initialBookedFare - addonsTotal);

  // Displayed Total Fare
  const displayedTotalFare = isFinalScenario && booking?.finalTotalFare
    ? Number(booking.finalTotalFare)
    : initialBookedFare;

  const advancePaid = Number(booking?.advancePaid || 0);
  const paidAtDrop = isFinalScenario ? Math.max(0, displayedTotalFare - advancePaid) : 0;
  const balanceDue = isFinalScenario ? 0 : Math.max(0, displayedTotalFare - advancePaid);

  const invoiceRows = [
    {
      id: "base_rental",
      title: `${tripType} Chauffeur Passenger Rental (${pickupCity} ➔ ${dropCity})`,
      subtitle: activeScenario === 1 ? "Estimated standard itinerary package" : "All-inclusive passenger rental duty",
      sac: "9966",
      qty: "1 Trip",
      rate: baseFare,
      amount: baseFare,
    },
    ...customerAddons.map((a) => ({
      id: a.id,
      title: `${a.emoji || "✨"} ${a.name}`,
      subtitle: a.description,
      sac: a.sacCode || "9966",
      qty: a.packageQty || "1 Unit",
      rate: Number(a.price || 0),
      amount: Number(a.price || 0),
    })),
  ];

  if (isFinalScenario) {
    if (extraKmCharge > 0) {
      invoiceRows.push({
        id: "extra_km",
        title: "Extra Distance Traveled Beyond Package",
        subtitle: `${extraKm} KM @ ₹${extraKmRate}/km post package limit`,
        sac: "9966",
        qty: `${extraKm} KM`,
        rate: extraKmCharge,
        amount: extraKmCharge,
      });
    }
    if (tollCharges > 0) {
      invoiceRows.push({
        id: "toll_charges",
        title: "Highway Express Tolls & FASTag Receipts",
        subtitle: "Electronic toll plaza charges on route",
        sac: "9966",
        qty: "Actuals",
        rate: tollCharges,
        amount: tollCharges,
      });
    }
    if (parkingCharges > 0) {
      invoiceRows.push({
        id: "parking_charges",
        title: "Airport & Station Parking Charges",
        subtitle: "Verified parking receipts",
        sac: "9966",
        qty: "Actuals",
        rate: parkingCharges,
        amount: parkingCharges,
      });
    }
    if (driverAllowanceCharges > 0) {
      invoiceRows.push({
        id: "driver_allowance",
        title: "Chauffeur Night / Extra Duty Allowance",
        subtitle: "Driver outstation / night duty batta",
        sac: "9966",
        qty: "Actuals",
        rate: driverAllowanceCharges,
        amount: driverAllowanceCharges,
      });
    }
    if (otherCharges > 0) {
      invoiceRows.push({
        id: "other_charges",
        title: "Other Verified Trip Expenses",
        subtitle: booking?.otherChargesNotes || "Incidental route expenses",
        sac: "9966",
        qty: "Actuals",
        rate: otherCharges,
        amount: otherCharges,
      });
    }
    if (extrasGst > 0) {
      invoiceRows.push({
        id: "extras_gst",
        title: "GST on Extra Trip Charges (5%)",
        subtitle: "Applicable road transport tax on additional extras",
        sac: "9966",
        qty: "5%",
        rate: extrasGst,
        amount: extrasGst,
      });
    }
  }

  let pickupDateFormatted = "Scheduled Pickup";
  if (booking?.pickupDateTime) {
    try {
      const dt = new Date(booking.pickupDateTime);
      if (!isNaN(dt.getTime())) {
        pickupDateFormatted = dt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch {
      // fallback
    }
  }

  const currentDateFormatted = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleSendWhatsApp = async (scenarioNum) => {
    if (sendingScenario) return;
    setSendingScenario(true);
    try {
      const res = await operationsApi.sendScenarioInvoice(
        booking.rawId || booking.id || bRef,
        scenarioNum,
        customerPhone
      );
      if (res?.error) {
        onToast?.({
          type: "error",
          message: res.error.message || `Failed to dispatch Scenario ${scenarioNum} invoice.`,
        });
      } else {
        const label =
          scenarioNum === 1
            ? "Scenario 1 (Booking Estimate)"
            : scenarioNum === 2
            ? "Scenario 2 (Confirmed)"
            : "Scenario 3 (Final Tax Invoice)";
        onToast?.({
          type: "success",
          message: `${label} dispatched to ${customerPhone} via WhatsApp!`,
        });
      }
    } catch (err) {
      onToast?.({
        type: "error",
        message: err?.message || "Failed to dispatch WhatsApp message.",
      });
    } finally {
      setSendingScenario(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Multi-Scenario Invoice &amp; Voucher Center
              </h3>
              <p className="text-xs text-slate-500">
                Booking: <span className="font-mono font-bold text-slate-700">{bRef}</span> • Customer: {customerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/public/bookings/${booking.rawId || booking.id || bRef}/document.pdf?scenario=${activeScenario}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Download PDF</span>
            </a>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scenario Selection Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveScenario(1)}
            className={`flex-1 min-w-[200px] flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeScenario === 1
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <div className="flex items-center gap-2 text-left">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black">
                1
              </span>
              <div>
                <p className="font-bold">Scenario 1: Estimate Bill</p>
                <p className="text-[10px] text-slate-400 font-normal">When Booking Created</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              Provisional
            </span>
          </button>

          <button
            onClick={() => setActiveScenario(2)}
            className={`flex-1 min-w-[200px] flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeScenario === 2
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <div className="flex items-center gap-2 text-left">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-black">
                2
              </span>
              <div>
                <p className="font-bold">Scenario 2: Confirmed</p>
                <p className="text-[10px] text-slate-400 font-normal">When Confirmed (No OTP)</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
              Confirmed
            </span>
          </button>

          <button
            onClick={() => setActiveScenario(3)}
            className={`flex-1 min-w-[200px] flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeScenario === 3
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <div className="flex items-center gap-2 text-left">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">
                3
              </span>
              <div>
                <p className="font-bold">Scenario 3: Tax Invoice</p>
                <p className="text-[10px] text-slate-400 font-normal">When Trip Completed</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              Final Tax
            </span>
          </button>
        </div>

        {/* Document Body Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-50/50">
          
          {/* Main Paper Document Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b-2 border-slate-900">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-slate-900">
                    GRAB<span className="text-amber-500">RENTAL</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      activeScenario === 1
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : activeScenario === 2
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {activeScenario === 1
                      ? "Provisional Estimate & Quotation"
                      : activeScenario === 2
                      ? "Booking Confirmation & Duty Slip"
                      : "Official Tax Invoice (SAC 9966)"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Grab Rental Technologies Pvt. Ltd.</p>
                <p className="text-xs text-slate-500">GSTIN: <span className="font-mono font-bold text-slate-700">29AABCG7890F1Z2</span> • Place of Supply: Karnataka (29)</p>
                <p className="text-xs text-slate-500">Support: +91 9071 100 200 • grabrentals2016@gmail.com</p>
              </div>

              <div className="sm:text-right space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {activeScenario === 1 ? "Estimate No." : activeScenario === 2 ? "Confirmation No." : "Tax Invoice No."}
                </span>
                <h2 className="text-xl font-black font-mono text-slate-900">{invNumber}</h2>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p><span className="text-slate-400">Date:</span> {currentDateFormatted}</p>
                  <p><span className="text-slate-400">Booking Ref:</span> <span className="font-mono font-bold">{bRef}</span></p>
                  <p><span className="text-slate-400">Trip Type:</span> <span className="font-bold">{tripType}</span></p>
                </div>
              </div>
            </div>

            {/* Billed To & Fleet Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Customer Details</span>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  {customerName}
                </h4>
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {customerPhone}
                </p>
                <p className="text-xs text-slate-500 flex items-start gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{booking?.pickupAddress || `${pickupCity} Pickup`}</span>
                </p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {activeScenario === 1 ? "Requested Fleet Category" : "Assigned Fleet & Chauffeur"}
                </span>

                {activeScenario === 1 ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-blue-600" />
                      {booking?.vehicleModel || booking?.vehicleCategory || "AC Sedan"}
                    </p>
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                      ⏳ Fleet &amp; chauffeur allocation will be finalized upon booking confirmation.
                    </p>
                    <p className="text-xs text-slate-500">Departure: {pickupDateFormatted}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-slate-700" />
                      {booking?.vehicleModel || "Verified AC Commercial Cab"} (
                      <span className="font-mono font-bold text-amber-700">
                        {booking?.vehicleNumber || "Assigned Fleet"}
                      </span>
                      )
                    </p>
                    <p className="text-xs text-slate-700">
                      Chauffeur: <span className="font-bold">{booking?.driverName || "Commercial Chauffeur"}</span> ({booking?.driverPhone || "+91 Contact on File"})
                    </p>
                    <p className="text-xs text-slate-500">Reporting Time: {pickupDateFormatted}</p>
                    {activeScenario === 2 && (
                      <p className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-medium">
                        ✓ Chauffeur assigned and scheduled for reporting.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Scenario 3 Specific: Odometer Telemetry */}
            {activeScenario === 3 && (
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                  <span className="font-bold uppercase tracking-wider text-amber-400">Trip Telemetry &amp; Distance Audit</span>
                  <span className="text-slate-400">Closing Chauffeur: {booking?.driverName || "Assigned Chauffeur"}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Start Reading</span>
                    <span className="font-mono font-bold text-sm text-slate-100">{booking?.startKm || "—"} KM</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">End Reading</span>
                    <span className="font-mono font-bold text-sm text-slate-100">{booking?.endKm || "—"} KM</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Actual Distance</span>
                    <span className="font-mono font-bold text-sm text-amber-400">{booking?.actualKm || "—"} KM</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Extra Distance</span>
                    <span className="font-mono font-bold text-sm text-emerald-400">{booking?.extraKm ? `${booking.extraKm} KM` : "0 KM"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Fare Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-[11px] font-black text-slate-700 uppercase tracking-wider">
                    <th className="py-2.5 px-2">#</th>
                    <th className="py-2.5 px-3">Service Description</th>
                    <th className="py-2.5 px-3">SAC Code</th>
                    <th className="py-2.5 px-3 text-center">Package / Qty</th>
                    <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {invoiceRows.map((row, idx) => (
                    <tr key={row.id || idx}>
                      <td className="py-2.5 px-2 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-slate-900">{row.title}</p>
                        <span className="text-[11px] text-slate-400">{row.subtitle}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{row.sac}</td>
                      <td className="py-2.5 px-3 text-center">{row.qty}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{row.amount.toLocaleString("en-IN")}.00
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal & Settlements Calculation */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t-2 border-slate-200">
              <div className="text-xs text-slate-500 space-y-1.5 max-w-sm">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  {activeScenario === 1 ? "Estimated Settlement" : activeScenario === 2 ? "Payment Status" : "Final Settlement"}
                </p>
                <p>• Advance paid online: ₹{advancePaid.toLocaleString("en-IN")}.00 ({booking?.paymentStatus || "Advance Paid"})</p>
                {isFinalScenario ? (
                  <>
                    {paidAtDrop > 0 && (
                      <p className="text-slate-700 font-semibold">
                        • Collected by chauffeur at destination: ₹{paidAtDrop.toLocaleString("en-IN")}.00 ({booking?.paymentMethod || "Cash / UPI"})
                      </p>
                    )}
                    <p className="text-emerald-700 font-bold">
                      ✓ Trip completed and fully settled. Outstanding balance: ₹0.00
                    </p>
                  </>
                ) : balanceDue > 0 ? (
                  <p>
                    • Balance due: ₹{balanceDue.toLocaleString("en-IN")}.00 payable upon trip conclusion.
                  </p>
                ) : (
                  <p className="text-emerald-700 font-medium">✓ Fully paid online. Zero cash required during journey.</p>
                )}
                <p className="text-[11px] text-slate-500">
                  Fare includes applicable GST under SAC 9966, vehicle rental, fuel, and chauffeur duties.
                </p>
              </div>

              <div className="w-full sm:w-64 space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Gross Fare</span>
                  <span className="font-mono text-slate-900">₹{displayedTotalFare.toLocaleString("en-IN")}.00</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Advance Received</span>
                  <span className="font-mono">- ₹{advancePaid.toLocaleString("en-IN")}.00</span>
                </div>
                {isFinalScenario && paidAtDrop > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Paid to Driver at Drop</span>
                    <span className="font-mono">- ₹{paidAtDrop.toLocaleString("en-IN")}.00</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs font-black text-slate-900 pt-2 border-t border-slate-300">
                  <span>{isFinalScenario ? "Final Settled Balance" : "Driver Balance Due"}</span>
                  <span className={`text-base font-mono ${isFinalScenario ? "text-emerald-700" : "text-amber-600"}`}>
                    {isFinalScenario ? "₹0.00" : `₹${balanceDue.toLocaleString("en-IN")}.00`}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              <p className="font-bold text-slate-600">Grab Rental Technologies Pvt. Ltd. • Bengaluru, Karnataka</p>
              <p>Computer-generated document. Valid without physical signature under the Information Technology Act.</p>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Dispatching <span className="font-bold text-slate-700">Scenario {activeScenario}</span> to customer WhatsApp:{" "}
            <span className="font-mono font-bold text-slate-900">{customerPhone}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSendWhatsApp(activeScenario)}
              disabled={sendingScenario}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {sendingScenario ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>
                {sendingScenario
                  ? "Dispatching..."
                  : `Send Scenario ${activeScenario} via WhatsApp`}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

