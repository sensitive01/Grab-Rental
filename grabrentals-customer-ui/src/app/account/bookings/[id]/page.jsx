"use client";

import { use, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  Share2, 
  FileText, 
  AlertTriangle, 
  KeyRound, 
  UserCheck, 
  Navigation, 
  Check, 
  Copy,
  Info
} from "lucide-react";

export default function TripDetailsTrackingPage({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams?.id || "GR-84920";
  const [copiedOtp, setCopiedOtp] = useState(false);

  const handleCopyOtp = () => {
    navigator.clipboard.writeText("4829");
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Back & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Trips
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/account/bookings/${bookingId}/invoice`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" /> View Invoice
            </Link>
            <button 
              onClick={() => alert("Trip tracking link copied to clipboard!")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" /> Share Trip
            </button>
          </div>
        </div>

        {/* Status Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-emerald-500"></div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {bookingId}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold animate-pulse">
                ● Chauffeur En Route
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
              Bengaluru ➔ Mysuru
            </h1>
            <p className="text-xs text-slate-500">
              One-Way Premium Outstation • Pickup: Tomorrow at 06:30 AM
            </p>
          </div>

          {/* Ride OTP Box */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-300/80 rounded-2xl p-4 flex items-center gap-4 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Start Ride OTP</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-mono text-slate-900 tracking-widest">4829</span>
                <button 
                  onClick={handleCopyOtp}
                  className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                  title="Copy OTP"
                >
                  {copiedOtp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-500">Share with chauffeur at pickup</span>
            </div>
          </div>
        </div>

        {/* Stepper Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-6">
            Live Trip Progress
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
            {[
              { label: "Booked", time: "21 Sep, 12:30 PM", done: true, current: false },
              { label: "Chauffeur Assigned", time: "21 Sep, 02:00 PM", done: true, current: false },
              { label: "Chauffeur En Route", time: "Est. Arrival 06:15 AM", done: true, current: true },
              { label: "Trip In Transit", time: "~3h 15m duration", done: false, current: false },
              { label: "Trip Completed", time: "Drop off & Receipt", done: false, current: false },
            ].map((step, idx) => (
              <div key={idx} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  step.current
                    ? "bg-amber-500 text-slate-950 ring-4 ring-amber-100"
                    : step.done 
                    ? "bg-emerald-600 text-white" 
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}>
                  {step.done ? "✓" : idx + 1}
                </div>
                <div className="sm:mt-1">
                  <h4 className={`text-xs font-extrabold ${step.current ? "text-amber-700 font-black" : "text-slate-900"}`}>
                    {step.label}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Grid: Chauffeur Details & Route Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Assigned Chauffeur & Vehicle */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Assigned Chauffeur
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Verified Driver
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xl shadow-sm">
                  RK
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-base font-extrabold text-slate-900">Ramesh Kumar</h4>
                  <p className="text-xs text-slate-500">Highway & Intercity Specialist • 8 Yrs Exp</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="text-amber-500">★ 4.9</span>
                    <span>• 1,240+ completed trips</span>
                  </div>
                </div>
              </div>

              {/* Call / Message CTAs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href="tel:+919845012345"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call Driver
                </a>
                <a
                  href="https://wa.me/919845012345"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                </a>
              </div>

              {/* Vehicle Specs */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Details</span>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">Toyota Innova Crysta (Pearl White)</h5>
                    <p className="text-[11px] text-slate-500">Dual AC • Clean Interiors • Luggage Roof Carrier</p>
                  </div>
                  <span className="text-xs font-mono font-black text-slate-900 bg-white border border-slate-300 px-2.5 py-1 rounded-lg">
                    KA 01 MJ 4521
                  </span>
                </div>
              </div>
            </div>

            {/* Safety & SOS Card */}
            <div className="bg-red-50/60 border border-red-200 rounded-3xl p-5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-red-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> 24x7 Safety & SOS Helpline
                </h4>
                <p className="text-[11px] text-red-700">Need immediate help during your journey?</p>
              </div>
              <a
                href="tel:112"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold tracking-wide shrink-0 transition-colors shadow-xs"
              >
                Emergency SOS
              </a>
            </div>
          </div>

          {/* Right Column: Route & Fare Breakdown */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Route Timeline */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                Route Itinerary
              </h3>

              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-emerald-500 bg-white ring-4 ring-emerald-50"></span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Address</span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">#45, 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru</p>
                    <span className="text-[11px] text-slate-500">Scheduled: 22 Sep 2026, 06:30 AM</span>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-amber-400 bg-white ring-4 ring-amber-50"></span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">En-route Stop (Optional)</span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">Kamat Lokaruchi / Expressway Rest Stop</p>
                    <span className="text-[11px] text-slate-500">Driver coordinated breakfast halt (20 mins)</span>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-slate-900 bg-white ring-4 ring-slate-100"></span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Drop Location</span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">Mysore Palace South Gate, Mysuru, Karnataka</p>
                    <span className="text-[11px] text-slate-500">Est. Drop: 09:45 AM (~145 km)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fare Breakdown Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                Payment & Billing Details
              </h3>

              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Base Outstation Fare (145 km)</span>
                  <span className="text-slate-900">₹5,200</span>
                </div>
                <div className="flex justify-between">
                  <span>Driver Chauffeur Allowance</span>
                  <span className="text-slate-900">₹450</span>
                </div>
                <div className="flex justify-between">
                  <span>Tolls & Highway Expressway Taxes</span>
                  <span className="text-emerald-700 font-bold">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="text-slate-900">₹300</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-900">Total Invoice Amount</span>
                  <span className="text-base font-black text-slate-900">₹5,950</span>
                </div>
                <div className="flex justify-between items-center text-xs text-emerald-700 font-bold">
                  <span>Online Advance Paid (UPI)</span>
                  <span>- ₹1,190</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-amber-200 text-xs font-extrabold text-slate-900">
                  <span>Balance Payable to Chauffeur</span>
                  <span className="text-base text-amber-700">₹4,760</span>
                </div>
              </div>

              <div className="text-center pt-1">
                <Link
                  href={`/account/bookings/${bookingId}/invoice`}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 underline inline-flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> Download Official GST Tax Invoice
                </Link>
              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
