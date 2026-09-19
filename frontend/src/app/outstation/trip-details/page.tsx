import { ShieldCheck, MapPin, User, Mail, Phone, Clock, FileText, ChevronRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SearchSummaryBar from "@/components/booking/SearchSummaryBar";

export default function TripDetailsPage() {
  return (
    <main className="bg-slate-50 min-h-screen pb-24">
      <SearchSummaryBar activeStep={2} />
      
      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-8">
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Passenger & Trip Details</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Forms */}
          <div className="flex-1 space-y-6">
            
            {/* 1. Passenger Details */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-brand-navy text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                <h2 className="text-xl font-extrabold text-slate-900">Passenger Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="text" placeholder="John Doe" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="email" placeholder="john@example.com" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none transition-all" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number (For Driver Updates)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="tel" placeholder="+91 99999 99999" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Pickup Details */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-brand-navy text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                <h2 className="text-xl font-extrabold text-slate-900">Pickup Address</h2>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Complete Address / Hotel Name / Flight Number</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 text-brand-emerald w-5 h-5" />
                    <textarea rows={3} placeholder="Enter your exact pickup location..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none transition-all"></textarea>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Special Requests (Optional)</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                    <textarea rows={2} placeholder="E.g., Need baby seat, carrying 3 large suitcases..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none transition-all"></textarea>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Fare Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-36 overflow-hidden">
              
              <div className="bg-brand-navy-dark text-white p-5">
                <h3 className="text-lg font-extrabold mb-1">Trip Summary</h3>
                <p className="text-xs text-slate-400 font-medium">Please review your booking details.</p>
              </div>

              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-14 relative bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0">
                    <Image src="/images/fleet/suv.jpg" alt="Innova" fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900">Toyota Innova Crysta</h4>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Executive SUV • 6 Seats</p>
                  </div>
                </div>
              </div>

              <div className="p-5 border-b border-slate-100">
                <h4 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider mb-3">Fare Breakdown</h4>
                <div className="space-y-2 text-sm font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Fare (275 km)</span>
                    <span className="text-slate-900">₹5,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Driver Allowance</span>
                    <span className="text-slate-900">₹450</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tolls & State Tax</span>
                    <span className="text-brand-emerald-dark font-bold">Included</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span className="text-slate-900">₹300</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-orange-50/30">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Total Amount</span>
                  <span className="text-2xl font-black text-brand-amber">₹5,950</span>
                </div>
                
                <Link href="/outstation/review-pay" className="w-full bg-brand-amber hover:bg-brand-amber-active text-white py-4 rounded-xl font-extrabold text-sm uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2">
                  Proceed to Payment <ChevronRight className="w-5 h-5" />
                </Link>
                
                <p className="text-[10px] text-slate-500 font-bold text-center mt-3 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-brand-emerald" /> Free Cancellation up to 6 hrs before pickup
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
