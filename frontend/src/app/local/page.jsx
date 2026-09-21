import BookingWidget from "@/components/home/BookingWidget";
import { Star, Clock, MapPin, CheckCircle, CarFront } from "lucide-react";

export default function LocalRentalsPage() {
  return (
    <main className="flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-14 px-6 relative">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand-navy-dark border border-slate-700 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-brand-amber mb-6">
            <Clock className="w-3 h-3 text-brand-amber" /> Flexible Hourly Packages
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Premium <span className="text-brand-amber">Hourly / Local</span> Car Rentals
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-medium">
            Book a chauffeur-driven car for 4 hrs, 8 hrs, or 12 hrs. Perfect for city tours, shopping, and back-to-back meetings.
          </p>
        </div>
      </section>

      {/* Booking Widget */}
      <section className="px-4 md:px-6 relative z-20">
        <BookingWidget />
      </section>

      {/* Packages Section */}
      <section className="max-w-7xl mx-auto px-6 mt-32 mb-20 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Popular Local Packages</h2>
          <p className="text-slate-600 font-medium max-w-2xl mx-auto">Choose a package that fits your day perfectly. Extra kilometers and hours are billed transparently.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { hours: "4 Hours", km: "40 km", desc: "Ideal for quick errands or short business meetings within city limits.", price: "₹1,200" },
            { hours: "8 Hours", km: "80 km", desc: "Perfect for a full day of shopping, visiting relatives, or city sightseeing.", price: "₹2,100", popular: true },
            { hours: "12 Hours", km: "120 km", desc: "Extended package for all-day events, weddings, or long corporate trips.", price: "₹2,900" },
          ].map((pkg, idx) => (
            <div key={idx} className={`bg-white p-6 rounded-2xl shadow-sm border ${pkg.popular ? 'border-brand-amber shadow-md' : 'border-slate-200'} flex flex-col relative`}>
              {pkg.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">Most Selected</div>}
              <h3 className="text-2xl font-extrabold text-slate-900 mb-1 mt-2">{pkg.hours}</h3>
              <p className="text-brand-emerald-dark font-bold text-sm mb-4">Includes {pkg.km}</p>
              <p className="text-sm text-slate-500 mb-6 flex-1">{pkg.desc}</p>
              <div className="text-xl font-black text-slate-900 border-t border-slate-100 pt-4">Starts at {pkg.price}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
