"use client";

import Link from "next/link";
import { Phone, ChevronDown, User, ShieldCheck, CheckCircle2, Star, Shield } from "lucide-react";

export default function TopNavigation() {
  return (
    <header className="flex flex-col w-full">
      {/* Top Utility Trust Bar */}
      <div className="bg-brand-navy text-slate-300 text-xs py-2 px-6 hidden md:flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-emerald" />
            <span>Zero Cancellation Fee (up to 6 hrs)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-brand-amber" />
            <span>Expert Chauffeurs (4.8★)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-sky" />
            <span>All-Inclusive Fares</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-brand-emerald" />
            <span>32-Point Sanitized Fleet</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/ops" className="hover:text-white transition-colors">Partner Dashboard</Link>
          <Link href="/admin" className="hover:text-white transition-colors">Corporate Login</Link>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-8 h-full">
          {/* Logo */}
          <Link href="/" className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <div className="bg-brand-navy text-white px-2 py-0.5 rounded flex items-center font-bold tracking-tight">
                FLEETRIDE
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase mt-0.5">
              Chauffeur & Intercity
            </span>
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center h-full space-x-1">
            <Link href="/" className="px-3 h-full flex items-center text-sm font-semibold text-brand-amber border-b-2 border-brand-amber">
              Outstation Cabs
            </Link>
            <Link href="/" className="px-3 h-full flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Hourly / Local Rentals
            </Link>
            <Link href="/" className="px-3 h-full flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Airport Transfers
            </Link>
            <Link href="/" className="px-3 h-full flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Tempo Traveller & Vans
            </Link>
            <Link href="/" className="px-3 h-full flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Luxury Buses
            </Link>
          </nav>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-4">
          <a href="tel:+919045450000" className="hidden md:flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors">
            <Phone className="w-4 h-4 text-brand-amber" />
            +91 90454 50000
          </a>
          
          <Link href="/dashboard" className="hidden md:flex items-center gap-2 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
            <User className="w-4 h-4" />
            Login <ChevronDown className="w-4 h-4 opacity-50" />
          </Link>
        </div>
      </div>
    </header>
  );
}
