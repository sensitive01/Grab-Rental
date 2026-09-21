"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  PhoneCall, 
  MessageSquare, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  ArrowLeft 
} from "lucide-react";

export default function SupportHelpPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bookingId: "",
    category: "booking_inquiry",
    message: ""
  });

  const faqs = [
    {
      q: "When will my chauffeur and car details be assigned?",
      a: "For all confirmed outstation and airport rides, your chauffeur's name, contact number, and vehicle registration plate are sent via SMS and WhatsApp exactly 2 hours before your scheduled pickup time. You can also view live status in your Customer Dashboard."
    },
    {
      q: "Are highway tolls, state permits, and driver allowances included?",
      a: "Yes! Grab-Rental provides transparent, all-inclusive pricing. All scheduled highway expressway tolls, driver day/night batta, and state border entry taxes are included upfront. There are zero hidden surprises on your trip."
    },
    {
      q: "What is your cancellation and refund policy?",
      a: "You can cancel your booking for FREE up to 6 hours before your scheduled departure time with 100% instant refund of your advance payment. For cancellations made within 6 hours of pickup, a nominal cancellation fee applies as the chauffeur is already dispatched."
    },
    {
      q: "What is the luggage capacity for Sedans and SUVs?",
      a: "Sedans (Dzire, Etios) accommodate up to 4 passengers with 2 large suitcases and 2 handbags. Premium SUVs (Innova Crysta, Ertiga) accommodate 6 passengers with 4 large suitcases, plus standard rooftop luggage carriers for group luggage."
    },
    {
      q: "Can I make intermediate stops during an outstation trip?",
      a: "Absolutely! You can add intermediate stops during booking or coordinate brief halts with your chauffeur for refreshments, sightseeing, or fuel stops along the authorized route."
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", phone: "", bookingId: "", category: "booking_inquiry", message: "" });
    }, 4000);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Navigation & Header */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
              Customer Helpdesk
            </span>
            <span className="text-xs text-slate-400 font-medium">24/7 Dedicated Assistance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
            How can we help you today?
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Have questions regarding your upcoming ride, chauffeur details, or billing? Reach out to our 24/7 operations team directly.
          </p>
        </div>

        {/* 3 Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-400 transition-colors">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">24/7 Phone Helpline</h3>
              <p className="text-xs text-slate-500">Speak directly with an operations representative for immediate ride support.</p>
            </div>
            <div>
              <a
                href="tel:+918047109999"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                Call +91 80 4710 9999
              </a>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-colors">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">WhatsApp Support</h3>
              <p className="text-xs text-slate-500">Fast response via chat for route updates, chauffeur tracking, and invoice copies.</p>
            </div>
            <div>
              <a
                href="https://wa.me/919845012345"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-400 transition-colors">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Email Assistance</h3>
              <p className="text-xs text-slate-500">For corporate bookings, corporate GST receipts, and customer feedback.</p>
            </div>
            <div>
              <a
                href="mailto:support@grabrental.in"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all"
              >
                support@grabrental.in
              </a>
            </div>
          </div>

        </div>

        {/* 2-Column: FAQs & Quick Request Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* FAQ Accordion (Col 1-7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black text-slate-900">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-900 hover:text-amber-600 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Inquiry Form (Col 8-12) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Request a Callback</h3>
              <p className="text-xs text-slate-500">Our operations desk will call you back within 15 minutes.</p>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200 p-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-black text-slate-900">Callback Requested!</h4>
                <p className="text-xs text-slate-600">
                  An executive has been assigned to your ticket. We will call your phone shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Anand Vardhan"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Booking ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.bookingId}
                    onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
                    placeholder="e.g. GR-84920"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Topic / Issue
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="booking_inquiry">Booking / Chauffeur Inquiry</option>
                    <option value="cancellation">Cancellation & Refund Request</option>
                    <option value="billing">GST Invoice & Payment Receipt</option>
                    <option value="luggage">Luggage / Vehicle Upgrade</option>
                    <option value="other">Other Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Message / Special Instructions
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Briefly describe what you need help with..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Request
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
