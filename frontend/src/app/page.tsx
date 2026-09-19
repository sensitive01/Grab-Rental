import BookingWidget from "@/components/home/BookingWidget";
import { CheckCircle, ShieldCheck, MapPin, Star, CarFront, FileText, UserCheck, ShieldAlert, BadgeCheck, QrCode } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col bg-slate-50">
      
      {/* 1. Hero Section */}
      <section className="text-white pt-10 pb-44 px-4 lg:px-8 relative overflow-hidden flex flex-col items-center bg-slate-900">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/images/hero-bg.jpg")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-900/60 to-transparent"></div>
        
        <div className="max-w-7xl w-full relative z-10 flex flex-col items-center text-center mt-4 md:mt-8">
          <div className="inline-flex items-center gap-2 bg-brand-navy-dark/80 backdrop-blur-md border border-slate-700/50 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-brand-amber mb-6 shadow-xl">
            <Star className="w-3 h-3 text-brand-amber" /> India's Premier Chauffeur Network
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-2xl">
            India's Trusted Chauffeur-Driven <br/>
            <span className="text-brand-orange drop-shadow-lg">Car, Van & Bus Rentals</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto font-medium drop-shadow-md">
            Transparent billing, expert verified drivers, and pristine AC vehicles for Outstation, Local & Airport transit across 2,000+ Indian cities.
          </p>
        </div>
      </section>

      {/* Floating Booking Widget */}
      <section className="px-4 md:px-6 relative z-20">
        <BookingWidget />
      </section>

      {/* 2. Key Metric Cards */}
      <section className="max-w-7xl mx-auto px-6 mt-32 mb-20 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { stat: "2,000+", label: "Cities & Towns Served", icon: <MapPin className="text-brand-sky w-6 h-6" /> },
            { stat: "98.9%", label: "On-Time Departure Rate", icon: <CheckCircle className="text-brand-emerald w-6 h-6" /> },
            { stat: "4.8 / 5.0", label: "(120,000+ Reviews)", icon: <Star className="text-brand-amber w-6 h-6" /> },
            { stat: "32-Point", label: "Sanitized Fleet Inspection", icon: <ShieldCheck className="text-brand-emerald w-6 h-6" /> },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col items-center text-center gap-3">
              <div className="bg-slate-50 p-3 rounded-full">{item.icon}</div>
              <h3 className="text-3xl font-extrabold text-slate-900">{item.stat}</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Choose Your Travel Class (Vehicle Cards Grid) */}
      <section className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Choose Your Travel Class</h2>
            <p className="text-slate-600 font-medium max-w-2xl mx-auto">Experience our premium fleet tailored for every need—from executive sedans to luxury coaches.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Executive Sedan", price: "Starts ₹11/km", desc: "Dzire, Etios", tags: ["4 Seats", "2 Bags", "AC"], badge: null, image: "/images/fleet/sedan.jpg" },
              { name: "Innova Crysta / SUV", price: "Starts ₹16/km", desc: "Innova Crysta, Hycross", tags: ["6-7 Seats", "4 Bags", "Captain Seats"], badge: "MOST POPULAR", image: "/images/fleet/suv.jpg" },
              { name: "Luxury Tempo Traveller", price: "Starts ₹24/km", desc: "12 to 26 Seater Force Urbania", tags: ["Maharaja Recliner", "AC", "AV System"], badge: null, image: "/images/fleet/tempo.jpg" },
              { name: "Luxury Coaches & Buses", price: "Starts ₹45/km", desc: "35 to 55 Seater Volvo, Scania", tags: ["Washroom", "Mic", "Air Suspension"], badge: null, image: "/images/fleet/bus.jpg" },
            ].map((fleet, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col items-center text-center relative hover:shadow-md transition-all cursor-pointer">
                {fleet.badge && (
                  <div className="absolute -top-3 bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10">
                    {fleet.badge}
                  </div>
                )}
                <div className="w-full aspect-[16/9] relative mb-6 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100">
                  <Image src={fleet.image} alt={fleet.name} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">{fleet.name}</h3>
                <p className="text-sm font-semibold text-slate-500 mb-4">{fleet.desc}</p>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {fleet.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600">{tag}</span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between w-full pt-4 border-t border-slate-200">
                  <span className="text-lg font-black text-brand-emerald-dark mx-auto">{fleet.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Value Proposition Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">The Standard of Excellence</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Transparent Billing", desc: "Automated GST Invoicing with zero hidden fees.", icon: <FileText /> },
              { title: "Expert Chauffeurs", desc: "8+ years highway experience & police verified.", icon: <UserCheck /> },
              { title: "32-Point Sanitization", desc: "Complimentary Water & Tissue inside pristine cabs.", icon: <ShieldAlert /> },
              { title: "Zero Cancellation Stress", desc: "Instant UPI/Card Reversal on early cancellations.", icon: <BadgeCheck /> },
            ].map((prop, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center text-brand-amber mb-4">
                  {prop.icon}
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{prop.title}</h4>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Popular Outstation Corridors */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Popular Outstation Corridors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { route: "Bangalore → Mysore", price: "₹1,850", dist: "145 km" },
              { route: "Delhi NCR → Agra", price: "₹2,299", dist: "230 km" },
              { route: "Mumbai → Pune", price: "₹1,999", dist: "150 km" },
              { route: "Delhi → Jaipur", price: "₹2,750", dist: "280 km" },
              { route: "Chennai → Pondy", price: "₹2,100", dist: "155 km" },
              { route: "Bangalore → Ooty", price: "₹4,100", dist: "275 km" },
            ].map((corridor, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-brand-amber hover:bg-orange-50 transition-colors cursor-pointer group">
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-amber mb-2">{corridor.route}</h4>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">{corridor.dist}</span>
                  <span className="text-brand-emerald-dark bg-emerald-50 px-1.5 py-0.5 rounded">{corridor.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Social Proof & Enterprise Banner */}
      <section className="py-16 bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8 items-center justify-between">
          <div className="flex items-center gap-4">
            <QrCode className="w-20 h-20 text-brand-amber bg-white p-2 rounded-xl" />
            <div>
              <h3 className="text-xl font-extrabold mb-1">Book Fast, Track Live</h3>
              <p className="text-sm font-medium text-slate-400">Scan to download the Grab Rentals App.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="bg-white text-brand-navy px-6 py-3 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-100 transition-colors">Corporate Travel Desk</button>
            <button className="bg-brand-amber hover:bg-brand-amber-hover px-6 py-3 rounded-lg font-bold text-sm text-white shadow-sm transition-colors">Attach Your Fleet</button>
          </div>
        </div>
      </section>

    </main>
  );
}
