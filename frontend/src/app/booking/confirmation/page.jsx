"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  MapPin, 
  Car, 
  Calendar, 
  Clock, 
  Download, 
  ArrowRight, 
  Copy, 
  Check, 
  PhoneCall, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles,
  Info
} from "lucide-react";

export default function BookingConfirmationPage() {
  const [copied, setCopied] = useState(false);
  const bookingId = "GR-84920";

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Success Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm text-center relative overflow-hidden">
          {/* Accent top gradient */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500"></div>
          
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-5 shadow-inner animate-bounce-short">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> 100% Guaranteed Cab • Zero Cancellation
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-2 max-w-md mx-auto">
            Your outstation ride is confirmed. A chauffeur will be assigned and SMS details will be sent prior to departure.
          </p>

          {/* Booking ID Pill */}
          <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 bg-slate-100/80 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Booking ID:</span>
            <span className="text-sm font-black text-slate-900 font-mono">{bookingId}</span>
            <button 
              onClick={handleCopy}
              className="text-slate-500 hover:text-slate-800 transition-colors p-1"
              title="Copy Booking ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Trip Overview Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">Trip Overview</h2>
              <p className="text-xs text-slate-500">One-way Outstation Ride</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold uppercase tracking-wide">
              Confirmed
            </span>
          </div>

          {/* Route Section */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            <div className="relative">
              <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-emerald-500 bg-white ring-4 ring-emerald-50"></span>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pickup Location</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">12th Main Road, Indiranagar, Bengaluru</p>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Tomorrow, 22 Sep 2026</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> 06:30 AM</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-brand-amber bg-white ring-4 ring-amber-50"></span>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Drop Destination</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">Mysore Palace Area, Mysuru, Karnataka</p>
                <p className="text-xs text-slate-500 mt-0.5">Est. Distance: ~145 km (3h 15m via Expressway)</p>
              </div>
            </div>
          </div>

          {/* Vehicle & Chauffeur Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vehicle Category</span>
                <h4 className="text-xs font-bold text-slate-900">Toyota Innova Crysta</h4>
                <p className="text-[11px] text-slate-500">6+1 Seater • AC • Luggage Carrier</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chauffeur Status</span>
                <h4 className="text-xs font-bold text-slate-900">Assigning 2h Before</h4>
                <p className="text-[11px] text-slate-500">Police Verified • Highway Specialist</p>
              </div>
            </div>
          </div>

          {/* Payment Summary Box */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
              <span>Total Fare (Tolls & GST Included)</span>
              <span className="font-bold text-slate-900">₹5,950</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-emerald-700">
              <span>Advance Paid (UPI)</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">✓ ₹1,190 Paid</span>
            </div>
            <div className="flex justify-between items-center text-xs font-extrabold text-slate-900 pt-2 border-t border-amber-200/50">
              <span>Balance to Chauffeur on Arrival</span>
              <span className="text-base text-amber-700">₹4,760</span>
            </div>
          </div>
        </div>

        {/* Driver Dispatch & Policy Notice */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex gap-3 text-xs text-blue-900">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">What happens next?</p>
            <p className="text-blue-800/90 leading-relaxed">
              Your chauffeur details and vehicle registration plate will be shared via WhatsApp and SMS 2 hours before your scheduled pickup time (04:30 AM). You can also view live trip progress in your dashboard.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            href="/account/bookings/GR-84920"
            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <span>Track Trip & Driver Details</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-all shadow-sm"
          >
            <span>Go to My Trips Dashboard</span>
          </Link>
        </div>

        <div className="text-center pt-2">
          <Link 
            href="/account/bookings/GR-84920/invoice"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 underline"
          >
            <Download className="w-3.5 h-3.5" /> View & Print Booking Receipt / Tax Invoice
          </Link>
        </div>

      </div>
    </main>
  );
}
