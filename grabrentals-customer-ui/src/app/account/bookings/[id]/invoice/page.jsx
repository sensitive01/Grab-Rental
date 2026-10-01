"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Download, CheckCircle2, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { customerApi } from "@/lib/customerApi";

export default function BookingInvoicePage({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams?.id || "";

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <p className="text-slate-600 font-bold text-sm">Generating your tax invoice...</p>
        </div>
      </main>
    );
  }

  const bRef = booking?.bookingReference || bookingId || "GR-INVOICE";
  const invNumber = `INV-${bRef.replace(/[^A-Za-z0-9]/g, "")}`;
  const totalFare = Number(booking?.totalFare || 4500);
  const advancePaid = Number(booking?.advancePaid || 0);
  const balanceDue = Number(booking?.dueAmount != null ? booking.dueAmount : Math.max(0, totalFare - advancePaid));

  const taxableSubtotal = Math.round(totalFare / 1.05);
  const totalGst = totalFare - taxableSubtotal;
  const cgst = (totalGst / 2).toFixed(2);
  const sgst = (totalGst / 2).toFixed(2);

  let pickupDateStr = "Scheduled Trip";
  if (booking?.pickupDateTime) {
    try {
      const dt = new Date(booking.pickupDateTime);
      if (!isNaN(dt.getTime())) {
        pickupDateStr = dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
      }
    } catch {
      // keep fallback
    }
  }

  const invoiceDateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Print Controls (Hidden on Print) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href={`/account/bookings/${bookingId}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Trip Details
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Invoice Paper Document */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm print:shadow-none print:border-none print:p-0 space-y-8">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  GRAB<span className="text-amber-500">RENTAL</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                  Tax Invoice
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Grab Rental Technologies Pvt. Ltd.</p>
              <p className="text-xs text-slate-500">#12, 100 Feet Road, Indiranagar, Bengaluru, KA - 560038</p>
              <p className="text-xs text-slate-500">GSTIN: <span className="font-mono font-bold text-slate-700">29AABCG7890F1Z2</span></p>
              <p className="text-xs text-slate-500">Email: billing@grabrental.in • Web: grabrental.in</p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tax Invoice</span>
              <h2 className="text-xl font-black font-mono text-slate-900">{invNumber}</h2>
              <div className="text-xs text-slate-600 pt-1 space-y-0.5">
                <p><span className="text-slate-400">Invoice Date:</span> {invoiceDateStr}</p>
                <p><span className="text-slate-400">Booking Ref:</span> <span className="font-mono font-bold">{bRef}</span></p>
                <p><span className="text-slate-400">Place of Supply:</span> Karnataka (29)</p>
              </div>
            </div>
          </div>

          {/* Bill To & Trip Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Billed To (Customer)</span>
              <h3 className="text-sm font-black text-slate-900">{booking?.passengerName || booking?.customerName || "Valued Passenger"}</h3>
              <p className="text-xs text-slate-600">{booking?.passengerPhone || booking?.customerPhone || "+91 Contact on File"}</p>
              <p className="text-xs text-slate-600">{booking?.customerEmail || "customer@grabrental.in"}</p>
              <p className="text-xs text-slate-500">{booking?.pickupAddress || "Verified Customer Address"}</p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Service Itinerary</span>
              <h4 className="text-sm font-extrabold text-slate-900">{booking?.pickupCity || "Origin"} ➔ {booking?.dropCity || "Destination"} ({(booking?.tripType || "ONE_WAY").replace(/_/g, " ")})</h4>
              <p className="text-xs text-slate-600">Vehicle: {booking?.vehicleModel || booking?.vehicleCategory || "AC Chauffeur Fleet"}</p>
              <p className="text-xs text-slate-600">Registration: <span className="font-mono font-bold">{booking?.vehicleNumber || "Verified Commercial Cab"}</span></p>
              <p className="text-xs text-slate-500">Departure: {pickupDateStr}</p>
            </div>
          </div>

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
                <tr>
                  <td className="py-3.5 px-2 font-bold text-slate-400">1</td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900">Intercity Chauffeur Passenger Car Rental Service</p>
                    <span className="text-[11px] text-slate-400">{booking?.pickupCity} to {booking?.dropCity} Commercial Transport</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">9966</td>
                  <td className="py-3.5 px-3 text-center">1 Trip</td>
                  <td className="py-3.5 px-3 text-right font-mono">₹{taxableSubtotal.toLocaleString()}.00</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">₹{taxableSubtotal.toLocaleString()}.00</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-2 font-bold text-slate-400">2</td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900">Chauffeur Day Allowance & Highway Duty</p>
                    <span className="text-[11px] text-slate-400">Verified commercial chauffeur service included</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">9966</td>
                  <td className="py-3.5 px-3 text-center">Included</td>
                  <td className="py-3.5 px-3 text-right font-mono">₹0.00</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">₹0.00</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-2 font-bold text-slate-400">3</td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900">Highway Express Tolls & State Passenger Tax</p>
                    <span className="text-[11px] text-slate-400">FASTag & Intercity permits</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">9966</td>
                  <td className="py-3.5 px-3 text-center">Included</td>
                  <td className="py-3.5 px-3 text-right font-mono">₹0.00</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700">₹0.00 (Incl)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Subtotals & Taxes Calculation */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t-2 border-slate-200">
            <div className="text-xs text-slate-500 space-y-1.5 max-w-sm">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Payment Summary & Method</p>
              <p>• Advance paid: ₹{advancePaid.toLocaleString()}.00 ({booking?.paymentStatus || "Advance Paid"})</p>
              {balanceDue > 0 ? (
                <p>• Balance payable: ₹{balanceDue.toLocaleString()}.00 directly to chauffeur via Cash or UPI upon destination arrival.</p>
              ) : (
                <p>• Fully paid online. Zero cash required during journey.</p>
              )}
              <p className="text-[10px] text-slate-400 pt-2">This is a computer-generated tax invoice and requires no physical signature under the IT Act.</p>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal (Taxable Value)</span>
                <span className="font-mono text-slate-900">₹{taxableSubtotal.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between">
                <span>CGST (2.5%)</span>
                <span className="font-mono text-slate-900">₹{cgst}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (2.5%)</span>
                <span className="font-mono text-slate-900">₹{sgst}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-base font-mono">₹{totalFare.toLocaleString()}.00</span>
              </div>

              <div className="flex justify-between text-xs text-emerald-700 font-bold pt-1">
                <span>Advance Paid Online</span>
                <span className="font-mono">- ₹{advancePaid.toLocaleString()}.00</span>
              </div>

              <div className="flex justify-between items-center text-xs font-black text-amber-700 pt-2 border-t border-dashed border-slate-300">
                <span>Balance to Driver</span>
                <span className="text-sm font-mono">₹{balanceDue.toLocaleString()}.00</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 text-center space-y-1">
            <p className="font-bold text-slate-600">Thank you for choosing Grab-Rental!</p>
            <p>For any billing inquiries, call our 24/7 helpline at +91 80 4710 9999 or email support@grabrental.in</p>
          </div>

        </div>

      </div>
    </main>
  );
}
