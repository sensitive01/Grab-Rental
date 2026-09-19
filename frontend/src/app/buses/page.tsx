import BookingWidget from "@/components/home/BookingWidget";
import { Star, Shield, Bus } from "lucide-react";

export default function BusesPage() {
  return (
    <main className="flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-14 px-6 relative">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand-navy-dark border border-slate-700 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-brand-amber mb-6">
            <Bus className="w-3 h-3 text-brand-amber" /> 35 to 55 Seater Luxury Coaches
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Luxury <span className="text-brand-emerald">Bus Rentals</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-medium">
            Volvo, Scania, and Mercedes coaches for weddings, corporate offsites, and large group travel across India.
          </p>
        </div>
      </section>

      {/* Booking Widget */}
      <section className="px-4 md:px-6 relative z-20">
        <BookingWidget />
      </section>

      <section className="max-w-7xl mx-auto px-6 mt-32 mb-20 text-center">
         <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Book Large Scale Transport Easily</h2>
         <p className="text-slate-600 font-medium max-w-2xl mx-auto mb-10">Our fleet of luxury buses ensures safety, comfort, and reliability for large events. All buses come with an experienced driver and an attendant.</p>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-2">45-Seater Volvo</h3>
                <p className="text-sm text-slate-500 mb-4">Air Suspension, Washroom Option</p>
                <div className="text-brand-emerald-dark font-black text-lg">Starts ₹55/km</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-brand-amber shadow-md">
                <div className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-2">Most Popular</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">35-Seater Luxury AC</h3>
                <p className="text-sm text-slate-500 mb-4">Pushback Seats, Video Coach</p>
                <div className="text-brand-amber font-black text-lg">Starts ₹45/km</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-2">55-Seater Semi-Sleeper</h3>
                <p className="text-sm text-slate-500 mb-4">Long Distance Comfort</p>
                <div className="text-brand-emerald-dark font-black text-lg">Starts ₹65/km</div>
            </div>
         </div>
      </section>
    </main>
  );
}
