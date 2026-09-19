import { Filter, ShieldAlert } from "lucide-react";

export default function FleetFilters() {
  return (
    <div className="w-72 flex-shrink-0 hidden lg:block space-y-6 sticky top-24 h-max">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Filter className="w-5 h-5" /> Filters
        </h2>
        <button className="text-sm text-brand-sky font-semibold hover:underline">Clear All</button>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Fleet Category</h3>
        <div className="space-y-2.5">
          {["Sedan", "Premium SUV", "Tempo Traveller", "Luxury Coach"].map(cat => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded text-brand-amber border-slate-300 focus:ring-brand-amber cursor-pointer" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Powertrain */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Powertrain</h3>
        <div className="flex flex-wrap gap-2">
          {["Diesel", "EV Chauffeur", "CNG", "Petrol"].map(pt => (
            <button key={pt} className="px-3 py-1.5 border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:border-brand-amber hover:text-brand-amber transition-colors">
              {pt}
            </button>
          ))}
        </div>
      </div>

      {/* Capacity */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Passenger Capacity</h3>
        <div className="flex flex-wrap gap-2">
          {["4 Seats", "6-7 Seats", "12+ Seats", "26+ Seats"].map(cap => (
            <button key={cap} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:border-brand-amber hover:text-brand-amber transition-colors">
              {cap}
            </button>
          ))}
        </div>
      </div>

      {/* Zero Surprise Guarantee */}
      <div className="bg-brand-navy rounded-xl p-5 text-white mt-8 shadow-lg relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <ShieldAlert className="w-24 h-24" />
        </div>
        <ShieldAlert className="w-6 h-6 text-brand-emerald mb-3" />
        <h4 className="font-bold mb-1">Zero-Surprise Guarantee</h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          Tolls, state permits, and driver allowance are pre-included. No hidden charges on any outstation trips.
        </p>
      </div>
    </div>
  );
}
