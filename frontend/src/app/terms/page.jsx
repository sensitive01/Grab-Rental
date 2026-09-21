import Link from "next/link";
import { FileText, ShieldAlert, Car, Scale, Clock, CheckCircle2, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Grab-Rental",
  description: "Terms and conditions governing vehicle reservations, intercity chauffeur services, cancellations, and user responsibilities with Grab-Rental."
};

export default function TermsOfServicePage() {
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
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-slate-900"></div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
            <Scale className="w-3.5 h-3.5" /> Chauffeur Driven Car Rental Agreement
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Last Revised: <span className="font-semibold text-slate-700">{lastUpdated}</span> • Version 2.4
          </p>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Please read these Terms of Service carefully before utilizing any booking services provided by Grab-Rental Technologies Pvt. Ltd. (&ldquo;Grab-Rental&rdquo;). By booking a vehicle or using our platform, you agree to be bound by these terms.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-10 text-slate-700 text-sm leading-relaxed">
          
          {/* 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Car className="w-5 h-5 text-amber-500 shrink-0" />
              <h2 className="text-lg font-black tracking-tight">1. Scope of Rental Services</h2>
            </div>
            <p>
              Grab-Rental provides premium intercity, local hourly, group transit (tempo travellers/buses), and airport transfer chauffeur-driven car rental services. Grab-Rental acts as a licensed technology mobility provider matching verified vehicle owners/fleet operators and certified commercial chauffeurs with registered passengers.
            </p>
          </section>

          {/* 2 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h2 className="text-lg font-black tracking-tight">2. Booking Confirmation & Chauffeur Allocation</h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <strong className="text-slate-900">Guaranteed Cab Commitment:</strong> Once an advance payment (or full payment) is received, your booking is confirmed and guaranteed.
              </li>
              <li>
                <strong className="text-slate-900">Chauffeur Information Dispatch:</strong> The driver&apos;s name, direct contact phone number, and vehicle registration number are shared 2 hours before the scheduled departure time via SMS, WhatsApp, and live in your <Link href="/dashboard" className="text-amber-700 underline font-bold">Dashboard</Link>.
              </li>
              <li>
                <strong className="text-slate-900">Ride Security OTP:</strong> Passengers must verify vehicle details and provide the 4-digit Ride OTP to the chauffeur prior to departure to commence the trip.
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-900">
              <Clock className="w-5 h-5 text-blue-600 shrink-0" />
              <h2 className="text-lg font-black tracking-tight">3. Fares, Tolls, Taxes & Payment Policy</h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <strong className="text-slate-900">All-Inclusive Quotations:</strong> All outstation packages explicitly detail base fares, scheduled kilometer caps, chauffeur batta/allowance, and applicable GST.
              </li>
              <li>
                <strong className="text-slate-900">Tolls and State Border Permits:</strong> On all standard all-inclusive packages, FASTag expressway tolls and state entry permits are included. Any unbudgeted parking charges levied at special monuments or private airports are payable directly by the passenger.
              </li>
              <li>
                <strong className="text-slate-900">Excess Distance / Time:</strong> Kilometers traveled beyond the contracted itinerary package will be billed at the standard per-kilometer overage rate displayed during booking.
              </li>
              <li>
                <strong className="text-slate-900">Payment Modes:</strong> Advance booking amounts are collected online via UPI, Credit/Debit cards, or Netbanking. Remaining balances must be settled with the chauffeur via Cash or UPI at trip termination.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-900">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              <h2 className="text-lg font-black tracking-tight">4. Passenger Conduct & Prohibited Items</h2>
            </div>
            <p>
              To ensure safe highway travel for all occupants, passengers must strictly adhere to the following rules:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Carrying contraband, hazardous chemicals, firearms, or illegal substances is strictly forbidden by Indian law.</li>
              <li>Smoking, consuming illicit substances, or reckless conduct compromising road safety inside the vehicle is prohibited.</li>
              <li>Vehicle seating capacity limits (Sedan: 4 seats; Innova Crysta: 6/7 seats) must be observed under Motor Vehicle regulations.</li>
            </ul>
          </section>

          {/* 5 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-900">
              <FileText className="w-5 h-5 text-slate-700 shrink-0" />
              <h2 className="text-lg font-black tracking-tight">5. Breakdown & Replacement Guarantee</h2>
            </div>
            <p>
              In the unlikely event of a mechanical malfunction or vehicle breakdown on the highway, Grab-Rental guarantees the dispatch of a replacement vehicle of equivalent or superior category within 45&ndash;90 minutes, with zero extra fare liability to the traveler.
            </p>
          </section>

          {/* 6 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-900">
              <Scale className="w-5 h-5 text-amber-700 shrink-0" />
              <h2 className="text-lg font-black tracking-tight">6. Cancellation & Refunds</h2>
            </div>
            <p>
              For detailed terms regarding cancellation timeframes, advance deposit refunds, and driver no-show policies, please consult our dedicated <Link href="/refund-policy" className="text-amber-700 font-bold underline">Cancellation & Refund Policy</Link>.
            </p>
          </section>

          {/* 7 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="text-lg font-black tracking-tight text-slate-900">7. Governing Law & Dispute Resolution</h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.
            </p>
          </section>

        </div>

      </div>
    </main>
  );
}
