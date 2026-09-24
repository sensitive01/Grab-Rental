"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Download, CheckCircle2, ShieldCheck } from "lucide-react";

export default function BookingInvoicePage({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams?.id || "GR-84920";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

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
              <h2 className="text-xl font-black font-mono text-slate-900">INV-2026-84920</h2>
              <div className="text-xs text-slate-600 pt-1 space-y-0.5">
                <p><span className="text-slate-400">Invoice Date:</span> 21 Sep 2026</p>
                <p><span className="text-slate-400">Booking Ref:</span> <span className="font-mono font-bold">{bookingId}</span></p>
                <p><span className="text-slate-400">Place of Supply:</span> Karnataka (29)</p>
              </div>
            </div>
          </div>

          {/* Bill To & Trip Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Billed To (Customer)</span>
              <h3 className="text-sm font-black text-slate-900">Anand Vardhan</h3>
              <p className="text-xs text-slate-600">+91 98765 43210</p>
              <p className="text-xs text-slate-600">anand.v@example.com</p>
              <p className="text-xs text-slate-500">Indiranagar, Bengaluru, Karnataka</p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Service Itinerary</span>
              <h4 className="text-sm font-extrabold text-slate-900">Bengaluru ➔ Mysuru (One-Way)</h4>
              <p className="text-xs text-slate-600">Vehicle: Toyota Innova Crysta (6+1 Seater)</p>
              <p className="text-xs text-slate-600">Registration: <span className="font-mono font-bold">KA 01 MJ 4521</span></p>
              <p className="text-xs text-slate-500">Pickup: 22 Sep 2026, 06:30 AM</p>
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
                    <p className="font-bold text-slate-900">Intercity Passenger Car Rental Service</p>
                    <span className="text-[11px] text-slate-400">One-way Outstation AC Cab (Bengaluru to Mysuru)</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">9966</td>
                  <td className="py-3.5 px-3 text-center">145 Km</td>
                  <td className="py-3.5 px-3 text-right font-mono">₹5,200.00</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">₹5,200.00</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-2 font-bold text-slate-400">2</td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900">Chauffeur Day Allowance & Batta</p>
                    <span className="text-[11px] text-slate-400">Highway certified driver service fee</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">9966</td>
                  <td className="py-3.5 px-3 text-center">1 Day</td>
                  <td className="py-3.5 px-3 text-right font-mono">₹450.00</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">₹450.00</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-2 font-bold text-slate-400">3</td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900">Highway Express Tolls & State Tax</p>
                    <span className="text-[11px] text-slate-400">Bangalore-Mysore Expressway FASTag</span>
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
              <p>• Advance paid: ₹1,190.00 via UPI (TXN ID: <span className="font-mono">UPI-99214732</span>)</p>
              <p>• Balance payable: ₹4,760.00 directly to chauffeur via Cash or UPI upon destination arrival.</p>
              <p className="text-[10px] text-slate-400 pt-2">This is a computer-generated tax invoice and requires no physical signature under the IT Act.</p>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal (Taxable Value)</span>
                <span className="font-mono text-slate-900">₹5,650.00</span>
              </div>
              <div className="flex justify-between">
                <span>CGST (2.5%)</span>
                <span className="font-mono text-slate-900">₹141.25</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (2.5%)</span>
                <span className="font-mono text-slate-900">₹141.25</span>
              </div>
              <div className="flex justify-between">
                <span>Round Off</span>
                <span className="font-mono text-slate-900">+ ₹17.50</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-base font-mono">₹5,950.00</span>
              </div>

              <div className="flex justify-between text-xs text-emerald-700 font-bold pt-1">
                <span>Advance Paid Online</span>
                <span className="font-mono">- ₹1,190.00</span>
              </div>

              <div className="flex justify-between items-center text-xs font-black text-amber-700 pt-2 border-t border-dashed border-slate-300">
                <span>Balance to Driver</span>
                <span className="text-sm font-mono">₹4,760.00</span>
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
