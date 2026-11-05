"use client";

import { Suspense } from "react";
import Link from "next/link";
import BookingWidget from "@/components/home/BookingWidget";
import PageHeroSection from "@/components/common/PageHeroSection";
import { ChevronRight, ShieldCheck, PhoneCall, Sparkles, Star } from "lucide-react";

function BookingPageContent() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. Header / Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/fleet" className="hover:text-slate-900 transition-colors">Our Fleet</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Fast-Track Reservation</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Commercial All-India Tourist Permit</span>
            </div>
            <a 
              href="tel:+919071100200" 
              className="hidden sm:flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#0082fe]" />
              <span>24/7 Helpline: +91 90711 00200</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Hero Section */}
      <PageHeroSection
        pageKey="HOME"
        defaultBadge="Fast-Track Online Reservation"
        defaultTitle1="India's Most Trusted Cab Rental Service"
        defaultTitle2="Car, Van & Bus Rentals"
        defaultSubtitle="Transparent billing, expert verified drivers, and pristine AC vehicles for Outstation, Local & Airport transit across 2,000+ Indian cities."
        badgeIcon={<Sparkles className="w-3 h-3 text-yellow-300" />}
      />

      {/* 3. Floating Booking Widget with Trip Type & Cab Type Dropdowns */}
      <section className="px-3 sm:px-4 md:px-6 relative z-20 -mt-20 sm:-mt-24 md:-mt-32 lg:-mt-36 mb-16 flex-1">
        <BookingWidget isDropdownMode={true} />
      </section>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-orange"></div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}
