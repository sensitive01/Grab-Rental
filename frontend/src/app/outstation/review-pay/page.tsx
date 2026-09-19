import { ShieldCheck, MapPin, CreditCard, Wallet, Clock, ChevronRight, CheckCircle2, Smartphone } from "lucide-react";
import Image from "next/image";
import SearchSummaryBar from "@/components/booking/SearchSummaryBar";

export default function ReviewPayPage() {
  return (
    <main className="bg-slate-50 min-h-screen pb-24">
      <SearchSummaryBar activeStep={3} />
      
      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-8">
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Review & Pay</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Payment Options */}
          <div className="flex-1 space-y-6">
            
            {/* Payment Method */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-brand-amber"></div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 mt-2">
                <div className="bg-brand-navy text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                <h2 className="text-xl font-extrabold text-slate-900">Select Payment Plan</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="relative border-2 border-brand-amber bg-orange-50/50 p-5 rounded-xl cursor-pointer flex flex-col items-center text-center">
                  <input type="radio" name="payment" defaultChecked className="absolute top-4 right-4 w-5 h-5 text-brand-amber accent-brand-amber" />
                  <span className="text-sm font-extrabold text-slate-900 mb-1">Pay 20% Advance Now</span>
                  <span className="text-2xl font-black text-brand-amber mb-2">₹1,190</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pay ₹4,760 to Driver Later</span>
                </label>
                
                <label className="relative border border-slate-200 hover:border-slate-300 p-5 rounded-xl cursor-pointer flex flex-col items-center text-center transition-colors">
                  <input type="radio" name="payment" className="absolute top-4 right-4 w-5 h-5 text-brand-amber accent-brand-amber" />
                  <span className="text-sm font-extrabold text-slate-900 mb-1">Pay Full Amount</span>
                  <span className="text-2xl font-black text-slate-900 mb-2">₹5,950</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Hassle-Free Cashless Trip</span>
                </label>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 mt-2">
                <div className="bg-brand-navy text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                <h2 className="text-xl font-extrabold text-slate-900">Payment Gateway</h2>
              </div>

              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-brand-amber hover:bg-orange-50/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-slate-500" />
                    </div>
                    <span className="font-bold text-slate-900">UPI (GPay, PhonePe, Paytm)</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
                
                <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-brand-amber hover:bg-orange-50/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-slate-500" />
                    </div>
                    <span className="font-bold text-slate-900">Credit / Debit Card</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>

                <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-brand-amber hover:bg-orange-50/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-slate-500" />
                    </div>
                    <span className="font-bold text-slate-900">Netbanking & Wallets</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Fare Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-36 overflow-hidden">
              
              <div className="bg-brand-navy-dark text-white p-5">
                <h3 className="text-lg font-extrabold mb-1">Final Booking Summary</h3>
                <p className="text-xs text-slate-400 font-medium">Verify details before payment.</p>
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
                
                <button className="w-full bg-brand-amber hover:bg-brand-amber-active text-white py-4 rounded-xl font-extrabold text-sm uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Securely Pay ₹1,190
                </button>
                
                <p className="text-[10px] text-slate-500 font-bold text-center mt-3 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-brand-emerald" /> 100% Safe & Encrypted Payment
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
