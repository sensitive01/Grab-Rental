"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2, 
  FileText, 
  Car, 
  MapPin, 
  Phone, 
  Share2 
} from "lucide-react";
import { vendorApi } from "@/lib/vendorApi";
import { formatINR } from "@/lib/utils";
import NumberPlate from "@/components/ui/NumberPlate";

export default function TripInvoicePage({ params }) {
  const unwrappedParams = use(params);
  const tripId = unwrappedParams?.id;

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tripId) return;

    async function loadTripInvoice() {
      try {
        setLoading(true);
        const data = await vendorApi.getBookingById(tripId);
        if (data) {
          setTrip(data);
        } else {
          setError("Trip record not found for invoice generation.");
        }
      } catch (err) {
        console.error("Failed to load invoice details:", err);
        setError("Unable to load invoice record from the server.");
      } finally {
        setLoading(false);
      }
    }

    loadTripInvoice();
  }, [tripId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
        <p className="text-xs text-slate-500 font-medium">Preparing certified trip tax invoice...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Invoice Unavailable</h2>
        <p className="text-xs text-slate-500">{error || "No trip record found for identifier"}</p>
        <Link
          href="/vendor/trips"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Trips Hub
        </Link>
      </div>
    );
  }

  const bRef = trip.bookingReference || trip.id || "GR-TRIP";
  const invNumber = trip.invoiceNumber || `INV-${bRef.replace(/[^A-Za-z0-9]/g, "")}`;
  const invoiceDateStr = trip.tripCompletedAt 
    ? new Date(trip.tripCompletedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  // Numbers
  const baseFare = Number(trip.estimatedAmount || trip.totalFare || 0);
  const extraKm = Number(trip.extraKm || 0);
  const extraKmRate = Number(trip.extraKmRate || 14);
  const extraKmCost = Number(trip.extraKmCharge || (extraKm * extraKmRate));

  const toll = Number(trip.tollCharges || 0);
  const permit = Number(trip.permitCharges || 0);
  const parking = Number(trip.parkingCharges || 0);
  const allowance = Number(trip.driverAllowanceCharges || 0);
  const other = Number(trip.otherCharges || 0);

  const totalExtras = extraKmCost + toll + permit + parking + allowance + other;
  const grandTotal = Number(trip.finalTotalFare || trip.totalFare || (baseFare + totalExtras));
  const advancePaid = Number(trip.advancePaid || 0);
  const balanceDue = Number(trip.dueAmount != null ? trip.dueAmount : Math.max(0, grandTotal - advancePaid));

  const taxableAmount = Math.round(grandTotal / 1.05);
  const gstAmount = grandTotal - taxableAmount;
  const cgst = (gstAmount / 2).toFixed(2);
  const sgst = (gstAmount / 2).toFixed(2);

  return (
    <div className="space-y-6 max-w-4xl mx-auto print:max-w-none print:m-0 print:p-0">
      
      {/* Top Action Bar (Hidden during printing) */}
      <div className="flex items-center justify-between print:hidden gap-3">
        <Link
          href="/vendor/trips"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Trips Hub
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md transition-all"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Tax Invoice Document Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm print:shadow-none print:border-none p-6 sm:p-10 space-y-8 text-slate-800">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-black tracking-tight text-slate-950 font-sans">
                GRAB RENTALS
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 text-[10px] font-black tracking-widest border border-amber-500/20">
                TAX INVOICE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Official Tax Invoice &amp; Journey Receipt
            </p>
            <p className="text-[11px] text-slate-400">
              Fleet Partner: <strong>{trip.vendorBusinessName || "Authorized Chauffeur Fleet"}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs">
            <div className="text-sm font-black font-mono text-slate-950">
              {invNumber}
            </div>
            <div className="text-slate-500">
              Booking Ref: <strong className="text-slate-900">#{bRef}</strong>
            </div>
            <div className="text-slate-500">
              Date: <strong className="text-slate-900">{invoiceDateStr}</strong>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Trip Completed
            </div>
          </div>
        </div>

        {/* Customer & Chauffeur / Vehicle Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-6 border-b border-slate-200">
          
          {/* Customer Particulars */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Billed To (Passenger)
            </span>
            <p className="font-black text-sm text-slate-900">{trip.customer?.name || "Passenger"}</p>
            <p className="text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-400" />
              {trip.customer?.phone || "N/A"}
            </p>
            {trip.customer?.email && (
              <p className="text-slate-600">{trip.customer.email}</p>
            )}
          </div>

          {/* Chauffeur & Vehicle */}
          <div className="space-y-1.5 sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Assigned Vehicle &amp; Chauffeur
            </span>
            <div className="flex sm:justify-end">
              <NumberPlate number={trip.vehicleNumber || "Assigned Vehicle"} />
            </div>
            <p className="font-bold text-slate-900">{trip.vehicleType || "Sedan / SUV Fleet"}</p>
            <p className="text-slate-600">
              Commercial Chauffeur: <strong>{trip.driverName || "Assigned Driver"}</strong> ({trip.driverPhone || "N/A"})
            </p>
          </div>

        </div>

        {/* Journey Details & Odometer Block */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 text-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Location</span>
              <p className="font-bold text-slate-900">{trip.pickup}</p>
              <span className="text-[11px] text-slate-500">{trip.pickupDate}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination</span>
              <p className="font-bold text-slate-900">{trip.drop}</p>
              <span className="text-[11px] text-slate-500">{trip.tripType}</span>
            </div>
          </div>

          {/* Odometer metrics if entered */}
          {(trip.startKm != null || trip.endKm != null || extraKm > 0 || trip.customerRouteKm > 0) && (
            <div className={`pt-3 border-t border-slate-200/80 grid grid-cols-2 ${trip.customerRouteKm > 0 ? "sm:grid-cols-5" : "sm:grid-cols-4"} gap-2 text-center text-[11px]`}>
              {trip.customerRouteKm > 0 && (
                <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-200">
                  <span className="text-blue-700 text-[10px] uppercase font-black block">Customer Route</span>
                  <strong className="text-blue-900">{trip.customerRouteKm} KM</strong>
                </div>
              )}
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Start Odometer</span>
                <strong className="text-slate-900">{trip.startKm != null ? `${trip.startKm} KM` : "Recorded"}</strong>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">End Odometer</span>
                <strong className="text-slate-900">{trip.endKm != null ? `${trip.endKm} KM` : "Recorded"}</strong>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Package Included</span>
                <strong className="text-slate-900">{trip.packageKm || trip.distanceKm || 250} KM</strong>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-amber-800 text-[10px] uppercase font-bold block">Extra Distance</span>
                <strong className="text-amber-900">{extraKm} KM (@ ₹{extraKmRate}/km)</strong>
              </div>
            </div>
          )}
        </div>

        {/* Itemized Charges Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 text-[11px] font-black uppercase tracking-wider">
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-center">Qty / Details</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr>
                <td className="py-3 px-3 font-bold text-slate-900">
                  Base Package Fare ({trip.distanceKm || 250} KM Included)
                  <p className="text-[10px] text-slate-400 font-normal">Standard tariff including vehicle &amp; fuel charges</p>
                </td>
                <td className="py-3 px-3 text-center">1 Trip</td>
                <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(baseFare)}</td>
              </tr>

              {trip.addons && trip.addons.length > 0 && trip.addons.map((a) => (
                <tr key={a.id} className="bg-blue-50/20">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {a.emoji || "✨"} {a.name}
                    <p className="text-[10px] text-slate-400 font-normal">{a.desc}</p>
                  </td>
                  <td className="py-3 px-3 text-center">Included</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(a.price)}</td>
                </tr>
              ))}

              {extraKm > 0 && (
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    Extra Distance Traveled
                    <p className="text-[10px] text-slate-400 font-normal">{extraKm} KM @ ₹{extraKmRate}/km post limit</p>
                  </td>
                  <td className="py-3 px-3 text-center">{extraKm} KM</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(extraKmCost)}</td>
                </tr>
              )}

              {toll > 0 && (
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    Highway Toll Charges (FASTag)
                    <p className="text-[10px] text-slate-400 font-normal">National / State Highway toll plaza charges</p>
                  </td>
                  <td className="py-3 px-3 text-center">Actuals</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(toll)}</td>
                </tr>
              )}

              {permit > 0 && (
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    Interstate Permit / State Tax
                    <p className="text-[10px] text-slate-400 font-normal">State entry border road tax</p>
                  </td>
                  <td className="py-3 px-3 text-center">Actuals</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(permit)}</td>
                </tr>
              )}

              {parking > 0 && (
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    Parking Charges
                    <p className="text-[10px] text-slate-400 font-normal">Airport / Destination commercial parking fees</p>
                  </td>
                  <td className="py-3 px-3 text-center">Actuals</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(parking)}</td>
                </tr>
              )}

              {allowance > 0 && (
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    Driver Allowance
                    <p className="text-[10px] text-slate-400 font-normal">Chauffeur outstation / night driving allowance</p>
                  </td>
                  <td className="py-3 px-3 text-center">1 Unit</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(allowance)}</td>
                </tr>
              )}

              {other > 0 && (
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    Other Incidental Expenses
                    <p className="text-[10px] text-slate-400 font-normal">{trip.otherChargesNotes || "Miscellaneous expenses incurred"}</p>
                  </td>
                  <td className="py-3 px-3 text-center">1 Unit</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(other)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & Tax Breakdown */}
        <div className="pt-4 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-start gap-6 text-xs">
          
          <div className="space-y-2 max-w-sm">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
              Tax Particulars (SAC Code: 996601)
            </span>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Taxable Value:</span>
                <span>{formatINR(taxableAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST (2.5%):</span>
                <span>₹{cgst}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (2.5%):</span>
                <span>₹{sgst}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              Passenger transport services by road under GST rules.
            </p>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Subtotal (Taxes Inc):</span>
              <span className="font-bold text-slate-900">{formatINR(grandTotal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
              <span>Less: Prepaid Advance:</span>
              <span className="font-semibold">-{formatINR(advancePaid)}</span>
            </div>
            <div className="pt-2 flex justify-between items-center text-sm font-black text-slate-950">
              <span>Grand Total Fare:</span>
              <span className="text-base text-slate-950">{formatINR(grandTotal)}</span>
            </div>

            {/* Final Cash / Balance Due */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex justify-between items-center mt-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                  Balance Paid / Collected
                </span>
                <span className="text-base font-black text-emerald-900">
                  {formatINR(balanceDue)}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800 text-[10px] font-extrabold">
                {balanceDue === 0 ? "PAID IN FULL" : "COLLECTED"}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Notice */}
        <div className="pt-6 border-t border-slate-200 text-center space-y-1">
          <p className="text-[11px] text-slate-500 font-medium">
            Thank you for choosing Grab Rentals Fleet Services. For assistance, email support@grabrentals.com
          </p>
          <p className="text-[10px] text-slate-400">
            This is a computer-generated tax invoice and requires no physical signature under the Information Technology Act.
          </p>
        </div>

      </div>

    </div>
  );
}
