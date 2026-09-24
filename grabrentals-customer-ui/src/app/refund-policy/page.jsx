import Link from "next/link";
import { RotateCcw, CheckCircle2, AlertCircle, Clock, ShieldCheck, ArrowLeft, PhoneCall } from "lucide-react";

export const metadata = {
  title: "Cancellation & Refund Policy | Grab-Rental",
  description: "Transparent cancellation guidelines, refund timelines, advance deposit returns, and our zero-cancellation guarantee."
};

export default function RefundPolicyPage() {
  const lastUpdated = "September 20, 2026";

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Breadcrumb */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Risk-Free Cancellation Policy
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Cancellation & Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Effective Date: <span className="font-semibold text-slate-700">{lastUpdated}</span> • Transparent & Hassle-Free
          </p>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            We understand plans change. Grab-Rental provides one of the most customer-friendly cancellation policies in the intercity car rental industry, designed to protect both our travelers and our hard-working chauffeurs.
          </p>
        </div>

        {/* Policy Highlights Table */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-slate-900">
            Outstation & Intercity Cancellation Matrix
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-800 font-extrabold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-3">Cancellation Timing</th>
                  <th className="py-3 px-3">Refund Eligibility</th>
                  <th className="py-3 px-3">Cancellation Fee</th>
                  <th className="py-3 px-3">Chauffeur Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr className="bg-emerald-50/40">
                  <td className="py-4 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>&gt; 6 Hours Before Pickup</span>
                  </td>
                  <td className="py-4 px-3 font-black text-emerald-700">100% Full Refund</td>
                  <td className="py-4 px-3 font-bold text-slate-600">₹0 (Free)</td>
                  <td className="py-4 px-3 text-slate-500">Unallocated</td>
                </tr>
                <tr>
                  <td className="py-4 px-3 font-bold text-slate-900">
                    2 to 6 Hours Before Pickup
                  </td>
                  <td className="py-4 px-3 font-bold text-amber-700">50% Advance Refunded</td>
                  <td className="py-4 px-3 text-slate-600">50% of Advance Paid</td>
                  <td className="py-4 px-3 text-slate-500">Chauffeur Mobilized</td>
                </tr>
                <tr className="bg-rose-50/30">
                  <td className="py-4 px-3 font-bold text-slate-900">
                    &lt; 2 Hours / Passenger No-Show
                  </td>
                  <td className="py-4 px-3 font-bold text-rose-700">No Refund</td>
                  <td className="py-4 px-3 text-slate-600">Full Advance Deposit</td>
                  <td className="py-4 px-3 text-slate-500">Arrived at Pickup</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Grab-Rental Assurance Guarantee */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent rounded-3xl border border-emerald-200 p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h3 className="text-base font-black text-slate-900">Our Zero-Cancellation & Chauffeur Guarantee</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            If Grab-Rental ever cancels a confirmed booking due to vehicle breakdown or driver unavailability without providing a free upgraded alternative vehicle, you will receive an <strong className="text-slate-900">Immediate 100% Refund + a ₹500 Courtesy Travel Credit</strong> credited to your account.
          </p>
        </div>

        {/* Refund Processing Timeframe */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900">Refund Processing Timelines</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Once a cancellation is initiated, refunds are processed automatically back to the original payment source:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">UPI / Netbanking</span>
              <h4 className="text-sm font-extrabold text-slate-900">Within 24 Hours</h4>
              <p className="text-xs text-slate-500">Credited straight to your linked bank account or VPA.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Credit / Debit Cards</span>
              <h4 className="text-sm font-extrabold text-slate-900">3 to 5 Business Days</h4>
              <p className="text-xs text-slate-500">Depending upon your card issuing bank&apos;s settlement cycle.</p>
            </div>
          </div>
        </div>

        {/* How to Cancel */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900">How to Cancel a Booking</h3>
          <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
            <li>Log into your account and open <Link href="/dashboard" className="text-amber-700 underline font-bold">My Trips Dashboard</Link>.</li>
            <li>Locate your upcoming booking and click &ldquo;Cancel Trip&rdquo;.</li>
            <li>Alternatively, call our 24/7 helpline at <a href="tel:+918047109999" className="text-slate-900 font-bold underline">+91 80 4710 9999</a> or WhatsApp our support team for instant assistance.</li>
          </ol>
        </div>

      </div>
    </main>
  );
}
