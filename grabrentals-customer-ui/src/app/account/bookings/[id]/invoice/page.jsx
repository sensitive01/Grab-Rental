"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Car,
  User,
  Phone,
  MapPin,
  Calendar,
  Gauge,
  FileText
} from "lucide-react";
import { customerApi } from "@/lib/customerApi";

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
      emoji: "🗣️"
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
      emoji: "🧳"
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
      emoji: "✨"
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
      emoji: "🛣️"
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
      emoji: "🐾"
    });
  }

  return list;
}

export default function BookingInvoicePage({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams?.id || "";

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchBookingDetails() {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let data = null;
        try {
          const res = await customerApi.getBookingById(bookingId);
          if (res?.data) data = res.data;
        } catch {
          const pub = await customerApi.getPublicBooking(bookingId);
          if (pub?.data) data = pub.data;
        }

        if (!isCancelled && data) {
          setBooking(data);
          const initialScenario =
            data.status === "COMPLETED"
              ? 3
              : data.status === "CONFIRMED" || data.assignedVehicle || data.vehicleNumber
              ? 2
              : 1;
          setActiveScenario(initialScenario);
        }
      } catch (err) {
        console.warn("[Invoice] Error fetching booking for invoice:", err);
        if (!isCancelled) {
          setError("Could not load invoice data for this booking.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchBookingDetails();

    return () => {
      isCancelled = true;
    };
  }, [bookingId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-bold text-sm">Generating your booking document...</p>
        </div>
      </main>
    );
  }

  const scenario = activeScenario || 1;
  const isFinalScenario = scenario === 3;
  const bRef = booking?.bookingReference || bookingId || "GRB1025";
  const invNumber = booking?.invoiceNumber || `INV-${bRef.replace(/[^A-Za-z0-9]/g, "")}`;

  // Customer Addons
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

  // Initial Booked Package Fare vs Scenario Fare
  const initialBookedFare = (booking?.finalTotalFare && totalClosingExtrasWithGst > 0)
    ? Math.max(0, Number(booking.finalTotalFare) - totalClosingExtrasWithGst)
    : Number(booking?.totalFare || 4500);

  // Base Rental Line Item = initialBookedFare minus customerAddons
  const baseServiceFare = Math.max(0, initialBookedFare - addonsTotal);

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
      title: "Intercity Chauffeur Passenger Car Rental Service",
      subtitle: `${booking?.pickupCity || "Origin"} to ${booking?.dropCity || "Destination"} Commercial Transport`,
      sac: "9966",
      qty: "1 Trip",
      rate: baseServiceFare,
      amount: baseServiceFare,
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

  let pickupDateStr = "Scheduled Trip";
  if (booking?.pickupDateTime) {
    try {
      const dt = new Date(booking.pickupDateTime);
      if (!isNaN(dt.getTime())) {
        pickupDateStr = dt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch {
      // keep fallback
    }
  }

  const invoiceDateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Controls (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <Link
            href={`/account/bookings/${bookingId}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Trip Details
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {/* 3-Scenario Switcher */}
            <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setActiveScenario(1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  scenario === 1
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1. Estimate
              </button>
              <button
                onClick={() => setActiveScenario(2)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  scenario === 2
                    ? "bg-purple-600 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                2. Confirmed
              </button>
              <button
                onClick={() => setActiveScenario(3)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  scenario === 3
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                3. Tax Invoice
              </button>
            </div>

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/public/bookings/${bookingId}/document.pdf?scenario=${scenario}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Download Original PDF</span>
            </a>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Paper Document */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm print:shadow-none print:border-none print:p-0 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  GRAB<span className="text-amber-500">RENTAL</span>
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    scenario === 1
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : scenario === 2
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {scenario === 1
                    ? "Provisional Estimate & Quotation"
                    : scenario === 2
                    ? "Booking Confirmation & Duty Slip"
                    : "Official Tax Invoice (SAC: 9966)"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Grab Rental Technologies Pvt. Ltd.</p>
              <p className="text-xs text-slate-500">Bangalore, Karnataka</p>
              <p className="text-xs text-slate-500">GSTIN: <span className="font-mono font-bold text-slate-700">29AABCG7890F1Z2</span></p>
              <p className="text-xs text-slate-500">Email: grabrentals2016@gmail.com • Web: grabrentals.in</p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {scenario === 1 ? "Estimate No." : scenario === 2 ? "Confirmation No." : "Tax Invoice No."}
              </span>
              <h2 className="text-xl font-black font-mono text-slate-900">{invNumber}</h2>
              <div className="text-xs text-slate-600 pt-1 space-y-0.5">
                <p><span className="text-slate-400">Date:</span> {invoiceDateStr}</p>
                <p><span className="text-slate-400">Booking Ref:</span> <span className="font-mono font-bold">{bRef}</span></p>
                <p><span className="text-slate-400">Place of Supply:</span> Karnataka (29)</p>
              </div>
            </div>
          </div>

          {/* Bill To & Trip Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Billed To (Passenger)</span>
              <h3 className="text-sm font-black text-slate-900">{booking?.passengerName || booking?.customerName || "Valued Passenger"}</h3>
              <p className="text-xs text-slate-600">{booking?.passengerPhone || booking?.customerPhone || "+91 Contact on File"}</p>
              <p className="text-xs text-slate-600">{booking?.customerEmail || "customer@grabrental.in"}</p>
              <p className="text-xs text-slate-500">{booking?.pickupAddress || "Verified Customer Address"}</p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {scenario === 1 ? "Requested Itinerary & Fleet" : "Confirmed Fleet & Chauffeur"}
              </span>
              <h4 className="text-sm font-extrabold text-slate-900">
                {booking?.pickupCity || "Origin"} ➔ {booking?.dropCity || "Destination"} ({(booking?.tripType || "ONE_WAY").replace(/_/g, " ")})
              </h4>

              {scenario === 1 ? (
                <>
                  <p className="text-xs text-slate-600">
                    Category: <span className="font-semibold">{booking?.vehicleCategory || booking?.vehicleModel || "AC Chauffeur Fleet"}</span>
                  </p>
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                    Fleet &amp; chauffeur allocation will be finalized upon booking confirmation.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-600">
                    Vehicle: <span className="font-semibold">{booking?.vehicleModel || "AC Commercial Cab"}</span> (
                    <span className="font-mono font-bold text-slate-900">{booking?.vehicleNumber || "Assigned Commercial Cab"}</span>)
                  </p>
                  <p className="text-xs text-slate-600">
                    Chauffeur: <span className="font-bold">{booking?.driverName || "Assigned Commercial Chauffeur"}</span> ({booking?.driverPhone || "+91 Contact on File"})
                  </p>
                </>
              )}

              <p className="text-xs text-slate-500">Departure: {pickupDateStr}</p>
              {booking?.isPetFriendly && (
                <p className="text-xs text-amber-800 font-bold pt-1">
                  🐾 Pet Friendly Cab ({booking?.petType || "Pet"} × {booking?.petCount || 1})
                </p>
              )}
            </div>
          </div>

          {/* Scenario 3 Odometer Telemetry */}
          {scenario === 3 && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-amber-400" />
                  Trip Distance &amp; Odometer Audit
                </span>
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

          {/* Itemized Fare Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-2">#</th>
                  <th className="py-3 px-3">Service Description</th>
                  <th className="py-3 px-3">SAC Code</th>
                  <th className="py-3 px-3 text-center">Package / Qty</th>
                  <th className="py-3 px-3 text-right">Rate</th>
                  <th className="py-3 px-3 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {invoiceRows.map((row, idx) => (
                  <tr key={row.id || idx}>
                    <td className="py-3.5 px-2 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{row.title}</p>
                      <span className="text-[11px] text-slate-400">{row.subtitle}</span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500">{row.sac}</td>
                    <td className="py-3.5 px-3 text-center">{row.qty}</td>
                    <td className="py-3.5 px-3 text-right font-mono">₹{row.rate.toLocaleString("en-IN")}.00</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">₹{row.amount.toLocaleString("en-IN")}.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotals & Taxes Calculation */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t-2 border-slate-200">
            <div className="text-xs text-slate-500 space-y-1.5 max-w-sm">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Payment Summary &amp; Method</p>
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
                <p>• Balance payable: ₹{balanceDue.toLocaleString("en-IN")}.00 directly to chauffeur via Cash or UPI upon destination arrival.</p>
              ) : (
                <p className="text-emerald-700 font-medium">✓ Fully paid online. Zero cash required during journey.</p>
              )}
              <p className="text-[11px] text-emerald-700 font-medium pt-1">
                ✓ Total fare is all-inclusive of applicable GST, vehicle rental, fuel, chauffeur trip allowance, and highway tolls.
              </p>
              <p className="text-[10px] text-slate-400 pt-1">This is a computer-generated document and requires no physical signature under the IT Act.</p>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Total Ride Fare</span>
                <span className="font-mono text-slate-900">₹{displayedTotalFare.toLocaleString("en-IN")}.00</span>
              </div>
              <div className="text-[10px] text-slate-400 -mt-1 pb-1">
                (Inclusive of GST, Driver Batta &amp; Tolls)
              </div>

              <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-base font-mono">₹{displayedTotalFare.toLocaleString("en-IN")}.00</span>
              </div>

              <div className="flex justify-between text-xs text-emerald-700 font-bold pt-1">
                <span>Advance Paid Online</span>
                <span className="font-mono">- ₹{advancePaid.toLocaleString("en-IN")}.00</span>
              </div>

              {isFinalScenario && paidAtDrop > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-bold pt-1">
                  <span>Paid to Driver at Drop</span>
                  <span className="font-mono">- ₹{paidAtDrop.toLocaleString("en-IN")}.00</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs font-black text-amber-700 pt-2 border-t border-dashed border-slate-300">
                <span>{isFinalScenario ? "Final Settled Balance" : "Balance to Driver"}</span>
                <span className={`text-sm font-mono ${isFinalScenario ? "text-emerald-700" : "text-amber-700"}`}>
                  {isFinalScenario ? "₹0.00 (Fully Settled)" : `₹${balanceDue.toLocaleString("en-IN")}.00`}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 text-center space-y-1">
            <p className="font-bold text-slate-600">Thank you for choosing Grab-Rental!</p>
            <p>For any billing inquiries, call our 24/7 helpline at +91 9071 100 200 or email grabrentals2016@gmail.com</p>
          </div>

        </div>

      </div>
    </main>
  );
}
