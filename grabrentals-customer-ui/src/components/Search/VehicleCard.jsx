import { Check, Users, Luggage, Snowflake, Info, BatteryCharging } from "lucide-react";
import Image from "next/image";

export default function VehicleCard({ vehicle }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden">
      
      {/* Category Badge */}
      {vehicle.badge && (
        <div className="absolute top-0 left-0 bg-brand-navy text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-br-lg z-10">
          {vehicle.badge}
        </div>
      )}

      {/* Left: Image & Specs */}
      <div className="w-full md:w-64 flex flex-col items-center pt-2 shrink-0">
        <div className="w-full h-32 bg-slate-50 rounded-xl mb-4 flex items-center justify-center border border-slate-100 relative overflow-hidden">
          {/* Placeholder for Car Image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-slate-50 opacity-50"></div>
          <span className="text-4xl relative z-10 font-bold text-slate-200 uppercase">{vehicle.category.substring(0, 3)}</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">{vehicle.name}</h3>
        <p className="text-xs text-slate-500 font-semibold mb-3 uppercase tracking-wide">{vehicle.category}</p>
        
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" /> {vehicle.seats}</span>
          <span className="flex items-center gap-1.5"><Luggage className="w-4 h-4 text-slate-400" /> {vehicle.luggage}</span>
          {vehicle.hasAC && <span className="flex items-center gap-1.5"><Snowflake className="w-4 h-4 text-slate-400" /> AC</span>}
          {vehicle.isEV && <span className="flex items-center gap-1.5 text-brand-emerald"><BatteryCharging className="w-4 h-4" /> EV</span>}
        </div>
      </div>

      {/* Middle: Inclusions */}
      <div className="flex-1 py-2 hidden md:block">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Check className="w-4 h-4 text-brand-emerald" /> What's Included
        </h4>
        <ul className="space-y-2.5 text-sm font-medium text-slate-700">
          {vehicle.inclusions.map((inc, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div className="mt-0.5 rounded-full bg-emerald-50 p-0.5 shrink-0">
                <Check className="w-3 h-3 text-brand-emerald" />
              </div>
              {inc}
            </li>
          ))}
        </ul>
        <button className="mt-4 text-xs font-bold text-brand-sky flex items-center gap-1 hover:underline">
          <Info className="w-3.5 h-3.5" /> View Detailed Fare Breakdown
        </button>
      </div>

      {/* Right: Pricing & CTA */}
      <div className="w-full md:w-56 bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col items-center md:items-end justify-center shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-slate-400 line-through">₹{vehicle.originalPrice.toLocaleString()}</span>
          <span className="bg-orange-100 text-brand-amber-light text-[10px] font-bold px-2 py-0.5 rounded uppercase">10% Off</span>
        </div>
        <div className="text-2xl font-black text-slate-900 mb-1">
          ₹{vehicle.price.toLocaleString()}
        </div>
        <p className="text-[10px] font-bold text-brand-emerald uppercase tracking-wider mb-5">
          All-Inclusive Fixed Fare
        </p>
        
        <button className="w-full bg-brand-amber hover:bg-brand-amber-hover text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors shadow-sm">
          Select Cab
        </button>
        <p className="text-[10px] text-slate-500 font-semibold mt-3 text-center">
          Zero advance option available at checkout.
        </p>
      </div>

    </div>
  );
}
